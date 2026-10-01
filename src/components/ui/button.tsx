import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-button border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-brand-primary text-text-primary hover:bg-brand-primary-hover hover:text-white",
        outline:
          "border-brand-primary bg-surface text-text-primary hover:bg-accent aria-expanded:bg-accent aria-expanded:text-text-primary",
        secondary:
          "bg-brand-dark text-white hover:bg-brand-dark/90 aria-expanded:bg-brand-dark aria-expanded:text-white",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        destructive:
          "bg-brand-primary-hover/10 text-brand-primary-hover hover:bg-brand-primary-hover/20 focus-visible:border-brand-primary-hover/40 focus-visible:ring-brand-primary-hover/20",
        link: "text-brand-primary underline-offset-4 hover:underline hover:text-brand-primary-hover",
      },
      size: {
        default:
          "h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 rounded-button px-2 text-xs in-data-[slot=button-group]:rounded-button has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-button px-3 text-[0.8rem] in-data-[slot=button-group]:rounded-button has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 px-6 has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        icon: "size-10",
        "icon-xs":
          "size-7 rounded-button in-data-[slot=button-group]:rounded-button [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-button in-data-[slot=button-group]:rounded-button",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
