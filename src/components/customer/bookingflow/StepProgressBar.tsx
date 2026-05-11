import { Check } from "lucide-react";

export interface StepProgressStep {
  label: string;
}

export interface StepProgressBarProps {
  steps: readonly StepProgressStep[];
  /** Zero-based index of the active step (0 = first). */
  currentStepIndex: number;
  className?: string;
}

type StepVisualState = "completed" | "active" | "upcoming";

function stepState(index: number, currentIndex: number): StepVisualState {
  if (index < currentIndex) {
    return "completed";
  }
  if (index === currentIndex) {
    return "active";
  }
  return "upcoming";
}

/** Segment between step `fromIndex` and `fromIndex + 1` is complete when past that segment. */
function connectorIsComplete(fromIndex: number, currentIndex: number): boolean {
  return fromIndex < currentIndex;
}

interface StepCircleProps {
  state: StepVisualState;
  stepNumber: number;
}

function StepCircle({ state, stepNumber }: StepCircleProps): React.JSX.Element {
  const base =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold leading-none";

  if (state === "completed") {
    return (
      <span
        className={`${base} bg-brand-black text-brand-white`}
        aria-hidden
      >
        <Check className="h-4 w-4" strokeWidth={2.5} />
      </span>
    );
  }

  if (state === "active") {
    return (
      <span
        className={`${base} bg-brand-red-200 text-brand-white`}
        aria-current="step"
      >
        {stepNumber}
      </span>
    );
  }

  return (
    <span className={`${base} bg-brand-gray-300 text-brand-white`}>
      {stepNumber}
    </span>
  );
}

function StepLabel({
  state,
  children,
}: {
  state: StepVisualState;
  children: React.ReactNode;
}): React.JSX.Element {
  if (state === "active") {
    return (
      <span className="body-3 font-bold text-brand-red-200">{children}</span>
    );
  }
  if (state === "completed") {
    return (
      <span className="body-3 font-bold text-brand-black">{children}</span>
    );
  }
  return (
    <span className="body-3 font-medium text-brand-gray-700">{children}</span>
  );
}

function ConnectorSegment({
  complete,
  hidden: visuallyHidden,
}: {
  complete: boolean;
  hidden?: boolean;
}): React.JSX.Element {
  return (
    <div
      className={`h-0.5 min-w-0 flex-1 rounded-full ${
        visuallyHidden ? "bg-transparent" : complete ? "bg-brand-black" : "bg-brand-gray-300"
      }`}
      aria-hidden
    />
  );
}

/**
 * Horizontal stepper (md+): each step is an equal flex column. The top row is
 * [left line | circle | right line] so segments meet the circle and join
 * across columns with no floating gap.
 */
function StepProgressBarHorizontal({
  steps,
  currentStepIndex,
}: StepProgressBarProps): React.JSX.Element {
  const lastIndex = steps.length - 1;

  return (
    <ol
      className="m-0 hidden w-full min-w-0 list-none flex-row p-0 md:flex"
      aria-label="Booking progress"
    >
      {steps.map((step, index) => {
        const state = stepState(index, currentStepIndex);
        const isFirst = index === 0;
        const isLast = index === lastIndex;

        return (
          <li
            key={step.label}
            className="flex min-w-0 flex-1 flex-col items-stretch"
          >
            <div className="flex w-full min-w-0 items-center">
              <ConnectorSegment
                hidden={isFirst}
                complete={
                  isFirst ? false : connectorIsComplete(index - 1, currentStepIndex)
                }
              />
              <div className="relative z-[1] mx-0 shrink-0">
                <StepCircle state={state} stepNumber={index + 1} />
              </div>
              <ConnectorSegment
                hidden={isLast}
                complete={
                  isLast ? false : connectorIsComplete(index, currentStepIndex)
                }
              />
            </div>
            <div className="mt-2 flex justify-center px-0.5 sm:mt-2.5">
              <StepLabel state={state}>
                <span className="block max-w-[11rem] text-balance text-center sm:max-w-[13rem]">
                  {step.label}
                </span>
              </StepLabel>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Stacked stepper for small screens — same states, vertical connectors. */
function StepProgressBarVertical({
  steps,
  currentStepIndex,
}: StepProgressBarProps): React.JSX.Element {
  return (
    <ol
      className="m-0 flex w-full list-none flex-col p-0 md:hidden"
      aria-label="Booking progress"
    >
      {steps.map((step, index) => {
        const state = stepState(index, currentStepIndex);
        const isLast = index === steps.length - 1;
        const lineComplete =
          !isLast && connectorIsComplete(index, currentStepIndex);

        return (
          <li key={step.label} className="flex flex-col">
            <div className="flex items-center gap-3">
              <StepCircle state={state} stepNumber={index + 1} />
              <StepLabel state={state}>{step.label}</StepLabel>
            </div>
            {!isLast ? (
              <div
                className="ml-[17px] flex w-1.5 shrink-0 justify-center py-1.5"
                aria-hidden
              >
                <div
                  className={`w-0.5 rounded-full ${
                    lineComplete ? "bg-brand-black" : "bg-brand-gray-300"
                  } h-10 sm:h-11`}
                />
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export default function StepProgressBar({
  steps,
  currentStepIndex,
  className = "",
}: StepProgressBarProps): React.JSX.Element {
  const safeIndex = Math.min(
    Math.max(currentStepIndex, 0),
    Math.max(steps.length - 1, 0),
  );

  return (
    <div
      className={`w-full min-w-0 max-w-400 rounded-2xl border border-brand-gray-100 bg-brand-gray-50 px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-9 lg:px-12 lg:py-10 ${className}`}
    >
      <StepProgressBarVertical
        steps={steps}
        currentStepIndex={safeIndex}
      />
      <StepProgressBarHorizontal
        steps={steps}
        currentStepIndex={safeIndex}
      />
    </div>
  );
}

export const DEFAULT_BOOKING_STEPS: readonly StepProgressStep[] = [
  { label: "Make a Reservation" },
  { label: "Pick your vehicle" },
  { label: "Review & Checkout" },
  { label: "Payment" },
] as const;
