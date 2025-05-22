import type { Talk } from "./talks-data"

// キャッシュの有効期限（ミリ秒）
const CACHE_EXPIRY = 3600000 // 1時間

// キャッシュのキー
const TALKS_CACHE_KEY = "tskaigi-talks-cache"

// キャッシュの型定義
interface TalksCache {
  data: { day1: Talk[]; day2: Talk[] };
  timestamp: number;
}

export async function fetchTalks(): Promise<{ day1: Talk[]; day2: Talk[] }> {
  // クライアントサイドでのみローカルストレージを使用
  if (typeof window !== "undefined") {
    // キャッシュを確認
    const cachedData = getCachedTalks()
    
    // キャッシュが有効な場合はキャッシュを返す
    if (cachedData) {
      console.log("Using cached talks data")
      return cachedData
    }
  }
  
  // キャッシュがない場合またはサーバーサイドの場合はAPIから取得
  try {
    const response = await fetch("/api/fetch-talks")

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch talks")
    }

    // クライアントサイドでのみキャッシュを保存
    if (typeof window !== "undefined") {
      cacheTalks(result.data)
    }

    return result.data
  } catch (error) {
    console.error("Error fetching talks:", error)
    // エラー時はデフォルトデータを返す
    return {
      day1: [],
      day2: [],
    }
  }
}

// キャッシュからデータを取得する関数
function getCachedTalks(): { day1: Talk[]; day2: Talk[] } | null {
  try {
    const cachedString = localStorage.getItem(TALKS_CACHE_KEY)
    
    if (!cachedString) {
      return null
    }
    
    const cache: TalksCache = JSON.parse(cachedString)
    const now = Date.now()
    
    // キャッシュが有効期限切れかどうかを確認
    if (now - cache.timestamp > CACHE_EXPIRY) {
      console.log("Cache expired, fetching fresh data")
      localStorage.removeItem(TALKS_CACHE_KEY)
      return null
    }
    
    return cache.data
  } catch (error) {
    console.error("Error reading from cache:", error)
    return null
  }
}

// データをキャッシュに保存する関数
function cacheTalks(data: { day1: Talk[]; day2: Talk[] }): void {
  try {
    const cache: TalksCache = {
      data,
      timestamp: Date.now()
    }
    
    localStorage.setItem(TALKS_CACHE_KEY, JSON.stringify(cache))
    console.log("Talks data cached successfully")
  } catch (error) {
    console.error("Error saving to cache:", error)
  }
}
