"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemoryForm } from "./memory-form";

interface ExpandableMemoryFormProps {
  memorialId: string;
  petName: string;
}

export function ExpandableMemoryForm({ memorialId, petName }: ExpandableMemoryFormProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center">
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.div
            key="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="outline"
              onClick={() => setOpen(true)}
              className="rounded-full border-amber-200 px-6 py-2 text-sm hover:bg-amber-50 dark:border-amber-800/30 dark:hover:bg-amber-900/20 dark:text-amber-200"
            >
              <PenLine className="mr-2 h-4 w-4" />
              Share a memory of {petName}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full overflow-hidden"
          >
            <MemoryForm memorialId={memorialId} petName={petName} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
