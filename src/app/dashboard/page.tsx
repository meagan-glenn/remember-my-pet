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
import Link from "next/link";
import { SignOutButton } from "./sign-out-button";
import { DashboardTabs } from "./dashboard-tabs";
import { FeedToggle } from "@/components/dashboard/feed-toggle";

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
    .select("id, pet_name, slug, is_paid, is_published, show_in_feed, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Count pending memories across all user's memorials
  const memorialIds = memorials?.map((m) => m.id) || [];
  let pendingCount = 0;
  if (memorialIds.length > 0) {
    const { count } = await supabase
      .from("memories")
      .select("*", { count: "exact", head: true })
      .in("memorial_id", memorialIds)
      .eq("moderation_status", "pending");
    pendingCount = count || 0;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-8 px-4 dark:from-gray-950 dark:to-gray-950">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-amber-50">My Memorials</h1>
          <SignOutButton />
        </div>

        <Link href="/create">
          <Button className="w-full h-12 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-gray-900 text-base">
            Create a Memorial
          </Button>
        </Link>

        {memorials?.some((m) => m.is_published) && (
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
              {memorials.map((memorial) => (
                <Card key={memorial.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
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
                  </CardHeader>
                  <CardContent className="flex items-center gap-4">
                    <Link
                      href={`/${memorial.slug}`}
                      className="text-sm text-amber-600 hover:underline dark:text-amber-400"
                    >
                      View memorial
                    </Link>
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
              ))}
            </div>
          )}
        </DashboardTabs>
      </div>
    </div>
  );
}
