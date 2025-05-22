import type { Talk } from "./talks-data"

export async function fetchTalks(): Promise<{ day1: Talk[]; day2: Talk[] }> {
  try {
    const response = await fetch("/api/fetch-talks")

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch talks")
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
