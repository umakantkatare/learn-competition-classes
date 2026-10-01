import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  Headphones,
  Search,
} from "lucide-react";

const courses = [
  {
    id: "ssc-cgl",
    category: "SSC",
    title: "SSC CGL Foundation Batch",
    image: "/images/courses/pexels-adam-sondel-381265-20432872.webp",
    price: 2499,
    originalPrice: 3999,
    discount: "35% OFF",
    color: "#ef2929",
    features: [
      { label: "Live Classes", icon: Headphones },
      { label: "Study Material", icon: ClipboardList },
      { label: "Mock Tests", icon: Search },
      { label: "Doubt Support", icon: Search },
    ],
  },
  {
    id: "banking",
    category: "BANKING",
    title: "Banking Complete Batch",
    image: "/images/courses/pexels-adam-sondel-381265-20432872.webp",
    price: 2499,
    originalPrice: 3999,
    discount: "35% OFF",
    color: "#1676e8",
    features: [
      { label: "Live Classes", icon: Headphones },
      { label: "Study Material", icon: ClipboardList },
      { label: "Mock Tests", icon: Search },
      { label: "Doubt Support", icon: Search },
    ],
  },
  {
    id: "railway",
    category: "RAILWAY",
    title: "Railway NTPC & Group D",
    image: "/images/courses/pexels-adam-sondel-381265-20432872.webp",
    price: 2499,
    originalPrice: 3999,
    discount: "35% OFF",
    color: "#6b21a8",
    features: [
      { label: "Live Classes", icon: Headphones },
      { label: "Study Material", icon: ClipboardList },
      { label: "Mock Tests", icon: Search },
      { label: "Doubt Support", icon: Search },
    ],
  },
  {
    id: "mp-tet",
    category: "MP TET",
    title: "MP TET Grade 1, 2, 3",
    image: "/images/courses/pexels-adam-sondel-381265-20432872.webp",
    price: 2499,
    originalPrice: 3999,
    discount: "35% OFF",
    color: "#047857",
    features: [
      { label: "Live Classes", icon: Headphones },
      { label: "Study Material", icon: ClipboardList },
      { label: "Mock Tests", icon: Search },
      { label: "Doubt Support", icon: Search },
    ],
  },
];

export function FeaturedCourses() {
  return (
    <section className="bg-[#fffdf8] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#171717] sm:text-3xl">
              Featured <span className="text-[#ef4b13]">Courses</span>
            </h2>

            <div className="mt-2 h-1 w-12 rounded-full bg-[#ef4b13]" />
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500 sm:text-sm">
              Comprehensive courses designed for your success.
            </p>

            <Link
              href="/courses"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700"
            >
              View All
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* Course Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course) => (
            <article
              key={course.id}
              className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Thumbnail */}
              <Link
                href={`/courses/${course.id}`}
                className="relative block aspect-[16/9] overflow-hidden bg-slate-100"
              >
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />

                <span
                  className="absolute left-3 top-3 rounded-md px-3 py-1.5 text-sm font-extrabold text-white shadow-sm"
                  style={{ backgroundColor: course.color }}
                >
                  {course.category}
                </span>
              </Link>

              {/* Course Details */}
              <div className="p-3">
                <Link href={`/courses/${course.id}`}>
                  <h3 className="truncate text-base font-bold text-[#17375e] transition-colors hover:text-[#ef4b13]">
                    {course.title}
                  </h3>
                </Link>

                {/* Course Features */}
                <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-3">
                  {course.features.map((feature, index) => {
                    const Icon = feature.icon;

                    return (
                      <div
                        key={`${feature.label}-${index}`}
                        className="flex min-w-0 items-center gap-1.5"
                      >
                        <Icon className="size-3.5 shrink-0 text-[#ef4b13]" />

                        <span className="truncate text-xs text-slate-600">
                          {feature.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Pricing */}
                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-extrabold text-[#171717]">
                      ₹{course.price.toLocaleString("en-IN")}
                    </span>

                    <span className="text-xs text-slate-400 line-through">
                      ₹{course.originalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <span className="shrink-0 rounded-sm bg-red-600 px-2 py-1 text-xs font-bold text-white">
                    {course.discount}
                  </span>
                </div>

                {/* CTA */}
                <Link
                  href={`/courses/${course.id}`}
                  className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-orange-500 to-[#ef4b13] text-sm font-bold text-white transition hover:brightness-95"
                >
                  View Details
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
