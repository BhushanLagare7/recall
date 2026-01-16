import { Button } from '../ui/button'

import { ThemeToggle } from './theme-toggle'

export const Navbar = () => {
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
          <Button variant="secondary">Login</Button>
          <Button>Get Started</Button>
        </div>
      </div>
    </nav>
  )
}
