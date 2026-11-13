import Image from "next/image";
import Link from "next/link";

const exams = [
  {
    name: "NAVY",
    description: "Indian Navy",
    logo: "/images/exams-logo/indian-navy.avif",
    href: "/exams/navy",
  },
  {
    name: "ARMY",
    description: "Indian Army",
    logo: "/images/exams-logo/indian-army.avif",
    href: "/exams/army",
  },
  {
    name: "AIRFORCE",
    description: "Indian Airforce",
    logo: "/images/exams-logo/indian-airforce_converted.avif",
    href: "/exams/airforce",
  },
  {
    name: "SSC",
    description: "Staff Selection Commission",
    logo: "/images/exams-logo/ssc_2.avif",
    href: "/exams/ssc",
  },
  {
    name: "RAILWAY",
    description: "Railway Exams",
    logo: "/images/exams-logo/indian-railway.avif",
    href: "/exams/railway",
  },
  {
    name: "PATWARI",
    description: "MP Patwari",
    logo: "/images/exams-logo/mp-patwari.avif",
    href: "/exams/patwari",
  },
  {
    name: "MP SI",
    description: "MP SI",
    logo: "/images/exams-logo/mp-police.avif",
    href: "/exams/mp-si",
  },
  {
    name: "MP POLICE",
    description: "MP Police",
    logo: "/images/exams-logo/mp-police.avif",
    href: "/exams/mp-police",
  },
  {
    name: "FOREST GUARD",
    description: "Forest Guard",
    logo: "/images/exams-logo/indian-forest.avif",
    href: "/exams/forest-guard",
  },
  {
    name: "MP TET",
    description: "Grade 1, 2, 3",
    logo: "/images/exams-logo/mp-tet.avif",
    href: "/exams/mp-tet",
  },
] as const;

type Exam = (typeof exams)[number];

function ExamCard({ exam }: { exam: Exam }) {
  return (
    <Link
      href={exam.href}
      className="
        group flex w-[160px] shrink-0 flex-col items-center
        rounded-2xl border border-slate-200/70 bg-white
        px-4 py-5 text-center shadow-sm
        transition-all duration-300
        hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg
        sm:w-[175px]
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-primary focus-visible:ring-offset-2
      "
    >
      {/* Circular Logo */}
      <div className="relative size-16 overflow-hidden rounded-full sm:size-[72px]">
        <Image
          src={exam.logo}
          alt={`${exam.name} exam logo`}
          fill
          sizes="72px"
          loading="lazy"
          className="
            rounded-full object-contain
            transition-transform duration-300
            group-hover:scale-110
          "
        />
      </div>

      {/* Exam Name */}
      <h3 className="mt-3 text-xs font-extrabold tracking-wide">{exam.name}</h3>

      {/* Description */}
      <p className="mt-1 min-h-8 line-clamp-2 text-[11px] leading-4 text-slate-800">
        {exam.description}
      </p>
    </Link>
  );
}

function ExamMarquee({
  items,
  reverse = false,
}: {
  items: readonly Exam[];
  reverse?: boolean;
}) {
  return (
    <div className="exam-marquee group/marquee relative overflow-hidden">
      <div
        className={`
          exam-marquee-track flex w-max gap-4 py-3
          ${reverse ? "exam-marquee-reverse" : ""}
        `}
      >
        {[0, 1].map((copy) => (
          <div
            key={copy}
            aria-hidden={copy === 1}
            inert={copy === 1}
            className="flex shrink-0 gap-4"
          >
            {items.map((exam) => (
              <ExamCard key={exam.name} exam={exam} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PopularExams() {
  const firstRow = exams.slice(0, 6);
  const secondRow = exams.slice(6);

  return (
    <section
      aria-labelledby="popular-exams-heading"
      className="overflow-hidden bg-[#fffdf8] px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mb-7 border-b border-orange-100 pb-5">
          <h2
            id="popular-exams-heading"
            className="text-2xl font-extrabold tracking-tight text-[#171717] sm:text-3xl"
          >
            Popular <span className="text-primary">Exams</span> We Prepare For
          </h2>

          <div className="mt-3 h-1 w-14 rounded-full bg-primary" />
        </div>

        {/* Moving Exam Cards */}
        <div className="space-y-3">
          <ExamMarquee items={firstRow} />
          <ExamMarquee items={secondRow} reverse />
        </div>
      </div>
    </section>
  );
}
