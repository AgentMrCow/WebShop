// Mutating application routes use strict Origin checks. NextAuth protects its own auth routes.
export { assertSameOrigin } from '@/lib/server/policy';
