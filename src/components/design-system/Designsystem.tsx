import AdminSidebar from "@/components/admin/AdminSidebar";
import StepProgressBarPlayground from "@/components/customer/bookingflow/StepProgressBarPlayground";
import VehicleSearchBar from "@/components/customer/landing/VehicleSearchBar";
import WhyChooseDrivo from "@/components/customer/landing/WhyChooseDrivo";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";

type ColorSwatch = {
  name: string;
  bgClass: string;
  fgClass: string;
  description?: string;
};

type TypographySample = {
  name: string;
  className: string;
  sample: string;
  note: string;
};

const BRAND_RED: ColorSwatch[] = [
  {
    name: "brand-red-900",
    bgClass: "bg-brand-red-900",
    fgClass: "text-brand-white",
    description: "#A81C13",
  },
  {
    name: "brand-red-700",
    bgClass: "bg-brand-red-700",
    fgClass: "text-brand-white",
    description: "#D93025",
  },
  {
    name: "brand-red-500",
    bgClass: "bg-brand-red-500",
    fgClass: "text-brand-white",
    description: "#F26560",
  },
  {
    name: "brand-red-300",
    bgClass: "bg-brand-red-300",
    fgClass: "text-brand-gray-900",
    description: "#FFA8A4",
  },
  {
    name: "brand-red-200",
    bgClass: "bg-brand-red-200",
    fgClass: "text-brand-white",
    description: "#A6001F",
  },
  {
    name: "brand-red-100",
    bgClass: "bg-brand-red-100",
    fgClass: "text-brand-gray-900",
    description: "#FFD5D3",
  },
  {
    name: "brand-red-50",
    bgClass: "bg-brand-red-50",
    fgClass: "text-brand-gray-900",
    description: "#FFF1F0",
  },
];

const BRAND_GRAY: ColorSwatch[] = [
  {
    name: "brand-gray-900",
    bgClass: "bg-brand-gray-900",
    fgClass: "text-brand-white",
    description: "#3A3B46",
  },
  {
    name: "brand-gray-700",
    bgClass: "bg-brand-gray-700",
    fgClass: "text-brand-white",
    description: "#5B5D6F",
  },
  {
    name: "brand-gray-500",
    bgClass: "bg-brand-gray-500",
    fgClass: "text-brand-white",
    description: "#7B7E8F",
  },
  {
    name: "brand-gray-300",
    bgClass: "bg-brand-gray-300",
    fgClass: "text-brand-gray-900",
    description: "#AEB1C3",
  },
  {
    name: "brand-gray-100",
    bgClass: "bg-brand-gray-100",
    fgClass: "text-brand-gray-900",
    description: "#DCDFED",
  },
  {
    name: "brand-gray-50",
    bgClass: "bg-brand-gray-50",
    fgClass: "text-brand-gray-900",
    description: "#F4F5F8",
  },
];

const SECONDARY: ColorSwatch[] = [
  {
    name: "brand-black",
    bgClass: "bg-brand-black",
    fgClass: "text-brand-white",
    description: "#000000",
  },
  {
    name: "brand-white",
    bgClass: "bg-brand-white ring-1 ring-brand-gray-100 ring-inset",
    fgClass: "text-brand-gray-900",
    description: "#FFFFFF",
  },
];

const TYPOGRAPHY: TypographySample[] = [
  {
    name: "display",
    className: "display",
    sample: "Ag",
    note: "88px / 96px · weight 900",
  },
  {
    name: "headline-1",
    className: "headline-1",
    sample: "Headline 1",
    note: "56px / 64px · weight 700",
  },
  {
    name: "headline-2",
    className: "headline-2",
    sample: "Headline 2",
    note: "36px / 44px · weight 700",
  },
  {
    name: "headline-3",
    className: "headline-3",
    sample: "Headline 3",
    note: "24px / 32px · weight 700",
  },
  {
    name: "headline-4",
    className: "headline-4",
    sample: "Headline 4",
    note: "20px / 28px · weight 700",
  },
  {
    name: "body-1",
    className: "body-1",
    sample:
      "Body 1 — Inter medium. The quick brown fox jumps over the lazy dog.",
    note: "18px / 26px · weight 500",
  },
  {
    name: "body-2",
    className: "body-2",
    sample:
      "Body 2 — Inter medium. The quick brown fox jumps over the lazy dog.",
    note: "16px / 28px · weight 500",
  },
  {
    name: "body-3",
    className: "body-3",
    sample:
      "Body 3 — Inter medium. The quick brown fox jumps over the lazy dog.",
    note: "14px / 24px · weight 500",
  },
];

/** Padded content column; full-bleed previews sit outside this. */
const PAGE_INNER =
  "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8" as const;

function ColorPaletteSection({
  id,
  title,
  swatches,
}: {
  id: string;
  title: string;
  swatches: ColorSwatch[];
}) {
  return (
    <section aria-labelledby={id} className="space-y-4">
      <h2 id={id} className="headline-4 text-brand-gray-900">
        {title}
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {swatches.map((swatch) => (
          <li key={swatch.name}>
            <div
              className={`flex h-28 flex-col justify-end rounded-xl p-3 shadow-sm ${swatch.bgClass} ${swatch.fgClass}`}
            >
              <span className="body-3 font-semibold">{swatch.name}</span>
              {swatch.description ? (
                <span className="mt-1 text-xs opacity-90">
                  {swatch.description}
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function DesignSystem() {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-14 py-10">
      <header
        className={`${PAGE_INNER} border-b border-brand-gray-100 pb-8`}
      >
        <p className="body-3 mb-2 font-medium text-brand-gray-500">
          drivo-client · globals.css
        </p>
        <h1 className="headline-2 text-brand-gray-900">
          Design tokens preview
        </h1>
        <p className="body-2 mt-4 max-w-2xl text-brand-gray-700">
          Color palette from{" "}
          <code className="rounded bg-brand-gray-50 px-1.5 py-0.5 font-mono text-sm">
            @theme inline
          </code>{" "}
          and typography from{" "}
          <code className="rounded bg-brand-gray-50 px-1.5 py-0.5 font-mono text-sm">
            @utility
          </code>
          . Base font is{" "}
          <span className="font-medium text-brand-gray-900">Inter</span> via{" "}
          <code className="rounded bg-brand-gray-50 px-1.5 py-0.5 font-mono text-sm">
            font-sans
          </code>{" "}
          in{" "}
          <code className="rounded bg-brand-gray-50 px-1.5 py-0.5 font-mono text-sm">
            layout.tsx
          </code>
          .
        </p>
      </header>

      <section aria-labelledby="navbar-heading" className="w-full">
        <div className={`${PAGE_INNER} space-y-4`}>
          <div>
            <h2
              id="navbar-heading"
              className="headline-4 text-brand-gray-900"
            >
              Navigation
            </h2>
            <p className="body-3 mt-2 text-brand-gray-700">
              Customer navbar — logo and links use{" "}
              <code className="rounded bg-brand-gray-50 px-1 font-mono text-sm">
                headline-4
              </code>{" "}
              (logo) and{" "}
              <code className="rounded bg-brand-gray-50 px-1 font-mono text-sm">
                body-3
              </code>{" "}
              (links). Below{" "}
              <span className="font-medium text-brand-gray-900">md</span>, open
              the menu with the Lucide icon. Preview is full viewport width.
            </p>
          </div>
        </div>
        <div className="w-full bg-brand-white shadow-sm">
          <Navbar />
        </div>
      </section>

      <section aria-labelledby="admin-sidebar-heading" className="w-full">
        <div className={`${PAGE_INNER} space-y-4`}>
          <div>
            <h2
              id="admin-sidebar-heading"
              className="headline-4 text-brand-gray-900"
            >
              Admin sidebar
            </h2>
            <p className="body-3 mt-2 max-w-2xl text-brand-gray-700">
              Desktop admin rail — wordmark uses{" "}
              <code className="rounded bg-brand-gray-50 px-1 font-mono text-sm">
                font-serif
              </code>{" "}
              in brand red; menu labels use Lucide outline icons (
              <code className="rounded bg-brand-gray-50 px-1 font-mono text-sm">
                strokeWidth 1.75
              </code>
              ). Active row: light gray fill, red vertical cap on the right.
              Bottom area is Logout only (no Settings/Support). Preview uses{" "}
              <code className="rounded bg-brand-gray-50 px-1 font-mono text-sm">
                mode=&quot;demo&quot;
              </code>{" "}
              so rows switch active state without leaving this page; in a real
              admin shell use{" "}
              <code className="rounded bg-brand-gray-50 px-1 font-mono text-sm">
                mode=&quot;routes&quot;
              </code>{" "}
              and optional{" "}
              <code className="rounded bg-brand-gray-50 px-1 font-mono text-sm">
                onLogout
              </code>
              .
            </p>
          </div>
        </div>
        <div className={`${PAGE_INNER} pb-2`}>
          <div className="inline-flex overflow-hidden rounded-2xl border border-brand-gray-200 bg-brand-white shadow-sm">
            <AdminSidebar mode="demo" className="min-h-[520px]" />
          </div>
        </div>
      </section>

      <section aria-labelledby="footer-heading" className="w-full">
        <div className={`${PAGE_INNER} space-y-4`}>
          <div>
            <h2 id="footer-heading" className="headline-4 text-brand-gray-900">
              Footer
            </h2>
            <p className="body-3 mt-2 text-brand-gray-700">
              Site-wide footer — link columns and icon buttons currently point to{" "}
              <code className="rounded bg-brand-gray-50 px-1 font-mono text-sm">
                /
              </code>{" "}
              until dedicated pages exist. Preview is full viewport width.
            </p>
          </div>
        </div>
        <Footer />
      </section>

      <div className={`${PAGE_INNER} flex flex-col gap-14`}>
        <section aria-labelledby="buttons-heading" className="space-y-6">
          <div>
            <h2 id="buttons-heading" className="headline-4 text-brand-gray-900">
              Primary button
            </h2>
            <p className="body-3 mt-2 max-w-2xl text-brand-gray-700">
              Brand fill{" "}
              <code className="rounded bg-brand-gray-50 px-1 font-mono text-sm">
                bg-brand-red-200
              </code>{" "}
              (#A6001F). Children set the label.{" "}
              <code className="rounded bg-brand-gray-50 px-1 font-mono text-sm">
                size
              </code>{" "}
              maps to spacing and{" "}
              <code className="rounded bg-brand-gray-50 px-1 font-mono text-sm">
                body-*
              </code>
              utilities. Press the control to see the active shrink / release
              animation.
            </p>
          </div>

          <div className="space-y-8 rounded-2xl border border-brand-gray-100 bg-brand-white p-6 sm:p-8">
            <div>
              <p className="body-3 mb-3 font-semibold text-brand-gray-900">
                Sizes
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" size="sm">
                  Small
                </Button>
                <Button variant="primary" size="md">
                  Medium
                </Button>
                <Button variant="primary" size="lg">
                  Large
                </Button>
              </div>
            </div>

            <div>
              <p className="body-3 mb-3 font-semibold text-brand-gray-900">
                States
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" size="md" type="button">
                  Default
                </Button>
                <Button variant="primary" size="md" disabled>
                  Disabled
                </Button>
              </div>
            </div>

            <div>
              <p className="body-3 mb-3 font-semibold text-brand-gray-900">
                Link variant
              </p>
              <p className="body-3 mb-3 text-brand-gray-600">
                Internal routes: pass{" "}
                <code className="rounded bg-brand-gray-50 px-1 font-mono text-sm">
                  href
                </code>{" "}
                (same look; navbar Register uses this).
              </p>
              <Button variant="primary" size="md" href="/register">
                Register (example link)
              </Button>
            </div>
          </div>
        </section>

        <section aria-labelledby="step-progress-heading" className="space-y-6">
          <div>
            <h2
              id="step-progress-heading"
              className="headline-4 text-brand-gray-900"
            >
              Booking step progress
            </h2>
            <p className="body-3 mt-2 max-w-3xl text-brand-gray-700">
              Active step: red circle and label (
              <code className="rounded bg-brand-gray-50 px-1 font-mono text-sm">
                brand-red-200
              </code>
              ). Completed: black circle with check, black label, black
              connectors behind you. Upcoming: gray. Narrow screens stack
              vertically; from{" "}
              <span className="font-medium text-brand-gray-900">md</span>{" "}
              onward the bar is horizontal with extra padding and larger
              circles.
            </p>
          </div>
          {/* Break out of PAGE_INNER horizontal padding so the stepper can use full column width */}
          <div className="-mx-4 w-[calc(100%+2rem)] min-w-0 sm:-mx-6 sm:w-[calc(100%+3rem)] lg:-mx-8 lg:w-[calc(100%+4rem)]">
            <StepProgressBarPlayground />
          </div>
        </section>
      </div>

      <section aria-labelledby="why-choose-section-heading" className="w-full">
        <div className={`${PAGE_INNER} mb-4 space-y-1`}>
          <h2
            id="why-choose-section-heading"
            className="headline-4 text-brand-gray-900"
          >
            Why Choose Drivo section
          </h2>
          <p className="body-3 text-brand-gray-700">
            3-card feature grid — responsive 1 / 2 / 3 columns. Preview is full
            viewport width.
          </p>
        </div>
        <WhyChooseDrivo />
      </section>

      <section aria-labelledby="vehicle-search-heading" className="w-full">
        <div className={`${PAGE_INNER} space-y-4`}>
          <div>
            <h2
              id="vehicle-search-heading"
              className="headline-4 text-brand-gray-900"
            >
              Vehicle search bar
            </h2>
            <p className="body-3 mt-2 max-w-3xl text-brand-gray-700">
              Landing-style booking strip: stacked on small screens,{" "}
              <span className="font-medium text-brand-gray-900">lg</span> and up
              uses three or four columns. Toggle adds drop-off location; submit
              is wired later (
              <code className="rounded bg-brand-gray-50 px-1 font-mono text-sm">
                preventDefault
              </code>
              ). Preview is full viewport width.
            </p>
          </div>
        </div>
        <VehicleSearchBar />
      </section>

      <div className={`${PAGE_INNER} flex flex-col gap-14`}>
        <ColorPaletteSection
          id="palette-red"
          title="Brand red"
          swatches={BRAND_RED}
        />
        <ColorPaletteSection
          id="palette-gray"
          title="Brand gray"
          swatches={BRAND_GRAY}
        />
        <ColorPaletteSection
          id="palette-secondary"
          title="Secondary"
          swatches={SECONDARY}
        />

        <section aria-labelledby="typography-heading" className="space-y-6">
          <div>
            <h2
              id="typography-heading"
              className="headline-4 text-brand-gray-900"
            >
              Typography
            </h2>
            <p className="body-3 mt-2 text-brand-gray-600">
              Custom utilities: apply one class per style (e.g.{" "}
              <code className="rounded bg-brand-gray-50 px-1 font-mono text-sm">
                headline-2
              </code>
              ).
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-brand-gray-100 bg-brand-white">
            <ul className="divide-y divide-brand-gray-100">
              {TYPOGRAPHY.map((row) => (
                <li
                  key={row.name}
                  className="flex flex-col gap-3 px-4 py-6 sm:flex-row sm:items-start sm:gap-8 sm:px-6"
                >
                  <div className="shrink-0 sm:w-40">
                    <p className="body-3 font-semibold text-brand-gray-900">
                      {row.name}
                    </p>
                    <p className="body-3 mt-1 text-brand-gray-500">
                      {row.note}
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-brand-gray-900 ${row.className}`}>
                      {row.sample}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <footer className="body-3 border-t border-brand-gray-100 pt-8 text-brand-gray-500">
          Open{" "}
          <code className="rounded bg-brand-gray-50 px-1.5 py-0.5 font-mono text-brand-gray-700">
            /design-system
          </code>{" "}
          any time to verify tokens after changing{" "}
          <code className="rounded bg-brand-gray-50 px-1.5 py-0.5 font-mono text-brand-gray-700">
            globals.css
          </code>
          .
        </footer>
      </div>
    </div>
  );
}
