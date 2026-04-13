import { useState, useEffect } from "react";
import styles from "./DashboardPage.module.css";

const DashboardPage = () => {
  const [stats, setStats] = useState({
    warehouses: 0,
    stores: 0,
    products: 0,
    employees: 0,
  });

  useEffect(() => {
    // Загрузка данных из localStorage
    const warehouses = JSON.parse(localStorage.getItem("warehouses") || "[]");
    const stores = JSON.parse(localStorage.getItem("stores") || "[]");
    const products = JSON.parse(localStorage.getItem("products") || "[]");
    const employees = JSON.parse(localStorage.getItem("employees") || "[]");

    setStats({
      warehouses: warehouses.length,
      stores: stores.length,
      products: products.length,
      employees: employees.length,
    });
  }, []);

  const statCards = [
    { title: "Склады", value: stats.warehouses, icon: "🏪", color: "#f97316" },
    { title: "Магазины", value: stats.stores, icon: "🏬", color: "#10b981" },
    { title: "Товары", value: stats.products, icon: "📦", color: "#3b82f6" },
    {
      title: "Сотрудники",
      value: stats.employees,
      icon: "👥",
      color: "#8b5cf6",
    },
  ];

  return (
    <div className={styles.dashboard}>
      <h1 className="section-title">
        Панель <span>управления</span>
      </h1>

      <div className={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ background: `${stat.color}20` }}
            >
              {stat.icon}
            </div>
            <div className={styles.statInfo}>
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.recentActivity}>
        <h2>Последняя активность</h2>
        <div className={styles.activityList}>
          <div className={styles.activityItem}>
            <span className={styles.activityIcon}>➕</span>
            <div>
              <p>Добавлен новый товар</p>
              <small>Только что</small>
            </div>
          </div>
          <div className={styles.activityItem}>
            <span className={styles.activityIcon}>🏪</span>
            <div>
              <p>Создан новый склад</p>
              <small>2 часа назад</small>
            </div>
          </div>
          <div className={styles.activityItem}>
            <span className={styles.activityIcon}>👥</span>
            <div>
              <p>Добавлен сотрудник</p>
              <small>Вчера</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
