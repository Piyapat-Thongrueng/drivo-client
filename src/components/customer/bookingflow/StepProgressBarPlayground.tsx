"use client";

import { useCallback, useState } from "react";

import StepProgressBar, {
  DEFAULT_BOOKING_STEPS,
} from "@/components/customer/bookingflow/StepProgressBar";
import { Button } from "@/components/ui/Button";

const LAST_INDEX = DEFAULT_BOOKING_STEPS.length - 1;

export default function StepProgressBarPlayground(): React.JSX.Element {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const goBack = useCallback((): void => {
    setCurrentStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback((): void => {
    setCurrentStepIndex((i) => Math.min(LAST_INDEX, i + 1));
  }, []);

  return (
    <div className="space-y-6">
      <StepProgressBar
        steps={DEFAULT_BOOKING_STEPS}
        currentStepIndex={currentStepIndex}
      />
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <Button
          type="button"
          variant="primary"
          size="md"
          disabled={currentStepIndex === 0}
          onClick={goBack}
        >
          Previous step
        </Button>
        <Button
          type="button"
          variant="primary"
          size="md"
          disabled={currentStepIndex === LAST_INDEX}
          onClick={goNext}
        >
          Next step
        </Button>
      </div>
      <p className="body-3 text-center text-brand-gray-600">
        In the real booking flow, the route or a parent component will set{" "}
        <code className="rounded bg-brand-gray-50 px-1 font-mono text-sm">
          currentStepIndex
        </code>{" "}
        instead of these demo buttons.
      </p>
    </div>
  );
}
