"use client"
import { useState, useEffect } from "react"
import { useCallback } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bookmark, Loader2, AlertCircle } from "lucide-react"
import { day1Talks, day2Talks, type Talk } from "@/lib/talks-data"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { fetchTalks } from "@/lib/api"

interface TalksGridProps {
  day: "day1" | "day2"
}

// トークが現在進行中かどうかを判断する関数
const isCurrentlyHappening = (timeString: string, currentTime: Date = new Date()): boolean => {
  // 現在の時間を使用
  const now = currentTime;
  
  // timeStringは "10:50 ~ 11:00" のような形式
  const [startTimeStr, endTimeStr] = timeString.split("~").map(t => t.trim());
  
  // 開始時間と終了時間をパース
  const [startHour, startMinute] = startTimeStr.split(":").map(Number);
  const [endHour, endMinute] = endTimeStr.split(":").map(Number);
  
  // 現在の時間を時間と分に分解
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // 現在時刻を分単位に変換
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  // 開始時間を分単位に変換
  const startTimeInMinutes = startHour * 60 + startMinute;
  // 終了時間を分単位に変換
  const endTimeInMinutes = endHour * 60 + endMinute;
  
  // 現在時刻が開始時間と終了時間の間にあるかどうかを判断
  return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
};

export function TalksGrid({ day }: TalksGridProps) {
  const [talks, setTalks] = useState<Talk[]>(day === "day1" ? day1Talks : day2Talks)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { bookmarks, toggleBookmark, isBookmarked } = useBookmarks()
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false)
  // 現在時刻の状態を追加（表示を更新するため）
  const [currentTime, setCurrentTime] = useState(new Date())

  // 1分ごとに現在時刻を更新するためのeffect
  useEffect(() => {
    // 1分ごとに更新するタイマーを設定
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 60秒 = 1分
    
    // クリーンアップ関数
    return () => clearInterval(timer);
  }, []);

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
          throw new Error("No talks found for the selected day.");
          // フォールバック: スクレイピングに失敗した場合はハードコードされたデータを使用
          // setTalks(day === "day1" ? day1Talks : day2Talks)
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

  // フィルタリングされたトークのリスト
  const filteredTalks = showBookmarksOnly 
    ? talks.filter(talk => isBookmarked(talk))
    : talks;

  // ブックマークのみ表示モードでブックマークがない場合
  if (showBookmarksOnly && filteredTalks.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-end space-x-2">
          <Switch
            id="show-bookmarks"
            checked={showBookmarksOnly}
            onCheckedChange={setShowBookmarksOnly}
          />
          <Label htmlFor="show-bookmarks">ブックマークのみ表示</Label>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">ブックマークがありません</h3>
          <p className="text-muted-foreground mt-2">
            {day === "day1" ? "Day 1" : "Day 2"} のトークをブックマークすると、ここに表示されます。
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end space-x-2">
        <Switch
          id="show-bookmarks"
          checked={showBookmarksOnly}
          onCheckedChange={setShowBookmarksOnly}
        />
        <Label htmlFor="show-bookmarks">ブックマークのみ表示</Label>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTalks.map((talk) => (
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
                  <div className={`text-sm mt-1 ${isCurrentlyHappening(talk.time, currentTime) ? "text-green-600 font-bold" : "text-muted-foreground"}`}>
                    {talk.time}
                    {isCurrentlyHappening(talk.time, currentTime) && <span className="ml-2 inline-block animate-pulse">●</span>}
                  </div>
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
              <CardTitle className="text-lg mt-2">
                {talk.url ? (
                  <a 
                    href={talk.url} 
                    className="underline hover:text-blue-purple-500"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {talk.title}
                  </a>
                ) : (
                  talk.title
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2 flex-grow">
              <div className="flex flex-col gap-1">
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
    </div>
  )
}
