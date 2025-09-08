"use client"

import { useState, useEffect } from "react"
import {
  LayoutDashboard,
  FileText,
  Settings,
  Menu,
  X,
  UserSquare,
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react"

import { Button } from "../components/ui/button"
import { useMobile } from "../hooks/use-mobile"
import { Tabs, TabsContent } from "../components/ui/tabs"
import { SimpleAnimatedThemeToggle } from "./SimpleAnimatedThemeToggle"

import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { logout } from "@/redux/Slice"
import { selectApplications } from "@/redux/applicationsSlice"
import { selectExams } from "@/redux/examDataSlice"
import { StatusCard } from "./ui/status-card"
import { GooeyMenu } from "./GooeyMenu"

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeFilter, setActiveFilter] = useState<string>("all")
  // Theme is now handled by SimpleAnimatedThemeToggle component
  const navigate = useNavigate()
  const isMobile = useMobile()
  // Local dropdown state handled inside GooeyMenu
  const dispatch = useDispatch()
  const applications = useSelector(selectApplications)
  const exams = useSelector(selectExams)
  const CurrentExam: any = exams[exams.length - 1]
  const handleLogout = () => {
    dispatch(logout())
    window.location.href = "/login"
  }
  console.log(exams, "exams")
  console.log(CurrentExam, "CurrentExam")

  const currentExamApplications = applications.filter((app) => app.examId === CurrentExam.id)
  console.log(currentExamApplications, "currentExamApplications")
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    } else {
      setSidebarOpen(true)
    }
  }, [isMobile])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Theme toggle is now handled by SimpleAnimatedThemeToggle component

  function nav(props: string) {
    navigate(props)
  }

  return (
    <div className="flex h-screen bg-background transition-all duration-300 ease-in-out">
      {/* Sidebar - transforms to top navbar on mobile */}
      {sidebarOpen && (
        <div
          className={`${
            isMobile ? "fixed top-0 left-0 z-50 w-64 h-full" : "w-64"
          } bg-[#5c347d] text-white shadow-lg transition-all duration-300 dark:bg-[#3b1f52]`}
        >
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <img src="/icon.png" alt="404" />
              </div>
              <span className="font-bold text-lg">MRCGP INT. </span>
            </div>
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          <nav className="mt-6 px-4">
            <ul className="space-y-2">
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-100 bg-slate-500/50 dark:bg-slate-600/50"
                  onClick={() => nav("/")}
                >
                  <LayoutDashboard className="mr-2 h-5 w-5" />
                  Dashboard
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-100 hover:bg-slate-700/50 dark:hover:bg-slate-800/50"
                  onClick={() => nav("/applications")}
                >
                  <UserSquare className="mr-2 h-5 w-5" />
                  Applications
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-100 hover:bg-slate-700/50 dark:hover:bg-slate-800/50"
                  onClick={() => nav("/exam")}
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Exams
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-100 hover:bg-slate-700/50 dark:hover:bg-slate-800/50"
                >
                  <Settings className="mr-2 h-5 w-5" />
                  Settings
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <header className="bg-[#5c347d] text-slate-100 h-16 flex items-center px-4 shadow-md dark:bg-[#3b1f52]">
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="mr-2 text-slate-100 hover:bg-slate-700/50 dark:hover:bg-slate-800/50"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <div className="flex-1 flex items-center justify-between">
            <h1 className="text-xl font-bold">Dashboard</h1>

            <div className="flex items-center space-x-4">
            <GooeyMenu />

              <SimpleAnimatedThemeToggle 
                variant="circle"
                start="top-right"
                className="bg-transparent border border-slate-600 hover:bg-slate-700/50 dark:hover:bg-slate-800/50"
              />

            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950">
          <Tabs defaultValue="applications" className="w-full">
            <TabsContent value="applications">
              <div className="text-3xl p-3">All Batch Status</div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <StatusCard
                  title="Total Requests"
                  value={applications.length}
                  color="bg-[#5c347d] dark:bg-[#3b1f52]"
                  onClick={() => setActiveFilter("totalAll")}
                  active={activeFilter === "totalAll"}
                  icon={ClipboardList}
                />
                <StatusCard
                  title="Pending Requests"
                  value={applications.filter((app) => app.status === "pending").length}
                  color="bg-amber-600 dark:bg-amber-700"
                  onClick={() => setActiveFilter("totalPending")}
                  active={activeFilter === "totalPending"}
                  icon={Clock}
                />
                <StatusCard
                  title="Approved Requests"
                  value={applications.filter((app) => app.status === "approved").length}
                  color="bg-green-600 dark:bg-green-700"
                  onClick={() => setActiveFilter("totalApproved")}
                  active={activeFilter === "totalApproved"}
                  icon={CheckCircle}
                />
                <StatusCard
                  title="Rejected Requests"
                  value={applications.filter((app) => app.status === "rejected").length}
                  color="bg-red-600 dark:bg-red-700"
                  onClick={() => setActiveFilter("totalRejected")}
                  active={activeFilter === "totalRejected"}
                  icon={XCircle}
                />
              </div>
              <div className="text-3xl p-3">Current Batch Status</div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <StatusCard
                  title="Total Requests"
                  value={currentExamApplications.length}
                  color="bg-[#5c347d] dark:bg-[#3b1f52]"
                  onClick={() => setActiveFilter("all")}
                  active={activeFilter === "all"}
                  icon={ClipboardList}
                />
                <StatusCard
                  title="Pending Requests"
                  value={currentExamApplications.filter((app: any) => app.status === "pending").length}
                  color="bg-amber-600 dark:bg-amber-700"
                  onClick={() => setActiveFilter("pending")}
                  active={activeFilter === "pending"}
                  icon={Clock}
                />
                <StatusCard
                  title="Approved Requests"
                  value={currentExamApplications.filter((app: any) => app.status === "approved").length}
                  color="bg-green-600 dark:bg-green-700"
                  onClick={() => setActiveFilter("approved")}
                  active={activeFilter === "approved"}
                  icon={CheckCircle}
                />
                <StatusCard
                  title="Rejected Requests"
                  value={currentExamApplications.filter((app: any) => app.status === "rejected").length}
                  color="bg-red-600 dark:bg-red-700"
                  onClick={() => setActiveFilter("rejected")}
                  active={activeFilter === "rejected"}
                  icon={XCircle}
                />
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
