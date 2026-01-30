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
    .select("id, pet_name, slug, is_paid, is_published, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

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
                      variant={memorial.is_published ? "default" : "secondary"}
                    >
                      {memorial.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <CardDescription>
                    Created{" "}
                    {new Date(memorial.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/${memorial.slug}`}
                    className="text-sm text-amber-600 hover:underline"
                  >
                    View memorial
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
