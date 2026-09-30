import { HeroSection } from "@/components/home/hero-section";
import { StatsBar } from "@/components/home/stats-bar";
import { PopularExams } from "@/components/home/popular-exams";
import { FeaturedCourses } from "@/components/home/featured-courses";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { ResultsBanner } from "@/components/home/results-banner";
import { SuccessStories } from "@/components/home/success-stories";

export default function HomePage() {
  return (
    <main className="bg-[#fffdf8]">
      <HeroSection />
      <StatsBar />
      <PopularExams />
      <FeaturedCourses />
      <WhyChooseUs />
      <ResultsBanner />
      <SuccessStories />
    </main>
  );
}
