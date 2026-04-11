import styles from "./MainPage.module.css";

const MainPage = () => {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            Учёт товаров <span>для малого бизнеса</span>
          </h1>
          <p className={styles.subtitle}>
            Продавайте больше, контролируйте остатки, управляйте поставками
            <br />в одном простом приложении
          </p>
          <div className={styles.heroButtons}>
            <button className="cta-btn">🚀 Начать бесплатно</button>
            <button className={styles.demoBtn}>🎥 Смотреть демо</button>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <h2 className="section-title">
          Всё для <span>вашего бизнеса</span>
        </h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📦</div>
            <h3>Учёт товаров</h3>
            <p>
              Добавляйте, редактируйте и отслеживайте все позиции в реальном
              времени
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <h3>Аналитика</h3>
            <p>Отчёты по продажам, прибыли и популярным товарам</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🏪</div>
            <h3>Остатки на складах</h3>
            <p>Контроль запасов и автоматические уведомления о нехватке</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📱</div>
            <h3>QR / Штрихкоды</h3>
            <p>Быстрое сканирование и инвентаризация</p>
          </div>
        </div>
      </section>

      {/* Как работает */}
      <section className={styles.howItWorks}>
        <h2 className="section-title">
          Простота в <span>каждом шаге</span>
        </h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h3>Добавьте товары</h3>
            <p>Импортируйте из Excel или добавьте вручную</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h3>Фиксируйте продажи</h3>
            <p>Один клик — и учёт обновлён</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h3>Анализируйте результат</h3>
            <p>Смотрите графики и планируйте закупки</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2>Готовы упростить учёт?</h2>
        <p>Присоединяйтесь к тысячам предпринимателей</p>
        <button className="cta-btn">Начать прямо сейчас →</button>
      </section>
    </>
  );
};

export default MainPage;
