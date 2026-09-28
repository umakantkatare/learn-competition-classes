import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { popularExams } from "@/data/footer.data";



export function FooterPopularExams() {
  return (
    <div className="flex flex-col gap-5">
      {/* Heading */}
      <h3 className="text-base font-semibold text-white">
        Popular Exams
      </h3>

      {/* Gold underline */}
      <div className="h-1 w-10 rounded-full bg-[#D4AF37]" />

      {/* Exam Links */}
      <nav aria-label="Popular exams">
        <ul className="flex flex-col gap-3">
          {popularExams.map((exam) => (
            <li key={exam.href}>
              <Link
                href={exam.href}
                className="group flex w-fit items-center gap-2 text-sm text-white/65 transition-colors duration-200 hover:text-[#D4AF37]"
              >
                <span>{exam.label}</span>

                <ArrowUpRight
                  className="h-3.5 w-3.5 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}