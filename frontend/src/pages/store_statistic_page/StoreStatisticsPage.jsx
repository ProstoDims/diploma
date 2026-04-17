import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./StoreStatisticsPage.module.css";

const StoreStatisticsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [sales, setSales] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showAssignSellerModal, setShowAssignSellerModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [statistics, setStatistics] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalProfit: 0,
    averageCheck: 0,
    uniqueCustomers: 0,
    topProducts: [],
    topSellers: [],
    stockValue: 0,
    stockProfit: 0,
    dailyStats: [],
    monthlyStats: [],
    sellerStats: [],
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [sellerFilter, setSellerFilter] = useState("all");

  useEffect(() => {
    loadStoreData();
    loadSalesData();
    loadEmployees();
  }, [id]);

  const loadStoreData = () => {
    const savedStores = localStorage.getItem("stores");
    if (savedStores) {
      const stores = JSON.parse(savedStores);
      const foundStore = stores.find((s) => s.id === parseInt(id));
      setStore(foundStore);
    }
  };

  const loadEmployees = () => {
    const savedEmployees = localStorage.getItem("employees");
    if (savedEmployees) {
      const allEmployees = JSON.parse(savedEmployees);
      // Фильтруем сотрудников, которые привязаны к этому магазину
      const storeEmployees = allEmployees.filter((emp) =>
        emp.assignedTo?.some(
          (assignment) =>
            assignment.id === parseInt(id) && assignment.type === "store",
        ),
      );
      setEmployees(storeEmployees);
    }
  };

  const loadSalesData = () => {
    const savedSales = localStorage.getItem("sales");
    let allSales = savedSales ? JSON.parse(savedSales) : [];

    // Фильтруем продажи для текущего магазина
    const storeSales = allSales.filter((s) => s.storeId === parseInt(id));
    setSales(storeSales);
    calculateStatistics(storeSales);
  };

  const assignSellerToSale = (saleId, seller) => {
    const savedSales = localStorage.getItem("sales");
    let allSales = savedSales ? JSON.parse(savedSales) : [];

    const updatedSales = allSales.map((sale) => {
      if (sale.id === saleId) {
        return {
          ...sale,
          sellerId: seller.id,
          sellerName: seller.name,
          sellerPosition: seller.position,
        };
      }
      return sale;
    });

    localStorage.setItem("sales", JSON.stringify(updatedSales));

    // Обновляем текущие продажи
    const updatedStoreSales = updatedSales.filter(
      (s) => s.storeId === parseInt(id),
    );
    setSales(updatedStoreSales);
    calculateStatistics(updatedStoreSales);
    setShowAssignSellerModal(false);
    setSelectedSale(null);
  };

  const removeSellerFromSale = (saleId) => {
    const savedSales = localStorage.getItem("sales");
    let allSales = savedSales ? JSON.parse(savedSales) : [];

    const updatedSales = allSales.map((sale) => {
      if (sale.id === saleId) {
        const { sellerId, sellerName, sellerPosition, ...rest } = sale;
        return rest;
      }
      return sale;
    });

    localStorage.setItem("sales", JSON.stringify(updatedSales));

    const updatedStoreSales = updatedSales.filter(
      (s) => s.storeId === parseInt(id),
    );
    setSales(updatedStoreSales);
    calculateStatistics(updatedStoreSales);
  };

  const calculateStatistics = (storeSales) => {
    const totalSales = storeSales.length;
    const totalRevenue = storeSales.reduce(
      (sum, sale) => sum + sale.totalAmount,
      0,
    );
    const totalProfit = storeSales.reduce((sum, sale) => sum + sale.profit, 0);
    const averageCheck = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Уникальные покупатели
    const uniqueCustomers = new Set(storeSales.map((s) => s.customerName)).size;

    // Топ товаров
    const productSales = {};
    storeSales.forEach((sale) => {
      sale.products.forEach((product) => {
        if (!productSales[product.name]) {
          productSales[product.name] = {
            name: product.name,
            quantity: 0,
            revenue: 0,
            profit: 0,
            category: product.category,
          };
        }
        productSales[product.name].quantity += product.quantity;
        productSales[product.name].revenue += product.totalPrice;
        productSales[product.name].profit +=
          product.profit || product.totalPrice - product.totalCost;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Статистика по продавцам (только из списка сотрудников)
    const sellerStatsMap = {};
    storeSales.forEach((sale) => {
      if (sale.sellerId && sale.sellerName) {
        if (!sellerStatsMap[sale.sellerId]) {
          sellerStatsMap[sale.sellerId] = {
            id: sale.sellerId,
            name: sale.sellerName,
            position: sale.sellerPosition || "Продавец",
            salesCount: 0,
            totalRevenue: 0,
            totalProfit: 0,
            averageCheck: 0,
            sales: [],
          };
        }
        sellerStatsMap[sale.sellerId].salesCount++;
        sellerStatsMap[sale.sellerId].totalRevenue += sale.totalAmount;
        sellerStatsMap[sale.sellerId].totalProfit += sale.profit;
        sellerStatsMap[sale.sellerId].sales.push(sale);
      }
    });

    // Рассчитываем средний чек для каждого продавца
    Object.values(sellerStatsMap).forEach((seller) => {
      seller.averageCheck = seller.totalRevenue / seller.salesCount;
    });

    const topSellers = Object.values(sellerStatsMap)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    const sellerStats = Object.values(sellerStatsMap).sort(
      (a, b) => b.totalRevenue - a.totalRevenue,
    );

    // Стоимость остатков на складе магазина
    let stockValue = 0;
    let stockProfit = 0;
    if (store?.products) {
      store.products.forEach((product) => {
        const productCost = product.cost || product.price * 0.7;
        stockValue += product.quantity * productCost;
        stockProfit += product.quantity * (product.price - productCost);
      });
    }

    // Статистика по дням
    const dailyStats = {};
    storeSales.forEach((sale) => {
      const date = new Date(sale.date).toLocaleDateString();
      if (!dailyStats[date]) {
        dailyStats[date] = { revenue: 0, profit: 0, count: 0 };
      }
      dailyStats[date].revenue += sale.totalAmount;
      dailyStats[date].profit += sale.profit;
      dailyStats[date].count += 1;
    });

    const dailyStatsArray = Object.entries(dailyStats)
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7);

    // Статистика по месяцам
    const monthlyStats = {};
    storeSales.forEach((sale) => {
      const date = new Date(sale.date);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyStats[month]) {
        monthlyStats[month] = {
          revenue: 0,
          profit: 0,
          count: 0,
          month: date.toLocaleString("default", { month: "long" }),
        };
      }
      monthlyStats[month].revenue += sale.totalAmount;
      monthlyStats[month].profit += sale.profit;
      monthlyStats[month].count += 1;
    });

    setStatistics({
      totalSales,
      totalRevenue,
      totalProfit,
      averageCheck,
      uniqueCustomers,
      topProducts,
      topSellers,
      stockValue,
      stockProfit,
      dailyStats: dailyStatsArray,
      monthlyStats: Object.values(monthlyStats).reverse(),
      sellerStats,
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("ru-RU").format(Math.round(price)) + " ₽";
  };

  // Фильтрация продаж
  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      searchTerm === "" ||
      sale.id.toString().includes(searchTerm) ||
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPayment =
      paymentFilter === "all" || sale.paymentMethod === paymentFilter;
    const matchesSeller =
      sellerFilter === "all" ||
      (sellerFilter === "none" && !sale.sellerName) ||
      (sellerFilter !== "none" &&
        sellerFilter !== "all" &&
        sale.sellerName === sellerFilter);
    return matchesSearch && matchesPayment && matchesSeller;
  });

  if (!store) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <div className={styles.statisticsPage}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate("/stores")}>
          ← Назад к магазинам
        </button>
        <h1 className="section-title">
          Статистика магазина: <span>{store.name}</span>
        </h1>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "overview" ? styles.active : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Обзор
        </button>
        <button
          className={`${styles.tab} ${activeTab === "sales" ? styles.active : ""}`}
          onClick={() => setActiveTab("sales")}
        >
          🧾 Продажи
        </button>
        <button
          className={`${styles.tab} ${activeTab === "sellers" ? styles.active : ""}`}
          onClick={() => setActiveTab("sellers")}
        >
          👨‍💼 Продавцы
        </button>
        <button
          className={`${styles.tab} ${activeTab === "stock" ? styles.active : ""}`}
          onClick={() => setActiveTab("stock")}
        >
          📦 Остатки
        </button>
        <button
          className={`${styles.tab} ${activeTab === "analytics" ? styles.active : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          📈 Аналитика
        </button>
      </div>

      {activeTab === "overview" && (
        <div className={styles.overview}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>💰</div>
              <div className={styles.statInfo}>
                <h3>Общая выручка</h3>
                <div className={styles.statValue}>
                  {formatPrice(statistics.totalRevenue)}
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>📈</div>
              <div className={styles.statInfo}>
                <h3>Прибыль</h3>
                <div className={styles.statValue}>
                  {formatPrice(statistics.totalProfit)}
                </div>
                <div className={styles.statSub}>
                  Маржинальность:{" "}
                  {statistics.totalRevenue > 0
                    ? (
                        (statistics.totalProfit / statistics.totalRevenue) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>🧾</div>
              <div className={styles.statInfo}>
                <h3>Продажи</h3>
                <div className={styles.statValue}>{statistics.totalSales}</div>
                <div className={styles.statSub}>
                  Средний чек: {formatPrice(statistics.averageCheck)}
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statInfo}>
                <h3>Покупатели</h3>
                <div className={styles.statValue}>
                  {statistics.uniqueCustomers}
                </div>
                <div className={styles.statSub}>Уникальных клиентов</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>👨‍💼</div>
              <div className={styles.statInfo}>
                <h3>Активных продавцов</h3>
                <div className={styles.statValue}>
                  {statistics.sellerStats.length}
                </div>
                <div className={styles.statSub}>Совершали продажи</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>📦</div>
              <div className={styles.statInfo}>
                <h3>Остатки на складе</h3>
                <div className={styles.statValue}>
                  {formatPrice(statistics.stockValue)}
                </div>
                <div className={styles.statSub}>
                  Потенциальная прибыль: {formatPrice(statistics.stockProfit)}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.chartsSection}>
            <div className={styles.chartCard}>
              <h3>🏆 Топ продавцов по выручке</h3>
              <div className={styles.topSellers}>
                {statistics.topSellers.map((seller, idx) => (
                  <div key={idx} className={styles.topSellerItem}>
                    <div className={styles.sellerRank}>{idx + 1}</div>
                    <div className={styles.sellerInfo}>
                      <div className={styles.sellerName}>{seller.name}</div>
                      <div className={styles.sellerStats}>
                        {seller.position} | {seller.salesCount} продаж | Средний
                        чек: {formatPrice(seller.averageCheck)}
                      </div>
                    </div>
                    <div className={styles.sellerRevenue}>
                      {formatPrice(seller.totalRevenue)}
                    </div>
                  </div>
                ))}
                {statistics.topSellers.length === 0 && (
                  <div className={styles.emptyState}>
                    Нет данных о продавцах. Назначьте продавцов на чеки во
                    вкладке "Продажи"
                  </div>
                )}
              </div>
            </div>

            <div className={styles.chartCard}>
              <h3>Топ товаров по выручке</h3>
              <div className={styles.topProducts}>
                {statistics.topProducts.map((product, idx) => (
                  <div key={idx} className={styles.topProductItem}>
                    <div className={styles.productRank}>{idx + 1}</div>
                    <div className={styles.productInfo}>
                      <div className={styles.productName}>{product.name}</div>
                      <div className={styles.productCategory}>
                        {product.category}
                      </div>
                    </div>
                    <div className={styles.productStats}>
                      <div>{product.quantity} шт</div>
                      <div className={styles.productRevenue}>
                        {formatPrice(product.revenue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "sales" && (
        <div className={styles.salesList}>
          <div className={styles.salesFilters}>
            <input
              type="text"
              placeholder="Поиск по номеру чека или покупателю..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className={styles.filterSelect}
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="all">Все способы оплаты</option>
              <option value="Наличные">Наличные</option>
              <option value="Карта">Карта</option>
              <option value="QR-код">QR-код</option>
            </select>
            <select
              className={styles.filterSelect}
              value={sellerFilter}
              onChange={(e) => setSellerFilter(e.target.value)}
            >
              <option value="all">Все продавцы</option>
              <option value="none">Без продавца</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.name}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.salesTable}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>№ чека</th>
                  <th>Покупатель</th>
                  <th>Продавец</th>
                  <th>Товары</th>
                  <th>Сумма</th>
                  <th>Прибыль</th>
                  <th>Оплата</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className={styles.saleRow}>
                    <td>{new Date(sale.date).toLocaleString()}</td>
                    <td>#{sale.id}</td>
                    <td>{sale.customerName}</td>
                    <td
                      className={
                        sale.sellerName ? styles.hasSeller : styles.noSeller
                      }
                    >
                      {sale.sellerName || "Не назначен"}
                    </td>
                    <td>
                      {sale.products
                        .map((p) => `${p.name} x${p.quantity}`)
                        .join(", ")}
                    </td>
                    <td className={styles.amount}>
                      {formatPrice(sale.totalAmount)}
                    </td>
                    <td className={styles.profit}>
                      {formatPrice(sale.profit)}
                    </td>
                    <td>{sale.paymentMethod}</td>
                    <td>
                      {!sale.sellerName ? (
                        <button
                          className={styles.assignSellerBtn}
                          onClick={() => {
                            setSelectedSale(sale);
                            setShowAssignSellerModal(true);
                          }}
                        >
                          👤 Назначить
                        </button>
                      ) : (
                        <button
                          className={styles.removeSellerBtn}
                          onClick={() => removeSellerFromSale(sale.id)}
                          title="Снять назначение"
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredSales.length === 0 && (
                  <tr>
                    <td colSpan="9" className={styles.emptyTable}>
                      Нет продаж, соответствующих фильтрам
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "sellers" && (
        <div className={styles.sellersSection}>
          <div className={styles.sellersGrid}>
            {statistics.sellerStats.map((seller, idx) => (
              <div key={idx} className={styles.sellerCard}>
                <div className={styles.sellerCardHeader}>
                  <div className={styles.sellerAvatar}>👨‍💼</div>
                  <div className={styles.sellerCardTitle}>
                    <h3>{seller.name}</h3>
                    <div className={styles.sellerPosition}>
                      {seller.position}
                    </div>
                  </div>
                </div>

                <div className={styles.sellerMetrics}>
                  <div className={styles.metric}>
                    <div className={styles.metricValue}>
                      {seller.salesCount}
                    </div>
                    <div className={styles.metricLabel}>Продаж</div>
                  </div>
                  <div className={styles.metric}>
                    <div className={styles.metricValue}>
                      {formatPrice(seller.totalRevenue)}
                    </div>
                    <div className={styles.metricLabel}>Выручка</div>
                  </div>
                  <div className={styles.metric}>
                    <div className={styles.metricValue}>
                      {formatPrice(seller.totalProfit)}
                    </div>
                    <div className={styles.metricLabel}>Прибыль</div>
                  </div>
                  <div className={styles.metric}>
                    <div className={styles.metricValue}>
                      {formatPrice(seller.averageCheck)}
                    </div>
                    <div className={styles.metricLabel}>Средний чек</div>
                  </div>
                </div>

                <div className={styles.sellerEfficiency}>
                  <div className={styles.efficiencyBar}>
                    <div
                      className={styles.efficiencyFill}
                      style={{
                        width:
                          statistics.totalRevenue > 0
                            ? `${(seller.totalRevenue / statistics.totalRevenue) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                  <div className={styles.efficiencyPercent}>
                    {statistics.totalRevenue > 0
                      ? (
                          (seller.totalRevenue / statistics.totalRevenue) *
                          100
                        ).toFixed(1)
                      : 0}
                    % от общей выручки
                  </div>
                </div>

                <div className={styles.recentSalesList}>
                  <h4>Последние продажи</h4>
                  {seller.sales.slice(0, 3).map((sale, saleIdx) => (
                    <div key={saleIdx} className={styles.recentSaleItem}>
                      <div className={styles.saleInfo}>
                        <div className={styles.saleDate}>
                          {new Date(sale.date).toLocaleDateString()}
                        </div>
                        <div className={styles.saleCustomer}>
                          {sale.customerName}
                        </div>
                      </div>
                      <div className={styles.saleTotal}>
                        {formatPrice(sale.totalAmount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {statistics.sellerStats.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>👨‍💼</div>
                <h3>Нет данных о продавцах</h3>
                <p>
                  Назначьте продавцов на чеки во вкладке "Продажи", чтобы
                  увидеть статистику
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "stock" && (
        <div className={styles.stockSection}>
          <div className={styles.stockSummary}>
            <div className={styles.summaryCard}>
              <h3>Общая стоимость остатков</h3>
              <div className={styles.summaryValue}>
                {formatPrice(statistics.stockValue)}
              </div>
            </div>
            <div className={styles.summaryCard}>
              <h3>Потенциальная прибыль</h3>
              <div className={styles.summaryValue}>
                {formatPrice(statistics.stockProfit)}
              </div>
            </div>
          </div>

          <div className={styles.stockTable}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Товар</th>
                  <th>Количество</th>
                  <th>Цена закупки</th>
                  <th>Цена продажи</th>
                  <th>Общая стоимость</th>
                  <th>Потенциальная прибыль</th>
                </tr>
              </thead>
              <tbody>
                {store.products?.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.quantity} шт</td>
                    <td>{formatPrice(product.cost || product.price * 0.7)}</td>
                    <td>{formatPrice(product.price)}</td>
                    <td>
                      {formatPrice(
                        (product.cost || product.price * 0.7) *
                          product.quantity,
                      )}
                    </td>
                    <td className={styles.profit}>
                      {formatPrice(
                        product.quantity *
                          (product.price -
                            (product.cost || product.price * 0.7)),
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className={styles.analyticsSection}>
          <div className={styles.periodSelector}>
            <button
              className={selectedPeriod === "week" ? styles.active : ""}
              onClick={() => setSelectedPeriod("week")}
            >
              Неделя
            </button>
            <button
              className={selectedPeriod === "month" ? styles.active : ""}
              onClick={() => setSelectedPeriod("month")}
            >
              Месяц
            </button>
            <button
              className={selectedPeriod === "quarter" ? styles.active : ""}
              onClick={() => setSelectedPeriod("quarter")}
            >
              Квартал
            </button>
          </div>

          <div className={styles.analyticsGrid}>
            <div className={styles.analyticsCard}>
              <h3>Динамика продаж по дням</h3>
              <div className={styles.dailyStats}>
                {statistics.dailyStats.map((day, idx) => (
                  <div key={idx} className={styles.dailyBar}>
                    <div className={styles.dailyLabel}>{day.date}</div>
                    <div className={styles.barContainer}>
                      <div
                        className={styles.bar}
                        style={{
                          width: `${(day.revenue / Math.max(...statistics.dailyStats.map((d) => d.revenue), 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <div className={styles.dailyValue}>
                      {formatPrice(day.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.analyticsCard}>
              <h3>Месячная статистика</h3>
              {statistics.monthlyStats.map((month, idx) => (
                <div key={idx} className={styles.monthlyStat}>
                  <div className={styles.monthName}>{month.month}</div>
                  <div className={styles.monthDetails}>
                    <div>Продаж: {month.count}</div>
                    <div>Выручка: {formatPrice(month.revenue)}</div>
                    <div>Прибыль: {formatPrice(month.profit)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно назначения продавца */}
      {showAssignSellerModal && selectedSale && (
        <div
          className={styles.modal}
          onClick={() => setShowAssignSellerModal(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Назначить продавца</h2>
            <p className={styles.saleInfo}>
              Чек #{selectedSale.id} от{" "}
              {new Date(selectedSale.date).toLocaleString()}
              <br />
              Покупатель: {selectedSale.customerName}
              <br />
              Сумма: {formatPrice(selectedSale.totalAmount)}
            </p>

            <div className={styles.sellersList}>
              <h3>Выберите продавца</h3>
              {employees.map((employee) => (
                <button
                  key={employee.id}
                  className={styles.sellerSelectBtn}
                  onClick={() => assignSellerToSale(selectedSale.id, employee)}
                >
                  <div className={styles.sellerIcon}>👨‍💼</div>
                  <div className={styles.sellerDetails}>
                    <div className={styles.sellerName}>{employee.name}</div>
                    <div className={styles.sellerPosition}>
                      {employee.position}
                    </div>
                  </div>
                </button>
              ))}
              {employees.length === 0 && (
                <div className={styles.emptyState}>
                  <p>Нет доступных продавцов, привязанных к этому магазину</p>
                  <button
                    className={styles.addEmployeeBtn}
                    onClick={() => navigate("/employees")}
                  >
                    Перейти к сотрудникам
                  </button>
                </div>
              )}
            </div>

            <div className={styles.modalButtons}>
              <button onClick={() => setShowAssignSellerModal(false)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreStatisticsPage;
