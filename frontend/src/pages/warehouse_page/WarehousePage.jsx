import { useState, useEffect } from "react";
import styles from "./WarehousePage.module.css";
import { useNavigate } from "react-router-dom";

const WarehousePage = () => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newWarehouse, setNewWarehouse] = useState({
    name: "",
    address: "",
    phone: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("warehouses");
    if (saved) setWarehouses(JSON.parse(saved));
  }, []);

  const saveWarehouses = (data) => {
    localStorage.setItem("warehouses", JSON.stringify(data));
    setWarehouses(data);
  };

  const addWarehouse = () => {
    if (!newWarehouse.name) return;
    const updated = [
      ...warehouses,
      { ...newWarehouse, id: Date.now(), products: [] },
    ];
    saveWarehouses(updated);
    setNewWarehouse({ name: "", address: "", phone: "" });
    setShowModal(false);
  };

  const deleteWarehouse = (id) => {
    if (confirm("Удалить склад?")) {
      const updated = warehouses.filter((w) => w.id !== id);
      saveWarehouses(updated);
    }
  };

  return (
    <div className={styles.warehousePage}>
      <div className={styles.header}>
        <h1 className="section-title">
          Управление <span>складами</span>
        </h1>
        <button className="cta-btn" onClick={() => setShowModal(true)}>
          + Добавить склад
        </button>
      </div>

      <div className={styles.warehousesGrid}>
        {warehouses.map((warehouse) => (
          <div key={warehouse.id} className={styles.warehouseCard}>
            <div className={styles.cardHeader}>
              <div className={styles.icon}>🏪</div>
              <button
                className={styles.deleteBtn}
                onClick={() => deleteWarehouse(warehouse.id)}
              >
                🗑️
              </button>
            </div>
            <h3>{warehouse.name}</h3>
            <p>{warehouse.address}</p>
            <p>{warehouse.phone}</p>
            <button
              className={styles.statsBtn}
              onClick={() => navigate(`/warehouses/${warehouse.id}/statistics`)}
            >
              📊 Статистика склада
            </button>
            <div className={styles.stats}>
              <span>📦 {warehouse.products?.length || 0} товаров</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className={styles.modal} onClick={() => setShowModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Добавить склад</h2>
            <input
              type="text"
              placeholder="Название склада"
              value={newWarehouse.name}
              onChange={(e) =>
                setNewWarehouse({ ...newWarehouse, name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Адрес"
              value={newWarehouse.address}
              onChange={(e) =>
                setNewWarehouse({ ...newWarehouse, address: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Телефон"
              value={newWarehouse.phone}
              onChange={(e) =>
                setNewWarehouse({ ...newWarehouse, phone: e.target.value })
              }
            />
            <div className={styles.modalButtons}>
              <button onClick={() => setShowModal(false)}>Отмена</button>
              <button className="cta-btn" onClick={addWarehouse}>
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehousePage;
