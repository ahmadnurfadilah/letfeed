"use client";

import Link from "next/link";
import { BotMessageSquare, LayoutDashboard, Link2, MessageSquareDashed, Palette, Users2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/ui/logo/logo";
import SelectTeam from "./select-team";

export default function Sidenav({user}: {user: any}) {
  const pathname = usePathname();
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <>
      {showSidebar && (
        <div className="absolute z-10 inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowSidebar(false)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white absolute left-2/3 top-4 cursor-pointer" viewBox="0 0 24 24">
            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )}

      <div
        className={`${
          showSidebar ? "-translate-x-0" : "-translate-x-64"
        } lg:-translate-x-0 w-64 absolute z-10 top-0 left-0 bottom-0 rounded-none lg:relative lg:flex flex-col bg-gradient-to-t from-brand-950 to-brand transition-transform shrink-0`}
      >
        <Link
          href="/dashboard"
          className="shrink-0 p-3 border-b border-gray-600 text-white font-mono font-bold -tracking-wider flex items-center justify-center h-16"
        >
          <Logo className="h-5" />
        </Link>

        <SelectTeam user={user} />

        <ul className="flex-1 p-4 space-y-3 font-semibold">
          <li>
            <Link
              href="/dashboard"
              className={`w-full text-sm text-white flex items-center space-x-2 px-4 py-3 rounded-md ${
                pathname === "/dashboard" ? "bg-gradient-to-r from-perfume-400 to-perfume text-brand" : "text-white/70 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              href="/feedback"
              className={`w-full text-sm text-white flex items-center space-x-2 px-4 py-3 rounded-md ${
                pathname === "/feedback" ? "bg-gradient-to-r from-perfume-400 to-perfume text-brand" : "text-white/70 hover:text-white"
              }`}
            >
              <MessageSquareDashed className="w-4 h-4" />
              <span>Feedback</span>
            </Link>
          </li>
          <li>
            <Link
              href="/analysis"
              className={`w-full text-sm text-white flex items-center space-x-2 px-4 py-3 rounded-md ${
                pathname === "/analysis" ? "bg-gradient-to-r from-perfume-400 to-perfume text-brand" : "text-white/70 hover:text-white"
              }`}
            >
              <BotMessageSquare className="w-4 h-4" />
              <span>AI Analysis</span>
            </Link>
          </li>
          {/* <li>
            <Link
              href="/customers"
              className={`w-full text-sm text-white flex items-center space-x-2 px-4 py-3 rounded-md ${
                pathname === "/customers" ? "bg-gradient-to-r from-perfume-400 to-perfume text-brand" : "text-white/70 hover:text-white"
              }`}
            >
              <Users2 className="w-4 h-4" />
              <span>Customers</span>
            </Link>
          </li> */}
          <li>
            <Link
              href="/widgets"
              className={`w-full text-sm text-white flex items-center space-x-2 px-4 py-3 rounded-md ${
                pathname === "/widgets" ? "bg-gradient-to-r from-perfume-400 to-perfume text-brand" : "text-white/70 hover:text-white"
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Widget Style</span>
            </Link>
          </li>
          <li>
            <Link
              href="/integrations"
              className={`w-full text-sm text-white flex items-center space-x-2 px-4 py-3 rounded-md ${
                pathname === "/integrations" ? "bg-gradient-to-r from-perfume-400 to-perfume text-brand" : "text-white/70 hover:text-white"
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span>Integration</span>
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}
