import type { Metadata } from "next";
import DesignSystem from "../../components/design-system/Designsystem";

export const metadata: Metadata = {
  title: "Design system",
  description:
    "Preview of color and typography tokens from src/app/globals.css",
};

export default function DesignSystemPage() {
  return <DesignSystem />;
}
