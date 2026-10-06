import Link from "next/link";
import { BookOpen, GraduationCap, Layers3, School, Users } from "lucide-react";

const academicNavigation = [
  {
    title: "Exams",
    href: "/academic/exams",
    icon: GraduationCap,
  },
  {
    title: "Subjects",
    href: "/academic/subjects",
    icon: BookOpen,
  },
  {
    title: "Topics",
    href: "/academic/topics",
    icon: Layers3,
  },
  {
    title: "Courses",
    href: "/academic/courses",
    icon: School,
  },
  {
    title: "Batches",
    href: "/academic/batches",
    icon: Users,
  },
];

export function AcademicSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-surface lg:block">
      <div className="flex h-16 items-center border-b border-border px-6">
        <span className="text-lg font-semibold text-text-primary">
          Academic
        </span>
      </div>

      <nav className="space-y-1 p-4" aria-label="Academic navigation">
        {academicNavigation.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-button px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-brand-primary/10 hover:text-text-primary"
            >
              <Icon className="size-4" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
