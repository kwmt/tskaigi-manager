"use client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bookmark, AlertCircle } from "lucide-react"
import { useBookmarks } from "@/hooks/use-bookmarks"

interface BookmarkedTalksProps {
  day: "day1" | "day2"
}

export function BookmarkedTalks({ day }: BookmarkedTalksProps) {
  const { bookmarks, toggleBookmark } = useBookmarks()

  // Filter bookmarks by day
  const filteredBookmarks = bookmarks.filter((talk) => talk.day === day)

  if (filteredBookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">ブックマークがありません</h3>
        <p className="text-muted-foreground mt-2">
          {day === "day1" ? "Day 1" : "Day 2"} のトークをブックマークすると、ここに表示されます。
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredBookmarks.map((talk) => (
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
              <Button variant="ghost" size="icon" onClick={() => toggleBookmark(talk)} aria-label="ブックマークを解除">
                <Bookmark className="fill-current text-yellow-500" size={20} />
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
