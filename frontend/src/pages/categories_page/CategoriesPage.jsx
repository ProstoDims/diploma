import { useState, useEffect } from "react";
import styles from "./CategoriesPage.module.css";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    fields: [],
  });
  const [newField, setNewField] = useState({
    label: "",
    type: "text",
    required: false,
    visible: true,
  });

  const fieldTypes = [
    { value: "text", label: "Текст", icon: "📝" },
    { value: "number", label: "Число", icon: "🔢" },
    { value: "date", label: "Дата", icon: "📅" },
    { value: "select", label: "Выбор", icon: "📋" },
    { value: "textarea", label: "Текстовая область", icon: "📄" },
    { value: "checkbox", label: "Чекбокс", icon: "✅" },
  ];

  useEffect(() => {
    const saved = localStorage.getItem("categories");
    if (saved) {
      setCategories(JSON.parse(saved));
    } else {
      // Примеры категорий
      const defaultCategories = [
        {
          id: 1,
          name: "Продукты питания",
          description: "Товары с ограниченным сроком годности",
          fields: [
            {
              id: "expiry_date",
              label: "Срок годности",
              type: "date",
              required: true,
              visible: true,
            },
            {
              id: "weight",
              label: "Вес (кг)",
              type: "number",
              required: false,
              visible: true,
            },
            {
              id: "calories",
              label: "Калории",
              type: "number",
              required: false,
              visible: false,
            },
          ],
        },
        {
          id: 2,
          name: "Посуда",
          description: "Кухонная утварь и посуда",
          fields: [
            {
              id: "material",
              label: "Материал",
              type: "select",
              required: true,
              visible: true,
              options: ["Керамика", "Стекло", "Металл", "Дерево"],
            },
            {
              id: "country",
              label: "Страна производства",
              type: "text",
              required: false,
              visible: true,
            },
            {
              id: "size",
              label: "Размеры",
              type: "text",
              required: false,
              visible: true,
            },
          ],
        },
        {
          id: 3,
          name: "Услуги",
          description: "Различные услуги",
          fields: [
            {
              id: "duration",
              label: "Длительность (мин)",
              type: "number",
              required: true,
              visible: true,
            },
            {
              id: "specialist",
              label: "Специалист",
              type: "text",
              required: false,
              visible: true,
            },
          ],
        },
      ];
      setCategories(defaultCategories);
      localStorage.setItem("categories", JSON.stringify(defaultCategories));
    }
  }, []);

  const saveCategories = (data) => {
    localStorage.setItem("categories", JSON.stringify(data));
    setCategories(data);
  };

  const addCategory = () => {
    if (!newCategory.name) return;
    const updated = [
      ...categories,
      {
        ...newCategory,
        id: Date.now(),
        fields: [],
      },
    ];
    saveCategories(updated);
    setNewCategory({ name: "", description: "", fields: [] });
    setShowModal(false);
  };

  const deleteCategory = (id) => {
    if (
      confirm(
        "Удалить категорию? Все товары этой категории также будут удалены",
      )
    ) {
      const updated = categories.filter((c) => c.id !== id);
      saveCategories(updated);

      // Удаляем товары этой категории
      const products = JSON.parse(localStorage.getItem("products") || "[]");
      const filteredProducts = products.filter((p) => p.categoryId !== id);
      localStorage.setItem("products", JSON.stringify(filteredProducts));
    }
  };

  const addFieldToCategory = () => {
    if (!newField.label) return;
    const updated = categories.map((cat) => {
      if (cat.id === selectedCategory.id) {
        return {
          ...cat,
          fields: [...cat.fields, { ...newField, id: Date.now().toString() }],
        };
      }
      return cat;
    });
    saveCategories(updated);
    setNewField({ label: "", type: "text", required: false, visible: true });
    setShowFieldModal(false);
  };

  const deleteFieldFromCategory = (categoryId, fieldId) => {
    const updated = categories.map((cat) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          fields: cat.fields.filter((f) => f.id !== fieldId),
        };
      }
      return cat;
    });
    saveCategories(updated);
  };

  const updateField = (categoryId, fieldId, updates) => {
    const updated = categories.map((cat) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          fields: cat.fields.map((f) =>
            f.id === fieldId ? { ...f, ...updates } : f,
          ),
        };
      }
      return cat;
    });
    saveCategories(updated);
  };

  return (
    <div className={styles.categoriesPage}>
      <div className={styles.header}>
        <h1 className="section-title">
          Категории <span>товаров</span>
        </h1>
        <button className="cta-btn" onClick={() => setShowModal(true)}>
          + Добавить категорию
        </button>
      </div>

      <div className={styles.categoriesGrid}>
        {categories.map((category) => (
          <div key={category.id} className={styles.categoryCard}>
            <div className={styles.cardHeader}>
              <div className={styles.icon}>📂</div>
              <button
                className={styles.deleteBtn}
                onClick={() => deleteCategory(category.id)}
              >
                🗑️
              </button>
            </div>
            <h3>{category.name}</h3>
            <p className={styles.description}>{category.description}</p>

            <div className={styles.fieldsSection}>
              <div className={styles.fieldsHeader}>
                <span>🏷️ Поля категории ({category.fields.length})</span>
                <button
                  className={styles.addFieldBtn}
                  onClick={() => {
                    setSelectedCategory(category);
                    setShowFieldModal(true);
                  }}
                >
                  + Добавить поле
                </button>
              </div>

              <div className={styles.fieldsList}>
                {category.fields.map((field) => (
                  <div key={field.id} className={styles.fieldItem}>
                    <div className={styles.fieldInfo}>
                      <span className={styles.fieldLabel}>
                        {field.label}
                        {field.required && (
                          <span className={styles.required}>*</span>
                        )}
                      </span>
                      <span className={styles.fieldType}>
                        {fieldTypes.find((t) => t.value === field.type)?.icon}{" "}
                        {fieldTypes.find((t) => t.value === field.type)?.label}
                      </span>
                    </div>
                    <div className={styles.fieldActions}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={field.visible}
                          onChange={(e) =>
                            updateField(category.id, field.id, {
                              visible: e.target.checked,
                            })
                          }
                        />
                        <span>Показывать</span>
                      </label>
                      <button
                        className={styles.removeFieldBtn}
                        onClick={() =>
                          deleteFieldFromCategory(category.id, field.id)
                        }
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                {category.fields.length === 0 && (
                  <p className={styles.emptyFields}>
                    Нет полей. Добавьте поля для этой категории
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно добавления категории */}
      {showModal && (
        <div className={styles.modal} onClick={() => setShowModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Добавить категорию</h2>
            <input
              type="text"
              placeholder="Название категории"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
            />
            <textarea
              placeholder="Описание категории"
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory({ ...newCategory, description: e.target.value })
              }
              rows={3}
            />
            <div className={styles.modalButtons}>
              <button onClick={() => setShowModal(false)}>Отмена</button>
              <button className="cta-btn" onClick={addCategory}>
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно добавления поля */}
      {showFieldModal && (
        <div className={styles.modal} onClick={() => setShowFieldModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Добавить поле для "{selectedCategory?.name}"</h2>
            <input
              type="text"
              placeholder="Название поля"
              value={newField.label}
              onChange={(e) =>
                setNewField({ ...newField, label: e.target.value })
              }
            />
            <select
              value={newField.type}
              onChange={(e) =>
                setNewField({ ...newField, type: e.target.value })
              }
            >
              {fieldTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
            {newField.type === "select" && (
              <input
                type="text"
                placeholder="Варианты (через запятую)"
                onChange={(e) =>
                  setNewField({
                    ...newField,
                    options: e.target.value.split(",").map((s) => s.trim()),
                  })
                }
              />
            )}
            <div className={styles.checkboxGroup}>
              <label>
                <input
                  type="checkbox"
                  checked={newField.required}
                  onChange={(e) =>
                    setNewField({ ...newField, required: e.target.checked })
                  }
                />
                Обязательное поле
              </label>
            </div>
            <div className={styles.modalButtons}>
              <button onClick={() => setShowFieldModal(false)}>Отмена</button>
              <button className="cta-btn" onClick={addFieldToCategory}>
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
