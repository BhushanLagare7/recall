import { Link } from '@tanstack/react-router'

import { toast } from 'sonner'

import { authClient } from '@/lib/auth-client'

import { Button,buttonVariants  } from '@/components/ui/button'

import { ThemeToggle } from './theme-toggle'






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
            alt="TanStack Logo"
            className="size-8"
            src="/tanstack-circle-logo.png"
          />
          <h1 className="text-lg font-semibold">TanStack Start</h1>
        </div>
        <div className="flex gap-3 items-center">
          <ThemeToggle />
          {isPending ? (
            <>
              <Button
                className={buttonVariants({ variant: 'secondary' })}
                disabled
              >
                Logout
              </Button>
              <Button className={buttonVariants()} disabled>
                Dashboard
              </Button>
            </>
          ) : session ? (
            <>
              <Button
                className={buttonVariants({ variant: 'secondary' })}
                onClick={handleSignOut}
              >
                Logout
              </Button>
              <Link className={buttonVariants()} to="/dashboard">
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                className={buttonVariants({ variant: 'secondary' })}
                to="/login"
              >
                Login
              </Link>
              <Link className={buttonVariants()} to="/signup">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
