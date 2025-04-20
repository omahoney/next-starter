# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Build: `pnpm build` or `yarn build`
- Dev server: `pnpm dev` or `yarn dev`
- Start production: `pnpm start` or `yarn start`
- Lint: `pnpm lint` or `yarn lint`

## Code Style Guidelines
- TypeScript is strictly enforced (`strict: true`)
- Use client-side components by default (mark with "use client")
- Path aliases: `@/*` for src directory, `@public/*` for public directory
- Component naming: PascalCase for components and files
- Styling: Use Tailwind CSS classes
- Imports: Group imports by external libraries, then internal modules
- Error handling: Use try/catch blocks for async operations
- Image optimization: Use Next.js Image component
- TypeScript target: ES2021
- Component organization: Smaller components can live in the same file
- Package manager: pnpm (preferred) or yarn