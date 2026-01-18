import { useState, useTransition } from 'react'
import { useForm } from '@tanstack/react-form'
import { createFileRoute } from '@tanstack/react-router'

import { toast } from 'sonner'
import { type SearchResultWeb } from '@mendable/firecrawl-js'
import { GlobeIcon, LinkIcon, Loader2Icon } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import {
  bulkScrapeUrlsFn,
  mapUrlFn,
  scrapeUrlFn,
  BulkScrapeProgress,
} from '@/data/items'

import { bulkImportSchema, importSchema } from '@/schemas/import'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'

export const Route = createFileRoute('/dashboard/import')({
  component: RouteComponent,
})

function RouteComponent() {
  const [discoveredLinks, setDiscoveredLinks] = useState<SearchResultWeb[]>([])
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set())
  const [progress, setProgress] = useState<BulkScrapeProgress | null>(null)

  const [isPendingSingle, startTransitionSingle] = useTransition()
  const [isPendingBulk, startTransitionBulk] = useTransition()
  const [isPendingBulkImport, startTransitionBulkImport] = useTransition()

  const form = useForm({
    defaultValues: {
      url: '',
    },
    validators: {
      onSubmit: importSchema,
    },
    onSubmit: ({ value }) => {
      startTransitionSingle(async () => {
        await scrapeUrlFn({ data: value })
        toast.success('URL scraped successfully')
      })
    },
  })

  const bulkForm = useForm({
    defaultValues: {
      url: '',
      search: '',
    },
    validators: {
      onSubmit: bulkImportSchema,
    },
    onSubmit: ({ value }) => {
      startTransitionBulk(async () => {
        const data = await mapUrlFn({ data: value })
        setDiscoveredLinks(data)
        toast.success('URLs mapped successfully')
      })
    },
  })

  const handleSelectAll = () => {
    if (discoveredLinks.length === selectedUrls.size) {
      setSelectedUrls(new Set())
    } else {
      setSelectedUrls(new Set(discoveredLinks.map((link) => link.url)))
    }
  }

  const handleToggleUrl = (url: string) => {
    setSelectedUrls((prev) => {
      const newSet = new Set(prev)

      if (newSet.has(url)) {
        newSet.delete(url)
      } else {
        newSet.add(url)
      }

      return newSet
    })
  }

  function handleBulkImport() {
    startTransitionBulkImport(async () => {
      if (selectedUrls.size === 0) {
        toast.error('Please select at least one URL to import.')
        return
      }

      setProgress({
        completed: 0,
        total: selectedUrls.size,
        url: '',
        status: 'success',
      })
      let successCount = 0
      let failedCount = 0

      for await (const update of await bulkScrapeUrlsFn({
        data: { urls: Array.from(selectedUrls) },
      })) {
        setProgress(update)

        if (update.status === 'success') {
          successCount++
        } else {
          failedCount++
        }
      }

      setProgress(null)

      if (failedCount > 0) {
        toast.success(`Imported ${successCount} Urls (${failedCount} failed)`)
      } else {
        toast.success(`Successfully imported ${successCount} URLs`)
      }
    })
  }

  return (
    <div className="flex flex-1 justify-center items-center py-8">
      <div className="px-4 space-y-6 w-full max-w-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Import Content</h1>
          <p className="pt-1 text-muted-foreground">
            Save web pages to your library for later reading
          </p>
        </div>

        <Tabs defaultValue="single">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="single" className="gap-2">
              <LinkIcon className="size-4" />
              Single URL
            </TabsTrigger>
            <TabsTrigger value="bulk" className="gap-2">
              <GlobeIcon className="size-4" />
              Bulk Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <Card>
              <CardHeader>
                <CardTitle>Import Single URL</CardTitle>
                <CardDescription>
                  Scrape and save content from any web app! 👀
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit()
                  }}
                >
                  <FieldGroup>
                    <form.Field
                      name="url"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>URL</FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="https://example.com"
                              autoComplete="off"
                              type="url"
                            />
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    />

                    <Button type="submit" disabled={isPendingSingle}>
                      {isPendingSingle ? (
                        <>
                          <Loader2Icon className="animate-spin size-4" />
                          Processing...
                        </>
                      ) : (
                        'Import Url'
                      )}
                    </Button>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="bulk">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Import</CardTitle>
                <CardDescription>
                  Discover and import multiple URLs from a website at once! 🚀
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    bulkForm.handleSubmit()
                  }}
                >
                  <FieldGroup>
                    <bulkForm.Field
                      name="url"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>URL</FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="https://example.com"
                              autoComplete="off"
                              type="url"
                            />
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    />
                    <bulkForm.Field
                      name="search"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              Filter (optional)
                            </FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="e.g. Blog, Article, Docs, etc."
                              autoComplete="off"
                              type="search"
                            />
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    />

                    <Button type="submit" disabled={isPendingBulk}>
                      {isPendingBulk ? (
                        <>
                          <Loader2Icon className="animate-spin size-4" />
                          Processing...
                        </>
                      ) : (
                        'Import Urls'
                      )}
                    </Button>
                  </FieldGroup>
                </form>

                {/* Discovered URLs */}
                {discoveredLinks.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">
                        Found {discoveredLinks.length} URLs
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                      >
                        {discoveredLinks.length === selectedUrls.size
                          ? 'Deselect All'
                          : 'Select All'}
                      </Button>
                    </div>
                    <div className="overflow-y-auto p-4 space-y-2 max-h-80 rounded-md border">
                      {discoveredLinks.map((link) => (
                        <label
                          key={link.url}
                          className="flex gap-3 items-start p-2 rounded-md cursor-pointer hover:bg-muted/50"
                        >
                          <Checkbox
                            className="mt-0.5"
                            checked={selectedUrls.has(link.url)}
                            onCheckedChange={() => handleToggleUrl(link.url)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {link.title ?? 'Title has not been found'}
                            </p>
                            <p className="text-xs truncate text-muted-foreground">
                              {link.description ??
                                'Description has not been found'}
                            </p>
                            <p className="text-xs truncate text-muted-foreground">
                              {link.url}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                    {progress && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">
                            Importing: {progress.completed} / {progress.total}
                          </span>
                          <span className="font-medium">
                            {Math.round(progress.completed / progress.total) *
                              100}
                          </span>
                        </div>
                        <Progress
                          value={(progress.completed / progress.total) * 100}
                        />
                      </div>
                    )}
                    <Button
                      className="w-full"
                      onClick={handleBulkImport}
                      disabled={isPendingBulkImport}
                      type="button"
                    >
                      {isPendingBulkImport ? (
                        <>
                          <Loader2Icon className="animate-spin size-4" />
                          {progress
                            ? `Importing ${progress.completed}/${progress.total}...`
                            : 'Starting...'}
                        </>
                      ) : (
                        `Import ${selectedUrls.size} URLs`
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
