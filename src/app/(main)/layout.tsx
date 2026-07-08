import { SideNav } from "@/components/site/side-nav";
import { MobileNav } from "@/components/site/mobile-nav";
import { BackToTop } from "@/components/site/back-to-top";
import { StripeBar } from "@/components/site/stripe-bar";
import { Footer } from "@/components/site/footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Left-gutter side navigation — only visible on xl+ */}
      <SideNav />

      {/* Mobile navigation drawer — only visible below xl */}
      <MobileNav />

      {/* Back to top button */}
      <BackToTop />

      {/* Main content rail */}
      <div className="mx-auto w-full max-w-3xl flex-1 border-x border-edge">
        {/* Stripe banner replaces the old header */}
        <StripeBar />
        {children}
      </div>

      <div className="mx-auto w-full max-w-3xl border-x border-edge">
        <Footer />
      </div>
    </>
  );
}
