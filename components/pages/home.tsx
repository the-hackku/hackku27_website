"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type Dispatch, type SetStateAction, useEffect } from "react";

interface HomeViewProps {
  setView: Dispatch<SetStateAction<"welcome" | "learn">>;
}

export function HomeView({ setView }: HomeViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // biome-ignore lint/correctness/useExhaustiveDependencies: setView does not determine when we need to set the view
  useEffect(() => {
    if (searchParams.has("reset")) {
      setView("welcome");
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router]);
  return null;
}
