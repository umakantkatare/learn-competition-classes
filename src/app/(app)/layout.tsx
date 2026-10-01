import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
