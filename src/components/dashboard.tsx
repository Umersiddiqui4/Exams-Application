"use client"

import { useState, useEffect } from "react"
import { Menu, ClipboardList, CheckCircle, XCircle, FileText, Eye } from "lucide-react"

import { Button } from "../components/ui/button"
import { useMobile } from "../hooks/use-mobile"
import { Tabs, TabsContent } from "../components/ui/tabs"
import { SimpleAnimatedThemeToggle } from "./SimpleAnimatedThemeToggle"

import {  } from "react-router-dom"
import { StatusCard } from "./ui/status-card"
import { GooeyMenu } from "./GooeyMenu"
import { SidebarNav } from "./SidebarNav"
import { useDashboardData } from "@/lib/useDashboardData"

export function Dashboard() {
   const [sidebarOpen, setSidebarOpen] = useState(true)
   const [activeFilter, setActiveFilter] = useState<string>("all")
   // Theme is now handled by SimpleAnimatedThemeToggle component
   const isMobile = useMobile()

   // Fetch dashboard data
   const { allApplications: stats, currentExam } = useDashboardData()

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

  

  return (
    <div className="flex h-screen bg-background transition-all duration-300 ease-in-out">
      {/* Sidebar - transforms to top navbar on mobile */}
      <SidebarNav sidebarOpen={sidebarOpen} onClose={toggleSidebar} />

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
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5 mb-6">
                <StatusCard
                  title="Total Requests"
                  value={stats.total}
                  color="bg-[#5c347d] dark:bg-[#3b1f52]"
                  onClick={() => setActiveFilter("totalAll")}
                  active={activeFilter === "totalAll"}
                  icon={ClipboardList}
                />
                <StatusCard
                  title="Approved Requests"
                  value={stats.approved}
                  color="bg-green-600 dark:bg-green-700"
                  onClick={() => setActiveFilter("totalApproved")}
                  active={activeFilter === "totalApproved"}
                  icon={CheckCircle}
                />
                <StatusCard
                  title="Rejected Requests"
                  value={stats.rejected}
                  color="bg-red-600 dark:bg-red-700"
                  onClick={() => setActiveFilter("totalRejected")}
                  active={activeFilter === "totalRejected"}
                  icon={XCircle}
                />
                <StatusCard
                  title="Submitted Requests"
                  value={stats.submitted}
                  color="bg-blue-600 dark:bg-blue-700"
                  onClick={() => setActiveFilter("totalSubmitted")}
                  active={activeFilter === "totalSubmitted"}
                  icon={FileText}
                />
                <StatusCard
                  title="Under Review Requests"
                  value={stats.underReview}
                  color="bg-purple-600 dark:bg-purple-700"
                  onClick={() => setActiveFilter("totalUnderReview")}
                  active={activeFilter === "totalUnderReview"}
                  icon={Eye}
                />
              </div>

              {/* Current Exam Status Section */}
              <div className="text-3xl p-3 mt-8">Current Exam Status</div>
              {currentExam.examTitle && (
                <div className="text-lg p-2 text-[#5c347d] dark:text-[#8b5fbf] font-semibold">
                  {currentExam.examTitle}
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5 mb-6">
                <StatusCard
                  title="Total Requests"
                  value={currentExam.total}
                  color="bg-[#5c347d] dark:bg-[#3b1f52]"
                  onClick={() => setActiveFilter("currentTotal")}
                  active={activeFilter === "currentTotal"}
                  icon={ClipboardList}
                />
                <StatusCard
                  title="Approved Requests"
                  value={currentExam.approved}
                  color="bg-green-600 dark:bg-green-700"
                  onClick={() => setActiveFilter("currentApproved")}
                  active={activeFilter === "currentApproved"}
                  icon={CheckCircle}
                />
                <StatusCard
                  title="Rejected Requests"
                  value={currentExam.rejected}
                  color="bg-red-600 dark:bg-red-700"
                  onClick={() => setActiveFilter("currentRejected")}
                  active={activeFilter === "currentRejected"}
                  icon={XCircle}
                />
                <StatusCard
                  title="Submitted Requests"
                  value={currentExam.submitted}
                  color="bg-blue-600 dark:bg-blue-700"
                  onClick={() => setActiveFilter("currentSubmitted")}
                  active={activeFilter === "currentSubmitted"}
                  icon={FileText}
                />
                <StatusCard
                  title="Under Review Requests"
                  value={currentExam.underReview}
                  color="bg-purple-600 dark:bg-purple-700"
                  onClick={() => setActiveFilter("currentUnderReview")}
                  active={activeFilter === "currentUnderReview"}
                  icon={Eye}
                />
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
