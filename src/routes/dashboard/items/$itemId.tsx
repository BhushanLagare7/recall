import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'

import {
  ArrowLeftIcon,
  CalendarIcon,
  ChevronDownIcon,
  ClockIcon,
  ExternalLinkIcon,
  UserIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

import { cn } from '@/lib/utils'

import { getItemByIdFn } from '@/data/items'
import { Card, CardContent } from '@/components/ui/card'
import { MessageResponse } from '@/components/ai-elements/message'

export const Route = createFileRoute('/dashboard/items/$itemId')({
  component: RouteComponent,
  loader: ({ params }) => getItemByIdFn({ data: { id: params.itemId } }),
})

function RouteComponent() {
  const item = Route.useLoaderData()

  const [contentOpen, setContentOpen] = useState(false)

  return (
    <div className="mx-auto space-y-6 w-full max-w-3xl">
      <div className="flex justify-start">
        <Link
          to="/dashboard/items"
          className={buttonVariants({ variant: 'outline' })}
        >
          <ArrowLeftIcon />
          Back
        </Link>
      </div>
      {item.ogImage && (
        <div className="overflow-hidden relative w-full rounded-lg aspect-video bg-muted">
          <img
            src={item.ogImage}
            alt={item.title ?? 'Thumbnail'}
            className="object-cover transition-transform duration-300 size-full hover:scale-105"
          />
        </div>
      )}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">
          {item.title ?? 'Untitled'}
        </h1>
        {/* Metadata Row */}
        <div className="flex flex-wrap gap-4 items-center text-sm text-muted-foreground">
          {item.author && (
            <span className="inline-flex gap-1 items-center">
              <UserIcon className="size-3.5" />
              {item.author}
            </span>
          )}
          {item.publishedAt && (
            <span className="inline-flex gap-1 items-center">
              <CalendarIcon className="size-3.5" />
              {new Date(item.publishedAt).toLocaleDateString('en-US')}
            </span>
          )}
          <span className="inline-flex gap-1 items-center">
            <ClockIcon className="size-3.5" />
            Saved {new Date(item.createdAt).toLocaleDateString('en-US')}
          </span>
        </div>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex gap-1 items-center text-sm text-primary hover:underline"
        >
          View Original
          <ExternalLinkIcon className="size-3.5" />
        </a>
        {/* Tags */}
        {item.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        )}
        {/* Summary */}
        <p>// TODO: Hey this for the summary</p>
        {/* Content */}
        {item.content && (
          <Collapsible open={contentOpen} onOpenChange={setContentOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="justify-between w-full">
                <span className="font-medium">Full Content</span>
                <ChevronDownIcon
                  className={cn('transition-transform duration-200 size-4', {
                    'rotate-180': contentOpen,
                  })}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card className="mt-2">
                <CardContent>
                  <MessageResponse>{item.content}</MessageResponse>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  )
}
