import { useRef, useState } from "react";

// カテゴリのカラーマップ
const CATEGORY_COLORS = {
  食費: "#4CAF50",
  日用品: "#2196F3",
  外食: "#FF9800",
  交通費: "#9C27B0",
  娯楽: "#F44336",
  その他: "#607D8B",
};

// レシート画像アップロードコンポーネント
export default function ReceiptUpload({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  // ファイルのアップロード処理
  async function uploadFile(file) {
    if (!file) return;

    setError(null);
    setIsLoading(true);

    // プレビュー画像を表示
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("receipt", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "アップロードに失敗しました");
      }

      const data = await response.json();
      onUploadSuccess(data);
      setPreview(null);
    } catch (err) {
      setError(err.message);
      setPreview(null);
    } finally {
      setIsLoading(false);
      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleFileChange(e) {
    uploadFile(e.target.files[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    uploadFile(e.dataTransfer.files[0]);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  return (
    <div className="upload-section">
      <h2>レシートをアップロード</h2>

      {/* ドラッグ&ドロップエリア */}
      <div
        className={`drop-zone ${isDragging ? "dragging" : ""} ${isLoading ? "loading" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isLoading && fileInputRef.current?.click()}
      >
        {isLoading ? (
          <div className="loading-content">
            <div className="spinner"></div>
            <p>Claude AIがレシートを読み取り中...</p>
          </div>
        ) : preview ? (
          <img src={preview} alt="レシートプレビュー" className="preview-img" />
        ) : (
          <div className="drop-hint">
            <span className="drop-icon">🧾</span>
            <p>クリックまたはドラッグ&ドロップで<br />レシート画像をアップロード</p>
            <span className="file-types">JPG・PNG・WEBP 対応</span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* エラーメッセージ */}
      {error && <p className="error-msg">{error}</p>}

      {/* カテゴリ凡例 */}
      <div className="category-legend">
        {Object.entries(CATEGORY_COLORS).map(([name, color]) => (
          <span key={name} className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: color }}></span>
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
