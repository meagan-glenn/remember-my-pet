import Link from "next/link";
import { PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-950 flex items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <PawPrint className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h1 className="font-serif text-3xl font-medium text-gray-900 dark:text-amber-50">
          We couldn&apos;t find this page
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          The memorial or page you&apos;re looking for may have been moved or
          no longer exists.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-gray-900">
              Go home
            </Button>
          </Link>
          <Link href="/create">
            <Button variant="outline" className="w-full sm:w-auto">
              Create a memorial
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
