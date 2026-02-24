import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Some Days Are Just Harder — And That's Okay — RememberMyPet.ai",
  description:
    "Grief doesn't follow a schedule. Some days you're fine. Some days it hits you all over again. If today is one of the hard ones, this is for you.",
};

export default function SomeDaysAreHarderPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <Link href="/blog" className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors">
          ← Back to blog
        </Link>

        <p className="mt-8 text-xs text-gray-400 uppercase tracking-wide">February 23, 2026</p>
        <h1 className="mt-2 font-serif text-3xl font-medium text-gray-900 dark:text-amber-50 leading-snug md:text-4xl">
          Some days are just harder — and that&apos;s okay
        </h1>

        <div className="mt-10 space-y-6 text-base leading-relaxed text-gray-600 dark:text-gray-300">
          <p>
            I thought I was doing better. A few days went by where the weight wasn&apos;t as heavy.
            I got through mornings without that gut-punch moment of remembering. I even laughed at
            something — really laughed — and for a second it felt like maybe the worst part was behind me.
          </p>

          <p>
            Then today happened. And I don&apos;t even know what triggered it. There wasn&apos;t a
            specific moment — no song, no photo that caught me off guard. I just woke up and she was
            the first thing I thought of, and it hurt like it was brand new.
          </p>

          <p>
            If you&apos;re having one of those days right now, I want you to know: there&apos;s nothing
            wrong with you. You&apos;re not going backward. You&apos;re not failing at grief. This is
            just how it works.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-amber-50 pt-2">Grief doesn&apos;t move in a straight line</h2>
          <p>
            Everyone talks about grief like it&apos;s a path — like you start at the worst point and
            slowly walk toward something easier. But it doesn&apos;t work that way. It&apos;s more like
            weather. You can have a whole week of clear skies and then get leveled by a storm you
            didn&apos;t see coming.
          </p>
          <p>
            That doesn&apos;t mean the clear days weren&apos;t real. It doesn&apos;t mean you&apos;re
            back at square one. It just means today is hard. And hard days are allowed.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-amber-50 pt-2">The quiet house is the worst part</h2>
          <p>
            What gets me on days like this isn&apos;t the big memories. It&apos;s the small
            absences. The sound that isn&apos;t there when I open the front door. The spot on the
            couch that&apos;s just a spot now. The way the mornings used to have a shape — feed her,
            walk her, check on her — and now they&apos;re just... open. Too open.
          </p>
          <p>
            You don&apos;t realize how much of your day was built around them until the structure is
            gone. And on the hard days, that emptiness is louder than usual.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-amber-50 pt-2">Being kind to yourself isn&apos;t what you think</h2>
          <p>
            I keep hearing that I should &quot;be gentle with myself.&quot; And I want to — but
            honestly, I didn&apos;t know what that meant for a while. It sounded like something
            you&apos;d read on a poster.
          </p>
          <p>
            Here&apos;s what it actually looks like for me: it means not being mad at myself for
            crying again. It means not forcing productivity when my brain won&apos;t cooperate. It
            means letting the house be messy and the emails go unanswered and eating cereal for dinner
            if that&apos;s all I&apos;ve got. It means saying &quot;today is a bad day&quot; without
            adding &quot;but I should be over this by now.&quot;
          </p>
          <p>
            You don&apos;t owe anyone a performance of being okay.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-amber-50 pt-2">The fear of forgetting</h2>
          <p>
            On the bad days, there&apos;s this other thing that creeps in — the worry that you&apos;re
            going to forget. That the details will soften. That one day you won&apos;t be able to
            remember exactly what their fur felt like, or the sound they made when they were happy, or
            the specific way they&apos;d look at you.
          </p>
          <p>
            I don&apos;t have a fix for that fear. But I will say — the fact that you&apos;re afraid of
            forgetting means you haven&apos;t. The memories are still there. They&apos;re the reason
            today hurts. And that&apos;s not a bad thing, even when it doesn&apos;t feel good.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-amber-50 pt-2">Tomorrow might be easier</h2>
          <p>
            It might not be. That&apos;s the honest answer. But the pattern I&apos;ve noticed — and I&apos;m
            still early in this, so take it for what it is — is that the hard days get further apart. Not
            gone. Just further apart. And the good days, the ones where you can think about them and
            smile instead of cry, those start showing up more.
          </p>
          <p>
            Today doesn&apos;t have to mean anything about where you&apos;re headed. It&apos;s just today.
            And you made it through. That counts.
          </p>

          <p className="text-gray-400 dark:text-gray-500 text-sm pt-4">— Meagan, founder of RememberMyPet.ai</p>
        </div>

        <div className="mt-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 p-6 text-center space-y-3">
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            If you&apos;re worried about forgetting, putting the memories somewhere safe can help.
          </p>
          <Link
            href="/create"
            className="inline-block rounded-full bg-amber-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-amber-700 dark:bg-amber-500 dark:text-gray-900 dark:hover:bg-amber-400 transition-colors"
          >
            Create a memorial
          </Link>
        </div>
      </div>
    </div>
  );
}
