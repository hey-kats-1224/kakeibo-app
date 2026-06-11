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

  // レシートアップロード成功時の処理
  function handleUploadSuccess(newExpense) {
    const updated = saveExpense(newExpense);
    setExpenses(updated);
    // 読み取り成功後に一覧タブへ自動遷移
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
