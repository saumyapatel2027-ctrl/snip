"use client";
import dynamic from "next/dynamic";

export const LocationPicker = dynamic(() => import("./LocationPickerInner"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse rounded-[20px] bg-ivory-200" />,
});
