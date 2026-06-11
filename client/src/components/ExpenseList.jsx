// レシート一覧・明細表示コンポーネント
const CATEGORY_COLORS = {
  食費: "#4CAF50",
  日用品: "#2196F3",
  外食: "#FF9800",
  交通費: "#9C27B0",
  娯楽: "#F44336",
  その他: "#607D8B",
};

export default function ExpenseList({ expenses, onDelete }) {
  if (expenses.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">📋</span>
        <p>まだデータがありません。<br />レシートをアップロードしてください。</p>
      </div>
    );
  }

  // 金額を日本円フォーマットで表示
  function formatPrice(price) {
    return price.toLocaleString("ja-JP") + "円";
  }

  // 日付を日本語形式で表示
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div className="expense-list">
      <h2>家計記録 ({expenses.length}件)</h2>
      {expenses.map((expense) => (
        <div key={expense.id} className="expense-card">
          <div className="expense-header">
            <div>
              <h3 className="store-name">{expense.storeName}</h3>
              <span className="expense-date">{formatDate(expense.date)}</span>
            </div>
            <div className="expense-header-right">
              <span className="expense-total">{formatPrice(expense.total)}</span>
              <button
                className="delete-btn"
                onClick={() => onDelete(expense.id)}
                title="削除"
              >
                ✕
              </button>
            </div>
          </div>

          {/* 商品明細テーブル */}
          {expense.items.length > 0 && (
            <table className="items-table">
              <thead>
                <tr>
                  <th>商品名</th>
                  <th>カテゴリ</th>
                  <th className="price-col">金額</th>
                </tr>
              </thead>
              <tbody>
                {expense.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td>
                      <span
                        className="category-badge"
                        style={{ backgroundColor: CATEGORY_COLORS[item.category] || "#607D8B" }}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td className="price-col">{formatPrice(item.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}
