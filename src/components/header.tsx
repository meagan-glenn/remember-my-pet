import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase-server";
import { Button } from "@/components/ui/button";

export async function Header() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold text-gray-900">
          PetMemorial.ai
        </Link>
        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Link href="/create">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                  Create a Tribute
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/sign-in">
              <Button size="sm" variant="outline">
                Sign in
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
