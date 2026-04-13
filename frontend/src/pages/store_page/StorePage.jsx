import { useState, useEffect } from "react";
import styles from "./StorePage.module.css";

const StorePage = () => {
  const [stores, setStores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [newStore, setNewStore] = useState({
    name: "",
    address: "",
    phone: "",
    workingHours: "09:00 - 21:00",
    products: [],
  });
  const [newProduct, setNewProduct] = useState({
    productId: "",
    quantity: 0,
  });
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    // Загрузка магазинов
    const savedStores = localStorage.getItem("stores");
    if (savedStores) setStores(JSON.parse(savedStores));

    // Загрузка товаров для добавления
    const savedProducts = localStorage.getItem("products");
    if (savedProducts) setAllProducts(JSON.parse(savedProducts));
  }, []);

  const saveStores = (data) => {
    localStorage.setItem("stores", JSON.stringify(data));
    setStores(data);
  };

  const addStore = () => {
    if (!newStore.name) return;
    const updated = [...stores, { ...newStore, id: Date.now() }];
    saveStores(updated);
    setNewStore({
      name: "",
      address: "",
      phone: "",
      workingHours: "09:00 - 21:00",
      products: [],
    });
    setShowModal(false);
  };

  const deleteStore = (id) => {
    if (confirm("Удалить магазин? Все товары в нём также будут удалены")) {
      const updated = stores.filter((s) => s.id !== id);
      saveStores(updated);
    }
  };

  const openProductModal = (store) => {
    setSelectedStore(store);
    setShowProductModal(true);
  };

  const addProductToStore = () => {
    if (!newProduct.productId) return;

    const product = allProducts.find(
      (p) => p.id === parseInt(newProduct.productId),
    );
    if (!product) return;

    const updatedStores = stores.map((store) => {
      if (store.id === selectedStore.id) {
        const existingProduct = store.products.find(
          (p) => p.id === parseInt(newProduct.productId),
        );
        if (existingProduct) {
          existingProduct.quantity += parseInt(newProduct.quantity);
        } else {
          store.products.push({
            ...product,
            quantity: parseInt(newProduct.quantity),
          });
        }
      }
      return store;
    });

    saveStores(updatedStores);
    setNewProduct({ productId: "", quantity: 0 });
    setShowProductModal(false);
  };

  const removeProductFromStore = (storeId, productId) => {
    const updatedStores = stores.map((store) => {
      if (store.id === storeId) {
        store.products = store.products.filter((p) => p.id !== productId);
      }
      return store;
    });
    saveStores(updatedStores);
  };

  const updateProductQuantity = (storeId, productId, newQuantity) => {
    if (newQuantity < 0) return;
    const updatedStores = stores.map((store) => {
      if (store.id === storeId) {
        const product = store.products.find((p) => p.id === productId);
        if (product) product.quantity = newQuantity;
      }
      return store;
    });
    saveStores(updatedStores);
  };

  return (
    <div className={styles.storePage}>
      <div className={styles.header}>
        <h1 className="section-title">
          Управление <span>магазинами</span>
        </h1>
        <button className="cta-btn" onClick={() => setShowModal(true)}>
          + Добавить магазин
        </button>
      </div>

      <div className={styles.storesGrid}>
        {stores.map((store) => (
          <div key={store.id} className={styles.storeCard}>
            <div className={styles.cardHeader}>
              <div className={styles.icon}>🏬</div>
              <button
                className={styles.deleteBtn}
                onClick={() => deleteStore(store.id)}
              >
                🗑️
              </button>
            </div>
            <h3>{store.name}</h3>
            <p>📍 {store.address}</p>
            <p>📞 {store.phone}</p>
            <p>🕐 {store.workingHours}</p>

            <div className={styles.productsSection}>
              <div className={styles.productsHeader}>
                <span>
                  📦 Товары в магазине ({store.products?.length || 0})
                </span>
                <button
                  className={styles.addProductBtn}
                  onClick={() => openProductModal(store)}
                >
                  + Добавить товар
                </button>
              </div>

              <div className={styles.productsList}>
                {store.products?.map((product) => (
                  <div key={product.id} className={styles.productItem}>
                    <div className={styles.productInfo}>
                      <span className={styles.productName}>{product.name}</span>
                      <span className={styles.productPrice}>
                        {product.price} ₽
                      </span>
                    </div>
                    <div className={styles.productActions}>
                      <input
                        type="number"
                        value={product.quantity}
                        onChange={(e) =>
                          updateProductQuantity(
                            store.id,
                            product.id,
                            parseInt(e.target.value),
                          )
                        }
                        className={styles.quantityInput}
                        min="0"
                      />
                      <button
                        className={styles.removeProductBtn}
                        onClick={() =>
                          removeProductFromStore(store.id, product.id)
                        }
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                {(!store.products || store.products.length === 0) && (
                  <p className={styles.emptyProducts}>Нет товаров</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно добавления магазина */}
      {showModal && (
        <div className={styles.modal} onClick={() => setShowModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Добавить магазин</h2>
            <input
              type="text"
              placeholder="Название магазина"
              value={newStore.name}
              onChange={(e) =>
                setNewStore({ ...newStore, name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Адрес"
              value={newStore.address}
              onChange={(e) =>
                setNewStore({ ...newStore, address: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Телефон"
              value={newStore.phone}
              onChange={(e) =>
                setNewStore({ ...newStore, phone: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Режим работы"
              value={newStore.workingHours}
              onChange={(e) =>
                setNewStore({ ...newStore, workingHours: e.target.value })
              }
            />
            <div className={styles.modalButtons}>
              <button onClick={() => setShowModal(false)}>Отмена</button>
              <button className="cta-btn" onClick={addStore}>
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно добавления товара в магазин */}
      {showProductModal && (
        <div
          className={styles.modal}
          onClick={() => setShowProductModal(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Добавить товар в {selectedStore?.name}</h2>
            <select
              value={newProduct.productId}
              onChange={(e) =>
                setNewProduct({ ...newProduct, productId: e.target.value })
              }
            >
              <option value="">Выберите товар</option>
              {allProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.price} ₽
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Количество"
              value={newProduct.quantity}
              onChange={(e) =>
                setNewProduct({ ...newProduct, quantity: e.target.value })
              }
              min="0"
            />
            <div className={styles.modalButtons}>
              <button onClick={() => setShowProductModal(false)}>Отмена</button>
              <button className="cta-btn" onClick={addProductToStore}>
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorePage;
