"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to Top"
      title="Back to Top"
      className="fixed bottom-8 right-8 z-50 h-12 w-12 rounded-full bg-[#84ff00] text-black shadow-[0_0_15px_#00ff26] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_25px_#00ff26]"
    >
      <FontAwesomeIcon icon={faArrowUp} />
    </button>
  );
}


