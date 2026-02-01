import Link from "next/link";
import { PawPrint } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-amber-100/60 bg-white/70 mt-auto">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 font-serif text-lg font-semibold text-gray-800"
            >
              <PawPrint className="h-5 w-5 text-amber-600" />
              RememberMyPet.ai
            </Link>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              Create a beautiful, lasting tribute for the pet who changed your
              life.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Product</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/create" className="hover:text-amber-600 transition-colors">
                  Create a Tribute
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-amber-600 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/demo" className="hover:text-amber-600 transition-colors">
                  See an Example
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Company</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li>
                <a
                  href="mailto:hello@remembermypet.ai"
                  className="hover:text-amber-600 transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Legal</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/privacy" className="hover:text-amber-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-amber-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-amber-100/60 pt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} RememberMyPet.ai. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
