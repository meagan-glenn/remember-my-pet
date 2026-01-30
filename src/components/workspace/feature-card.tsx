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
}

const statusColors: Record<StatusType, string> = {
  "not-started": "text-gray-400 bg-gray-100",
  "in-progress": "text-amber-700 bg-amber-100",
  "complete": "text-green-700 bg-green-100",
  "disabled": "text-gray-400 bg-gray-100",
};

export function FeatureCard({ title, description, status, statusType, href, icon }: FeatureCardProps) {
  const isDisabled = statusType === "disabled";

  const content = (
    <div
      className={`rounded-2xl border p-5 transition-all ${
        isDisabled
          ? "border-gray-100 bg-gray-50 opacity-60 cursor-default"
          : "border-gray-200 bg-white hover:border-amber-300 hover:shadow-md cursor-pointer"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 rounded-xl p-3 ${isDisabled ? "bg-gray-100 text-gray-400" : "bg-amber-50 text-amber-600"}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          <span className={`inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[statusType]}`}>
            {status}
          </span>
        </div>
      </div>
    </div>
  );

  if (isDisabled) return content;

  return <Link href={href}>{content}</Link>;
}
