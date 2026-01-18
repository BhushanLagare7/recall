import { useState } from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'

import {
  ArrowLeftIcon,
  CalendarIcon,
  ChevronDownIcon,
  ClockIcon,
  ExternalLinkIcon,
  Loader2Icon,
  SparklesIcon,
  UserIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { useCompletion } from '@ai-sdk/react'

import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

import { cn } from '@/lib/utils'

import { getItemById, saveSummaryAndGenerateTagsFn } from '@/data/items'
import { Card, CardContent } from '@/components/ui/card'
import { MessageResponse } from '@/components/ai-elements/message'

export const Route = createFileRoute('/dashboard/items/$itemId')({
  component: RouteComponent,
  loader: ({ params }) => getItemById({ data: { id: params.itemId } }),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.title ?? 'Item Details',
      },
      {
        property: 'og:title',
        content: loaderData?.title ?? 'Item Details',
      },
      {
        property: 'og:description',
        content: loaderData?.summary ?? 'Item Summary',
      },
      {
        property: 'og:image',
        content: loaderData?.ogImage ?? '',
      },
      {
        property: 'twitter:title',
        content: loaderData?.title ?? 'Item Details',
      },
      {
        property: 'twitter:description',
        content: loaderData?.summary ?? 'Item Summary',
      },
    ],
  }),
})

function RouteComponent() {
  const item = Route.useLoaderData()
  const router = useRouter()

  const [contentOpen, setContentOpen] = useState(false)

  const { completion, complete, isLoading } = useCompletion({
    api: '/api/ai/summary',
    initialCompletion: item.summary ? item.summary : undefined,
    streamProtocol: 'text',
    body: { itemId: item.id },
    onFinish: async (_prompt, completionText) => {
      await saveSummaryAndGenerateTagsFn({
        data: {
          id: item.id,
          summary: completionText,
        },
      })
      toast.success('Summary generated successfully')
      router.invalidate()
    },
    onError: (error) => {
      console.error(error.message)
      toast.error('Failed to generate summary')
    },
  })

  const handleGenerateSummary = () => {
    if (!item.content) {
      toast.error('No content available to generate a summary.')
      return
    }

    complete(item.content)
  }

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

      <div className="overflow-hidden relative w-full rounded-lg aspect-video bg-muted">
        <img
          src={
            item.ogImage ??
            'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1429&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
          }
          alt={item.title ?? 'Thumbnail'}
          className="object-cover transition-transform duration-300 size-full hover:scale-105"
        />
      </div>

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
        <Card className="border-primary/20 bg-primary/5">
          <CardContent>
            <div className="flex gap-4 justify-between items-start">
              <div className="flex-1">
                <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase text-primary">
                  Summary
                </h2>
                {completion || item.summary ? (
                  <MessageResponse>{completion}</MessageResponse>
                ) : (
                  <p className="italic text-muted-foreground">
                    {item.content
                      ? 'No summary available. Generate one with AI.'
                      : 'No content available to generate a summary.'}
                  </p>
                )}
              </div>
              {item.content && !item.summary && (
                <Button
                  onClick={handleGenerateSummary}
                  disabled={isLoading}
                  size="sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2Icon className="animate-spin size-4" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="size-4" />
                      Generate Summary
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

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
