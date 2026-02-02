import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { MasonryWall } from "@/components/memorial-wall/masonry-wall";

export const metadata: Metadata = {
  title: "Example Memorial — RememberMyPet.ai",
  description:
    "See what a pet memorial looks like on RememberMyPet.ai. A sample tribute for Buddy, a beloved golden retriever.",
};

const DEMO_TRIBUTE = `Buddy wasn't just a dog — he was the first face you'd see in the morning and the warmest presence in any room. He had this way of knowing exactly when you needed him most, showing up with a tennis ball or just resting his head on your lap.

He loved swimming in the lake more than anything. The moment he heard the car doors unlock on a Saturday morning, he knew it was adventure time. He'd press his nose against the window the entire drive, tail going like a metronome set to allegro.

He had a signature move at the dog park — a full-speed lap around the perimeter, ears back, pure joy, before he'd even acknowledge the other dogs. Everyone knew Buddy's victory lap. The regulars would cheer him on and he'd finish with this proud little prance back to you, like he'd just won an Olympic medal.

In his later years, the lake trips got shorter, but his enthusiasm never dimmed. He'd wade in up to his belly and stand there, perfectly content, watching the ducks like he was supervising them. On cold mornings he'd curl up on the couch and let out this deep sigh — not sad, just settled. Like he'd found exactly where he was supposed to be.

Buddy taught everyone around him what unconditional loyalty looks like. Not the dramatic kind — the quiet, steady, always-there kind. The kind where you come home after the worst day and someone is genuinely, completely thrilled to see you. He never held a grudge, never kept score, never loved you less on your bad days.

Fourteen years wasn't enough. It never would have been. But every single one of those years was better because he was in it.`;

const DEMO_MEMORIES = [
  {
    name: "Uncle Mike",
    content:
      "Buddy once stole an entire rotisserie chicken off the counter at Thanksgiving. We were all too impressed to be mad. He looked so proud of himself.",
  },
  {
    name: "Jen & Marcus",
    content:
      "Our kids grew up with Buddy. He was the most patient dog — let them dress him up, pull his ears, use him as a pillow. He loved every second of it.",
  },
  {
    name: "Dr. Sarah Chen",
    content:
      "Buddy was my favorite patient for 12 years. Even at the vet, tail never stopped wagging. He made my job easier just by being himself.",
  },
];

const DEMO_PHOTOS = [
  { src: "/demo/lake.jpg", caption: "That smile that could fix any bad day" },
  { src: "/demo/snow.jpg", caption: "First snow, age 2" },
  { src: "/demo/ball.jpg", caption: "The ball was always his favorite" },
  { src: "/demo/nap.jpg", caption: "Sprinkler days in the backyard" },
  { src: "/demo/hero.jpg", caption: "Our adventure buddy" },
  { src: "/demo/lake.jpg", caption: "Lake days were his happy place" },
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-white">
      {/* Banner */}
      <div className="bg-amber-600 text-white text-center py-2.5 px-4 text-sm">
        This is a sample memorial.{" "}
        <Link href="/create" className="underline font-medium">
          Create your own
        </Link>
      </div>

      {/* Hero */}
      <section className="relative">
        <div className="relative h-[35vh] min-h-[280px] max-h-[500px] w-full sm:h-[50vh]">
          <Image
            src="/demo/hero.jpg"
            alt="Buddy the golden retriever"
            fill
            className="object-cover object-[center_25%]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-10">
            <h1 className="font-serif text-4xl font-medium tracking-tight text-white sm:text-5xl drop-shadow-lg">
              Buddy
            </h1>
            <p className="mt-3 text-lg text-white/80 drop-shadow">
              March 12, 2010 — November 8, 2024
            </p>
          </div>
        </div>
      </section>

      {/* Wall intro */}
      <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <p className="mb-6 text-center text-sm text-gray-400 italic">
          Buddy&apos;s life, through the eyes of those who loved him
        </p>
      </section>

      {/* Tribute + Side Photos */}
      <section className="mx-auto max-w-6xl px-4 pb-3 sm:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-stretch md:gap-4">
          {/* Tribute */}
          <div className="flex-1 rounded-2xl border-l-4 border-l-amber-700 border border-amber-100 bg-amber-50/50 p-6 shadow-sm backdrop-blur-sm sm:p-8">
            <h2 className="mb-4 font-serif text-2xl font-medium text-gray-900">
              A Tribute
            </h2>
            <div className="whitespace-pre-line text-base leading-relaxed text-gray-700">
              {DEMO_TRIBUTE}
            </div>
          </div>
          {/* Side photos */}
          <div className="flex gap-3 md:w-80 md:shrink-0 md:flex-col">
            {DEMO_PHOTOS.slice(0, 2).map((photo, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-amber-100 bg-white/80 shadow-sm">
                <div className="relative aspect-square">
                  <Image
                    src={photo.src}
                    alt={photo.caption}
                    fill
                    sizes="(max-width: 768px) 50vw, 320px"
                    className="object-cover"
                  />
                </div>
                {photo.caption && (
                  <p className="px-3 py-2 text-xs italic text-gray-500">{photo.caption}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Masonry Wall (remaining photos + memories) */}
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <MasonryWall
          photos={DEMO_PHOTOS.slice(2)}
          memories={DEMO_MEMORIES}
          petName="Buddy"
        />
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-2xl px-4 pb-16 sm:px-6 text-center">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-8">
          <h2 className="font-serif text-2xl font-medium text-gray-900">
            Create a memorial for your pet
          </h2>
          <p className="mt-2 text-gray-500">
            Honor their memory with a beautiful tribute.
          </p>
          <Link
            href="/create"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-600 px-8 py-3 text-base font-medium text-white hover:bg-amber-700 transition-colors"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
