import Image from "next/image";
import { Quote } from "lucide-react";

type Testimonial = {
  name: string;
  selection: string;
  image: string;
  review: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Rahul Sharma",
    selection: "SSC CGL",
    image: "/images/students/pexels-mart-production-8217506.webp",
    review:
      "The concepts were explained from the basics, and regular mock tests helped me improve my speed and accuracy. The faculty guidance was very helpful throughout my preparation.",
  },
  {
    name: "Priya Verma",
    selection: "MP Patwari",
    image: "/images/students/pexels-mart-production-8217506.webp",
    review:
      "The bilingual classes made difficult topics easy to understand. The structured study plan and doubt sessions helped me stay consistent with my preparation.",
  },
  {
    name: "Amit Singh",
    selection: "Railway NTPC",
    image: "/images/students/pexels-mart-production-8217506.webp",
    review:
      "The regular practice tests and detailed explanations helped me identify my weak areas. I am thankful to the LCC faculty for their guidance and support.",
  },
];

export function SuccessStories() {
  return (
    <section className="bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Our Students, <span className="text-primary">Our Pride</span>
            </h2>

            <div className="mt-3 h-1 w-12 rounded-full bg-primary" />
          </div>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((student) => (
            <article
              key={student.name}
              className="
                group relative flex h-full flex-col
                rounded-2xl border border-border bg-card
                p-5 shadow-sm
                transition-all duration-300
                hover:-translate-y-1
                hover:border-primary/30
                hover:shadow-md
                sm:p-6
              "
            >
              {/* Quote Icon */}
              <div className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full bg-primary/10">
                <Quote className="size-5 text-primary" />
              </div>

              {/* Review */}
              <p className="flex-1 pr-8 text-sm leading-7 text-muted-foreground">
                &ldquo;{student.review}&rdquo;
              </p>

              {/* Student Details */}
              <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                  <Image
                    src={student.image}
                    alt={`${student.name} testimonial`}
                    fill
                    sizes="48px"
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-foreground">
                    {student.name}
                  </h3>

                  <p className="mt-1 text-xs font-medium text-primary">
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
