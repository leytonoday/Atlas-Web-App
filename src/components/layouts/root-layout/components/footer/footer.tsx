import React from "react";
import Image from "next/image";
import { CenteredContainer } from "@/components/common";

/**
 * The footer for the website.
 */
export const Footer = () => {
  return (
    <footer role="contentinfo">
      <CenteredContainer>
        <div className="flex items-center gap-4 py-4">
          <Image
            src="/logo.png"
            width={100}
            height={100}
            alt="Logo"
            className="h-16 w-auto"
            priority
          />
          <div>@ Copyright 2023 legallighthouse.xyz</div>
        </div>
      </CenteredContainer>
    </footer>
  );
};
