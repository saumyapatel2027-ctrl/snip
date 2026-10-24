"use client";
import dynamic from "next/dynamic";

export const StudioMap = dynamic(() => import("./StudioMapInner"), {
  ssr: false,
  loading: () => <div className="h-[420px] w-full animate-pulse rounded-[20px] bg-ivory-200" />,
});
export type { MapPoint } from "./StudioMapInner";
