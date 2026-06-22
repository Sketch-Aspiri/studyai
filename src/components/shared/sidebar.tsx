"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

interface SidebarProps {
  items: NavItem[]
  variant: "student" | "teacher"
  userName: string
  userEmail: string
  userInitials: string
  logoutAction: () => Promise<void>
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({
  items,
  variant,
  userName,
  userEmail,
  userInitials,
  logoutAction,
  isMobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname()
  const isTeacher = variant === "teacher"
  const accentColor = isTeacher ? "var(--teacher)" : "var(--primary)"
  const accentBg = isTeacher ? "rgba(5,150,105,0.08)" : "rgba(79,70,229,0.08)"

  return (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 border-r border-border bg-white flex flex-col",
        "transition-transform duration-200 ease-in-out",
        "md:static md:z-auto md:w-60 md:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
      ].join(" ")}
    >
      {/* Header */}
      <div className="h-14 flex items-center px-5 border-b border-border gap-2">
        <span className="flex-1 text-lg font-bold" style={{ color: accentColor }}>
          StudyAI
        </span>
        {/* Close button — mobile only */}
        <button
          onClick={onMobileClose}
          className="md:hidden flex items-center justify-center h-8 w-8 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
          aria-label="Cerrar menú"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className="flex items-center gap-3 rounded-lg px-3 min-h-[44px] text-sm font-medium transition-colors cursor-pointer hover:bg-surface"
              style={
                isActive
                  ? { background: accentBg, color: accentColor }
                  : undefined
              }
            >
              <span
                className="flex-shrink-0"
                style={isActive ? { color: accentColor } : { color: "var(--muted)" }}
              >
                {item.icon}
              </span>
              <span
                className={isActive ? "" : "text-muted"}
                style={isActive ? { color: accentColor } : undefined}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-2 mb-2">
          <div
            className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
            style={{ background: accentBg, color: accentColor }}
          >
            {userInitials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{userName}</p>
            <p className="text-xs text-muted truncate">{userEmail}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 rounded-lg px-3 min-h-[44px] text-sm text-muted hover:bg-surface hover:text-foreground transition-colors cursor-pointer"
          >
            <svg
              className="h-4 w-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  )
}
