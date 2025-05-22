import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

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

async function fetchTalksForDay(day: string) {
  const response = await fetch(`https://2025.tskaigi.org/talks?day=${day}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status}`)
  }

  const html = await response.text()
  const $ = cheerio.load(html)
  const talks: any[] = []

  // タイムテーブルの各行を処理
  $("tr").each((rowIndex, row) => {
    // 時間帯を取得
    const timeCell = $(row).find("td:first-child")
    const timeText = timeCell.text().trim()

    if (!timeText || timeText === "") return

    // 各トラックのセルを処理
    $(row)
      .find("td:not(:first-child)")
      .each((cellIndex, cell) => {
        const trackIndex = cellIndex
        let trackName = ""

        // トラック名を取得（ヘッダー行から）
        if (trackIndex === 0) trackName = "トグルルーム"
        else if (trackIndex === 1) trackName = "アセンドトラック"
        else if (trackIndex === 2) trackName = "レバレジーズトラック"

        const talkElement = $(cell)
        const talkTitle = talkElement.find("a").text().trim() || talkElement.text().trim()

        // 空のセルやヘッダーをスキップ
        if (
          !talkTitle ||
          talkTitle === "" ||
          talkTitle === "トグルルーム" ||
          talkTitle === "アセンドトラック" ||
          talkTitle === "レバレジーズトラック"
        ) {
          return
        }

        // トークタイプを判定
        let talkType = "セッション"
        if (talkElement.find(".badge-primary").length > 0) {
          talkType = "セッション"
        } else if (talkElement.find(".badge-danger").length > 0) {
          talkType = "招待講演"
        } else if (talkTitle.includes("オープニング")) {
          talkType = "オープニング"
        } else if (talkTitle.includes("クローズ")) {
          talkType = "クローズ"
        } else if (talkTitle.includes("休憩")) {
          talkType = "休憩"
        } else if (talkTitle.includes("ランチ")) {
          talkType = "ランチ配布"
        } else if (talkElement.find(".badge-warning").length > 0) {
          talkType = "スポンサーLT"
        }

        // 話者情報を取得
        const speakerElement = talkElement.find(".speaker-name")
        const speaker = speakerElement.text().trim()

        // ハッシュタグを取得
        const hashtag = talkElement.find(".hashtag").text().trim()

        // トークIDを生成
        const id = `day${day}-${rowIndex}-${cellIndex}`

        talks.push({
          id,
          day: `day${day}`,
          title: talkTitle,
          speaker: speaker || undefined,
          time: timeText,
          track: trackName || undefined,
          type: talkType,
          hashtag: hashtag || undefined,
        })
      })
  })

  return talks
}
