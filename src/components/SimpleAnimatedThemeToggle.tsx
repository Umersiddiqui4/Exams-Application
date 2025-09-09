"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

// Simple animated theme toggle button
export const SimpleAnimatedThemeToggle = ({
  className = "",
  variant = "circle",
  start = "top-right",
  blur = true,
}: {
  className?: string;
  variant?: "circle" | "rectangle";
  start?: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
  blur?: boolean;
}) => {
  const { theme, setTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  // Sync isDark state with theme
  useEffect(() => {
    setIsDark(theme === "dark");
  }, [theme]);

  const styleId = "theme-transition-styles";

  const updateStyles = useCallback((css: string) => {
    if (typeof window === "undefined") return;

    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = css;
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(!isDark);

    const animation = createSimpleAnimation(variant, start, blur);
    updateStyles(animation.css);

    if (typeof window === "undefined") return;

    const switchTheme = () => {
      setTheme(theme === "light" ? "dark" : "light");
    };

    if (!document.startViewTransition) {
      switchTheme();
      return;
    }

    document.startViewTransition(switchTheme);
  }, [theme, setTheme, variant, start, blur, updateStyles, isDark, setIsDark]);

  return (
    <button
      type="button"
      className={cn(
        "size-10 cursor-pointer rounded-full bg-black p-0 transition-all duration-300 active:scale-95 hover:scale-105",
        className,
      )}
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <span className="sr-only">Toggle theme</span>
      <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g
          animate={{ rotate: isDark ? -180 : 0 }}
          transition={{ ease: "easeInOut", duration: 0.5 }}
        >
          <path
            d="M120 67.5C149.25 67.5 172.5 90.75 172.5 120C172.5 149.25 149.25 172.5 120 172.5"
            fill="white"
          />
          <path
            d="M120 67.5C90.75 67.5 67.5 90.75 67.5 120C67.5 149.25 90.75 172.5 120 172.5"
            fill="black"
          />
        </motion.g>
        <motion.path
          animate={{ rotate: isDark ? 180 : 0 }}
          transition={{ ease: "easeInOut", duration: 0.5 }}
          d="M120 3.75C55.5 3.75 3.75 55.5 3.75 120C3.75 184.5 55.5 236.25 120 236.25C184.5 236.25 236.25 184.5 236.25 120C236.25 55.5 184.5 3.75 120 3.75ZM120 214.5V172.5C90.75 172.5 67.5 149.25 67.5 120C67.5 90.75 90.75 67.5 120 67.5V25.5C172.5 25.5 214.5 67.5 214.5 120C214.5 172.5 172.5 214.5 120 214.5Z"
          fill="white"
        />
      </svg>
    </button>
  );
};

// Simple animation creation function
const createSimpleAnimation = (
  variant: "circle" | "rectangle",
  start: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right",
  blur = false,
) => {
  if (variant === "circle") {
    const getClipPosition = (position: string) => {
      switch (position) {
        case "top-left":
          return "0% 0%";
        case "top-right":
          return "100% 0%";
        case "bottom-left":
          return "0% 100%";
        case "bottom-right":
          return "100% 100%";
        default:
          return "50% 50%";
      }
    };

    const clipPosition = getClipPosition(start);

    return {
      css: `
        ::view-transition-group(root) {
          animation-duration: 0.7s;
          animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
              
        ::view-transition-new(root) {
          animation-name: reveal-light${blur ? "-blur" : ""};
          ${blur ? "filter: blur(2px);" : ""}
        }

        ::view-transition-old(root),
        .dark::view-transition-old(root) {
          animation: none;
          z-index: -1;
        }
        .dark::view-transition-new(root) {
          animation-name: reveal-dark${blur ? "-blur" : ""};
          ${blur ? "filter: blur(2px);" : ""}
        }

        @keyframes reveal-dark${blur ? "-blur" : ""} {
          from {
            clip-path: circle(0% at ${clipPosition});
            ${blur ? "filter: blur(8px);" : ""}
          }
          ${blur ? "50% { filter: blur(4px); }" : ""}
          to {
            clip-path: circle(150% at ${clipPosition});
            ${blur ? "filter: blur(0px);" : ""}
          }
        }

        @keyframes reveal-light${blur ? "-blur" : ""} {
          from {
             clip-path: circle(0% at ${clipPosition});
             ${blur ? "filter: blur(8px);" : ""}
          }
          ${blur ? "50% { filter: blur(4px); }" : ""}
          to {
            clip-path: circle(150% at ${clipPosition});
            ${blur ? "filter: blur(0px);" : ""}
          }
        }
        `,
    };
  }

  if (variant === "rectangle") {
    const getClipPath = (direction: string) => {
      switch (direction) {
        case "top-left":
          return {
            from: "polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)",
            to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          };
        case "top-right":
          return {
            from: "polygon(100% 0%, 100% 0%, 100% 0%, 100% 0%)",
            to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          };
        case "bottom-left":
          return {
            from: "polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%)",
            to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          };
        case "bottom-right":
          return {
            from: "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)",
            to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          };
        default:
          return {
            from: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
            to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          };
      }
    };

    const clipPath = getClipPath(start);

    return {
      css: `
        ::view-transition-group(root) {
          animation-duration: 0.7s;
          animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
              
        ::view-transition-new(root) {
          animation-name: reveal-light${blur ? "-blur" : ""};
          ${blur ? "filter: blur(2px);" : ""}
        }

        ::view-transition-old(root),
        .dark::view-transition-old(root) {
          animation: none;
          z-index: -1;
        }
        .dark::view-transition-new(root) {
          animation-name: reveal-dark${blur ? "-blur" : ""};
          ${blur ? "filter: blur(2px);" : ""}
        }

        @keyframes reveal-dark${blur ? "-blur" : ""} {
          from {
            clip-path: ${clipPath.from};
            ${blur ? "filter: blur(8px);" : ""}
          }
          ${blur ? "50% { filter: blur(4px); }" : ""}
          to {
            clip-path: ${clipPath.to};
            ${blur ? "filter: blur(0px);" : ""}
          }
        }

        @keyframes reveal-light${blur ? "-blur" : ""} {
          from {
            clip-path: ${clipPath.from};
            ${blur ? "filter: blur(8px);" : ""}
          }
          ${blur ? "50% { filter: blur(4px); }" : ""}
          to {
            clip-path: ${clipPath.to};
            ${blur ? "filter: blur(0px);" : ""}
          }
        }
        `,
    };
  }

  return { css: "" };
};
