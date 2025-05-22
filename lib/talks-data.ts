export interface Talk {
  id: string
  day: "day1" | "day2"
  title: string
  speaker?: string
  speakerImage?: string
  time: string
  track?: string
  type: "セッション" | "招待講演" | "オープニング" | "クローズ" | "休憩" | "ランチ配布" | "スポンサーLT"
  hashtag?: string
  url?: string
  // 追加：子トークを含むためのプロパティ
  childTalks?: Talk[]
  // 追加：親トークのIDを参照するためのプロパティ（オプション）
  parentId?: string
}

export const day1Talks: Talk[] = [
  {
    id: "day1-1",
    day: "day1",
    title: "オープニングトーク",
    time: "10:50 ~ 11:00",
    track: "トグルルーム",
    type: "オープニング",
    hashtag: "#tskaigi_toggle",
  },
  {
    id: "day1-2",
    day: "day1",
    title: "The New Powerful ESLint Config with Type Safety",
    speaker: "Anthony Fu",
    time: "11:00 ~ 11:40",
    track: "トグルルーム",
    type: "招待講演",
    hashtag: "#tskaigi_toggle",
  },
  {
    id: "day1-3",
    day: "day1",
    title: "checker.tsに対して具体に向き合う",
    speaker: "Kaoru",
    time: "11:50 ~ 12:20",
    track: "トグルルーム",
    type: "セッション",
    hashtag: "#tskaigi_toggle",
  },
  {
    id: "day1-4",
    day: "day1",
    title: "高度な型付け、どう教える？",
    speaker: "progfay",
    time: "11:50 ~ 12:20",
    track: "アセンドトラック",
    type: "セッション",
    hashtag: "#tskaigi_ascend",
  },
  {
    id: "day1-5",
    day: "day1",
    title: "スキーマと型で拡大 Full-Stack TypeScript",
    speaker: "Sohei Takeno",
    time: "11:50 ~ 12:20",
    track: "レバレジーズトラック",
    type: "セッション",
    hashtag: "#tskaigi_leverages",
  },
  {
    id: "day1-6",
    day: "day1",
    title: "ランチ配布",
    time: "12:20 ~ 12:30",
    type: "ランチ配布",
  },
  {
    id: "day1-7",
    day: "day1",
    title: "脱退危機からのピボット：4年目エンジニアがリードするTypeScriptで挑む新規事業開発",
    time: "12:30 ~ 13:00",
    track: "トグルルーム",
    type: "スポンサーLT",
    hashtag: "#tskaigi_toggle",
  },
]

export const day2Talks: Talk[] = [
  {
    id: "day2-1",
    day: "day2",
    title: "オープニングトーク",
    time: "9:50 ~ 10:00",
    track: "トグルルーム",
    type: "オープニング",
    hashtag: "#tskaigi_toggle",
  },
  {
    id: "day2-2",
    day: "day2",
    title: "TypeScriptネイティブ移植観測レポート TSKaigi 2025",
    speaker: "berlysia",
    time: "10:00 ~ 10:40",
    track: "トグルルーム",
    type: "招待講演",
    hashtag: "#tskaigi_toggle",
  },
  {
    id: "day2-3",
    day: "day2",
    title: "TypeScript Language Service Plugin でCSS Modulesの開発体験を改善する",
    speaker: "mizdra",
    time: "10:50 ~ 11:20",
    track: "トグルルーム",
    type: "セッション",
    hashtag: "#tskaigi_toggle",
  },
  {
    id: "day2-4",
    day: "day2",
    title: "フロントエンドがTypeScriptなら、バックエンドはPHPでもいいじゃない",
    speaker: "高河 豊",
    time: "10:50 ~ 11:20",
    track: "アセンドトラック",
    type: "セッション",
    hashtag: "#tskaigi_ascend",
  },
  {
    id: "day2-5",
    day: "day2",
    title:
      "TypeScriptとVercel AI SDKで実現するLLMアプリケーション開発：フロントエンドからバックエンド、そしてChromeに進まで",
    speaker: "加藤健太 (Kesin11)",
    time: "10:50 ~ 11:20",
    track: "レバレジーズトラック",
    type: "セッション",
    hashtag: "#tskaigi_leverages",
  },
]
