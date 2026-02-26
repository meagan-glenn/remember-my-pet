import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Eye, Pencil, Flame, MessageCircle, ImageIcon, PawPrint, Users, Share2, HeartHandshake } from "lucide-react";
import { SignOutButton } from "./sign-out-button";
import { DashboardTabs } from "./dashboard-tabs";
import { FeedToggle } from "@/components/dashboard/feed-toggle";
import { ShareLink } from "@/components/dashboard/share-link";
import { ShareCard } from "@/components/dashboard/share-card";

export default async function Dashboard() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?redirect=/dashboard");
  }

  const { data: memorials } = await supabase
    .from("memorials")
    .select("id, pet_name, slug, is_paid, is_published, show_in_feed, created_at, photos(url, sort_order)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const memorialIds = memorials?.map((m) => m.id) || [];

  // Batch-fetch pending count, candle counts, and approved memory counts in parallel
  let pendingCount = 0;
  let candleCounts: Record<string, number> = {};
  let memoryCounts: Record<string, number> = {};

  if (memorialIds.length > 0) {
    const [pendingResult, candleResult, memoryResult] = await Promise.all([
      supabase
        .from("memories")
        .select("*", { count: "exact", head: true })
        .in("memorial_id", memorialIds)
        .eq("moderation_status", "pending"),
      supabase
        .from("candles")
        .select("memorial_id")
        .in("memorial_id", memorialIds),
      supabase
        .from("memories")
        .select("memorial_id")
        .in("memorial_id", memorialIds)
        .eq("moderation_status", "approved"),
    ]);

    pendingCount = pendingResult.count || 0;

    if (candleResult.data) {
      for (const c of candleResult.data) {
        candleCounts[c.memorial_id] = (candleCounts[c.memorial_id] || 0) + 1;
      }
    }

    if (memoryResult.data) {
      for (const m of memoryResult.data) {
        memoryCounts[m.memorial_id] = (memoryCounts[m.memorial_id] || 0) + 1;
      }
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const hasMemorials = !!memorials?.length;
  const hasPublished = memorials?.some((m) => m.is_published);
  const mostRecentPublished = memorials?.find((m) => m.is_published);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-8 px-4 dark:from-gray-950 dark:to-gray-950">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-amber-50">My Memorials</h1>
          <SignOutButton />
        </div>

        {/* Create CTA — prominent for new users, subtle for returning */}
        <Link href="/create">
          {hasMemorials ? (
            <Button variant="outline" className="w-full h-10 border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20">
              + Create another memorial
            </Button>
          ) : (
            <Button className="w-full h-12 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-gray-900 text-base">
              Create a Memorial
            </Button>
          )}
        </Link>

        {/* Feedback card */}
        {hasPublished && (
          <Card className="border-amber-100 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-950/20">
            <CardContent className="flex items-center justify-between py-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                How was your experience creating a memorial?
              </p>
              <a
                href="https://tally.so/r/aQBOYX"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-sm font-medium text-amber-600 hover:underline dark:text-amber-400"
              >
                Share feedback
              </a>
            </CardContent>
          </Card>
        )}

        {/* Decision support nudge */}
        {hasMemorials && (
          <Card className="border-amber-100 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-950/20">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <HeartHandshake className="h-5 w-5 shrink-0 text-amber-500 dark:text-amber-400" />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Carrying guilt or &lsquo;what-ifs&rsquo;? You&apos;re not alone.
                </p>
              </div>
              <Link
                href="/support"
                className="shrink-0 text-sm font-medium text-amber-600 hover:underline dark:text-amber-400"
              >
                Talk it through
              </Link>
            </CardContent>
          </Card>
        )}

        <DashboardTabs pendingCount={pendingCount}>
          {!memorials?.length ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  You haven&apos;t created any memorials yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {memorials.map((memorial) => {
                const photos = Array.isArray(memorial.photos) ? memorial.photos : [];
                const heroPhoto = photos.sort(
                  (a: { sort_order: number }, b: { sort_order: number }) =>
                    (a.sort_order ?? 0) - (b.sort_order ?? 0)
                )[0];
                const photoCount = photos.length;
                const candleCount = candleCounts[memorial.id] || 0;
                const memoryCount = memoryCounts[memorial.id] || 0;
                const memorialUrl = `${siteUrl}/${memorial.slug}`;

                return (
                  <Card key={memorial.id}>
                    <CardHeader className="pb-2">
                      <div className="flex gap-4">
                        {/* Hero photo thumbnail */}
                        <Link href={`/${memorial.slug}`} className="shrink-0">
                          {heroPhoto ? (
                            <div className="relative h-20 w-20 overflow-hidden rounded-xl">
                              <Image
                                src={heroPhoto.url}
                                alt={memorial.pet_name}
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                              <PawPrint className="h-8 w-8 text-amber-400 dark:text-amber-600" />
                            </div>
                          )}
                        </Link>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <CardTitle className="text-lg truncate">
                              {memorial.pet_name}
                            </CardTitle>
                            <Badge
                              variant={
                                memorial.is_published
                                  ? "default"
                                  : memorial.is_paid
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {memorial.is_published
                                ? "Published"
                                : memorial.is_paid
                                  ? "Paid"
                                  : "Draft"}
                            </Badge>
                          </div>
                          <CardDescription>
                            Created{" "}
                            {new Date(memorial.created_at).toLocaleDateString()}
                          </CardDescription>

                          {/* Stats row */}
                          {(candleCount > 0 || memoryCount > 0 || photoCount > 0) && (
                            <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                              {candleCount > 0 && (
                                <span className="flex items-center gap-1">
                                  <Flame className="h-3 w-3" />
                                  {candleCount}
                                </span>
                              )}
                              {memoryCount > 0 && (
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="h-3 w-3" />
                                  {memoryCount}
                                </span>
                              )}
                              {photoCount > 0 && (
                                <span className="flex items-center gap-1">
                                  <ImageIcon className="h-3 w-3" />
                                  {photoCount}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex items-center gap-2">
                      {/* Action icons */}
                      <Button variant="ghost" size="icon-xs" asChild>
                        <Link href={`/${memorial.slug}`} title="View memorial">
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon-xs" asChild>
                        <Link href={`/create?edit=${memorial.id}`} title="Edit memorial">
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      {memorial.is_published && (
                        <ShareLink url={memorialUrl} />
                      )}

                      <div className="flex-1" />

                      {/* Feed toggle / publish CTA */}
                      {memorial.is_published ? (
                        <FeedToggle
                          memorialId={memorial.id}
                          initialValue={memorial.show_in_feed}
                        />
                      ) : (
                        <Link
                          href={`/create?edit=${memorial.id}`}
                          className="text-sm font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-full transition-colors dark:text-amber-300 dark:bg-amber-900/30 dark:hover:bg-amber-900/50"
                        >
                          Publish
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </DashboardTabs>

        {/* What's next section */}
        {hasPublished && mostRecentPublished && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-gray-400 dark:text-gray-500">What&apos;s next</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Link href={`/${mostRecentPublished.slug}`}>
                <Card className="group cursor-pointer border-amber-100 dark:border-amber-900/30 transition-colors hover:bg-amber-50/50 dark:hover:bg-amber-950/20">
                  <CardContent className="flex items-center gap-3 py-4">
                    <Users className="h-5 w-5 shrink-0 text-amber-500 dark:text-amber-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">Invite friends to share memories</p>
                  </CardContent>
                </Card>
              </Link>
              <ShareCard url={`${siteUrl}/${mostRecentPublished.slug}`} />
              <Link href="/support">
                <Card className="group cursor-pointer border-amber-100 dark:border-amber-900/30 transition-colors hover:bg-amber-50/50 dark:hover:bg-amber-950/20">
                  <CardContent className="flex items-center gap-3 py-4">
                    <HeartHandshake className="h-5 w-5 shrink-0 text-amber-500 dark:text-amber-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">Talk through guilt or regret</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

