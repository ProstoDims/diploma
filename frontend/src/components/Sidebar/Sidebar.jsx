import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const user = JSON.parse(
    localStorage.getItem("user") || '{"name": "Пользователь"}',
  );

  const menuItems = [
    { path: "/dashboard", icon: "📊", label: "Дашборд" },
    { path: "/warehouses", icon: "🏪", label: "Склады" },
    { path: "/stores", icon: "🏬", label: "Магазины" },
    { path: "/categories", icon: "📂", label: "Категории" },
    { path: "/products", icon: "📦", label: "Товары" },
    { path: "/employees", icon: "👥", label: "Сотрудники" },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.userInfo}>
        <div className={styles.avatar}>👨‍💼</div>
        <h3>{user.name}</h3>
        <p>Администратор</p>
      </div>

      <nav className={styles.menu}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? `${styles.menuItem} ${styles.active}` : styles.menuItem
            }
          >
            <span className={styles.icon}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button
        className={styles.logoutBtn}
        onClick={() => {
          localStorage.removeItem("isAuthenticated");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }}
      >
        🚪 Выйти
      </button>
    </aside>
  );
};

export default Sidebar;
