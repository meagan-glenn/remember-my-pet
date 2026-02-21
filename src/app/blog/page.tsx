import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog — RememberMyPet.ai",
  description: "Thoughts on pet loss, grief, and how to honor the animals who shaped our lives.",
};

const posts = [
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
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-serif text-3xl font-medium text-gray-900 md:text-4xl">
          Blog
        </h1>
        <p className="mt-3 text-gray-500 text-base leading-relaxed">
          Thoughts on pet loss, grief, and honoring the animals who shaped our lives.
        </p>

        <div className="mt-12 space-y-10">
          {posts.map((post) => (
            <article key={post.slug} className="border-b border-gray-100 pb-10">
              <p className="text-xs text-gray-400 uppercase tracking-wide">{post.date}</p>
              <h2 className="mt-2 font-serif text-xl font-medium text-gray-900 leading-snug">
                <Link href={`/blog/${post.slug}`} className="hover:text-amber-600 transition-colors">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-3 text-gray-500 text-sm leading-relaxed">{post.excerpt}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-4 inline-block text-sm text-amber-600 hover:text-amber-700 transition-colors"
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
