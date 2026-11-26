
import { supportLinks } from "@/data/footer.data";

export function FooterSupport() {
  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
      {/* Heading */}
      <h3 className="text-sm font-semibold text-white sm:text-base">
        Support
      </h3>

      {/* Gold underline */}
      <div className="h-1 w-10 rounded-full bg-[#D4AF37]" />

      {/* Support Labels */}
      <ul className="flex flex-col gap-2 sm:gap-3">
        {supportLinks.map((link) => (
          <li key={link.label}>
            <span
              className="
                block w-fit max-w-full
                cursor-default select-none
                py-1 break-words
                text-xs leading-5 text-white/65
                sm:text-sm sm:leading-6
              "
            >
              {link.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
