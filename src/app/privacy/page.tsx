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
          Last updated: January 31, 2026
        </p>

        <div className="mt-10 space-y-8 text-base leading-relaxed text-gray-600 dark:text-gray-300">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-amber-50">
              1. Information We Collect
            </h2>
            <p className="mt-3">
              When you use RememberMyPet.ai, we collect information you provide
              directly: your email address (for authentication), pet details
              (name, species, dates), photos, videos, tribute text, and memory
              wall contributions. We also collect standard usage data such as IP
              address, browser type, and pages visited.
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
              <li>Process payments via Stripe</li>
              <li>Send transactional emails (sign-in links, memory wall notifications)</li>
              <li>Improve our service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-amber-50">
              3. AI Processing
            </h2>
            <p className="mt-3">
              We use AI services (Anthropic Claude for tribute generation,
              Google Gemini for photo analysis) to create personalized content.
              Your pet&apos;s details and memories are sent to these services
              solely to generate your tribute and captions. We do not use your
              content to train AI models.
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
              transmission. Payment information is handled entirely by Stripe
              and never touches our servers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-amber-50">
              5. Sharing & Disclosure
            </h2>
            <p className="mt-3">
              We do not sell your personal information. We share data only with
              service providers necessary to operate the platform (Supabase,
              Vercel, Stripe, Anthropic, Google, Resend for email). Published
              memorials are publicly accessible via their unique URL — you
              control when and if a memorial is published.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-amber-50">
              6. Your Rights
            </h2>
            <p className="mt-3">
              You can access, update, or delete your memorial and account data
              at any time from your dashboard. To request full data deletion,
              contact us at{" "}
              <a
                href="mailto:teamremembermypet@gmail.com"
                className="text-amber-600 hover:underline dark:text-amber-400"
              >
                teamremembermypet@gmail.com
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
              management. We do not use advertising or tracking cookies.
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
                href="mailto:teamremembermypet@gmail.com"
                className="text-amber-600 hover:underline dark:text-amber-400"
              >
                teamremembermypet@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
