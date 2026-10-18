import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
