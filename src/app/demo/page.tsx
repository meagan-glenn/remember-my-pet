import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Example Memorial — RememberMyPet.ai",
  description:
    "See what a pet memorial looks like on RememberMyPet.ai. A sample tribute for Buddy, a beloved golden retriever.",
};

const DEMO_TRIBUTE = `Buddy wasn't just a dog — he was the first face you'd see in the morning and the warmest presence in any room. He had this way of knowing exactly when you needed him most, showing up with a tennis ball or just resting his head on your lap.

He loved swimming in the lake more than anything. The moment he heard the car doors unlock on a Saturday morning, he knew it was adventure time. He'd press his nose against the window the entire drive, tail going like a metronome set to allegro.

In his later years, the lake trips got shorter, but his enthusiasm never dimmed. He'd wade in up to his belly and stand there, perfectly content, watching the ducks like he was supervising them.

Buddy taught everyone around him what unconditional loyalty looks like. Not the dramatic kind — the quiet, steady, always-there kind. The kind where you come home after the worst day and someone is genuinely, completely thrilled to see you.

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
  { src: "/demo/lake.jpg", caption: "Lake day — his happy place" },
  { src: "/demo/snow.jpg", caption: "First snow, age 2" },
  { src: "/demo/ball.jpg", caption: "The tennis ball collection" },
  { src: "/demo/nap.jpg", caption: "Nap time with his favorite human" },
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
        <div className="relative h-[50vh] min-h-[320px] max-h-[500px] w-full sm:h-[60vh]">
          <Image
            src="/demo/hero.jpg"
            alt="Buddy the golden retriever"
            fill
            className="object-cover"
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

      {/* Tribute */}
      <section className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-amber-100 bg-white/80 p-6 shadow-sm backdrop-blur-sm sm:p-8">
          <h2 className="mb-4 font-serif text-2xl font-medium text-gray-900">
            A Tribute
          </h2>
          <div className="whitespace-pre-line text-base leading-relaxed text-gray-700">
            {DEMO_TRIBUTE}
          </div>
        </div>
      </section>

      {/* Photo Gallery (placeholders) */}
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <h2 className="mb-6 font-serif text-2xl font-medium text-gray-900">
          Photos
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {DEMO_PHOTOS.map((photo, i) => (
            <div key={i} className="space-y-2">
              <div className="relative aspect-square overflow-hidden rounded-xl">
                <Image
                  src={photo.src}
                  alt={photo.caption}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-sm text-gray-500 italic px-1">
                {photo.caption}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Memory Wall */}
      <section className="mx-auto max-w-2xl px-4 pb-16 sm:px-6">
        <h2 className="mb-6 font-serif text-2xl font-medium text-gray-900">
          Memories &amp; Stories
        </h2>
        <div className="space-y-4">
          {DEMO_MEMORIES.map((memory, i) => (
            <div
              key={i}
              className="rounded-2xl border border-amber-100 bg-white/80 p-5 shadow-sm"
            >
              <p className="text-base leading-relaxed text-gray-700">
                {memory.content}
              </p>
              <p className="mt-3 text-sm font-medium text-gray-500">
                — {memory.name}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-2xl px-4 pb-16 sm:px-6 text-center">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-8">
          <h2 className="font-serif text-2xl font-medium text-gray-900">
            Create a memorial for your pet
          </h2>
          <p className="mt-2 text-gray-500">
            Honor their memory with a beautiful, permanent tribute.
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
