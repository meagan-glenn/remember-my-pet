import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — RememberMyPet.ai",
  description: "Terms and conditions for using RememberMyPet.ai.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-serif text-3xl font-medium text-gray-900 md:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Last updated: January 31, 2026
        </p>

        <div className="mt-10 space-y-8 text-base leading-relaxed text-gray-600">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              1. Acceptance of Terms
            </h2>
            <p className="mt-3">
              By accessing or using RememberMyPet.ai (&quot;the Service&quot;),
              you agree to be bound by these Terms of Service. If you do not
              agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              2. Description of Service
            </h2>
            <p className="mt-3">
              RememberMyPet.ai provides a platform for creating digital pet
              memorials, including AI-generated tributes, photo galleries,
              memory walls, video reels, and printed keepsakes. The Service is
              available via web browser.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              3. User Accounts
            </h2>
            <p className="mt-3">
              You may create memorials without an account, but saving requires
              authentication via email magic link. You are responsible for
              maintaining the security of your account and for all activities
              under your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              4. Content Ownership
            </h2>
            <p className="mt-3">
              You retain all rights to the photos, text, videos, and other
              content you upload. By using the Service, you grant us a limited
              license to host, display, and process your content solely to
              provide the Service. AI-generated tributes and captions created
              by the Service are yours to use as you wish.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              5. Acceptable Use
            </h2>
            <p className="mt-3">You agree not to:</p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Upload content that is illegal, harmful, or violates others&apos; rights</li>
              <li>Use the Service for any purpose other than creating pet memorials</li>
              <li>Attempt to gain unauthorized access to the Service or its systems</li>
              <li>Use automated tools to scrape or extract content from the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              6. Payments & Refunds
            </h2>
            <p className="mt-3">
              Memorial plans are sold as one-time purchases. Payments are
              processed securely via Stripe. If you are unsatisfied with your
              purchase, contact us within 30 days at{" "}
              <a
                href="mailto:hello@remembermypet.ai"
                className="text-amber-600 hover:underline"
              >
                hello@remembermypet.ai
              </a>{" "}
              for a full refund.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              7. Memorial Hosting
            </h2>
            <p className="mt-3">
              All memorials are preserved in your account. Paid memorials
              become publicly accessible and are hosted indefinitely at no
              additional cost. We will make reasonable efforts to maintain
              uptime and data integrity. In the unlikely event of service
              discontinuation, we will provide at least 90 days notice and
              the ability to export your data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              8. Memory Wall Contributions
            </h2>
            <p className="mt-3">
              Third-party contributions to a memorial&apos;s memory wall are
              subject to moderation by the memorial owner. Contributors grant
              the memorial owner and the Service a license to display their
              contributions on the memorial page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              9. Limitation of Liability
            </h2>
            <p className="mt-3">
              The Service is provided &quot;as is&quot; without warranties of
              any kind. We are not liable for any indirect, incidental, or
              consequential damages arising from your use of the Service. Our
              total liability is limited to the amount you paid for the
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              10. Changes to Terms
            </h2>
            <p className="mt-3">
              We may update these terms from time to time. Continued use of the
              Service after changes constitutes acceptance of the updated
              terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              11. Contact
            </h2>
            <p className="mt-3">
              Questions about these terms? Email us at{" "}
              <a
                href="mailto:hello@remembermypet.ai"
                className="text-amber-600 hover:underline"
              >
                hello@remembermypet.ai
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
