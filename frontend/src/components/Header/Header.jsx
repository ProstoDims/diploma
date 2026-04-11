import styles from "./Header.module.css";

const Header = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        🧾 <span>ТоварУчёт</span>
      </div>
      <div className={styles.navLinks}>
        <a href="/">Главная</a>
        <a href="/products">Товары</a>
        <a href="/reports">Отчёты</a>
        <a href="/login" className={styles.loginBtn}>
          Войти
        </a>
        <a href="/register" className={styles.registerBtn}>
          Регистрация
        </a>
      </div>
    </nav>
  );
};

export default Header;
