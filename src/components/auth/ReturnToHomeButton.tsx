import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/Button";

/** กลับหน้าแรกจากหน้า login / register */
export default function ReturnToHomeButton(): React.JSX.Element {
  return (
    <Button
      href="/"
      variant="secondary"
      size="md"
      className="w-full justify-center gap-2 rounded-xl border border-brand-gray-200 bg-brand-white font-semibold text-brand-gray-900 shadow-none hover:bg-brand-gray-50"
    >
      <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
      Return to Home Page
    </Button>
  );
}
