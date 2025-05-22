import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TalksGrid } from "@/components/talks-grid"
import { BookmarkedTalks } from "@/components/bookmarked-talks"

export default function Home() {
  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2"><a href="https://2025.tskaigi.org/talks" target="_blank" rel="noopener noreferrer">TSKaigi タイムテーブル</a> Bookmarker</h1>
        <p className="text-center text-muted-foreground">お気に入りのトークをブックマークして、日別に管理できます</p>
      </header>

      <Tabs defaultValue="day1" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="day1">Day 1 (5/23)</TabsTrigger>
          <TabsTrigger value="day2">Day 2 (5/24)</TabsTrigger>
          <TabsTrigger value="bookmarked-day1">ブックマーク (Day 1)</TabsTrigger>
          <TabsTrigger value="bookmarked-day2">ブックマーク (Day 2)</TabsTrigger>
        </TabsList>
        <TabsContent value="day1">
          <TalksGrid day="day1" />
        </TabsContent>
        <TabsContent value="day2">
          <TalksGrid day="day2" />
        </TabsContent>
        <TabsContent value="bookmarked-day1">
          <BookmarkedTalks day="day1" />
        </TabsContent>
        <TabsContent value="bookmarked-day2">
          <BookmarkedTalks day="day2" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
