import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { apiError } from "@/lib/error-messages";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { writeFile, unlink, mkdtemp } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { createReadStream } from "fs";

export const runtime = "nodejs";
export const maxDuration = 300;

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

interface ClipInput {
  videoUrl: string;
  startTime: number;
  endTime: number;
}

interface CompileRequest {
  memorialId: string;
  clips: ClipInput[];
  transition: "cut" | "fade" | "dissolve";
}

const MAX_OUTPUT_DURATION = 120; // seconds

async function downloadFile(url: string, dest: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download: ${url}`);
  const buffer = await res.arrayBuffer();
  await writeFile(dest, Buffer.from(buffer));
}

function runFfmpeg(args: {
  inputs: { path: string; startTime: number; endTime: number }[];
  output: string;
  transition: "cut" | "fade" | "dissolve";
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const { inputs, output, transition } = args;

    if (transition === "cut") {
      // Simple concat with trimming: create a concat file
      // Use filter_complex to trim and concat
      const cmd = ffmpeg();

      inputs.forEach((inp) => {
        cmd.input(inp.path).inputOptions([
          `-ss ${inp.startTime}`,
          `-to ${inp.endTime}`,
        ]);
      });

      const filterParts: string[] = [];
      inputs.forEach((_, i) => {
        filterParts.push(`[${i}:v]setpts=PTS-STARTPTS,scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2[v${i}]`);
        filterParts.push(`[${i}:a]aresample=44100[a${i}]`);
      });

      const vStreams = inputs.map((_, i) => `[v${i}]`).join("");
      const aStreams = inputs.map((_, i) => `[a${i}]`).join("");
      filterParts.push(`${vStreams}concat=n=${inputs.length}:v=1:a=0[outv]`);
      filterParts.push(`${aStreams}concat=n=${inputs.length}:v=0:a=1[outa]`);

      cmd
        .complexFilter(filterParts.join(";"))
        .outputOptions(["-map", "[outv]", "-map", "[outa]"])
        .output(output)
        .outputOptions(["-c:v", "libx264", "-preset", "fast", "-c:a", "aac", "-movflags", "+faststart"])
        .on("end", () => resolve())
        .on("error", (err) => reject(err))
        .run();
    } else if (transition === "fade") {
      // Trim each, add fade in/out, then concat
      const cmd = ffmpeg();
      const fadeDuration = 0.5;

      inputs.forEach((inp) => {
        cmd.input(inp.path).inputOptions([
          `-ss ${inp.startTime}`,
          `-to ${inp.endTime}`,
        ]);
      });

      const filterParts: string[] = [];
      inputs.forEach((inp, i) => {
        const clipDur = inp.endTime - inp.startTime;
        const fadeOutStart = Math.max(0, clipDur - fadeDuration);
        filterParts.push(
          `[${i}:v]setpts=PTS-STARTPTS,scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,fade=t=in:st=0:d=${fadeDuration},fade=t=out:st=${fadeOutStart}:d=${fadeDuration}[v${i}]`
        );
        filterParts.push(
          `[${i}:a]aresample=44100,afade=t=in:st=0:d=${fadeDuration},afade=t=out:st=${fadeOutStart}:d=${fadeDuration}[a${i}]`
        );
      });

      const vStreams = inputs.map((_, i) => `[v${i}]`).join("");
      const aStreams = inputs.map((_, i) => `[a${i}]`).join("");
      filterParts.push(`${vStreams}concat=n=${inputs.length}:v=1:a=0[outv]`);
      filterParts.push(`${aStreams}concat=n=${inputs.length}:v=0:a=1[outa]`);

      cmd
        .complexFilter(filterParts.join(";"))
        .outputOptions(["-map", "[outv]", "-map", "[outa]"])
        .output(output)
        .outputOptions(["-c:v", "libx264", "-preset", "fast", "-c:a", "aac", "-movflags", "+faststart"])
        .on("end", () => resolve())
        .on("error", (err) => reject(err))
        .run();
    } else {
      // dissolve: use xfade between consecutive clips
      const cmd = ffmpeg();
      const xfadeDuration = 0.5;

      inputs.forEach((inp) => {
        cmd.input(inp.path).inputOptions([
          `-ss ${inp.startTime}`,
          `-to ${inp.endTime}`,
        ]);
      });

      if (inputs.length === 1) {
        // Single clip, no transition needed
        const filterParts = [
          `[0:v]setpts=PTS-STARTPTS,scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2[outv]`,
          `[0:a]aresample=44100[outa]`,
        ];
        cmd
          .complexFilter(filterParts.join(";"))
          .outputOptions(["-map", "[outv]", "-map", "[outa]"])
          .output(output)
          .outputOptions(["-c:v", "libx264", "-preset", "fast", "-c:a", "aac", "-movflags", "+faststart"])
          .on("end", () => resolve())
          .on("error", (err) => reject(err))
          .run();
        return;
      }

      // Build xfade chain
      const filterParts: string[] = [];
      // First, scale all inputs
      inputs.forEach((_, i) => {
        filterParts.push(
          `[${i}:v]setpts=PTS-STARTPTS,scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2[sv${i}]`
        );
        filterParts.push(`[${i}:a]aresample=44100[sa${i}]`);
      });

      // Chain xfade between consecutive clips
      let prevV = "[sv0]";
      let offset = inputs[0].endTime - inputs[0].startTime - xfadeDuration;
      for (let i = 1; i < inputs.length; i++) {
        const outLabel = i === inputs.length - 1 ? "[outv]" : `[xv${i}]`;
        filterParts.push(
          `${prevV}[sv${i}]xfade=transition=fade:duration=${xfadeDuration}:offset=${Math.max(0, offset)}${outLabel}`
        );
        prevV = outLabel;
        if (i < inputs.length - 1) {
          offset += inputs[i].endTime - inputs[i].startTime - xfadeDuration;
        }
      }

      // Audio: simple concat
      const aStreams = inputs.map((_, i) => `[sa${i}]`).join("");
      filterParts.push(`${aStreams}concat=n=${inputs.length}:v=0:a=1[outa]`);

      cmd
        .complexFilter(filterParts.join(";"))
        .outputOptions(["-map", "[outv]", "-map", "[outa]"])
        .output(output)
        .outputOptions(["-c:v", "libx264", "-preset", "fast", "-c:a", "aac", "-movflags", "+faststart"])
        .on("end", () => resolve())
        .on("error", (err) => reject(err))
        .run();
    }
  });
}

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("AUTH_REQUIRED", 401);
  }

  if (!rateLimit(`compile:${user.id}`, 3)) {
    return apiError("RATE_LIMITED", 429);
  }

  const body: CompileRequest = await request.json();
  const { memorialId, clips, transition } = body;

  if (!memorialId || !clips?.length) {
    return apiError("INVALID_INPUT", 400, "Missing memorialId or clips.");
  }

  // Validate clip inputs
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  for (const clip of clips) {
    // Prevent SSRF: only allow Supabase-hosted video URLs
    if (!supabaseUrl || typeof clip.videoUrl !== "string" || !clip.videoUrl.startsWith(supabaseUrl)) {
      return apiError("INVALID_INPUT", 400, "Invalid video URL.");
    }
    // Prevent command injection: enforce numeric types at runtime
    if (typeof clip.startTime !== "number" || !isFinite(clip.startTime) ||
        typeof clip.endTime !== "number" || !isFinite(clip.endTime) ||
        clip.startTime < 0 || clip.endTime <= clip.startTime) {
      return apiError("INVALID_INPUT", 400, "Invalid clip times.");
    }
  }

  // Validate total duration
  const totalDuration = clips.reduce((sum, c) => sum + (c.endTime - c.startTime), 0);
  if (totalDuration > MAX_OUTPUT_DURATION) {
    return apiError("INVALID_INPUT", 400, `Total clip duration exceeds ${MAX_OUTPUT_DURATION} seconds. Please shorten your clips.`);
  }

  // Create compilation record
  const { data: compilation, error: insertError } = await supabase
    .from("video_compilations")
    .insert({
      memorial_id: memorialId,
      status: "processing",
      transition_type: transition || "cut",
    })
    .select("id")
    .single();

  if (insertError || !compilation) {
    console.error("Failed to create compilation record:", insertError?.message);
    return apiError("VIDEO_COMPILATION_FAILED", 500);
  }

  const compilationId = compilation.id;
  let workDir: string | undefined;

  try {
    // Create temp working directory
    workDir = await mkdtemp(join(tmpdir(), "compile-"));

    // Download source videos
    const inputPaths: { path: string; startTime: number; endTime: number }[] = [];
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const ext = clip.videoUrl.split(".").pop()?.split("?")[0] || "mp4";
      const filePath = join(workDir, `input_${i}.${ext}`);
      await downloadFile(clip.videoUrl, filePath);
      inputPaths.push({
        path: filePath,
        startTime: clip.startTime,
        endTime: clip.endTime,
      });
    }

    // Run FFmpeg
    const outputPath = join(workDir, `output_${compilationId}.mp4`);
    await runFfmpeg({
      inputs: inputPaths,
      output: outputPath,
      transition: transition || "cut",
    });

    // Upload result to Supabase
    const storagePath = `compilations/${memorialId}/${compilationId}.mp4`;
    const fileStream = createReadStream(outputPath);
    const chunks: Buffer[] = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk as Buffer);
    }
    const outputBuffer = Buffer.concat(chunks);

    const { error: uploadError } = await supabase.storage
      .from("memorial-videos")
      .upload(storagePath, outputBuffer, {
        contentType: "video/mp4",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("memorial-videos").getPublicUrl(storagePath);

    // Update compilation record
    await supabase
      .from("video_compilations")
      .update({
        status: "complete",
        url: publicUrl,
        duration_seconds: totalDuration,
        completed_at: new Date().toISOString(),
      })
      .eq("id", compilationId);

    return NextResponse.json({
      compilationId,
      url: publicUrl,
      status: "complete",
    });
  } catch (err) {
    console.error("Compilation error:", err instanceof Error ? err.message : "Unknown error");

    // Update compilation record with failure
    await supabase
      .from("video_compilations")
      .update({
        status: "failed",
        error_message: err instanceof Error ? err.message : "Unknown error",
      })
      .eq("id", compilationId);

    return NextResponse.json(
      { error: { code: "VIDEO_COMPILATION_FAILED", message: "The video couldn't be compiled. Your clips are saved.", recoverable: true }, compilationId },
      { status: 500 }
    );
  } finally {
    // Clean up temp files
    if (workDir) {
      try {
        const { readdir } = await import("fs/promises");
        const files = await readdir(workDir);
        for (const f of files) {
          await unlink(join(workDir, f)).catch(() => {});
        }
        const { rmdir } = await import("fs/promises");
        await rmdir(workDir).catch(() => {});
      } catch {
        // Best-effort cleanup
      }
    }
  }
}
