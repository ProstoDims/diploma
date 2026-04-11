import { useState } from "react";
import styles from "./RegisterPage.module.css";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    agreeTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Пароли не совпадают");
      return;
    }
    console.log("Register:", formData);
  };

  return (
    <div className={styles.registerPage}>
      <div className={styles.registerCard}>
        <div className={styles.registerHeader}>
          <div className={styles.logo}>
            🧾 <span>ТоварУчёт</span>
          </div>
          <h2>Создать аккаунт</h2>
          <p>Начните вести учёт своего бизнеса бесплатно</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label>Ваше имя</label>
              <input
                type="text"
                name="name"
                placeholder="Иван Иванов"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Название бизнеса</label>
              <input
                type="text"
                name="businessName"
                placeholder="ООО Ромашка"
                value={formData.businessName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="ivan@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label>Пароль</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Подтвердите пароль</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              required
            />
            <span>
              Я соглашаюсь с <a href="#">условиями использования</a> и
              <a href="#"> политикой конфиденциальности</a>
            </span>
          </label>

          <button
            type="submit"
            className="cta-btn"
            style={{ width: "100%", justifyContent: "center" }}
          >
            Зарегистрироваться
          </button>
        </form>

        <div className={styles.loginLink}>
          Уже есть аккаунт? <a href="/login">Войти</a>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
