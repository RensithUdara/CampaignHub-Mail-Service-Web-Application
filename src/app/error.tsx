"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 py-24 text-center">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
        Something went wrong
      </h2>
      <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
        {error.message || "An unexpected error occurred."}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
