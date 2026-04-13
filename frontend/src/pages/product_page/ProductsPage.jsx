import { useState, useEffect } from "react";
import styles from "./ProductsPage.module.css";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const savedProducts = localStorage.getItem("products");
    if (savedProducts) setProducts(JSON.parse(savedProducts));

    const savedCategories = localStorage.getItem("categories");
    if (savedCategories) setCategories(JSON.parse(savedCategories));

    const savedStores = localStorage.getItem("stores");
    if (savedStores) setStores(JSON.parse(savedStores));

    const savedWarehouses = localStorage.getItem("warehouses");
    if (savedWarehouses) setWarehouses(JSON.parse(savedWarehouses));
  }, []);

  const saveProducts = (data) => {
    localStorage.setItem("products", JSON.stringify(data));
    setProducts(data);
  };

  const openAddModal = () => {
    setSelectedCategory(null);
    setFormData({});
    setEditingProduct(null);
    setShowModal(true);
  };

  const selectCategory = (category) => {
    setSelectedCategory(category);
    const initialData = {
      categoryId: category.id,
      categoryName: category.name,
      name: "",
      price: "",
      locationType: "store",
      locationId: "",
      quantity: 0,
    };

    category.fields.forEach((field) => {
      if (field.type === "checkbox") {
        initialData[field.id] = false;
      } else if (field.type === "select" && field.options?.length) {
        initialData[field.id] = field.options[0];
      } else {
        initialData[field.id] = "";
      }
    });

    setFormData(initialData);
  };

  const openEditModal = (product) => {
    const category = categories.find((c) => c.id === product.categoryId);
    setSelectedCategory(category);
    setFormData(product);
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.price) {
      alert("Заполните название и цену");
      return;
    }

    if (editingProduct) {
      const updated = products.map((p) =>
        p.id === editingProduct.id ? { ...formData, id: editingProduct.id } : p,
      );
      saveProducts(updated);
    } else {
      saveProducts([...products, { ...formData, id: Date.now() }]);
    }
    setShowModal(false);
  };

  const deleteProduct = (id) => {
    if (confirm("Удалить товар?")) {
      const updated = products.filter((p) => p.id !== id);
      saveProducts(updated);
    }
  };

  const renderFieldInput = (field) => {
    const value = formData[field.id] || "";

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            placeholder={field.label}
            value={value}
            onChange={(e) =>
              setFormData({ ...formData, [field.id]: e.target.value })
            }
            rows={3}
          />
        );
      case "select":
        return (
          <select
            value={value}
            onChange={(e) =>
              setFormData({ ...formData, [field.id]: e.target.value })
            }
          >
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      case "checkbox":
        return (
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData[field.id] || false}
              onChange={(e) =>
                setFormData({ ...formData, [field.id]: e.target.checked })
              }
            />
            <span>{field.label}</span>
          </label>
        );
      default:
        return (
          <input
            type={field.type}
            placeholder={field.label}
            value={value}
            onChange={(e) =>
              setFormData({ ...formData, [field.id]: e.target.value })
            }
          />
        );
    }
  };

  const getLocationName = (product) => {
    if (product.locationType === "store") {
      const store = stores.find((s) => s.id === product.locationId);
      return store ? `🏬 ${store.name}` : "Не указано";
    } else {
      const warehouse = warehouses.find((w) => w.id === product.locationId);
      return warehouse ? `🏪 ${warehouse.name}` : "Не указано";
    }
  };

  return (
    <div className={styles.productsPage}>
      <div className={styles.header}>
        <h1 className="section-title">
          Управление <span>товарами</span>
        </h1>
        <button className="cta-btn" onClick={openAddModal}>
          + Добавить товар
        </button>
      </div>

      <div className={styles.productsTable}>
        <table>
          <thead>
            <tr>
              <th>Категория</th>
              <th>Название</th>
              <th>Цена</th>
              <th>Местоположение</th>
              <th>Количество</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const category = categories.find(
                (c) => c.id === product.categoryId,
              );
              const visibleFields =
                category?.fields.filter((f) => f.visible) || [];

              return (
                <tr key={product.id}>
                  <td>{product.categoryName}</td>
                  <td>{product.name}</td>
                  <td>{product.price} ₽</td>
                  <td>{getLocationName(product)}</td>
                  <td>{product.quantity || 0} шт</td>
                  <td>
                    <button
                      onClick={() => openEditModal(product)}
                      className={styles.editBtn}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className={styles.deleteBtn}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan="6" className={styles.emptyTable}>
                  Нет товаров. Нажмите "Добавить товар"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Модальное окно выбора категории */}
      {showModal && !selectedCategory && (
        <div className={styles.modal} onClick={() => setShowModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Выберите категорию товара</h2>
            <div className={styles.categoriesList}>
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={styles.categorySelectBtn}
                  onClick={() => selectCategory(category)}
                >
                  <div className={styles.categoryIcon}>📂</div>
                  <div>
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                    <small>{category.fields.length} полей</small>
                  </div>
                </button>
              ))}
            </div>
            <div className={styles.modalButtons}>
              <button onClick={() => setShowModal(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно добавления/редактирования товара */}
      {showModal && selectedCategory && (
        <div className={styles.modal} onClick={() => setShowModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{editingProduct ? "Редактировать" : "Добавить"} товар</h2>
            <h3 className={styles.categoryBadge}>
              Категория: {selectedCategory.name}
            </h3>

            <div className={styles.formFields}>
              <div className={styles.formGroup}>
                <label>Название товара *</label>
                <input
                  type="text"
                  placeholder="Название"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label>Цена *</label>
                <input
                  type="number"
                  placeholder="Цена"
                  value={formData.price || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Тип расположения</label>
                  <select
                    value={formData.locationType || "store"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        locationType: e.target.value,
                        locationId: "",
                      })
                    }
                  >
                    <option value="store">Магазин</option>
                    <option value="warehouse">Склад</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>
                    Выберите{" "}
                    {formData.locationType === "store" ? "магазин" : "склад"}
                  </label>
                  <select
                    value={formData.locationId || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        locationId: parseInt(e.target.value),
                      })
                    }
                  >
                    <option value="">Выберите...</option>
                    {(formData.locationType === "store"
                      ? stores
                      : warehouses
                    ).map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Количество</label>
                  <input
                    type="number"
                    placeholder="Количество"
                    value={formData.quantity || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    min="0"
                  />
                </div>
              </div>

              <div className={styles.divider}>
                Дополнительные поля категории
              </div>

              {selectedCategory.fields.map((field) => (
                <div key={field.id} className={styles.formGroup}>
                  <label>
                    {field.label}
                    {field.required && (
                      <span className={styles.required}>*</span>
                    )}
                  </label>
                  {renderFieldInput(field)}
                </div>
              ))}
            </div>

            <div className={styles.modalButtons}>
              <button onClick={() => setShowModal(false)}>Отмена</button>
              <button className="cta-btn" onClick={handleSubmit}>
                {editingProduct ? "Сохранить" : "Добавить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
