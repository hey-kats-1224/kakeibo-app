// LocalStorage を使った家計データの永続化ユーティリティ
const STORAGE_KEY = "kakeibo_expenses";

// 全レシートデータを取得
export function loadExpenses() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// 新しいレシートデータを追加して保存
export function saveExpense(expense) {
  const expenses = loadExpenses();
  expenses.unshift(expense); // 最新を先頭に追加
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  return expenses;
}

// IDを指定してレシートデータを削除
export function deleteExpense(id) {
  const expenses = loadExpenses().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  return expenses;
}

// カテゴリ別の合計金額を集計
export function aggregateByCategory(expenses) {
  const totals = {};
  for (const expense of expenses) {
    for (const item of expense.items) {
      totals[item.category] = (totals[item.category] || 0) + item.price;
    }
  }
  return totals;
}

// 月別の合計金額を集計（直近12ヶ月）
export function aggregateByMonth(expenses) {
  const totals = {};
  for (const expense of expenses) {
    // date が "YYYY-MM-DD" 形式
    const month = expense.date.slice(0, 7); // "YYYY-MM"
    totals[month] = (totals[month] || 0) + expense.total;
  }
  // 月を昇順に並べ替え
  return Object.fromEntries(Object.entries(totals).sort(([a], [b]) => a.localeCompare(b)));
}
