import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "She's Live — Building a Pet Memorial From Grief — RememberMyPet.ai",
  description:
    "After weeks of building RememberMyPet.ai, I finally published Skylar's memorial. Here's what it felt like to turn grief into something that might help other people.",
};

export default function ShesLivePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <Link href="/blog" className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors">
          &larr; Back to blog
        </Link>

        <p className="mt-8 text-xs text-gray-400 uppercase tracking-wide">February 25, 2026</p>
        <h1 className="mt-2 font-serif text-3xl font-medium text-gray-900 dark:text-amber-50 leading-snug md:text-4xl">
          She&apos;s live
        </h1>

        <div className="mt-10 space-y-6 text-base leading-relaxed text-gray-600 dark:text-gray-300">
          <p>
            I published{" "}
            <Link href="/skylar-glenn-2026" className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 underline">
              Skylar&apos;s memorial
            </Link>{" "}
            today. Hit the button and just sat there for a minute.
          </p>

          <p>
            It&apos;s a weird feeling. I&apos;ve been building this thing for weeks — late nights,
            weekends, staring at code until my eyes blur. And the whole time, technically, I was
            building a product. A platform. Something for other people. But the truth is, I was
            building it for her first.
          </p>

          <p>
            Every feature I added, I was thinking about Skylar. When I built the photo gallery,
            I was scrolling through 13 years of her photos trying to pick the best ones. When I
            wrote the tribute system, I was testing it with her name, her story, her weird habits.
            When I added the memory wall, I was thinking about the people in her life who loved
            her too — and wishing they had a place to say so.
          </p>

          <p>
            She was the first memorial on this platform, and she always will be.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-amber-50 pt-2">Grief needs somewhere to go</h2>
          <p>
            I said this in an earlier post, but it&apos;s more true now than when I wrote it.
            The hardest part of losing Skylar wasn&apos;t the sadness — it was the restlessness.
            The feeling of wanting to do something and having nothing to do. The routines were gone.
            The purpose was gone. And you can only sit with that for so long before you need to
            put the energy somewhere.
          </p>
          <p>
            Building this was where I put it. Every line of code was a way to stay close to her
            without just sitting in the grief. And I don&apos;t mean that in a poetic way — I mean
            literally, working on a memorial platform means you spend your days thinking about
            how to honor a pet&apos;s life. That&apos;s not a bad place to be when you&apos;re
            missing yours.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-amber-50 pt-2">The moment it became real</h2>
          <p>
            There&apos;s a difference between building something and shipping it. For weeks, Skylar&apos;s
            memorial existed in draft mode — photos uploaded, tribute written, everything in place,
            but unpublished. Just mine. And there was something safe about that.
          </p>
          <p>
            Publishing it made it real in a different way. It&apos;s out there now. Anyone can see it.
            People can light a candle, leave a memory, look at her photos. She&apos;s not just in my
            phone anymore — she has a place on the internet that&apos;s hers.
          </p>
          <p>
            I&apos;m proud of that. I&apos;m proud of her page. I think she&apos;d be annoyed
            by the attention, honestly — she was more of a &quot;demand affection on her own
            terms&quot; kind of dog. But I think she&apos;d also like that people can see how
            beautiful she was.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-amber-50 pt-2">Building for other people now</h2>
          <p>
            The thing that surprised me most about this project is how much it changed along the
            way. I started building it because I needed it. But the more I worked on it, the more
            I thought about the other people who need it too — the person who just lost their cat
            of 18 years, the family whose dog got sick too fast, the kid who lost their first pet
            and doesn&apos;t know what to do with that feeling.
          </p>
          <p>
            I wanted to make something that would actually help. Not a generic sympathy card. Not
            a Facebook post that disappears in a feed. Something lasting. A place where you can go
            back to on the hard days and see their face and remember the good parts.
          </p>
          <p>
            That&apos;s what this is now. And it started with a husky named Skylar who had opinions
            about everything and made my life better for 13 and a half years.
          </p>

          <p>
            If you&apos;re going through it right now — I&apos;m sorry. I know. And if you want
            to build something for them,{" "}
            <Link href="/create" className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 underline">
              the door&apos;s open
            </Link>.
          </p>

          <p className="text-gray-400 dark:text-gray-500 text-sm pt-4">&mdash; Meagan, founder of RememberMyPet.ai</p>
        </div>

        <div className="mt-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 p-6 text-center space-y-3">
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            Want to see the memorial that started it all?
          </p>
          <Link
            href="/skylar-glenn-2026"
            className="inline-block rounded-full bg-amber-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-amber-700 dark:bg-amber-500 dark:text-gray-900 dark:hover:bg-amber-400 transition-colors"
          >
            Visit Skylar&apos;s memorial
          </Link>
        </div>
      </div>
    </div>
  );
}
