const STEPS = [
  {
    title: "Choose dates & location",
    body: "Pick where and when you need the car so we can show matching vehicles.",
  },
  {
    title: "Select your vehicle",
    body: "Compare models and pricing, then add any extras you need for the trip.",
  },
  {
    title: "Confirm & go",
    body: "Review your booking, pay securely, and pick up keys when you arrive.",
  },
] as const;

/**
 * In-page anchor target for the hero “How to Book” CTA (`#how-to-book`).
 */
export default function HowToBookSection(): React.JSX.Element {
  return (
    <section
      id="how-to-book"
      aria-labelledby="how-to-book-heading"
      className="scroll-mt-20 border-t border-brand-gray-100 bg-brand-white px-4 py-14 sm:px-6 sm:py-16 lg:px-8"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="how-to-book-heading"
          className="headline-2 text-center text-brand-gray-900"
        >
          How to book
        </h2>
        <p className="body-1 mx-auto mt-3 max-w-2xl text-center text-brand-gray-700">
          Three quick steps from browsing to driving.
        </p>
        <ol className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6 lg:gap-8">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex flex-col text-center sm:text-left">
              <span className="body-3 font-semibold text-brand-red-200">
                Step {index + 1}
              </span>
              <span className="headline-3 mt-1 text-brand-gray-900">
                {step.title}
              </span>
              <p className="body-2 mt-2 text-brand-gray-700">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
