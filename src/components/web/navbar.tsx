import { Link } from '@tanstack/react-router'

import { buttonVariants } from '@/components/ui/button'

import { authClient } from '@/lib/auth-client'

import { ThemeToggle } from './theme-toggle'

import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export const Navbar = () => {
  const { data: session, isPending } = authClient.useSession()

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success('You have been signed out')
        },
        onError: ({ error }) => {
          toast.error(error.message)
        },
      },
    })
  }

  return (
    <nav className="sticky top-0 z-50 border-b backdrop-blur bg-background/95 supports-backdrop-filter:bg-background/60">
      <div className="flex justify-between items-center px-4 mx-auto max-w-6xl h-16">
        <div className="flex gap-2 items-center">
          <img
            src="/tanstack-circle-logo.png"
            alt="TanStack Logo"
            className="size-8"
          />
          <h1 className="text-lg font-semibold">TanStack Start</h1>
        </div>
        <div className="flex gap-3 items-center">
          <ThemeToggle />
          {isPending ? (
            <>
              <Button
                disabled
                className={buttonVariants({ variant: 'secondary' })}
              >
                Logout
              </Button>
              <Button disabled className={buttonVariants()}>
                Dashboard
              </Button>
            </>
          ) : session ? (
            <>
              <Button
                onClick={handleSignOut}
                className={buttonVariants({ variant: 'secondary' })}
              >
                Logout
              </Button>
              {/* TODO: Add a link to the dashboard */}
              <Link to="/" className={buttonVariants()}>
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={buttonVariants({ variant: 'secondary' })}
              >
                Login
              </Link>
              <Link to="/signup" className={buttonVariants()}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
