import { ChevronDown } from "lucide-react";

// --- FEATURE CARD (Responsive: Compact on Mobile, Spacious on Desktop) ---
export function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="group relative h-full rounded-2xl sm:rounded-3xl border border-border/50 bg-card/50 p-4 sm:p-6 transition-all duration-300 hover:bg-card hover:shadow-xl hover:-translate-y-1 hover:border-indigo-500/20">
      {/* Icon Wrapper: Lebih kecil di HP (mb-3, p-2.5) */}
      <div className="mb-3 sm:mb-5 inline-flex items-center justify-center rounded-xl sm:rounded-2xl bg-indigo-500/5 p-2.5 sm:p-3 text-indigo-600 ring-1 ring-indigo-500/10 transition-colors group-hover:bg-indigo-500/10 group-hover:text-indigo-700 dark:text-indigo-400 dark:group-hover:text-indigo-300">
        {icon}
      </div>

      {/* Title: Text-sm di HP */}
      <h3 className="mb-1.5 sm:mb-3 text-sm sm:text-lg font-bold text-foreground transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
        {title}
      </h3>

      {/* Desc: Text-xs di HP */}
      <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

// --- USE CASE CARD (Compact & Responsive) ---
export function UseCaseCard({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group flex h-full flex-col rounded-2xl border border-border/50 bg-card p-5 transition-all duration-300 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5">
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-muted/50 text-foreground transition-all duration-300 group-hover:scale-110 group-hover:bg-indigo-500/10 group-hover:text-indigo-600">
        {icon}
      </div>

      <h3 className="mb-2 text-base font-bold text-foreground group-hover:text-indigo-600 transition-colors">
        {title}
      </h3>

      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

// --- FAQ ITEM (HTML5 Native Details) ---
// Komponen ini sangat ringan karena menggunakan tag asli browser <details>
// Tidak butuh JavaScript untuk animasi buka-tutup.
export function DetailsItem({
  question,
  children,
}: {
  question: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:border-indigo-500/30 open:border-indigo-500/20 open:bg-indigo-50/30 dark:open:bg-indigo-900/10 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer items-center justify-between p-5 font-medium text-foreground transition-colors select-none">
        <span className="text-base font-semibold">{question}</span>
        <span className="ml-4 flex size-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-transform duration-300 group-hover:bg-indigo-100 group-hover:text-indigo-600 group-open:-rotate-180">
          <ChevronDown className="size-4" />
        </span>
      </summary>

      <div className="px-5 pb-5 pt-0 text-sm leading-relaxed text-muted-foreground animate-in slide-in-from-top-1 fade-in duration-200">
        {children}
      </div>
    </details>
  );
}
