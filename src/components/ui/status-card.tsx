"use client"

import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusCardProps {
  title: string
  value: number
  color: string
  onClick?: () => void
  active?: boolean
  icon?: LucideIcon
}

export function StatusCard({ title, value, color, onClick, active = false, icon: Icon }: StatusCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg p-4 shadow-md transition-all duration-200 cursor-pointer hover:shadow-lg",
        color,
        active ? "ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-600" : "",
      )}
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        {Icon && (
          <div className="bg-white/20 dark:bg-black/20 p-2 rounded-full">
            <Icon className="h-5 w-5 text-white" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-medium text-white/80">{title}</h3>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  )
}
