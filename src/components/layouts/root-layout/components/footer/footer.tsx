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
        <div className="flex items-center gap-4 py-8">
          @ Copyright 2023 legallighthouse.xyz
        </div>
      </CenteredContainer>
    </footer>
  );
};
