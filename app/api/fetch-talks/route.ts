import { NextResponse } from "next/server"
import * as cheerio from "cheerio"
import type { Talk } from "@/lib/talks-data"
import { chromium } from 'playwright'

export async function GET() {
  try {
    // Day 1のデータを取得
    const day1Data = await fetchTalksForDay("1")
    // Day 2のデータを取得
    const day2Data = await fetchTalksForDay("2")

    return NextResponse.json({
      success: true,
      data: {
        day1: day1Data,
        day2: day2Data,
      },
    })
  } catch (error) {
    console.error("Error fetching talks:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch talks data" }, { status: 500 })
  }
}

// Playwrightを使用してHTMLを取得する関数
export async function fetchHtml(url: string): Promise<string> {
  const browser = await chromium.launch({
    headless: true // ヘッドレスモードで実行
  });
  
  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle' }); // ネットワークが安定するまで待機
    
    // ページのHTMLを取得
    const html = await page.content();
    console.log("HTML content fetched successfully", html);
    return html;
  } finally {
    await browser.close(); // ブラウザを必ず閉じる
  }
}

export async function fetchTalksForDay(day: string): Promise<Talk[]> {
  try {
    // HTTPSリクエストでHTMLを取得
    const html = await fetchHtml(`https://2025.tskaigi.org/talks?day=${day}`);
    if (!html || html.trim() === "") {
      console.error("Empty HTML response received")
      return []
    }
    console.log("HTML response received", html)
    const $ = cheerio.load(html)
    const rawTalks: Talk[] = []

    // グリッド要素が見つからない場合のフォールバックセレクタ
    const gridSelector = $(".grid.gap-1.mt-4").length > 0 
      ? ".grid.gap-1.mt-4" 
      : ".grid" // フォールバックとして単純な.gridを試す

    // 各時間帯のグリッド要素を処理
    $(gridSelector).each((gridIndex, gridElement) => {
      try {
        // 時間情報を取得（複数のセレクタを試す）
        const timeSelectors = [".bg-yellow-200 p", "p.text-yellow-700", "p.font-bold"]
        let timeText = ""
        
        for (const selector of timeSelectors) {
          const timeElement = $(gridElement).find(selector)
          if (timeElement.length > 0) {
            timeText = timeElement.text().trim()
            break
          }
        }

        if (!timeText || timeText === "") return

        // 各トラックのセルを処理（最初の要素は時間情報なのでスキップ）
        const cellSelector = "> div:not(.bg-yellow-200)"
        $(gridElement)
          .find(cellSelector)
          .each((cellIndex, cell) => {
            try {
              const trackIndex = cellIndex
              let trackName = ""

              // トラック名を取得
              const trackElement = $(cell).find("[class*='bg-track-']")
              if (trackElement.length > 0) {
                trackName = trackElement.text().trim()
              }

              // トークタイトルとURLを取得
              const titleAnchor = $(cell).find("a")
              const titleElement = titleAnchor.find("p")
              const talkTitle = titleElement.length > 0 
                ? titleElement.text().trim() 
                : $(cell).find(".text-center").text().trim() // タイトルがない場合（休憩など）
              
              // リンクURLを取得
              let talkUrl: string | undefined = undefined
              if (titleAnchor.length > 0) {
                talkUrl = titleAnchor.attr("href")
                // 相対URLの場合は絶対URLに変換
                if (talkUrl && !talkUrl.startsWith("http")) {
                  talkUrl = `https://2025.tskaigi.org${talkUrl.startsWith("/") ? "" : "/"}${talkUrl}`
                }
              }

              // 空のセルやヘッダーをスキップ
              if (
                !talkTitle ||
                talkTitle === "" ||
                talkTitle === "トグルルーム" ||
                talkTitle === "アセンドトラック" ||
                talkTitle === "レバレジーズトラック" ||
                talkTitle === "サテライト" ||
                talkTitle === "クローズ"
              ) {
                return
              }

              // トークタイプを判定
              let talkType: Talk["type"] = "セッション"
              const typeElement = $(cell).find(".inline-block")
              if (typeElement.length > 0) {
                const typeText = typeElement.text().trim()
                // 型を確認して割り当て
                if (
                  typeText === "セッション" ||
                  typeText === "招待講演" ||
                  typeText === "オープニング" ||
                  typeText === "クローズ" ||
                  typeText === "休憩" ||
                  typeText === "ランチ配布" ||
                  typeText === "スポンサーLT"
                ) {
                  talkType = typeText
                }
              } else if (talkTitle.includes("オープニング")) {
                talkType = "オープニング"
              } else if (talkTitle.includes("クローズ")) {
                talkType = "クローズ"
              } else if (talkTitle.includes("休憩")) {
                talkType = "休憩"
              } else if (talkTitle.includes("ランチ")) {
                talkType = "ランチ配布"
              }

              // 話者情報を取得
              const speakerElement = $(cell).find(".flex.items-center.gap-2 span")
              const speaker = speakerElement.text().trim()

              // ハッシュタグを取得（現在の構造ではハッシュタグが直接見つからないため、トラック名から推測）
              let hashtag = ""
              if (trackName.includes("トグル")) {
                hashtag = "#tskaigi_toggle"
              } else if (trackName.includes("アセンド")) {
                hashtag = "#tskaigi_ascend"
              } else if (trackName.includes("レバレジーズ")) {
                hashtag = "#tskaigi_leverages"
              }

              // 話者画像のURLを取得
              const speakerImageElement = $(cell).find(".flex.items-center.gap-2 img")
              let speakerImage = speakerImageElement.length > 0 ? speakerImageElement.attr("src") : undefined
              // 相対URLの場合は絶対URLに変換
              if (speakerImage && !speakerImage.startsWith("http")) {
                speakerImage = `https://2025.tskaigi.org${speakerImage.startsWith("/") ? "" : "/"}${speakerImage}`
              }

              // トークIDを生成
              const id = `day${day}-${gridIndex}-${cellIndex}`

              // dayの型を確認
              const dayValue: "day1" | "day2" = day === "1" ? "day1" : "day2"

              rawTalks.push({
                id,
                day: dayValue,
                title: talkTitle,
                speaker: speaker || undefined,
                speakerImage: speakerImage,
                time: timeText,
                track: trackName || undefined,
                type: talkType,
                hashtag: hashtag || undefined,
                url: talkUrl,
              })
            } catch (cellError) {
              console.error(`Error processing cell at index ${cellIndex}:`, cellError)
              // 個別のセルのエラーはスキップして続行
            }
          })
      } catch (gridError) {
        console.error(`Error processing grid at index ${gridIndex}:`, gridError)
        // 個別のグリッドのエラーはスキップして続行
      }
    })

    // 親トークと子トークの関係を構築
    const processedTalks: Talk[] = []
    
    // 時間帯とトークタイプでグループ化
    const talkGroups: { [key: string]: Talk[] } = {}
    
    rawTalks.forEach(talk => {
      const groupKey = `${talk.time}-${talk.type}`
      if (!talkGroups[groupKey]) {
        talkGroups[groupKey] = []
      }
      talkGroups[groupKey].push(talk)
    })
    
    // 各グループを処理
    Object.values(talkGroups).forEach(group => {
      console.log("Processing group:", group)
      // グループ内のトークが1つだけの場合はそのまま追加
      if (group.length === 1) {
        processedTalks.push(group[0])
        return
      }
      
      // グループ内のトークが複数ある場合
      // 特定のトークタイプ（スポンサーLTなど）の場合は親子関係を構築
      if (
        group[0].type === "スポンサーLT" || 
        // 必要に応じて他のタイプも追加
        (group.length > 1 && group.every(t => t.track === group[0].track))
      ) {
        const parentTalk = { ...group[0] }
        const childTalks = group.slice(1).map(talk => ({
          ...talk,
          parentId: parentTalk.id
        }))
        
        parentTalk.childTalks = childTalks
        processedTalks.push(parentTalk)
      } else {
        // それ以外の場合は個別のトークとして追加
        group.forEach(talk => {
          processedTalks.push(talk)
        })
      }
    })

    return processedTalks
  } catch (error) {
    console.error("Error in fetchTalksForDay:", error)
    // エラーが発生した場合は空の配列を返す
    return []
  }
}
