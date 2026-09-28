import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { supportLinks } from "@/data/footer.data";



export function FooterSupport() {
  return (
    <div className="flex flex-col gap-5">
      {/* Heading */}
      <h3 className="text-base font-semibold text-white">
        Support
      </h3>

      {/* Gold underline */}
      <div className="h-1 w-10 rounded-full bg-[#D4AF37]" />

      {/* Support Links */}
      <nav aria-label="Footer support links">
        <ul className="flex flex-col gap-3">
          {supportLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="group flex w-fit items-center gap-2 text-sm text-white/65 transition-colors duration-200 hover:text-[#D4AF37]"
              >
                <span>{link.label}</span>

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



// import Link from "next/link";
// import { ArrowUpRight } from "lucide-react";

// const supportLinks = [
//   {
//     label: "Help Center",
//     href: "/help",
//   },
//   {
//     label: "FAQs",
//     href: "/faqs",
//   },
//   {
//     label: "Contact Support",
//     href: "/contact",
//   },
//   {
//     label: "Privacy Policy",
//     href: "/privacy-policy",
//   },
//   {
//     label: "Terms & Conditions",
//     href: "/terms-and-conditions",
//   },
//   {
//     label: "Refund Policy",
//     href: "/refund-policy",
//   },
// ];

// export function FooterSupport() {
//   return (
//     <div className="flex flex-col gap-5">
//       {/* Heading */}
//       <h3 className="text-base font-semibold text-white">
//         Support
//       </h3>

//       {/* Gold underline */}
//       <div className="h-1 w-10 rounded-full bg-[#D4AF37]" />

//       {/* Support Links */}
//       <nav aria-label="Footer support links">
//         <ul className="flex flex-col gap-3">
//           {supportLinks.map((link) => (
//             <li key={link.href}>
//               <Link
//                 href={link.href}
//                 className="group flex w-fit items-center gap-2 text-sm text-white/65 transition-colors duration-200 hover:text-[#D4AF37]"
//               >
//                 <span>{link.label}</span>

//                 <ArrowUpRight
//                   className="h-3.5 w-3.5 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
//                   aria-hidden="true"
//                 />
//               </Link>
//             </li>
//           ))}
//         </ul>
//       </nav>
//     </div>
//   );
// }