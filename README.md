This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Sidebar Navigation Styling

**IMPORTANT: DO NOT MODIFY WITHOUT EXPLICIT CONSENT**

The sidebar navigation has specific styling requirements that have been carefully implemented:

### Parent Navigation Items (with children)
- **Active state**: Theme-colored background with white text
- **Hover state**: Theme-colored background with white text (`hover:bg-blue-600 hover:text-white`)
- **Default state**: Gray text

### Child Navigation Items
- **Active state**: Theme-colored text only (`text-blue-600`)
- **Hover state**: Theme-colored text only (`hover:text-blue-600`)
- **Default state**: Gray text (`text-gray-600`)
- **NO background card effects on children**

### Current Implementation (src/components/layout/sidebar.tsx)
```tsx
// Parent items (lines 283-286)
isActiveItem
  ? `${getBackgroundClasses(true)} text-white`
  : `text-gray-700 hover:bg-blue-600 hover:text-white`

// Child items (lines 325-327)
isActive(child.href)
  ? "text-blue-600"
  : "text-gray-600 hover:text-blue-600"
```

This creates a clear visual hierarchy where:
1. Parents get full background cards on hover/active
2. Children only change text color on hover/active
3. Both use the same theme color (currently blue-600)

**Last Updated**: December 2024
