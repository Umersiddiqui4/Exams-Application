import { LayoutDashboard, FileText, Settings, UserSquare, X } from "lucide-react"
import { Button } from "./ui/button"
import { useLocation, useNavigate } from "react-router-dom"
import { useMobile } from "../hooks/use-mobile"

type SidebarNavProps = {
  sidebarOpen: boolean
  onClose: () => void
}

export function SidebarNav({ sidebarOpen, onClose }: SidebarNavProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useMobile()

  function nav(path: string) {
    navigate(path)
    if (isMobile) onClose()
  }

  if (!sidebarOpen) return null

  return (
    <div className={`${isMobile ? "fixed top-0 left-0 z-50 w-64 h-full" : "w-64"} bg-[#5c347d] text-white shadow-lg transition-all duration-300 dark:bg-[#3b1f52]`}>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <img src="/icon.png" alt="404" />
          </div>
          <span className="font-bold text-lg">MRCGP INT. </span>
        </div>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav className="mt-6 px-4">
        <ul className="space-y-2">
          <li>
            <Button
              variant="ghost"
              className={`w-full justify-start text-slate-100 ${location.pathname === "/" ? "bg-slate-500/50 dark:bg-slate-600/50" : "hover:bg-slate-700/50 dark:hover:bg-slate-800/50"}`}
              onClick={() => nav("/")}
            >
              <LayoutDashboard className="mr-2 h-5 w-5" />
              Dashboard
            </Button>
          </li>
          <li>
            <Button
              variant="ghost"
              className={`w-full justify-start text-slate-100 ${location.pathname === "/applications" ? "bg-slate-500/50 dark:bg-slate-600/50" : "hover:bg-slate-700/50 dark:hover:bg-slate-800/50"}`}
              onClick={() => nav("/applications")}
            >
              <UserSquare className="mr-2 h-5 w-5" />
              Applications
            </Button>
          </li>
          <li>
            <Button
              variant="ghost"
              className={`w-full justify-start text-slate-100 ${location.pathname === "/exam" ? "bg-slate-500/50 dark:bg-slate-600/50" : "hover:bg-slate-700/50 dark:hover:bg-slate-800/50"}`}
              onClick={() => nav("/exam")}
            >
              <FileText className="mr-2 h-5 w-5" />
              Exams
            </Button>
          </li>
          <li>
            {/* Settings route currently removed; keeping UI commented to avoid 404 */}
            {false && (
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-100 hover:bg-slate-700/50 dark:hover:bg-slate-800/50"
                onClick={() => nav("/settings")}
              >
                <Settings className="mr-2 h-5 w-5" />
                Settings
              </Button>
            )}
          </li>
        </ul>
      </nav>
    </div>
  )
}


