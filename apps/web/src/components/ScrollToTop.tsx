"use client"; 

import { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
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
      style={{
  position: "fixed",
  left: "50%",                          // 1. Move left edge to screen center
  bottom: "24px",                        // 2. Keep it at the bottom
  transform: "translateX(-50%)",         // 3. Shift it back left to perfectly center it
  zIndex: "50",
  backgroundColor: "#000000",
  color: "#ffffff",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: "50%",
  width: "45px",
  height: "45px",
  fontSize: "20px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
}}
      title="Go to top"
      aria-label="Scroll to top"
    >
      &#8593;
    </button>
  );
}