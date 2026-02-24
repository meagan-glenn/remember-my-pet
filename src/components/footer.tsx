import Link from "next/link";
import { PawPrint } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-amber-100/60 bg-white/70 mt-auto dark:border-amber-900/30 dark:bg-gray-950/70">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 font-serif text-lg font-semibold text-gray-800 dark:text-amber-100"
            >
              <PawPrint className="h-5 w-5 text-amber-600" />
              RememberMyPet.ai
            </Link>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              Create a beautiful, lasting memorial for the pet who changed your
              life.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-amber-100">Product</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <Link href="/create" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Create a Memorial
                </Link>
              </li>
              <li>
                <Link href="/demo" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  See an Example
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-amber-100">Company</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <Link href="/blog/why-i-built-this" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <a
                  href="mailto:team@remembermypet.ai"
                  className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <Link href="/ai-info" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  AI Info
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-amber-100">Legal</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <Link href="/privacy" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-amber-100/60 dark:border-amber-900/30 pt-6 text-center space-y-3">
          <p className="text-sm text-gray-500">
            RememberMyPet is free while we&apos;re getting started. If it helped,{" "}
            <a
              href="https://buymeacoffee.com/meaganglenn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-600 hover:text-amber-700 underline underline-offset-2 dark:text-amber-400 dark:hover:text-amber-300"
            >
              showing your support
            </a>{" "}
            will help keep it that way.
          </p>
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} RememberMyPet.ai. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
