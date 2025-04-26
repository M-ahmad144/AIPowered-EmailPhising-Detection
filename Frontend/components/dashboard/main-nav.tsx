import Link from "next/link"

export function MainNav() {
  return (
    <div className="flex items-center space-x-4 lg:space-x-6">
      <Link href="/dashboard" className="text-lg font-semibold transition-colors hover:text-primary">
        Admin Dashboard
      </Link>
    </div>
  )
}
