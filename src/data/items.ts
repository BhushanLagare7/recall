import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

import * as z from 'zod'

import { prisma } from '@/db'
import { bulkImportSchema, extractSchema, importSchema } from '@/schemas/import'

import { firecrawl } from '@/lib/firecrawl'
import { authFnMiddleware } from '@/middlewares/auth'

export const scrapeUrlFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .inputValidator(importSchema)
  .handler(async ({ data, context }) => {
    const item = await prisma.savedItem.create({
      data: {
        url: data.url,
        userId: context.session.user.id,
        status: 'PROCESSING',
      },
    })

    try {
      const result = await firecrawl.scrape(data.url, {
        formats: [
          'markdown',
          {
            type: 'json',
            schema: extractSchema,
            // prompt: 'Extract the author and publishedAt timestamps',
          },
        ],
        location: { country: 'US', languages: ['en'] },
        onlyMainContent: true,
      })

      const jsonData = result.json as z.infer<typeof extractSchema>

      let publishedAt = null
      if (jsonData.publishedAt) {
        const parsed = new Date(jsonData.publishedAt)

        if (!isNaN(parsed.getTime())) {
          publishedAt = parsed
        }
      }

      const updatedItem = await prisma.savedItem.update({
        where: {
          id: item.id,
        },
        data: {
          title: result.metadata?.title ?? null,
          content: result.markdown ?? null,
          ogImage: result.metadata?.ogImage ?? null,
          author: jsonData.author ?? null,
          publishedAt,
          status: 'COMPLETED',
        },
      })

      return updatedItem
    } catch (error) {
      console.error(error)

      const failedItem = await prisma.savedItem.update({
        where: {
          id: item.id,
        },
        data: {
          status: 'FAILED',
        },
      })

      return failedItem
    }
  })

export const mapUrlFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .inputValidator(bulkImportSchema)
  .handler(async ({ data }) => {
    const result = await firecrawl.map(data.url, {
      limit: 25,
      search: data.search,
      location: { country: 'US', languages: ['en'] },
    })

    return result.links
  })

export const bulkScrapeUrlFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .inputValidator(z.object({ urls: z.array(z.string().url()) }))
  .handler(async ({ data, context }) => {
    const items = await Promise.all(
      data.urls.map(async (url) => {
        const item = await prisma.savedItem.create({
          data: {
            url,
            userId: context.session.user.id,
            status: 'PENDING',
          },
        })

        try {
          const result = await firecrawl.scrape(item.url, {
            formats: [
              'markdown',
              {
                type: 'json',
                schema: extractSchema,
                // prompt: 'Extract the author and publishedAt timestamps',
              },
            ],
            location: { country: 'US', languages: ['en'] },
            onlyMainContent: true,
          })

          const jsonData = result.json as z.infer<typeof extractSchema>

          let publishedAt = null
          if (jsonData.publishedAt) {
            const parsed = new Date(jsonData.publishedAt)

            if (!isNaN(parsed.getTime())) {
              publishedAt = parsed
            }
          }

          const updatedItem = await prisma.savedItem.update({
            where: {
              id: item.id,
            },
            data: {
              title: result.metadata?.title ?? null,
              content: result.markdown ?? null,
              ogImage: result.metadata?.ogImage ?? null,
              author: jsonData.author ?? null,
              publishedAt,
              status: 'COMPLETED',
            },
          })

          return updatedItem
        } catch (error) {
          console.error(error)

          const failedItem = await prisma.savedItem.update({
            where: {
              id: item.id,
            },
            data: {
              status: 'FAILED',
            },
          })

          return failedItem
        }
      }),
    )

    return items
  })

export const getItemsFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .handler(async ({ context }) => {
    const items = await prisma.savedItem.findMany({
      where: {
        userId: context.session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return items
  })

export const getItemByIdFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    const item = await prisma.savedItem.findUnique({
      where: {
        userId: context.session.user.id,
        id: data.id,
      },
    })

    if (!item) {
      throw notFound()
    }

    return item
  })
