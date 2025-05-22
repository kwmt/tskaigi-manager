"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bookmark, Loader2 } from "lucide-react"
import { day1Talks, day2Talks, type Talk } from "@/lib/talks-data"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { fetchTalks } from "@/lib/api"

interface TalksGridProps {
  day: "day1" | "day2"
}

export function TalksGrid({ day }: TalksGridProps) {
  const [talks, setTalks] = useState<Talk[]>(day === "day1" ? day1Talks : day2Talks)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { bookmarks, toggleBookmark, isBookmarked } = useBookmarks()

  useEffect(() => {
    async function loadTalks() {
      try {
        setIsLoading(true)
        const data = await fetchTalks()
        if (day === "day1" && data.day1.length > 0) {
          setTalks(data.day1)
        } else if (day === "day2" && data.day2.length > 0) {
          setTalks(data.day2)
        } else {
          // フォールバック: スクレイピングに失敗した場合はハードコードされたデータを使用
          setTalks(day === "day1" ? day1Talks : day2Talks)
        }
      } catch (err) {
        console.error("Failed to fetch talks:", err)
        setError("トークデータの取得に失敗しました。")
        // フォールバック: エラー時はハードコードされたデータを使用
        setTalks(day === "day1" ? day1Talks : day2Talks)
      } finally {
        setIsLoading(false)
      }
    }

    loadTalks()
  }, [day])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>トークデータを読み込み中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <p>ハードコードされたデータを表示しています。</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {talks.map((talk) => (
        <Card key={talk.id} className="flex flex-col h-full">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <Badge
                  variant={
                    talk.type === "セッション" ? "default" : talk.type === "招待講演" ? "destructive" : "secondary"
                  }
                >
                  {talk.type}
                </Badge>
                <div className="text-sm text-muted-foreground mt-1">{talk.time}</div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleBookmark(talk)}
                aria-label={isBookmarked(talk) ? "ブックマークを解除" : "ブックマークに追加"}
              >
                <Bookmark className={isBookmarked(talk) ? "fill-current text-yellow-500" : ""} size={20} />
              </Button>
            </div>
            <CardTitle className="text-lg mt-2">{talk.title}</CardTitle>
          </CardHeader>
          <CardContent className="pb-2 flex-grow">
            <div className="text-sm">
              {talk.track && <div className="mb-1">トラック: {talk.track}</div>}
              {talk.speaker && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {talk.speakerImage ? (
                      <img
                        src={talk.speakerImage || "/placeholder.svg"}
                        alt={talk.speaker}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs">{talk.speaker.charAt(0)}</span>
                    )}
                  </div>
                  <span>{talk.speaker}</span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            {talk.hashtag && (
              <Badge variant="outline" className="text-xs">
                {talk.hashtag}
              </Badge>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
