import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import {  } from "react-router-dom";
import { useMobile } from "../hooks/use-mobile";
import { useState } from "react";
import ApplicationTable from "./ui/applicationTable";
import { SimpleAnimatedThemeToggle } from "./SimpleAnimatedThemeToggle";
import { GooeyMenu } from "./GooeyMenu";
import { SidebarNav } from "./SidebarNav";

export default function Applications() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  useMobile();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  

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
              className="mr-2 text-slate-100  hover:bg-slate-700/50 dark:hover:bg-slate-800/50"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <div className="flex-1 flex items-center justify-between">
            <h1 className="text-xl font-bold">Applications</h1>

            <div className="flex items-center space-x-4 " >
            <GooeyMenu />
              <SimpleAnimatedThemeToggle 
                variant="circle"
                start="top-right"
                className="bg-transparent border border-slate-600 hover:bg-slate-700/50 dark:hover:bg-slate-800/50"
              />

            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950">
          <ApplicationTable />
        </main>
      </div>
    </div>
  );
}
