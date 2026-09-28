import { FooterBrand } from "./footer-brand";
import { FooterPopularExams } from "./footer-popularExams";
import { FooterQuickLinks } from "./footer-quickLinks";
import { FooterSupport } from "./footer-support";
import { FooterContact } from "./footer-contact";

export function FooterMain() {
  return (
    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
      {/* Brand Section */}
      <div className="sm:col-span-2 lg:col-span-4">
        <FooterBrand />
      </div>

      {/* Quick Links */}
      <div className="lg:col-span-2">
        <FooterQuickLinks />
      </div>

      {/* Popular Exams */}
      <div className="lg:col-span-2">
        <FooterPopularExams />
      </div>

      {/* Support */}
      <div className="lg:col-span-2">
        <FooterSupport />
      </div>

      {/* Contact */}
      <div className="lg:col-span-2">
        <FooterContact />
      </div>
    </div>
  );
}
