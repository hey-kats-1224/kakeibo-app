import { useState } from "react";
import CategorySummary from "./components/CategorySummary.jsx";
import Charts from "./components/Charts.jsx";
import ExpenseList from "./components/ExpenseList.jsx";
import ReceiptUpload from "./components/ReceiptUpload.jsx";
import { deleteExpense, loadExpenses, saveExpense } from "./utils/storage.js";

// タブの定義
const TABS = [
  { id: "upload", label: "📸 アップロード" },
  { id: "list", label: "📋 一覧" },
  { id: "charts", label: "📊 グラフ" },
];

export default function App() {
  // LocalStorageから初期データを読み込む
  const [expenses, setExpenses] = useState(() => loadExpenses());
  const [activeTab, setActiveTab] = useState("upload");
  const [warnings, setWarnings] = useState([]);

  // 警告を追加するヘルパー
  function addWarning(warning) {
    setWarnings((prev) => [...prev, { id: `w-${Date.now()}-${Math.random()}`, ...warning }]);
  }

  // 警告を閉じる
  function dismissWarning(id) {
    setWarnings((prev) => prev.filter((w) => w.id !== id));
  }

  // 重複確認後に保存を続行する
  function confirmDuplicate(warning) {
    const updated = saveExpense(warning.pendingExpense);
    setExpenses(updated);
    dismissWarning(warning.id);
    setActiveTab("list");
  }

  // レシートアップロード成功時のバリデーションと保存
  function handleUploadSuccess(newExpense) {
    let hasDuplicate = false;

    // 負の金額チェック（保存は続行するが警告を表示）
    const negativeItems = newExpense.items.filter((item) => item.price < 0);
    if (negativeItems.length > 0) {
      const names = negativeItems.map((i) => `「${i.name}」`).join("、");
      addWarning({
        type: "negative",
        message: `${names} の金額が負の値になっています。読み取り内容を確認してください。`,
      });
    }

    // 重複チェック（同一日付 & 合計金額）
    const duplicate = expenses.find(
      (e) => e.date === newExpense.date && e.total === newExpense.total
    );
    if (duplicate) {
      hasDuplicate = true;
      addWarning({
        type: "duplicate",
        message: `同じ日付・合計金額（${newExpense.date} / ${newExpense.total.toLocaleString("ja-JP")}円）のレシートが既に登録されています。`,
        pendingExpense: newExpense,
      });
    }

    // 重複がある場合は保存せず警告のみ表示（ユーザーが確認後に保存）
    if (hasDuplicate) return;

    const updated = saveExpense(newExpense);
    setExpenses(updated);
    setActiveTab("list");
  }

  // レシートデータ削除時の処理
  function handleDelete(id) {
    if (window.confirm("このレシートを削除しますか？")) {
      const updated = deleteExpense(id);
      setExpenses(updated);
    }
  }

  return (
    <div className="app">
      {/* ヘッダー */}
      <header className="app-header">
        <h1>🧾 家計簿アプリ</h1>
        <p className="subtitle">レシートをアップロードして自動で家計を管理</p>
      </header>

      {/* 警告バナー */}
      {warnings.length > 0 && (
        <div className="warning-list">
          {warnings.map((w) => (
            <div key={w.id} className={`warning-banner warning-${w.type}`}>
              <span className="warning-icon">
                {w.type === "negative" ? "⚠️" : "🔁"}
              </span>
              <span className="warning-message">{w.message}</span>
              <div className="warning-actions">
                {w.type === "duplicate" && (
                  <button
                    className="warning-btn confirm"
                    onClick={() => confirmDuplicate(w)}
                  >
                    保存する
                  </button>
                )}
                <button
                  className="warning-btn dismiss"
                  onClick={() => dismissWarning(w.id)}
                >
                  {w.type === "duplicate" ? "キャンセル" : "閉じる"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* タブナビゲーション */}
      <nav className="tab-nav">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.id === "list" && expenses.length > 0 && (
              <span className="badge">{expenses.length}</span>
            )}
          </button>
        ))}
      </nav>

      {/* メインコンテンツ */}
      <main className="app-main">
        {activeTab === "upload" && (
          <ReceiptUpload onUploadSuccess={handleUploadSuccess} />
        )}

        {activeTab === "list" && (
          <>
            <CategorySummary expenses={expenses} />
            <ExpenseList expenses={expenses} onDelete={handleDelete} />
          </>
        )}

        {activeTab === "charts" && (
          expenses.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📊</span>
              <p>グラフを表示するには<br />レシートをアップロードしてください。</p>
            </div>
          ) : (
            <Charts expenses={expenses} />
          )
        )}
      </main>
    </div>
  );
}
