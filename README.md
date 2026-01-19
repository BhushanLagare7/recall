# Recall

Recall is an intelligent knowledge base application that allows you to discover, import, and "recall" content from the web. Leveraging the power of AI and modern web technologies, it provides a seamless way to crawl websites, bulk import data, and build your personal library of knowledge.

## 🚀 Why Recall?

In the age of information overload, keeping track of valuable content is difficult. Recall solves this by:

- **Automating Content Retrieval**: Use [Firecrawl](https://firecrawl.dev/) to scrape single URLs or perform bulk imports from entire domains.
- **Smart Discovery**: Search the web for specific topics and instantly import relevant articles.
- **Centralized Knowledge**: Store and organize web content in a structured format for easy access.

## ✨ Features

- **Single URL Import**: Scrape and save content from any specific web page.
- **Bulk Import**: Discover and import multiple URLs from a website in one go.
- **Topic Discovery**: Search the web for articles on any topic and add them to your library.
- **Modern UI**: Built with a sleek, responsive interface using Tailwind CSS 4 and Shadcn UI.
- **Secure Authentication**: Robust user authentication powered by Better-Auth.

## 🛠️ Stack

- **Framework**: [React 19](https://react.dev/) & [TanStack Start](https://tanstack.com/start)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma](https://www.prisma.io/)
- **AI & Crawling**: [Firecrawl](https://firecrawl.dev/), [Vercel AI SDK](https://sdk.vercel.ai/)
- **Authentication**: [Better-Auth](https://better-auth.com/)

## 🏁 Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- [pnpm](https://pnpm.io/)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/recall.git
   cd recall
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory and add the following variables:

   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/recall"

   # Firecrawl (for scraping and crawling)
   FIRECRAWL_API_KEY="your_firecrawl_api_key"

   # Better Auth
   BETTER_AUTH_SECRET="your_secret_key"
   BETTER_AUTH_URL="http://localhost:3000"
   ```

4. **Database Setup**
   Push the schema to your database:

   ```bash
   pnpm db:push
   ```

5. **Run the application**
   ```bash
   pnpm dev
   ```
   The app will be available at `http://localhost:3000`.

## 🤝 Support

If you encounter any issues or have questions, please check the [issues page](../../issues) or refer to the documentation:

- [TanStack Start Documentation](https://tanstack.com/start/latest/docs/framework/react/overview)
- [Firecrawl Documentation](https://docs.firecrawl.dev/)

## 👥 Maintainers

Maintained by the open source community.

**Contributing**: We welcome contributions! Please read our [Contribution Guidelines](docs/CONTRIBUTING.md) to get started.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
