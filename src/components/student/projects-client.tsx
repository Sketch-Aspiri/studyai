"use client"

import { useState, useMemo } from "react"
import { ProjectCard } from "./project-card"
import { NewProjectButton } from "./new-project-button"

type Project = {
  id: string
  name: string
  emoji: string | null
  description: string | null
  created_at: Date
  updated_at: Date
  _count: { documents: number; resources: number }
}

type SortKey = "updated" | "created" | "name" | "resources"
type FilterKey = "all" | "with_docs" | "with_resources" | "empty"

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "updated", label: "Última actividad" },
  { value: "created", label: "Más recientes" },
  { value: "name", label: "Nombre A–Z" },
  { value: "resources", label: "Más recursos" },
]

const FILTER_OPTIONS: { value: FilterKey; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "with_docs", label: "Con documentos" },
  { value: "with_resources", label: "Con recursos" },
  { value: "empty", label: "Sin actividad" },
]

function applyFilter(projects: Project[], filter: FilterKey) {
  switch (filter) {
    case "with_docs": return projects.filter(p => p._count.documents > 0)
    case "with_resources": return projects.filter(p => p._count.resources > 0)
    case "empty": return projects.filter(p => p._count.documents === 0 && p._count.resources === 0)
    default: return projects
  }
}

function applySort(projects: Project[], sort: SortKey) {
  return [...projects].sort((a, b) => {
    switch (sort) {
      case "updated": return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      case "created": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case "name": return a.name.localeCompare(b.name, "es")
      case "resources": return b._count.resources - a._count.resources
    }
  })
}

export function ProjectsClient({ projects }: { projects: Project[] }) {
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortKey>("updated")
  const [filter, setFilter] = useState<FilterKey>("all")

  const visible = useMemo(() => {
    const searched = projects.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description ?? "").toLowerCase().includes(search.toLowerCase())
    )
    return applySort(applyFilter(searched, filter), sort)
  }, [projects, search, sort, filter])

  const totalDocs = projects.reduce((s, p) => s + p._count.documents, 0)
  const totalResources = projects.reduce((s, p) => s + p._count.resources, 0)

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">Mis proyectos</h1>
          <p className="text-sm text-muted mt-1">
            {projects.length} proyecto{projects.length !== 1 ? "s" : ""} ·{" "}
            {totalDocs} documento{totalDocs !== 1 ? "s" : ""} ·{" "}
            {totalResources} recurso{totalResources !== 1 ? "s" : ""}
          </p>
        </div>
        <NewProjectButton />
      </div>

      {/* Search + controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar proyectos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-border rounded-[--radius-sm] text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortKey)}
          className="py-2 px-3 text-sm bg-white border border-border rounded-[--radius-sm] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors cursor-pointer"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        {FILTER_OPTIONS.map(o => (
          <button
            key={o.value}
            onClick={() => setFilter(o.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              filter === o.value
                ? "bg-primary text-white"
                : "bg-white border border-border text-muted hover:border-gray-300 hover:text-foreground"
            }`}
          >
            {o.label}
            {o.value !== "all" && (
              <span className="ml-1 opacity-70">
                ({applyFilter(projects, o.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Results */}
      {visible.length === 0 ? (
        <div className="bg-white rounded-lg border border-border p-10 flex flex-col items-center justify-center text-center">
          <div className="h-10 w-10 rounded-full bg-surface flex items-center justify-center mb-3">
            <svg className="h-5 w-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            {search ? "Sin resultados" : "No hay proyectos en esta categoría"}
          </p>
          <p className="text-xs text-muted">
            {search
              ? `Ningún proyecto coincide con "${search}"`
              : "Prueba con otro filtro"}
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="mt-3 text-xs text-primary hover:underline"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-muted mb-3">
            {visible.length === projects.length
              ? `${visible.length} proyecto${visible.length !== 1 ? "s" : ""}`
              : `${visible.length} de ${projects.length} proyecto${projects.length !== 1 ? "s" : ""}`}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {visible.map(project => (
              <ProjectCard key={project.id} project={project} basePath="/projects" />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
