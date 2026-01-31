import { Resend } from "resend";

const FROM_EMAIL = "PetMemorial.ai <noreply@petmemorial.ai>";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendMemoryNotification({
  ownerEmail,
  petName,
  contributorName,
  memoryPreview,
  memorialSlug,
}: {
  ownerEmail: string;
  petName: string;
  contributorName: string;
  memoryPreview: string;
  memorialSlug: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const dashboardUrl = `${siteUrl}/dashboard?tab=pending`;

  const rawPreview = memoryPreview.length > 200
    ? memoryPreview.slice(0, 200) + "…"
    : memoryPreview;

  const safePetName = escapeHtml(petName);
  const safeName = escapeHtml(contributorName);
  const safePreview = escapeHtml(rawPreview);

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: ownerEmail,
      subject: `Someone shared a memory of ${petName}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
          <h2 style="color: #92400e; font-size: 22px; margin-bottom: 8px;">
            A new memory of ${safePetName}
          </h2>
          <p style="color: #6b7280; font-size: 15px; margin-bottom: 20px;">
            <strong>${safeName}</strong> shared a memory:
          </p>
          <blockquote style="border-left: 3px solid #f59e0b; padding-left: 16px; color: #374151; font-style: italic; margin: 0 0 24px;">
            ${safePreview}
          </blockquote>
          <a href="${dashboardUrl}" style="display: inline-block; background: #d97706; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 15px;">
            Review pending memories
          </a>
          <p style="color: #9ca3af; font-size: 13px; margin-top: 32px;">
            This memory won't appear publicly until you approve it.
          </p>
        </div>
      `,
    });
  } catch (error) {
    // Log but don't fail the submission if email fails
    console.error("Failed to send memory notification email:", error);
  }
}
