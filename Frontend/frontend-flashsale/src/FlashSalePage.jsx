import React, { useEffect, useMemo, useState } from "react";

const API_BASE_URL = "http://localhost:8080/api/flash-sale";
const DEMO_USER_ID = 101;

export default function FlashSalePage() {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [loadingProductId, setLoadingProductId] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);

  // quantity người dùng chọn tại từng card sản phẩm
  const [selectedQuantities, setSelectedQuantities] = useState({});

  // giỏ hàng local
  const [cart, setCart] = useState([]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      const data = await response.json();
      const productList = data.result || [];
      setProducts(productList);

      // khởi tạo quantity mặc định = 1 nếu chưa có
      setSelectedQuantities((prev) => {
        const next = { ...prev };
        productList.forEach((p) => {
          if (!next[p.id]) next[p.id] = 1;
        });
        return next;
      });
    } catch (error) {
      setMessage("Không tải được danh sách sản phẩm");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleQuantityChange = (productId, value) => {
    const quantity = Number(value);
    setSelectedQuantities((prev) => ({
      ...prev,
      [productId]: Number.isNaN(quantity) || quantity < 1 ? 1 : quantity
    }));
  };

  const handleAddToCart = (product) => {
    const quantity = selectedQuantities[product.id] || 1;

    if (quantity <= 0) {
      setMessage("Số lượng không hợp lệ");
      return;
    }

    if (quantity > product.stock) {
      setMessage(`Số lượng vượt tồn kho. Chỉ còn ${product.stock} sản phẩm`);
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.productId === product.id);

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > product.stock) {
          setMessage(`Tổng số lượng trong giỏ vượt tồn kho. Chỉ còn ${product.stock} sản phẩm`);
          return prevCart;
        }

        if (newQuantity > 2) {
          setMessage("Mỗi khách hàng chỉ được mua tối đa 2 sản phẩm cho mỗi sản phẩm flash sale");
          return prevCart;
        }

        return prevCart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      if (quantity > 2) {
        setMessage("Mỗi khách hàng chỉ được mua tối đa 2 sản phẩm cho mỗi sản phẩm flash sale");
        return prevCart;
      }

      return [
        ...prevCart,
        {
          productId: product.id,
          name: product.name,
          salePrice: product.salePrice,
          stock: product.stock,
          quantity
        }
      ];
    });

    setMessage(`Đã thêm "${product.name}" vào giỏ hàng`);
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
  };

  const handleCartQuantityChange = (productId, value) => {
    const quantity = Number(value);

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.productId !== productId) return item;

        const nextQuantity = Number.isNaN(quantity) || quantity < 1 ? 1 : quantity;

        if (nextQuantity > item.stock) {
          setMessage(`Số lượng vượt tồn kho. Chỉ còn ${item.stock} sản phẩm`);
          return item;
        }

        if (nextQuantity > 2) {
          setMessage("Mỗi khách hàng chỉ được mua tối đa 2 sản phẩm cho mỗi sản phẩm flash sale");
          return item;
        }

        return {
          ...item,
          quantity: nextQuantity
        };
      })
    );
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.salePrice * item.quantity, 0);
  }, [cart]);

  const handleBuyNow = async (productId) => {
    const quantity = selectedQuantities[productId] || 1;
    setMessage("");
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
          quantity
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Đặt hàng thành công");
      } else {
        setMessage(data.message || "Đặt hàng thất bại");
      }

      await fetchProducts();
    } catch (error) {
      setMessage("Có lỗi khi gọi API");
    } finally {
      setLoadingProductId(null);
    }
  };

  // checkout giỏ hàng: gọi API order từng sản phẩm
  const handleCheckout = async () => {
    if (cart.length === 0) {
      setMessage("Giỏ hàng đang trống");
      return;
    }

    setCheckingOut(true);
    setMessage("");

    const successMessages = [];
    const failedMessages = [];

    try {
      for (const item of cart) {
        const response = await fetch(`${API_BASE_URL}/order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            productId: item.productId,
            userId: DEMO_USER_ID,
            quantity: item.quantity
          })
        });

        const data = await response.json();

        if (response.ok) {
          successMessages.push(`${item.name}: thành công`);
        } else {
          failedMessages.push(`${item.name}: ${data.message || "thất bại"}`);
        }
      }

      await fetchProducts();

      if (failedMessages.length === 0) {
        setMessage("Thanh toán thành công toàn bộ giỏ hàng");
        setCart([]);
      } else {
        setMessage(
          `Một số sản phẩm thanh toán thất bại. Thành công: ${successMessages.join(
            ", "
          )}. Thất bại: ${failedMessages.join(", ")}`
        );

        // chỉ giữ lại các item thất bại trong giỏ
        setCart((prevCart) =>
          prevCart.filter((item) =>
            failedMessages.some((msg) => msg.startsWith(`${item.name}:`))
          )
        );
      }
    } catch (error) {
      setMessage("Có lỗi khi thanh toán giỏ hàng");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "1280px",
        margin: "30px auto",
        fontFamily: "Arial, sans-serif",
        padding: "0 16px"
      }}
    >
      <h1 style={{ textAlign: "center", color: "#d32f2f", marginBottom: "24px" }}>
        🔥 Flash Sale
      </h1>

      {message && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 16px",
            borderRadius: "8px",
            backgroundColor: "#f5f5f5",
            border: "1px solid #ddd"
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "24px",
          alignItems: "start"
        }}
      >
        {/* Danh sách sản phẩm */}
        <div>
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
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  backgroundColor: "#fff"
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

                <h3>{product.name}</h3>

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

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>
                    Số lượng:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="2"
                    value={selectedQuantities[product.id] || 1}
                    onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid #ccc"
                    }}
                  />
                  <small style={{ color: "#666" }}>Mỗi khách hàng tối đa 2 sản phẩm</small>
                </div>

                <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock <= 0}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #d32f2f",
                      borderRadius: "8px",
                      backgroundColor: "#fff",
                      color: "#d32f2f",
                      fontWeight: "bold",
                      cursor: product.stock <= 0 ? "not-allowed" : "pointer"
                    }}
                  >
                    Thêm vào giỏ
                  </button>

                  <button
                    onClick={() => handleBuyNow(product.id)}
                    disabled={loadingProductId === product.id || product.stock <= 0}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "none",
                      borderRadius: "8px",
                      backgroundColor: product.stock <= 0 ? "#bdbdbd" : "#d32f2f",
                      color: "white",
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
              </div>
            ))}
          </div>
        </div>

        {/* Giỏ hàng */}
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "16px",
            backgroundColor: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            position: "sticky",
            top: "20px"
          }}
        >
          <h2 style={{ marginTop: 0 }}>🛒 Giỏ hàng</h2>

          {cart.length === 0 ? (
            <p>Chưa có sản phẩm nào trong giỏ.</p>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    style={{
                      border: "1px solid #eee",
                      borderRadius: "8px",
                      padding: "12px"
                    }}
                  >
                    <h4 style={{ margin: "0 0 8px 0" }}>{item.name}</h4>
                    <p style={{ margin: "4px 0" }}>
                      Giá: <strong>{item.salePrice.toLocaleString()} VND</strong>
                    </p>
                    <p style={{ margin: "4px 0" }}>Còn hàng: {item.stock}</p>

                    <div style={{ margin: "8px 0" }}>
                      <label style={{ display: "block", marginBottom: "4px" }}>Số lượng</label>
                      <input
                        type="number"
                        min="1"
                        max="2"
                        value={item.quantity}
                        onChange={(e) => handleCartQuantityChange(item.productId, e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px",
                          borderRadius: "6px",
                          border: "1px solid #ccc"
                        }}
                      />
                    </div>

                    <p style={{ margin: "8px 0", fontWeight: "bold" }}>
                      Thành tiền: {(item.salePrice * item.quantity).toLocaleString()} VND
                    </p>

                    <button
                      onClick={() => handleRemoveFromCart(item.productId)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "none",
                        borderRadius: "6px",
                        backgroundColor: "#757575",
                        color: "#fff",
                        cursor: "pointer"
                      }}
                    >
                      Xóa khỏi giỏ
                    </button>
                  </div>
                ))}
              </div>

              <hr style={{ margin: "16px 0" }} />

              <p style={{ fontSize: "18px", fontWeight: "bold" }}>
                Tổng tiền: {cartTotal.toLocaleString()} VND
              </p>

              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "none",
                  borderRadius: "8px",
                  backgroundColor: checkingOut ? "#bdbdbd" : "#2e7d32",
                  color: "#fff",
                  fontWeight: "bold",
                  cursor: checkingOut ? "not-allowed" : "pointer"
                }}
              >
                {checkingOut ? "Đang thanh toán..." : "Thanh toán giỏ hàng"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}