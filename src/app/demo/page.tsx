import type { Metadata } from "next";
import { LiveDemo } from "@/components/demo/live-demo";

export const metadata: Metadata = {
  title: "Live call",
  description: "Call the after-hours receptionist yourself and watch the lead fill in while you talk.",
};

export default function DemoPage() {
  return <LiveDemo />;
}
