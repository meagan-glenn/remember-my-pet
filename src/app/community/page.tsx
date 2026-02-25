import type { Metadata } from "next";
import { ActivityFeed } from "@/components/feed/activity-feed";

export const metadata: Metadata = {
  title: "Community Memorials | RememberMyPet.ai",
  description:
    "Browse memorials created by our community. See how people are honoring the pets who changed their lives.",
};

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
      <ActivityFeed />
    </div>
  );
}
