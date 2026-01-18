import { Suspense, use, useEffect, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'

import * as z from 'zod'
import { CopyIcon, InboxIcon } from 'lucide-react'
import { zodValidator } from '@tanstack/zod-adapter'

import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { getItemsFn } from '@/data/items'

import { copyToClipboard } from '@/lib/copyToClipboard'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

import { ItemStatus } from '@/generated/prisma/enums'
import { Skeleton } from '@/components/ui/skeleton'

function ItemsListSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="overflow-hidden pt-0">
          <Skeleton className="w-full aspect-video" />
          <CardHeader className="space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="w-20 h-5 rounded-full" />
              <Skeleton className="rounded-md size-8" />
            </div>
            <Skeleton className="w-full h-6" />
            <Skeleton className="w-40 h-4" />
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

const itemSearchSchema = z.object({
  q: z.string().default(''),
  status: z.union([z.literal('all'), z.nativeEnum(ItemStatus)]).default('all'),
})

type ItemsSearch = z.infer<typeof itemSearchSchema>

function ItemsList({
  q,
  status,
  data,
}: {
  q: ItemsSearch['q']
  status: ItemsSearch['status']
  data: ReturnType<typeof getItemsFn>
}) {
  const items = use(data)

  // Filter items based on search parameters
  const filteredItems = items.filter((item) => {
    // Check if item matches search query (title or tags)
    const matchesQuery =
      q === '' ||
      item.title?.toLowerCase().includes(q.toLowerCase()) ||
      item.tags?.some((tag) => tag.toLowerCase().includes(q.toLowerCase()))

    // Check if item matches status filter
    const matchesStatus = status === 'all' || item.status === status

    return matchesQuery && matchesStatus
  })

  if (filteredItems.length === 0) {
    return (
      <Empty className="h-full rounded-lg border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <InboxIcon className="size-12" />
          </EmptyMedia>
          <EmptyTitle>
            {items.length === 0 ? 'No items saved yet' : 'No items found'}
          </EmptyTitle>
          <EmptyDescription>
            {items.length === 0
              ? 'Import a URL to get started with saving your content.'
              : 'No items match your current search or filters.'}
          </EmptyDescription>
        </EmptyHeader>
        {items.length === 0 && (
          <EmptyContent>
            <Link to="/dashboard/import" className={buttonVariants()}>
              Import URL
            </Link>
          </EmptyContent>
        )}
      </Empty>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {filteredItems.map((item) => (
        <Card
          key={item.id}
          className="overflow-hidden pt-0 transition-all group hover:shadow-lg"
        >
          <Link
            to="/dashboard/items/$itemId"
            params={{ itemId: item.id }}
            className="block"
          >
            <div className="overflow-hidden w-full aspect-video bg-muted">
              <img
                src={
                  item.ogImage ??
                  'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1429&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                }
                alt={item.title ?? 'Thumbnail'}
                className="object-cover transition-transform size-full group-hover:scale-105"
              />
            </div>

            <CardHeader className="pt-4 space-y-3">
              <div className="flex gap-2 justify-between items-center">
                <Badge
                  variant={
                    item.status === 'COMPLETED' ? 'default' : 'secondary'
                  }
                >
                  {item.status.toLowerCase()}
                </Badge>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={async (e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    await copyToClipboard(item.url)
                  }}
                >
                  <CopyIcon className="size-4" />
                </Button>
              </div>
              <CardTitle className="text-xl leading-snug transition-colors line-clamp-1 group-hover:text-primary">
                {item.title}
              </CardTitle>
              {item.author && (
                <p className="text-xs text-muted-foreground">{item.author}</p>
              )}
              {item.summary && (
                <CardDescription className="text-sm line-clamp-3">
                  {item.summary}
                </CardDescription>
              )}
              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {item.tags.slice(0, 4).map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
          </Link>
        </Card>
      ))}
    </div>
  )
}

export const Route = createFileRoute('/dashboard/items/')({
  component: RouteComponent,
  loader: () => ({ itemsPromise: getItemsFn() }),
  validateSearch: zodValidator(itemSearchSchema),
  head: () => ({
    meta: [
      {
        title: 'Saved Items',
      },
      {
        property: 'og:title',
        content: 'Saved Items',
      },
      {
        property: 'og:description',
        content: 'Your saved articles and content!',
      },
    ],
  }),
})

function RouteComponent() {
  const { itemsPromise } = Route.useLoaderData()
  const { q, status } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const [searchInput, setSearchInput] = useState(q)

  useEffect(() => {
    if (searchInput === q) return

    const timeout = setTimeout(() => {
      navigate({ search: (prev) => ({ ...prev, q: searchInput }) })
    }, 500)

    return () => clearTimeout(timeout)
  }, [searchInput, navigate, q])

  return (
    <div className="flex flex-col flex-1 gap-6">
      <div>
        <h1 className="text-2xl font-bold">Saved Items</h1>
        <p className="text-muted-foreground">
          Your saved articles and content!
        </p>
      </div>
      {/* Search and Filter controls */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by title or tags..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Select
          value={status}
          onValueChange={(value) =>
            navigate({
              search: (prev) => ({ ...prev, status: value as typeof status }),
            })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.values(ItemStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Suspense fallback={<ItemsListSkeleton />}>
        <ItemsList q={q} status={status} data={itemsPromise} />
      </Suspense>
    </div>
  )
}
