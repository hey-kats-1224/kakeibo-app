import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { aggregateByCategory, aggregateByMonth } from "../utils/storage.js";

// Chart.js コンポーネントの登録
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

// カテゴリの色定義
const CATEGORY_COLORS = {
  食費: "#4CAF50",
  日用品: "#2196F3",
  外食: "#FF9800",
  交通費: "#9C27B0",
  娯楽: "#F44336",
  その他: "#607D8B",
};

// カテゴリ別円グラフ + 月別棒グラフコンポーネント
export default function Charts({ expenses }) {
  if (expenses.length === 0) {
    return null;
  }

  // カテゴリ別集計
  const categoryTotals = aggregateByCategory(expenses);
  const categoryLabels = Object.keys(categoryTotals);
  const categoryValues = Object.values(categoryTotals);
  const categoryColors = categoryLabels.map(
    (label) => CATEGORY_COLORS[label] || "#607D8B"
  );

  // 月別集計
  const monthlyTotals = aggregateByMonth(expenses);
  const monthLabels = Object.keys(monthlyTotals).map((m) => {
    const [year, month] = m.split("-");
    return `${year}年${parseInt(month)}月`;
  });
  const monthValues = Object.values(monthlyTotals);

  // 円グラフのデータ
  const pieData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryValues,
        backgroundColor: categoryColors,
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "right" },
      title: { display: true, text: "カテゴリ別支出" },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            ` ${ctx.label}: ${ctx.parsed.toLocaleString("ja-JP")}円`,
        },
      },
    },
  };

  // 棒グラフのデータ
  const barData = {
    labels: monthLabels,
    datasets: [
      {
        label: "月別支出合計",
        data: monthValues,
        backgroundColor: "#42A5F5",
        borderColor: "#1E88E5",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "月別支出推移" },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            ` ${ctx.parsed.y.toLocaleString("ja-JP")}円`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${value.toLocaleString("ja-JP")}円`,
        },
      },
    },
  };

  return (
    <div className="charts-section">
      <h2>グラフ</h2>
      <div className="charts-grid">
        {/* カテゴリ別円グラフ */}
        <div className="chart-container">
          <Pie data={pieData} options={pieOptions} />
        </div>

        {/* 月別棒グラフ */}
        <div className="chart-container">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
    </div>
  );
}
