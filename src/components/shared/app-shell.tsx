"use client"

import { useState } from "react"
import { Sidebar, type NavItem } from "./sidebar"

interface AppShellProps {
  children: React.ReactNode
  items: NavItem[]
  variant: "student" | "teacher"
  userName: string
  userEmail: string
  userInitials: string
  logoutAction: () => Promise<void>
}

export function AppShell({
  children,
  items,
  variant,
  userName,
  userEmail,
  userInitials,
  logoutAction,
}: AppShellProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const accentColor = variant === "teacher" ? "var(--teacher)" : "var(--primary)"

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        items={items}
        variant={variant}
        userName={userName}
        userEmail={userEmail}
        userInitials={userInitials}
        logoutAction={logoutAction}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 flex items-center gap-3 h-14 px-4 bg-white border-b border-border shrink-0">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="flex items-center justify-center h-10 w-10 rounded-lg text-foreground hover:bg-surface transition-colors cursor-pointer"
            aria-label="Abrir menú de navegación"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-base font-bold" style={{ color: accentColor }}>
            StudyAI
          </span>
        </header>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
