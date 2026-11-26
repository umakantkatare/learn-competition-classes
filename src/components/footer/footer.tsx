
import { Separator } from "@/components/ui/separator";
import { FooterMain } from "./footer-main";
import { FooterBottom } from "./footer-bottom";

export default function Footer() {
  return (
    <footer className="w-full overflow-hidden bg-[#080808] text-white">
      <div
        className="
          mx-auto w-full max-w-[1280px]
          px-4 py-10
          sm:px-6 sm:py-12
          lg:px-8 lg:py-14
          xl:px-10
        "
      >
        <FooterMain />

        <Separator className="my-8 bg-white/10 sm:my-10" />

        <FooterBottom />
      </div>
    </footer>
  );
}
