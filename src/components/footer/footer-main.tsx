
import { FooterBrand } from "./footer-brand";
import { FooterPopularExams } from "./footer-popularExams";
import { FooterQuickLinks } from "./footer-quickLinks";
import { FooterSupport } from "./footer-support";
import { FooterContact } from "./footer-contact";

export function FooterMain() {
  return (
    <div
      className="
        grid min-w-0 grid-cols-2
        gap-x-5 gap-y-9
        sm:grid-cols-3 sm:gap-x-8 sm:gap-y-10
        lg:grid-cols-12 lg:gap-x-6
        xl:gap-x-8
      "
    >
      {/* Brand */}
      <div className="col-span-2 min-w-0 sm:col-span-3 lg:col-span-4">
        <FooterBrand />
      </div>

      {/* Quick Links */}
      <div className="col-span-1 min-w-0 lg:col-span-2">
        <FooterQuickLinks />
      </div>

      {/* Popular Exams */}
      <div className="col-span-1 min-w-0 lg:col-span-2">
        <FooterPopularExams />
      </div>

      {/* Support */}
      <div className="col-span-1 min-w-0 lg:col-span-2">
        <FooterSupport />
      </div>

      {/* Contact */}
      <div className="col-span-1 min-w-0 lg:col-span-2">
        <FooterContact />
      </div>
    </div>
  );
}
