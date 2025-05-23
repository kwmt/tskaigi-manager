import * as cheerio from "cheerio"
import type { Talk } from "@/lib/talks-data"
import { chromium, LaunchOptions } from 'playwright-core'
import chromiumPath from '@sparticuz/chromium'

export async function GET() {
  try {
    // Day 1のデータを取得
    const day1Data = await fetchTalksForDay("1")
    // Day 2のデータを取得
    const day2Data = await fetchTalksForDay("2")

    return Response.json({
      success: true,
      data: {
        day1: day1Data,
        day2: day2Data,
      },
    })
  } catch (error) {
    console.error("Error fetching talks:", error)
    return Response.json({ success: false, error: "Failed to fetch talks data" }, { status: 500 })
  }
}

// セル内の複数トークを抽出する関数
function extractTalksFromCell(
  $: cheerio.CheerioAPI,
  cell: any,
  timeText: string,
  trackName: string,
  day: string,
  gridIndex: number,
  cellIndex: number
): Talk[] {
  const talks: Talk[] = []
  const dayValue: "day1" | "day2" = day === "1" ? "day1" : "day2"

  // ハッシュタグを取得
  let hashtag = ""
  if (trackName.includes("トグル")) {
    hashtag = "#tskaigi_toggle"
  } else if (trackName.includes("アセンド")) {
    hashtag = "#tskaigi_ascend"
  } else if (trackName.includes("レバレジーズ")) {
    hashtag = "#tskaigi_leverages"
  }

  // トークタイプを取得
  let talkType: Talk["type"] = "セッション"
  const typeElement = $(cell).find(".inline-block").first()
  if (typeElement.length > 0) {
    const typeText = typeElement.text().trim()
    if (
      typeText === "セッション" ||
      typeText === "招待講演" ||
      typeText === "オープニング" ||
      typeText === "クローズ" ||
      typeText === "休憩" ||
      typeText === "ランチ配布" ||
      typeText === "スポンサーLT" ||
      typeText === "LT"
    ) {
      talkType = typeText === "LT" ? "スポンサーLT" : typeText
    }
  }

  // 複数のセレクタパターンを試して複数トークを検出
  let talkElements: cheerio.Cheerio<any> = $()
  
  // パターン1: gap-5クラスで区切られている場合
  const multiTalkContainer = $(cell).find(".flex.flex-col.gap-5")
  if (multiTalkContainer.length > 0) {
    talkElements = multiTalkContainer.find("> .flex.flex-col.gap-1")
  }
  
  // パターン2: 直接的な子要素でトークが分かれている場合
  if (talkElements.length === 0) {
    const directTalkElements = $(cell).find("a").parent()
    if (directTalkElements.length > 1) {
      talkElements = directTalkElements
    }
  }
  
  // パターン3: リンク要素が複数ある場合
  if (talkElements.length === 0) {
    const linkElements = $(cell).find("a")
    if (linkElements.length > 1) {
      talkElements = linkElements
    }
  }

  if (talkElements.length > 0) {
    // 複数トークがある場合
    talkElements.each((talkIndex, talkElement) => {
      const talk = extractSingleTalk($, talkElement, timeText, trackName, hashtag, talkType, dayValue, gridIndex, cellIndex, talkIndex)
      if (talk) {
        talks.push(talk)
      }
    })
  } else {
    // 単一トークの場合
    const talk = extractSingleTalk($, cell, timeText, trackName, hashtag, talkType, dayValue, gridIndex, cellIndex, 0)
    if (talk) {
      talks.push(talk)
    }
  }

  return talks
}

// 単一トークを抽出する関数
function extractSingleTalk(
  $: cheerio.CheerioAPI,
  element: any,
  timeText: string,
  trackName: string,
  hashtag: string,
  talkType: Talk["type"],
  dayValue: "day1" | "day2",
  gridIndex: number,
  cellIndex: number,
  talkIndex: number
): Talk | null {
  // トークタイトルとURLを取得
  let titleAnchor = $(element).find("a").first()
  let titleElement = titleAnchor.find("p").first()
  
  // 要素自体がリンクの場合
  if ($(element).is("a")) {
    titleAnchor = $(element)
    titleElement = titleAnchor.find("p").first()
  }
  
  let talkTitle = ""
  if (titleElement.length > 0) {
    talkTitle = titleElement.text().trim()
  } else if (titleAnchor.length > 0) {
    talkTitle = titleAnchor.text().trim()
  } else {
    talkTitle = $(element).find(".text-center").text().trim()
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
    return null
  }

  // リンクURLを取得
  let talkUrl: string | undefined = undefined
  if (titleAnchor.length > 0) {
    talkUrl = titleAnchor.attr("href")
    // 相対URLの場合は絶対URLに変換
    if (talkUrl && !talkUrl.startsWith("http")) {
      talkUrl = `https://2025.tskaigi.org${talkUrl.startsWith("/") ? "" : "/"}${talkUrl}`
    }
  }

  // 話者情報を取得（複数のセレクタパターンを試す）
  let speaker = ""
  let speakerImage: string | undefined = undefined
  
  // パターン1: 標準的な構造
  const speakerElement = $(element).find(".flex.items-center.gap-2 span").first()
  if (speakerElement.length > 0) {
    speaker = speakerElement.text().trim()
  }
  
  // パターン2: 親要素から検索
  if (!speaker) {
    const parentSpeakerElement = $(element).parent().find(".flex.items-center.gap-2 span").first()
    if (parentSpeakerElement.length > 0) {
      speaker = parentSpeakerElement.text().trim()
    }
  }

  // 話者画像のURLを取得
  const speakerImageElement = $(element).find(".flex.items-center.gap-2 img").first()
  if (speakerImageElement.length > 0) {
    speakerImage = speakerImageElement.attr("src")
  } else {
    // 親要素から検索
    const parentSpeakerImageElement = $(element).parent().find(".flex.items-center.gap-2 img").first()
    if (parentSpeakerImageElement.length > 0) {
      speakerImage = parentSpeakerImageElement.attr("src")
    }
  }
  
  // 相対URLの場合は絶対URLに変換
  if (speakerImage && !speakerImage.startsWith("http")) {
    speakerImage = `https://2025.tskaigi.org${speakerImage.startsWith("/") ? "" : "/"}${speakerImage}`
  }

  // トークIDを生成
  const id = `day${dayValue.slice(-1)}-${gridIndex}-${cellIndex}-${talkIndex}`

  return {
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
  }
}

// Playwrightを使用してHTMLを取得する関数
export async function fetchHtml(url: string): Promise<string> {
  let options: LaunchOptions = {
    headless: true
  }

  if (process.env.NODE_ENV === "production") {
    options["args"] = chromiumPath.args
    options["executablePath"] = await chromiumPath.executablePath()
  }
  const browser = await chromium.launch(options);
  
  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle' }); // ネットワークが安定するまで待機
    
    // ページのHTMLを取得
    const html = await page.content();
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

              // セル内の複数トークを検出
              const talksInCell = extractTalksFromCell($, cell, timeText, trackName, day, gridIndex, cellIndex)
              rawTalks.push(...talksInCell)
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

    // すべてのトークを同じレベルで表示（親子関係を構築しない）
    return rawTalks
  } catch (error) {
    console.error("Error in fetchTalksForDay:", error)
    // エラーが発生した場合は空の配列を返す
    return []
  }
}
