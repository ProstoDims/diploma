import { useState } from "react";
import { useProductFields } from "../../contexts/ProductFieldsContext";
import styles from "./SettingsPage.module.css";

const SettingsPage = () => {
  const { fields, addField, updateField, deleteField, reorderFields } =
    useProductFields();
  const [showModal, setShowModal] = useState(false);
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
    { value: "color", label: "Цвет", icon: "🎨" },
  ];

  const addNewField = () => {
    if (!newField.label) return;
    addField({
      ...newField,
      options:
        newField.type === "select" ? ["Вариант 1", "Вариант 2"] : undefined,
    });
    setNewField({ label: "", type: "text", required: false, visible: true });
    setShowModal(false);
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"));
    reorderFields(dragIndex, dropIndex);
  };

  return (
    <div className={styles.settingsPage}>
      <div className={styles.header}>
        <h1 className="section-title">
          Настройка <span>полей товаров</span>
        </h1>
        <button className="cta-btn" onClick={() => setShowModal(true)}>
          + Добавить поле
        </button>
      </div>

      <div className={styles.infoBox}>
        <p>💡 Настройте какие поля будут у ваших товаров или услуг.</p>
        <p>Перетаскивайте поля для изменения порядка</p>
      </div>

      <div className={styles.fieldsList}>
        {fields.map((field, index) => (
          <div
            key={field.id}
            className={styles.fieldCard}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            <div className={styles.dragHandle}>⋮⋮</div>

            <div className={styles.fieldInfo}>
              <div className={styles.fieldLabel}>
                {field.label}
                {field.required && <span className={styles.required}>*</span>}
              </div>
              <div className={styles.fieldMeta}>
                <span className={styles.fieldType}>
                  {fieldTypes.find((t) => t.value === field.type)?.icon}{" "}
                  {fieldTypes.find((t) => t.value === field.type)?.label}
                </span>
              </div>
            </div>

            <div className={styles.fieldControls}>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={field.visible}
                  onChange={(e) =>
                    updateField(field.id, { visible: e.target.checked })
                  }
                />
                <span>Показывать</span>
              </label>

              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) =>
                    updateField(field.id, { required: e.target.checked })
                  }
                />
                <span>Обязательное</span>
              </label>

              <button
                className={styles.deleteFieldBtn}
                onClick={() => deleteField(field.id)}
                disabled={fields.length === 1}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно добавления поля */}
      {showModal && (
        <div className={styles.modal} onClick={() => setShowModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Добавить поле</h2>

            <div className={styles.formGroup}>
              <label>Название поля</label>
              <input
                type="text"
                placeholder="Например: Вес, Длительность, Цвет..."
                value={newField.label}
                onChange={(e) =>
                  setNewField({ ...newField, label: e.target.value })
                }
              />
            </div>

            <div className={styles.formGroup}>
              <label>Тип поля</label>
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
            </div>

            {newField.type === "select" && (
              <div className={styles.formGroup}>
                <label>Варианты (через запятую)</label>
                <input
                  type="text"
                  placeholder="Вариант 1, Вариант 2, Вариант 3"
                  onChange={(e) =>
                    setNewField({
                      ...newField,
                      options: e.target.value.split(",").map((s) => s.trim()),
                    })
                  }
                />
              </div>
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
              <button onClick={() => setShowModal(false)}>Отмена</button>
              <button className="cta-btn" onClick={addNewField}>
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
