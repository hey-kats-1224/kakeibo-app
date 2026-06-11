// レシート読み込み家計簿アプリ - バックエンドサーバー
import Anthropic from "@anthropic-ai/sdk";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import { randomUUID } from "crypto";

// .envファイルの読み込み（プロジェクトルートの.envを参照）
dotenv.config({ path: "../.env" });

const app = express();
const PORT = process.env.PORT || 3001;

// Anthropic クライアントの初期化
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// multer: メモリストレージ（ファイルをバッファとして保持）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 最大10MB
  fileFilter: (req, file, cb) => {
    // 画像ファイルのみ許可
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("画像ファイルのみアップロード可能です"));
    }
  },
});

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// カテゴリの定義
const CATEGORIES = ["食費", "日用品", "外食", "交通費", "娯楽", "その他"];

// レシート読み取りAPIエンドポイント
app.post("/api/upload", upload.single("receipt"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "画像ファイルが必要です" });
  }

  // 画像をbase64エンコード
  const imageBase64 = req.file.buffer.toString("base64");
  const mediaType = req.file.mimetype;

  // Claude APIへのプロンプト
  const prompt = `このレシート画像を分析して、以下の情報をJSON形式で返してください。

返却するJSONの形式:
{
  "date": "YYYY-MM-DD形式の日付（不明な場合は今日の日付）",
  "storeName": "店舗名",
  "items": [
    {
      "name": "商品名",
      "price": 金額（数値、税込み）,
      "category": "カテゴリ（食費・日用品・外食・交通費・娯楽・その他のいずれか）"
    }
  ],
  "total": 合計金額（数値）
}

カテゴリの分類基準:
- 食費: スーパーや食料品店での食材・飲料
- 日用品: 洗剤・シャンプー・文具・雑貨など
- 外食: レストラン・カフェ・ファストフードでの食事
- 交通費: 電車・バス・タクシー・ガソリン
- 娯楽: 映画・書籍・ゲーム・趣味関連
- その他: 上記に当てはまらないもの

注意事項:
- 合計金額が読み取れない場合はitemsの合計を計算してください
- 商品が読み取れない場合は空配列を返してください
- JSON以外のテキストは含めないでください`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    // レスポンスからJSONを抽出
    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent) {
      throw new Error("Claude APIからテキストレスポンスを取得できませんでした");
    }

    // JSONの抽出（コードブロックが含まれている場合も対応）
    let jsonText = textContent.text.trim();
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }

    const parsedData = JSON.parse(jsonText);

    // バリデーションと正規化
    const result = {
      id: randomUUID(),
      date: parsedData.date || new Date().toISOString().split("T")[0],
      storeName: parsedData.storeName || "不明な店舗",
      items: (parsedData.items || []).map((item) => ({
        name: item.name || "不明な商品",
        price: typeof item.price === "number" ? item.price : 0,
        category: CATEGORIES.includes(item.category) ? item.category : "その他",
      })),
      total:
        typeof parsedData.total === "number"
          ? parsedData.total
          : (parsedData.items || []).reduce(
              (sum, item) => sum + (item.price || 0),
              0
            ),
      createdAt: new Date().toISOString(),
    };

    res.json(result);
  } catch (err) {
    console.error("レシート解析エラー:", err.message);

    // JSONパースエラーの場合
    if (err instanceof SyntaxError) {
      return res
        .status(422)
        .json({ error: "レシートの内容を解析できませんでした" });
    }

    res.status(500).json({ error: "サーバーエラーが発生しました" });
  }
});

// ヘルスチェックエンドポイント
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`サーバー起動: http://localhost:${PORT}`);
});
