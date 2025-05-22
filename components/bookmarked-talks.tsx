"use client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bookmark, AlertCircle, ChevronDown } from "lucide-react"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

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
              
              {/* 子トークがある場合はアコーディオンで表示 */}
              {talk.childTalks && talk.childTalks.length > 0 && (
                <div className="mt-3">
                  <Accordion type="single" collapsible className="border-t pt-2">
                    <AccordionItem value="child-talks" className="border-b-0">
                      <AccordionTrigger className="py-2 text-sm font-medium">
                        関連トーク ({talk.childTalks.length})
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          {talk.childTalks.map((childTalk) => (
                            <div key={childTalk.id} className="p-3 bg-muted/30 rounded-md">
                              <div className="font-medium">
                                {childTalk.url ? (
                                  <a 
                                    href={childTalk.url} 
                                    className="underline hover:text-blue-purple-500"
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                  >
                                    {childTalk.title}
                                  </a>
                                ) : (
                                  childTalk.title
                                )}
                              </div>
                              
                              {childTalk.speaker && (
                                <div className="flex items-center gap-2 mt-2 text-sm">
                                  <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                    {childTalk.speakerImage ? (
                                      <img
                                        src={childTalk.speakerImage || "/placeholder.svg"}
                                        alt={childTalk.speaker}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-xs">{childTalk.speaker.charAt(0)}</span>
                                    )}
                                  </div>
                                  <span>{childTalk.speaker}</span>
                                </div>
                              )}
                              
                              <div className="flex justify-end mt-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleBookmark(childTalk)}
                                  className="h-8 px-2"
                                >
                                  <Bookmark 
                                    className="fill-current text-yellow-500" 
                                    size={16} 
                                  />
                                  <span className="ml-1 text-xs">
                                    ブックマーク解除
                                  </span>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
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
