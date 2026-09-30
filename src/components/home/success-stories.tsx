import Image from "next/image";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Rahul Sharma",
    selection: "SSC CGL",
    image: "/images/students/pexels-mart-production-8217506.jpg",
    review:
      "The concepts were explained from the basics, and regular mock tests helped me improve my speed and accuracy. The faculty guidance was very helpful throughout my preparation.",
  },
  {
    name: "Priya Verma",
    selection: "MP Patwari",
    image: "/images/students/pexels-mart-production-8217506.jpg",
    review:
      "The bilingual classes made difficult topics easy to understand. The structured study plan and doubt sessions helped me stay consistent with my preparation.",
  },
  {
    name: "Amit Singh",
    selection: "Railway NTPC",
    image: "/images/students/pexels-mart-production-8217506.jpg",
    review:
      "The regular practice tests and detailed explanations helped me identify my weak areas. I am thankful to the LCC faculty for their guidance and support.",
  },
];

export function SuccessStories() {
  return (
    <section className="bg-[#fffdf8] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-[#ef4b13]">
              Student Testimonials
            </p>

            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#171717] sm:text-3xl">
              Our Students, <span className="text-[#ef4b13]">Our Pride</span>
            </h2>

            <div className="mt-3 h-1 w-12 rounded-full bg-[#ef4b13]" />
          </div>

          <p className="max-w-lg text-sm leading-6 text-slate-500">
            Every success story reflects dedication, consistent effort, and the
            guidance of our faculty.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((student) => (
            <article
              key={student.name}
              className="relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg sm:p-6"
            >
              {/* Quote Icon */}
              <div className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full bg-orange-50">
                <Quote className="size-5 text-[#ef4b13]" />
              </div>

              {/* Rating */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className="size-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Review */}
              <p className="mt-5 flex-1 text-sm leading-7 text-slate-600">
                &ldquo;{student.review}&rdquo;
              </p>

              {/* Student Details */}
              <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-orange-50">
                  <Image
                    src={student.image}
                    alt={student.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-[#17375e]">
                    {student.name}
                  </h3>

                  <p className="mt-1 text-xs font-medium text-emerald-700">
                    Selected: {student.selection}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
