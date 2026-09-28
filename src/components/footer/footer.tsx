import { Separator } from "@/components/ui/separator";
import { FooterMain } from "./footer-main";
import { FooterBottom } from "./footer-bottom";



export default function Footer() {
  return (
    <footer className="w-full bg-[#080808] text-white">
      {/* Main Footer */}
      <div className="mx-auto max-w-[1920px] px-5 py-12 sm:px-8 lg:px-16 lg:py-14">
        <FooterMain />

        {/* Divider */}
        <Separator className="my-8 bg-white/20 lg:my-10" />

        {/* Copyright and Payments */}
        <FooterBottom />
      </div>
    </footer>
  );
}