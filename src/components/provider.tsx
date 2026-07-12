'use client'

import { ReactNode } from 'react'
import { Authenticated, ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ClerkProvider, useAuth } from '@clerk/nextjs'

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error('Missing NEXT_PUBLIC_CONVEX_URL in your .env file')
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL)

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            <Authenticated>
                {children}
            </Authenticated>
        </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}