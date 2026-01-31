"use client";

import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ModerationQueue } from "@/components/memory-wall/moderation-queue";

interface DashboardTabsProps {
  pendingCount: number;
  children: React.ReactNode;
}

export function DashboardTabs({ pendingCount, children }: DashboardTabsProps) {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "pending" ? "pending" : "memorials";

  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList className="w-full">
        <TabsTrigger value="memorials" className="flex-1">
          Memorials
        </TabsTrigger>
        <TabsTrigger value="pending" className="flex-1 gap-1.5">
          Pending Memories
          {pendingCount > 0 && (
            <Badge className="ml-1 h-5 min-w-[20px] bg-amber-600 px-1.5 text-xs">
              {pendingCount}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="memorials" className="mt-4">
        {children}
      </TabsContent>
      <TabsContent value="pending" className="mt-4">
        <ModerationQueue />
      </TabsContent>
    </Tabs>
  );
}
