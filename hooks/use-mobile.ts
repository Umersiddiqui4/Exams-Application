"use client"

import { useState, useEffect } from "react"

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if window is defined (browser environment)
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768) // Adjust breakpoint as needed
      }

      // Set initial value
      handleResize()

      // Add event listener
      window.addEventListener("resize", handleResize)

      // Remove event listener on cleanup
      return () => window.removeEventListener("resize", handleResize)
    }

    return undefined
  }, [])

  return isMobile
}
