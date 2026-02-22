"use client";

import { useState, useEffect } from "react";
import { FeedCard } from "./feed-card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface FeedItem {
  id: string;
  petName: string;
  species: string | null;
  slug: string;
  tributeSnippet: string | null;
  heroPhotoUrl: string | null;
  candleCount: number;
  userLit: boolean;
  createdAt: string;
}

export function ActivityFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetch("/api/feed?limit=6")
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items || []);
        setHasMore(data.hasMore ?? false);
      })
      .catch(() => {
        // Feed is non-critical — silently fail
      })
      .finally(() => setLoading(false));
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/feed?limit=6&offset=${items.length}`);
      const data = await res.json();
      setItems((prev) => [...prev, ...(data.items || [])]);
      setHasMore(data.hasMore ?? false);
    } catch {
      // Silently fail
    } finally {
      setLoadingMore(false);
    }
  };

  // Don't render the section at all if there are no feed items
  if (!loading && items.length === 0) return null;

  if (loading) {
    return (
      <section className="px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-serif text-3xl font-medium text-gray-900 md:text-4xl">
            Recently remembered
          </h2>
          <p className="mt-4 text-center text-gray-500">
            Pets loved and honored by our community
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-amber-100 bg-white/80 overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-5 w-24 bg-gray-200 rounded" />
                  <div className="h-4 w-full bg-gray-100 rounded" />
                  <div className="h-4 w-2/3 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center font-serif text-3xl font-medium text-gray-900 md:text-4xl">
          Recently remembered
        </h2>
        <p className="mt-4 text-center text-gray-500">
          Pets loved and honored by our community
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <FeedCard {...item} />
            </motion.div>
          ))}
        </div>

        {hasMore && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={loadingMore}
              className="rounded-full border-amber-200 text-amber-700 hover:bg-amber-50"
            >
              {loadingMore ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                  Loading...
                </span>
              ) : (
                "See more memorials"
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
