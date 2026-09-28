import Link from "next/link";
import { Clock } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { contactDetails } from "@/data/footer.data";

export function FooterContact() {
  return (
    <div className="flex flex-col gap-5">
      {/* Heading */}
      <h3 className="text-base font-semibold text-white">Get in Touch</h3>

      {/* Gold underline */}
      <div className="h-1 w-10 rounded-full bg-[#D4AF37]" />

      {/* Contact Details */}
      <div className="flex flex-col gap-4">
        {contactDetails.map(({ label, value, href, icon: Icon }) => (
          <TooltipProvider key={label}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    href={href}
                    target={label === "Address" ? "_blank" : undefined}
                    rel={
                      label === "Address" ? "noopener noreferrer" : undefined
                    }
                    className="group flex items-start gap-3 text-sm text-white/65 transition-colors duration-200 hover:text-[#D4AF37]"
                  >
                    <Icon
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]"
                      aria-hidden="true"
                    />

                    <span className="break-words">{value}</span>
                  </Link>
                }
              />

              <TooltipContent>
                <p>{label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}

        {/* Working Hours */}
        <div className="flex items-start gap-3 text-sm text-white/65">
          <Clock
            className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]"
            aria-hidden="true"
          />

          <div className="flex flex-col gap-1">
            <span className="text-white/80">Working Hours</span>
            <span>Mon – Sat: 9:00 AM – 6:00 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
