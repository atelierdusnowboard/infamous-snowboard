"use client";

import { useEffect, useState } from "react";
import { CartDrawer } from "./CartDrawer";
import { MobileMenu } from "@/components/layout/MobileMenu";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {children}
      {mounted && (
        <>
          <CartDrawer />
          <MobileMenu />
        </>
      )}
    </>
  );
}
