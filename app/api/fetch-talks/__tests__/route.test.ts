import { fetchTalksForDay } from '../route'
import { describe, it, expect, beforeEach, vi } from 'vitest'

// @sparticuz/chromiumのモックを追加
vi.mock('@sparticuz/chromium', () => {
  return {
    default: {
      executablePath: '/path/to/chromium'
    }
  };
});

// Playwrightのモックを追加
vi.mock('playwright-core', () => {
  return {
    chromium: {
      launch: vi.fn().mockImplementation(() => {
        return {
          newContext: vi.fn().mockImplementation(() => {
            return {
              newPage: vi.fn().mockImplementation(() => {
                return {
                  goto: vi.fn().mockResolvedValue(undefined),
                  content: vi.fn().mockResolvedValue(mockHtmlDay1),
                };
              }),
            };
          }),
          close: vi.fn(),
        };
      }),
    },
  };
});

// fetchHtml関数をモック化
vi.mock('../route', async () => {
  const actual = await vi.importActual('../route');
  return {
    ...actual as any,
    fetchHtml: vi.fn().mockImplementation(() => Promise.resolve(mockHtmlDay1))
  };
});

// モックHTMLサンプル - Day 1
const mockHtmlDay1 = ``

describe('fetchTalksForDay', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('正しくトークデータを抽出できること', async () => {
    // Playwrightのモックは上部で設定済み

    // 関数を実行
    const result = await fetchTalksForDay('1')

    // 期待される結果
    expect(result).toHaveLength(2) // 2件のトークがある（オープニングトークと招待講演）
    
    // オープニングトークの検証
    expect(result[0]).toEqual({
      id: 'day1-2-0',
      day: 'day1',
      title: 'オープニングトーク',
      time: '10:50 ~ 11:00',
      track: 'トグルルーム',
      type: 'オープニング',
      hashtag: '#tskaigi_toggle',
      speaker: undefined,
      speakerImage: undefined,
    })
    
    // 招待講演の検証
    expect(result[1]).toEqual({
      id: 'day1-3-0',
      day: 'day1',
      title: 'The New Powerful ESLint Config with Type Safety',
      time: '11:00 ~ 11:40',
      track: 'トグルルーム',
      type: '招待講演',
      hashtag: '#tskaigi_toggle',
      speaker: 'Anthony Fu',
      speakerImage: './タイムテーブル _ TSKaigi 2025_files/antfu.jpg',
    })
  })

  it('フェッチに失敗した場合エラーをスローすること', async () => {
    // fetchHtml関数をモック化して404エラーを返す
    const { fetchHtml } = await import('../route');
    vi.mocked(fetchHtml).mockRejectedValueOnce(new Error('Failed to fetch data: 404'));
    
    // 関数を実行し、エラーが発生することを確認
    await expect(fetchTalksForDay('1')).rejects.toThrow('Failed to fetch data: 404');
  })

  it('HTMLが空の場合は空の配列を返すこと', async () => {
    // fetchHtml関数をモック化して空のHTMLを返す
    const { fetchHtml } = await import('../route');
    vi.mocked(fetchHtml).mockResolvedValueOnce('<div class="min-w-full"></div>');

    // 関数を実行
    const result = await fetchTalksForDay('1')

    // 期待される結果
    expect(result).toHaveLength(0)
  })
})
