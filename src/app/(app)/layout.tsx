import { ReactNode } from "react";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import AppLayoutClient from "@/components/layouts/app-layout-client";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppLayoutClient navbar={<Navbar />} footer={<Footer />}>
      {children}
    </AppLayoutClient>
  );
}
