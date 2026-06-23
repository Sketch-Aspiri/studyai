import { Redis } from "@upstash/redis"

const FREE_LIMIT = 15
const PRO_LIMIT = 200

let redis: Redis | null = null

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  if (!redis) {
    redis = Redis.fromEnv()
  }
  return redis
}

function monthKey(userId: string): string {
  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  return `gen:${userId}:${month}`
}

export async function checkGenerationLimit(
  userId: string,
  isPro: boolean
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const limit = isPro ? PRO_LIMIT : FREE_LIMIT
  const client = getRedis()

  if (!client) {
    return { allowed: true, remaining: limit, limit }
  }

  try {
    const key = monthKey(userId)
    const count = (await client.incr(key)) as number

    if (count === 1) {
      const now = new Date()
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      const ttl = Math.ceil((nextMonth.getTime() - now.getTime()) / 1000) + 86400
      await client.expire(key, ttl)
    }

    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      limit,
    }
  } catch {
    return { allowed: true, remaining: limit, limit }
  }
}

export async function getGenerationUsage(
  userId: string,
  isPro: boolean
): Promise<{ used: number; limit: number; remaining: number }> {
  const limit = isPro ? PRO_LIMIT : FREE_LIMIT
  const client = getRedis()

  if (!client) {
    return { used: 0, limit, remaining: limit }
  }

  try {
    const key = monthKey(userId)
    const count = ((await client.get(key)) as number | null) ?? 0
    return { used: count, limit, remaining: Math.max(0, limit - count) }
  } catch {
    return { used: 0, limit, remaining: limit }
  }
}
