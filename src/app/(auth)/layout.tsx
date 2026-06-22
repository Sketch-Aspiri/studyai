export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">StudyAI</span>
          </a>
        </div>
        <div
          className="bg-white rounded-[--radius-lg] border border-border shadow-sm p-8"
        >
          {children}
        </div>
      </div>
    </div>
  )
}
