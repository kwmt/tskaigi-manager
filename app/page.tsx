"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TalksGrid } from "@/components/talks-grid"

export default function Home() {
  // 選択されたタブの状態を管理
  const [selectedTab, setSelectedTab] = useState<string>("day1"); // デフォルト値として"day1"を設定
  
  // コンポーネントのマウント時に実行
  useEffect(() => {
    // 現在の日付を取得
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 月は0から始まるため+1
    const currentDay = currentDate.getDate();
    
    // TSKaigiの日程（2025年5月23日と24日）に基づいてタブを選択
    if (currentMonth === 5) {
      if (currentDay === 23) {
        setSelectedTab("day1");
      } else if (currentDay === 24) {
        setSelectedTab("day2");
      } else if (currentDay < 23) {
        // 開催前は最初の日を表示
        setSelectedTab("day1");
      } else {
        // 開催後は最後の日を表示
        setSelectedTab("day2");
      }
    } else if (currentMonth < 5 || (currentMonth === 5 && currentDay < 23)) {
      // 5月23日より前の場合
      setSelectedTab("day1");
    } else {
      // 5月24日より後の場合
      setSelectedTab("day2");
    }
  }, []); // 空の依存配列でコンポーネントのマウント時にのみ実行
  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2"><a href="https://2025.tskaigi.org/talks" target="_blank" rel="noopener noreferrer">TSKaigi タイムテーブル</a> Bookmarker</h1>
        <p className="text-center text-muted-foreground">お気に入りのトークをブックマークして、日別に管理できます</p>
      </header>

      <Tabs defaultValue={selectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="day1">Day 1 (5/23)</TabsTrigger>
          <TabsTrigger value="day2">Day 2 (5/24)</TabsTrigger>
        </TabsList>
        <TabsContent value="day1">
          <TalksGrid day="day1" />
        </TabsContent>
        <TabsContent value="day2">
          <TalksGrid day="day2" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
