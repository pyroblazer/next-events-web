import { auth } from '@clerk/nextjs'

/**
 * Returns the Mongo user id of the signed-in user, taken from the verified Clerk session.
 * Server actions are public endpoints, so identity must never come from client-supplied params.
 */
export function requireUserId(): string {
  const { sessionClaims } = auth()
  const userId = sessionClaims?.userId as string | undefined
  if (!userId) throw new Error('Unauthorized')
  return userId
}
