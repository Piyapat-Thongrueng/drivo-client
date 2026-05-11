import Link from "next/link";
import { CircleHelp, Globe, ShieldCheck } from "lucide-react";

/** Placeholder until real routes exist — all footer links go home per product decision. */
const HOME = "/" as const;

interface FooterLink {
  label: string;
  href: typeof HOME;
}

interface FooterColumn {
  title: string;
  links: readonly FooterLink[];
}

const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: HOME },
      { label: "Careers", href: HOME },
      { label: "Press", href: HOME },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: HOME },
      { label: "Contact Us", href: HOME },
      { label: "FAQs", href: HOME },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: HOME },
      { label: "Privacy Policy", href: HOME },
      { label: "Cookie Settings", href: HOME },
    ],
  },
] as const;

function FooterLinkItem({ link }: { link: FooterLink }): React.JSX.Element {
  return (
    <li>
      <Link
        href={link.href}
        className="body-3 text-brand-gray-700 transition-colors hover:text-brand-red-200"
      >
        {link.label}
      </Link>
    </li>
  );
}

function FooterColumnBlock({ column }: { column: FooterColumn }): React.JSX.Element {
  return (
    <div>
      <h3 className="body-3 font-bold text-brand-gray-900">{column.title}</h3>
      <ul className="mt-4 flex flex-col gap-3">
        {column.links.map((link) => (
          <FooterLinkItem key={link.label} link={link} />
        ))}
      </ul>
    </div>
  );
}

interface IconLinkProps {
  href: typeof HOME;
  label: string;
  children: React.ReactNode;
}

function IconLink({ href, label, children }: IconLinkProps): React.JSX.Element {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-gray-300 text-brand-gray-700 transition-colors hover:border-brand-gray-500 hover:text-brand-gray-900"
    >
      {children}
    </Link>
  );
}

export default function Footer(): React.JSX.Element {
  return (
    <footer className="border-t border-brand-gray-100 bg-brand-gray-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="max-w-md md:col-span-2 lg:col-span-1 lg:max-w-none">
            <Link
              href={HOME}
              className="headline-4 font-bold text-brand-red-200 transition-opacity hover:opacity-90"
            >
              Drivo
            </Link>
            <p className="body-2 mt-4 text-brand-gray-700">
              Providing premium vehicle solutions for every journey. Dependable,
              warm, and accessible car rentals worldwide.
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <FooterColumnBlock key={column.title} column={column} />
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-brand-gray-200 pt-8 sm:mt-14 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="body-3 text-brand-gray-600">
            © {new Date().getFullYear()} Drivo Car Rentals. All rights reserved.
          </p>
          <div className="flex items-center gap-3 sm:shrink-0">
            <IconLink href={HOME} label="Language and region (coming soon)">
              <Globe className="h-5 w-5" aria-hidden />
            </IconLink>
            <IconLink href={HOME} label="Security and trust (coming soon)">
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </IconLink>
            <IconLink href={HOME} label="Help (coming soon)">
              <CircleHelp className="h-5 w-5" aria-hidden />
            </IconLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
