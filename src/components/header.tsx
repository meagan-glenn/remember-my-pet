import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase-server";
import { Button } from "@/components/ui/button";
import { PawPrint } from "lucide-react";

export async function Header() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-amber-100/60 bg-white/70 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-serif text-lg font-semibold text-gray-800">
          <PawPrint className="h-5 w-5 text-amber-600" />
          RememberMyPet.ai
        </Link>
        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-gray-600">
                  Dashboard
                </Button>
              </Link>
              <Link href="/create">
                <Button size="sm" className="rounded-full bg-amber-600 hover:bg-amber-700">
                  Create a Tribute
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/sign-in">
              <Button size="sm" variant="ghost" className="text-gray-600">
                Sign in
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
