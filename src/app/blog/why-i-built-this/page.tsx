import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "I lost my dog of 13 years. Then I built this. — RememberMyPet.ai",
  description:
    "Skylar was a husky who was my best friend for 13 and a half years. Losing her on January 28th stopped my whole world. This is why I built RememberMyPet.ai.",
};

export default function WhyIBuiltThisPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <Link href="/blog" className="text-sm text-amber-600 hover:text-amber-700 transition-colors">
          ← Back to blog
        </Link>

        <p className="mt-8 text-xs text-gray-400 uppercase tracking-wide">February 20, 2026</p>
        <h1 className="mt-2 font-serif text-3xl font-medium text-gray-900 leading-snug md:text-4xl">
          I lost my dog of 13 years. Then I built this.
        </h1>

        <div className="mt-10 space-y-6 text-base leading-relaxed text-gray-600">
          <p>
            Skylar was a husky. Mouthy the way huskies are — she had opinions about everything and
            wasn&apos;t shy about sharing them. She was funny and playful and had more energy than
            any dog I&apos;d ever seen. She was also my best friend for 13 and a half years.
          </p>

          <p>
            I lost her on January 28th.
          </p>

          <p>
            I don&apos;t have a softer way to say what that felt like. My whole world stopped. The
            house felt wrong. The mornings felt wrong. I kept reaching for routines that didn&apos;t
            exist anymore — the walk, the feeding, the way she&apos;d demand attention at exactly the
            wrong moment. She had been sick for a while, and so much of my life had been built around
            her care. When she was gone, I didn&apos;t just lose her. I lost the structure of my days.
          </p>

          <p>
            People don&apos;t always understand that. They mean well. But pet loss sits in this
            strange in-between — too big to just shake off, not always treated with the weight it
            deserves. You grieve, but sometimes quietly, because the world keeps moving and not
            everyone stops with you.
          </p>

          <p>
            I wanted to do something with that. Not to fix it — you can&apos;t fix grief — but to
            create a place where it could land. Somewhere you could put the photos, the memories, the
            words you couldn&apos;t find at first. Somewhere that said: this mattered. She mattered.
          </p>

          <p>
            That&apos;s what RememberMyPet.ai is. A memorial — a real one, not a folder of photos on
            your phone. A place where the people who loved your pet can gather, leave their own
            memories, and remember together. Something that lives online, always there, long after the
            hard days start to soften.
          </p>

          <p>
            I built it for anyone going through what I went through. For the person whose dog was
            their reason to get up. For the person whose cat slept on their chest every night for a
            decade. For the person who can&apos;t explain why they&apos;re still crying two weeks
            later — because the answer is simple: you loved them, and they&apos;re gone.
          </p>

          <p>
            If you&apos;re here because you lost your best friend, I&apos;m sorry. I know what that feels
            like. I hope this helps, even a little.
          </p>

          <p className="text-gray-400 text-sm">— Meagan, founder of RememberMyPet.ai</p>
        </div>

        <div className="mt-12 rounded-2xl bg-amber-50 border border-amber-100 p-6 text-center space-y-3">
          <p className="text-gray-700 text-sm leading-relaxed">
            Ready to create a memorial for your pet?
          </p>
          <Link
            href="/create"
            className="inline-block rounded-full bg-amber-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
          >
            Create a memorial
          </Link>
        </div>
      </div>
    </div>
  );
}
