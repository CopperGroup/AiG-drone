"use client"

import { Button } from "@/components/ui/button";
import { ReactNode } from "react";


const ExploreCollectionsButton = ({ children, componentId }: { children : ReactNode, componentId: string }) => {
  const scrollToDiv = () => {
    const element = document.getElementById(componentId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Button
      size="lg"
      variant="outline"
      className="text-white border-white rounded-none hover:bg-white/10 px-8 py-6 text-lg"
      onClick={scrollToDiv}
    >
      {children}
    </Button>
  )
}

export default ExploreCollectionsButton