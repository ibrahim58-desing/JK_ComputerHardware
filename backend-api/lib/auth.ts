import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import {
  getJwtSecret,
  getJwtIssuer,
  getJwtAudience,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
} from '@/lib/env'

export const ACCESS_COOKIE_NAME = 'jk_admin_token'
export const REFRESH_COOKIE_NAME = 'jk_admin_refresh'

// admin-interface, user-interface, and backend-api all live on different
// subdomains of the same site in production, so auth cookies need the
// parent-domain scope to be readable across all three. Unset in dev, where
// they're separate ports on localhost (already same-site without it).
export function cookieDomain(): string | undefined {
  if (process.env.COOKIE_DOMAIN) return process.env.COOKIE_DOMAIN
  return process.env.NODE_ENV === 'production' ? '.jkinfosystem.com' : undefined
}

const DUMMY_HASH = bcrypt.hashSync('timing-attack-dummy-password', 12)

export interface TokenPayload {
  adminId: number
  username: string
  role: string
}

interface JwtClaims extends TokenPayload {
  type: 'access' | 'refresh'
}

function parseExpiry(expiry: string): string {
  return expiry
}

// ─── Password Helpers ─────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(
  password: string,
  hash: string | null | undefined
): Promise<boolean> {
  const targetHash = hash || DUMMY_HASH
  return bcrypt.compare(password, targetHash)
}

// ─── JWT Helpers ──────────────────────────────────────────────────────────────

async function signJwt(
  payload: JwtClaims,
  expiresIn: string
): Promise<string> {
  const secret = getJwtSecret()
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(getJwtIssuer())
    .setAudience(getJwtAudience())
    .setExpirationTime(parseExpiry(expiresIn))
    .sign(secret)
}

export async function signAccessToken(payload: TokenPayload): Promise<string> {
  return signJwt({ ...payload, type: 'access' }, ACCESS_TOKEN_EXPIRY)
}

export async function signRefreshToken(payload: TokenPayload): Promise<string> {
  return signJwt({ ...payload, type: 'refresh' }, REFRESH_TOKEN_EXPIRY)
}

export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  return verifyToken(token, 'access')
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload | null> {
  return verifyToken(token, 'refresh')
}

async function verifyToken(
  token: string,
  expectedType: 'access' | 'refresh'
): Promise<TokenPayload | null> {
  try {
    const secret = getJwtSecret()
    const { payload } = await jwtVerify(token, secret, {
      issuer: getJwtIssuer(),
      audience: getJwtAudience(),
    })

    if (payload.type !== expectedType) return null

    return {
      adminId: payload.adminId as number,
      username: payload.username as string,
      role: payload.role as string,
    }
  } catch {
    return null
  }
}

// ─── Cookie Helpers ───────────────────────────────────────────────────────────

function accessMaxAge(): number {
  return 20 * 60 // 20 minutes
}

function refreshMaxAge(): number {
  return 7 * 24 * 60 * 60 // 7 days
}

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(ACCESS_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    domain: cookieDomain(),
    path: '/',
    maxAge: accessMaxAge(),
  })
  cookieStore.set(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    domain: cookieDomain(),
    path: '/',
    maxAge: refreshMaxAge(),
  })
}

export async function setAccessCookie(accessToken: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(ACCESS_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    domain: cookieDomain(),
    path: '/',
    maxAge: accessMaxAge(),
  })
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies()
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    domain: cookieDomain(),
    path: '/',
    maxAge: 0,
  }
  cookieStore.set(ACCESS_COOKIE_NAME, '', opts)
  cookieStore.set(REFRESH_COOKIE_NAME, '', opts)
}

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(ACCESS_COOKIE_NAME)?.value
}

export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(REFRESH_COOKIE_NAME)?.value
}

export async function verifyAuth(): Promise<TokenPayload | null> {
  const token = await getAuthToken()
  if (!token) return null
  return verifyAccessToken(token)
}

/** Legacy alias — use signAccessToken */
export const signToken = signAccessToken

export { ACCESS_COOKIE_NAME as COOKIE_NAME }
