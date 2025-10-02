"use client"

import { cn } from "@/lib/utils"
import { LayoutDashboard, Calendar, Bed, Building2, Hotel } from "lucide-react"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navigation = [
  { id: "overview", name: "Tổng quan", icon: LayoutDashboard },
  { id: "bookings", name: "Đặt phòng", icon: Calendar },
  { id: "rooms", name: "Phòng", icon: Bed },
  { id: "room-types", name: "Loại phòng", icon: Building2 },
]

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <Hotel className="h-8 w-8 text-sidebar-primary" />
          <h1 className="text-xl font-bold text-sidebar-foreground">Hotel Manager</h1>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeTab === item.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
