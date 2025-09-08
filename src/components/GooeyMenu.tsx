"use client"

import { useState } from "react"
import { LogOut, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { logout } from "@/redux/Slice";
import { useDispatch } from "react-redux";

interface GooeyMenuProps {
  className?: string
}

export function GooeyMenu({ className }: GooeyMenuProps) {
  const [open, setOpen] = useState(false)
  const dispatch = useDispatch();

  const handleLogout = () => {
    console.log("logout");
    
    dispatch(logout());
    window.location.href = "/login";
  };


  return (
    <div className={cn("relative", className)}>
      {/* SVG filter for gooey effect */}
      <svg width="0" height="0">
        <filter id="gooey">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </svg>

      {/* Trigger (avatar) */}
      {!open && (
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative z-10 grid place-items-center size-8 rounded-full bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-300/60 dark:ring-slate-700/70 hover:scale-[1.03] active:scale-95 transition"
      >
        <img src="/profile.png" alt="profile" className="size-8 rounded-full object-cover" />
      </button>
      )}

      {/* Gooey menu container */}
      <div
        style={{ filter: "url(#gooey)" }}
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 p-1",
          open ? "opacity-100 translate-x-0" : "pointer-events-none opacity-0 translate-x-2",
          "transition-all duration-300"
        )}
      >
        {/* Blob buttons */}
        <button
          type="button"
          title="Logout"
        className="grid place-items-center size-9 rounded-full bg-white/90 text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-white dark:bg-slate-900/80 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-800"

          onClick={() => {
              handleLogout()
              setOpen(false)
          }}
        >
          <LogOut className="size-4" />
        </button>

        <button
          type="button"
          title="Logout"
        className="grid place-items-center size-9 rounded-full bg-white/90 text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-white dark:bg-slate-900/80 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-800"

          onClick={() => {
              setOpen(false)
          }}
        >
          <X className="size-4" />
        </button>
       
      </div>

    </div>
  )
}
