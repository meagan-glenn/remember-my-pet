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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-8 px-4">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Memorials</h1>
          <SignOutButton />
        </div>

        <Link href="/create">
          <Button className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-base">
            Create a Tribute
          </Button>
        </Link>

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
                      className="text-sm text-amber-600 hover:underline"
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
                        className="text-sm font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-full transition-colors"
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
