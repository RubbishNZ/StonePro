import Link from "next/link";

const navigation = [
  { href: "/", label: "Product" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="rounded-md bg-slate-900 px-2 py-1 text-sm font-bold uppercase tracking-widest text-slate-100 shadow-sm">
            SOP
          </span>
          <span className="font-semibold">StoneOpsPro</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-slate-400"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="hidden rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 md:inline-flex"
          >
            Request access
          </Link>
        </div>
      </div>
    </header>
  );
}