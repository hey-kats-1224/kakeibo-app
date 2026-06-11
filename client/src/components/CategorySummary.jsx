import { aggregateByCategory } from "../utils/storage.js";

// カテゴリ別集計サマリーコンポーネント
const CATEGORY_COLORS = {
  食費: "#4CAF50",
  日用品: "#2196F3",
  外食: "#FF9800",
  交通費: "#9C27B0",
  娯楽: "#F44336",
  その他: "#607D8B",
};

export default function CategorySummary({ expenses }) {
  if (expenses.length === 0) return null;

  const categoryTotals = aggregateByCategory(expenses);
  const grandTotal = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  // 金額降順にソート
  const sorted = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a);

  function formatPrice(price) {
    return price.toLocaleString("ja-JP") + "円";
  }

  return (
    <div className="summary-section">
      <h2>カテゴリ別集計</h2>
      <div className="summary-total">合計: {formatPrice(grandTotal)}</div>
      <div className="summary-bars">
        {sorted.map(([category, total]) => {
          const pct = grandTotal > 0 ? ((total / grandTotal) * 100).toFixed(1) : 0;
          const color = CATEGORY_COLORS[category] || "#607D8B";
          return (
            <div key={category} className="summary-bar-row">
              <span className="summary-label" style={{ color }}>
                {category}
              </span>
              <div className="bar-wrapper">
                <div
                  className="bar-fill"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                ></div>
              </div>
              <span className="summary-amount">{formatPrice(total)}</span>
              <span className="summary-pct">({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
