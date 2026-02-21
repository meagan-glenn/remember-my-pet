import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Coping with Pet Loss: What Actually Helped Me — RememberMyPet.ai",
  description:
    "After losing my dog Skylar, I learned what actually helps with pet loss grief — and what doesn't. Here's what got me through the hardest days.",
};

export default function CopingWithPetLossPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <Link href="/blog" className="text-sm text-amber-600 hover:text-amber-700 transition-colors">
          ← Back to blog
        </Link>

        <p className="mt-8 text-xs text-gray-400 uppercase tracking-wide">February 20, 2026</p>
        <h1 className="mt-2 font-serif text-3xl font-medium text-gray-900 leading-snug md:text-4xl">
          Coping with pet loss: what actually helped me
        </h1>

        <div className="mt-10 space-y-6 text-base leading-relaxed text-gray-600">
          <p>
            I lost my dog Skylar on January 28th. She was a husky, 13 and a half years old, and
            she was my whole world. When she died, I didn&apos;t know what to do with myself. I
            still don&apos;t, some days.
          </p>

          <p>
            There&apos;s no shortage of advice about grief online. Most of it is well-meaning and
            most of it doesn&apos;t help. So I wanted to write about what actually did — for me,
            in the weeks after losing her. Not as a prescription, but as one person talking to
            another.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 pt-2">Get out of the house</h2>
          <p>
            This was the hardest and most important thing. The house is full of them — the spot
            where they slept, the bowl, the leash hanging by the door. Staying home and sitting in
            that absence is brutal. It doesn&apos;t mean you&apos;re avoiding grief. It means
            you&apos;re giving yourself air.
          </p>
          <p>
            I had a vacation already planned when Skylar passed. I almost canceled it. I&apos;m
            glad I didn&apos;t. It was hard — grief travels with you — but being somewhere
            different, out of the routines we&apos;d built together, gave me room to breathe.
            Even just a walk somewhere new helped.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 pt-2">Stay busy — intentionally</h2>
          <p>
            Idle time is the worst. Not because you should suppress what you&apos;re feeling, but
            because unstructured silence just loops you back to the same thoughts. Find something
            to put your hands on. A project. A show you can get absorbed in. I watched a lot of
            movies I loved — familiar ones, comforting ones. It helped more than I expected.
          </p>
          <p>
            For me, building RememberMyPet.ai was part of this. It gave the grief somewhere to go.
            Not everyone needs to start a company, obviously — but having something to work toward,
            something that felt meaningful, made the days feel less empty.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 pt-2">Let yourself want what you want</h2>
          <p>
            I want a new puppy. I&apos;ve wanted one since about two weeks after Skylar died. My
            husband isn&apos;t ready, which I understand — we grieve differently, on different
            timelines. But I&apos;ve stopped feeling guilty about wanting one.
          </p>
          <p>
            Getting a new pet isn&apos;t replacing the one you lost. It&apos;s not a betrayal.
            It&apos;s one of many things people do to move forward — and moving forward
            doesn&apos;t mean forgetting. Some people need time. Some people find that a new animal
            helps them heal. Both are okay.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 pt-2">Find people who get it</h2>
          <p>
            Not everyone will understand. Some people will say the wrong thing — not out of malice,
            just because they haven&apos;t been through it. That&apos;s okay. Find the ones who
            have. Communities like r/Petloss exist for exactly this reason. Reading other
            people&apos;s stories, even strangers&apos;, can remind you that what you&apos;re
            feeling is real and it&apos;s shared.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 pt-2">Preserve what you can</h2>
          <p>
            One thing I wish I&apos;d done sooner was gather everything — the photos scattered
            across my phone, the videos, the memories I was afraid I&apos;d start to forget. Grief
            has a way of making you worry about that. You don&apos;t want the hard days to be what
            you remember most.
          </p>
          <p>
            That&apos;s the other reason I built this. A memorial isn&apos;t about death. It&apos;s
            about life — the 13 years, not the last day. Having a place to put all of that helped
            me more than I expected.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 pt-2">There&apos;s no timeline</h2>
          <p>
            You don&apos;t have to be over it in a week. Or a month. Or a year. The people who
            tell you it gets easier are right — but they usually forget to mention that it gets
            easier on its own schedule, not yours. Be patient with yourself. The fact that
            it hurts this much just means you loved them that much. That&apos;s not something
            to rush past.
          </p>

          <p className="text-gray-400 text-sm pt-4">— Meagan, founder of RememberMyPet.ai</p>
        </div>

        <div className="mt-12 rounded-2xl bg-amber-50 border border-amber-100 p-6 text-center space-y-3">
          <p className="text-gray-700 text-sm leading-relaxed">
            Want to preserve their memory somewhere that lasts?
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
