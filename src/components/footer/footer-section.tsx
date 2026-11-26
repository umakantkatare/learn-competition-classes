
interface FooterSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function FooterSection({
  title,
  children,
  className,
}: FooterSectionProps) {
  return (
    <section className={`flex min-w-0 flex-col gap-4 ${className ?? ""}`}>
      <div className="space-y-2.5">
        <h3 className="text-sm font-semibold text-white sm:text-base">
          {title}
        </h3>

        <div className="h-1 w-9 rounded-full bg-brand-primary" />
      </div>

      {children}
    </section>
  );
}
