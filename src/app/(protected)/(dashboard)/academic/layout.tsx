import type { ReactNode } from "react";
import { AcademicHeader } from "@/components/academic/academic-header";
import { AcademicSidebar } from "@/components/academic/academic-sidebar";

interface AcademicLayoutProps {
  children: ReactNode;
}

export default function AcademicLayout({ children }: AcademicLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AcademicSidebar />

      <div className="lg:pl-64">
        <AcademicHeader />

        <main className="mx-auto w-full max-w-content px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
