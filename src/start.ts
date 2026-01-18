import { createMiddleware, createStart } from '@tanstack/react-start'

import { authMiddleware } from './middlewares/auth'

// INFO: By default, "createMiddleware" creates a "request" type middleware (Runs on every request). We need to explicitly set the type to "function" to use it as a server function middleware.
const loggingMiddleware = createMiddleware({ type: 'request' }).server(
  ({ next, request }) => {
    const url = new URL(request.url)

    console.log(
      `[${new Date().toISOString()}] ${request.method} ${url.pathname}${url.search}`,
    )

    return next()
  },
)

export const startInstance = createStart(() => {
  // INFO: Middleware are executed in the order they are added.
  return {
    requestMiddleware: [loggingMiddleware, authMiddleware],
  }
})
