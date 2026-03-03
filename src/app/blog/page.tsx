import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog — RememberMyPet.ai",
  description: "Thoughts on pet loss, grief, and how to honor the animals who shaped our lives.",
};

const posts = [
  {
    slug: "did-i-make-the-right-decision",
    title: "Did I make the right decision? On euthanasia guilt and the weight of choosing.",
    date: "March 3, 2026",
    excerpt:
      "I knew putting Skylar down was the right call. I could see it in her. But the guilt came anyway — not about the decision, but about the days I worked too late, the hikes I took without her, the time I'll never get back.",
  },
  {
    slug: "is-it-normal-to-grieve-a-pet-this-much",
    title: "Is it normal to grieve a pet this much?",
    date: "February 28, 2026",
    excerpt:
      "If you're still crying over a pet you lost months or years ago, nothing is wrong with you. The intensity of the grief isn't a sign that something is broken — it's a sign of how real the relationship was.",
  },
  {
    slug: "shes-live",
    title: "She's live",
    date: "February 25, 2026",
    excerpt:
      "I published Skylar's memorial today. After weeks of building this platform, I finally hit the button. Here's what it felt like to turn grief into something that might help other people.",
  },
  {
    slug: "some-days-are-harder",
    title: "Some days are just harder — and that's okay",
    date: "February 23, 2026",
    excerpt:
      "I thought I was doing better. Then today happened. If you're having one of those days where the grief hits all over again, this is for you.",
  },
  {
    slug: "coping-with-pet-loss",
    title: "Coping with pet loss: what actually helped me",
    date: "February 20, 2026",
    excerpt:
      "There's no shortage of advice about grief online. Most of it doesn't help. Here's what actually did — for me, in the weeks after losing my dog of 13 years.",
  },
  {
    slug: "why-i-built-this",
    title: "I lost my dog of 13 years. Then I built this.",
    date: "February 20, 2026",
    excerpt:
      "Skylar was a husky. She was mouthy and funny and full of more energy than any dog I'd ever seen. She was also my best friend for 13 and a half years. This is why I built RememberMyPet.ai.",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-serif text-3xl font-medium text-gray-900 dark:text-amber-50 md:text-4xl">
          Blog
        </h1>
        <p className="mt-3 text-gray-500 dark:text-gray-400 text-base leading-relaxed">
          Thoughts on pet loss, grief, and honoring the animals who shaped our lives.
        </p>

        <div className="mt-12 space-y-10">
          {posts.map((post) => (
            <article key={post.slug} className="border-b border-gray-100 dark:border-amber-900/30 pb-10">
              <p className="text-xs text-gray-400 uppercase tracking-wide">{post.date}</p>
              <h2 className="mt-2 font-serif text-xl font-medium text-gray-900 dark:text-amber-50 leading-snug">
                <Link href={`/blog/${post.slug}`} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-3 text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{post.excerpt}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-4 inline-block text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
              >
                Read more →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
