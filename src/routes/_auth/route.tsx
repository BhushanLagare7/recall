import { createFileRoute, Link, Outlet } from '@tanstack/react-router'

import { ArrowLeftIcon } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="min-h-screen">
      <div className="absolute top-8 left-8">
        <Link to="/" className={buttonVariants({ variant: 'secondary' })}>
          <ArrowLeftIcon className="size-4" />
          Back to Home
        </Link>
      </div>
      <div className="flex justify-center items-center min-h-screen">
        <Outlet />
      </div>
    </div>
  )
}
