import { SignupForm } from "@/components/signup-form";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function SignUp() {
  return (
    <main
      className={`${poppins.className} flex min-h-screen items-center justify-center bg-amber-50/30 px-4 py-5 sm:px-6 sm:py-6`}
    >
      <SignupForm />
    </main>
  );
}
