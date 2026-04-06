"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type StatusType = "not-started" | "in-progress" | "complete" | "disabled";

interface FeatureCardProps {
  title: string;
  description: string;
  status: string;
  statusType: StatusType;
  href: string;
  icon: ReactNode;
  step?: number;
  highlighted?: boolean;
}

const statusColors: Record<StatusType, string> = {
  "not-started": "text-gray-400 bg-gray-100 dark:text-gray-500 dark:bg-gray-800",
  "in-progress": "text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30",
  "complete": "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
  "disabled": "text-gray-400 bg-gray-100 dark:text-gray-500 dark:bg-gray-800",
};

export function FeatureCard({ title, description, status, statusType, href, icon, step, highlighted }: FeatureCardProps) {
  const isDisabled = statusType === "disabled";

  const content = (
    <div
      className={`rounded-2xl border p-5 transition-all ${
        isDisabled
          ? "border-gray-100 bg-gray-50 opacity-60 cursor-default dark:border-gray-800 dark:bg-gray-900/50"
          : highlighted
            ? "border-amber-300 bg-amber-50/50 hover:border-amber-400 hover:shadow-md cursor-pointer ring-1 ring-amber-200 dark:border-amber-700 dark:bg-amber-950/20 dark:ring-amber-800/40 dark:hover:border-amber-600"
            : "border-gray-200 bg-white hover:border-amber-300 hover:shadow-md cursor-pointer dark:border-amber-900/30 dark:bg-gray-900/40 dark:hover:border-amber-700"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 relative">
          <div className={`rounded-xl p-3 ${isDisabled ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500" : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"}`}>
            {icon}
          </div>
          {step !== undefined && (
            <span className={`absolute -top-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
              statusType === "not-started"
                ? "border-2 border-gray-300 text-gray-400 bg-white dark:border-gray-600 dark:text-gray-500 dark:bg-gray-950"
                : "bg-amber-600 text-white dark:bg-amber-500 dark:text-gray-900"
            }`}>
              {step}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-amber-50">{title}</h3>
          <p className="text-sm text-gray-500 mt-0.5 dark:text-gray-400">{description}</p>
          {status && (
            <span className={`inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[statusType]}`}>
              {status}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (isDisabled) return content;

  return <Link href={href}>{content}</Link>;
}
