import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — RememberMyPet.ai",
  description: "How we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-serif text-3xl font-medium text-gray-900 dark:text-amber-50 md:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Last updated: April 5, 2026
        </p>

        <div className="mt-10 space-y-8 text-base leading-relaxed text-gray-600 dark:text-gray-300">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-amber-50">
              1. Information We Collect
            </h2>
            <p className="mt-3">
              When you use RememberMyPet.ai, we collect information you provide
              directly: your email address (for authentication), pet details
              (name, species, dates), photos, videos, tribute text, memory wall
              contributions, and any conversations you have with our decision
              support feature. We also collect standard usage data such as IP
              address (used for rate limiting to prevent abuse), browser type,
              and pages visited. We use FullStory to record session replays
              (clicks, scrolls, and page navigation) to understand how people
              use the site and improve the experience. FullStory automatically
              masks sensitive input fields. When you make a purchase, payment
              information is collected and processed directly by Stripe — we
              never see or store your full card details.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-amber-50">
              2. How We Use Your Information
            </h2>
            <p className="mt-3">We use your information to:</p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Create and host your pet memorial</li>
              <li>Generate AI-written tributes and photo captions</li>
              <li>Send transactional emails (sign-in links, memory wall notifications)</li>
              <li>Improve our service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-amber-50">
              3. AI Processing
            </h2>
            <p className="mt-3">
              We use Anthropic&apos;s Claude models to generate tributes, write
              photo captions, analyze photos for visual tags, and power the
              decision support conversations. Your pet&apos;s details, photos,
              and any text you share with the AI are sent to Anthropic solely
              to generate your content. Anthropic does not use data sent via
              their API to train their models, and we do not sell or share
              your content with any third party for training purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-amber-50">
              4. Data Storage & Security
            </h2>
            <p className="mt-3">
              Your data is stored securely on Supabase (PostgreSQL database and
              file storage) and hosted on Vercel. Photos and videos are stored
              in encrypted cloud storage. We use HTTPS for all data
              transmission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-amber-50">
              5. Sharing & Disclosure
            </h2>
            <p className="mt-3">
              We do not sell your personal information. We share data only with
              service providers necessary to operate the platform: Supabase
              (database and file storage), Vercel (hosting), Anthropic (AI for
              tributes, captions, and decision support), Resend (transactional
              email), Stripe (payment processing, when paid plans are enabled),
              and FullStory (session replay analytics). Published memorials are
              publicly accessible via their unique URL — you control when and
              if a memorial is published.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-amber-50">
              6. Your Rights
            </h2>
            <p className="mt-3">
              You can access, update, or delete any memorial from your
              dashboard at any time. Deleting a memorial permanently removes
              its photos, memories, candles, and all associated content. To
              request full account deletion or a copy of your data, contact us
              at{" "}
              <a
                href="mailto:team@remembermypet.ai"
                className="text-amber-600 hover:underline dark:text-amber-400"
              >
                team@remembermypet.ai
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-amber-50">
              7. Cookies
            </h2>
            <p className="mt-3">
              We use essential cookies for authentication and session
              management. FullStory uses cookies and local storage to power
              session replay analytics. We do not use advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-amber-50">
              8. Changes to This Policy
            </h2>
            <p className="mt-3">
              We may update this policy from time to time. We&apos;ll notify
              you of significant changes via email or a notice on our site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-amber-50">
              9. Contact Us
            </h2>
            <p className="mt-3">
              Questions about this policy? Email us at{" "}
              <a
                href="mailto:team@remembermypet.ai"
                className="text-amber-600 hover:underline dark:text-amber-400"
              >
                team@remembermypet.ai
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
