"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

export function StepIndicator({
  currentStep,
  totalSteps = 4,
}: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-6">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <motion.div
            key={step}
            className={cn(
              "h-2.5 rounded-full",
              isActive
                ? "bg-amber-500"
                : isCompleted
                  ? "bg-amber-300"
                  : "bg-gray-200"
            )}
            animate={{
              width: isActive ? 32 : 10,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
        );
      })}
    </div>
  );
}
