import Firecrawl from '@mendable/firecrawl-js'

// Validate that the required API key is present at runtime.
if (!process.env.FIRECRAWL_API_KEY) {
  throw new Error(
    'FIRECRAWL_API_KEY environment variable is missing. Please set it before using the Firecrawl client.',
  )
}

export const firecrawl = new Firecrawl({
  apiKey: process.env.FIRECRAWL_API_KEY,
})
