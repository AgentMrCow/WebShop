import { createHash } from 'crypto'
import { cookies } from 'next/headers'

export const verifyCsrfToken = (): boolean => {
  try {
    const cookie = cookies().get('next-auth.csrf-token')
    if (!cookie) {
      return false
    }
    const parsedCsrfTokenAndHash = cookie.value

    if (!parsedCsrfTokenAndHash) {
      return false
    }
    // delimiter could be either a '|' or a '%7C'
    const tokenHashDelimiter =
          parsedCsrfTokenAndHash.indexOf('|') !== -1 ? '|' : '%7C'

    const [requestToken, requestHash] = parsedCsrfTokenAndHash.split(
      tokenHashDelimiter
    )

    const secret = process.env.NEXTAUTH_SECRET

    // compute the valid hash
    const validHash = createHash('sha256')
      .update(`${requestToken}${secret}`)
      .digest('hex')
    if (requestHash !== validHash) {
      return false
    }


  } catch (err) {
    return false
  }
  return true
}