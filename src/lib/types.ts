import { LinkOptions } from '@tanstack/react-router'
import { type User } from 'better-auth'
import { type LucideIcon } from 'lucide-react'

export interface NavPrimaryProps {
  items: {
    title: string
    to: string
    icon: LucideIcon
    activeOptions?: LinkOptions['activeOptions']
  }[]
}

export interface NavUserProps {
  user: User
}
