import React, { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:8080/api/flash-sale";
const DEMO_USER_ID = 101;

export default function FlashSalePage() {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success | error
  const [loadingProductId, setLoadingProductId] = useState(null);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      const data = await response.json();

      if (response.ok) {
        setProducts(data.result || []);
      } else {
        setMessage(data.message || "Không tải được danh sách sản phẩm");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Có lỗi khi tải danh sách sản phẩm");
      setMessageType("error");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleBuyNow = async (productId) => {
    setMessage("");
    setMessageType("");
    setLoadingProductId(productId);

    try {
      const response = await fetch(`${API_BASE_URL}/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          productId,
          userId: DEMO_USER_ID,
          quantity: 1
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Đặt hàng thành công");
        setMessageType("success");
      } else {
        setMessage(data.message || "Đặt hàng thất bại");
        setMessageType("error");
      }

      await fetchProducts();
    } catch (error) {
      setMessage("Có lỗi khi gọi API");
      setMessageType("error");
    } finally {
      setLoadingProductId(null);
    }
  };

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "30px auto",
        padding: "0 16px",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <h1
        style={{
          textAlign: "center",
          color: "#d32f2f",
          marginBottom: "24px"
        }}
      >
        🔥 Flash Sale
      </h1>

      {message && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 16px",
            borderRadius: "8px",
            border: `1px solid ${
              messageType === "success" ? "#4caf50" : "#f44336"
            }`,
            backgroundColor:
              messageType === "success" ? "#e8f5e9" : "#ffebee",
            color: messageType === "success" ? "#2e7d32" : "#c62828"
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px"
        }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "16px",
              backgroundColor: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
            }}
          >
            <div
              style={{
                display: "inline-block",
                marginBottom: "10px",
                padding: "4px 8px",
                borderRadius: "6px",
                backgroundColor: "#ff5722",
                color: "#fff",
                fontSize: "12px",
                fontWeight: "bold"
              }}
            >
              GIẢM 50%
            </div>

            <h3 style={{ marginTop: 0 }}>{product.name}</h3>

            <p>
              <strong>Giá gốc:</strong>{" "}
              <span style={{ textDecoration: "line-through", color: "#888" }}>
                {product.originalPrice.toLocaleString()} VND
              </span>
            </p>

            <p>
              <strong>Giá sale:</strong>{" "}
              <span style={{ color: "#d32f2f", fontWeight: "bold" }}>
                {product.salePrice.toLocaleString()} VND
              </span>
            </p>

            <p>
              <strong>Số lượng còn:</strong> {product.stock}
            </p>

            <button
              onClick={() => handleBuyNow(product.id)}
              disabled={loadingProductId === product.id || product.stock <= 0}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "none",
                borderRadius: "8px",
                backgroundColor: product.stock <= 0 ? "#bdbdbd" : "#d32f2f",
                color: "#fff",
                fontWeight: "bold",
                cursor: product.stock <= 0 ? "not-allowed" : "pointer"
              }}
            >
              {loadingProductId === product.id
                ? "Đang xử lý..."
                : product.stock <= 0
                ? "Hết hàng"
                : "Mua ngay"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}