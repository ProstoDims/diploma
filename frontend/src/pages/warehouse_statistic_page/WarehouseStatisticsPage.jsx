import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./WarehouseStatisticsPage.module.css";

const WarehouseStatisticsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [movements, setMovements] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showAssignWorkerModal, setShowAssignWorkerModal] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [statistics, setStatistics] = useState({
    totalStockValue: 0,
    totalItems: 0,
    uniqueProducts: 0,
    averageTurnover: 0,
    topProducts: [],
    slowMovingProducts: [],
    outOfStock: [],
    lowStock: [],
    incomingLastMonth: 0,
    outgoingLastMonth: 0,
    writeOffs: 0,
    occupancyRate: 0,
    turnoverRate: 0,
    topWorkers: [],
    workerStats: [],
    monthlyStats: [],
  });
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadAllData();
  }, [id]);

  const loadAllData = () => {
    loadWarehouseData();
    loadEmployees();
    loadMovements();
  };

  const loadWarehouseData = () => {
    const savedWarehouses = localStorage.getItem("warehouses");
    if (savedWarehouses) {
      const warehouses = JSON.parse(savedWarehouses);
      const foundWarehouse = warehouses.find((w) => w.id === parseInt(id));
      setWarehouse(foundWarehouse);

      if (foundWarehouse) {
        if (!foundWarehouse.products || foundWarehouse.products.length === 0) {
          generateTestProducts(foundWarehouse);
        } else {
          setInventory(foundWarehouse.products);
        }
      }
    }
  };

  const generateTestProducts = (warehouseData) => {
    const testProducts = [
      {
        id: 1,
        name: "iPhone 15 Pro",
        price: 99900,
        cost: 75000,
        quantity: 45,
        category: "Смартфоны",
      },
      {
        id: 2,
        name: "Samsung Galaxy S24",
        price: 89900,
        cost: 68000,
        quantity: 32,
        category: "Смартфоны",
      },
      {
        id: 3,
        name: "Xiaomi 13T Pro",
        price: 59900,
        cost: 45000,
        quantity: 58,
        category: "Смартфоны",
      },
      {
        id: 4,
        name: "MacBook Air M2",
        price: 119900,
        cost: 95000,
        quantity: 12,
        category: "Ноутбуки",
      },
      {
        id: 5,
        name: "AirPods Pro",
        price: 24900,
        cost: 18000,
        quantity: 120,
        category: "Аксессуары",
      },
      {
        id: 6,
        name: "iPad Air",
        price: 69900,
        cost: 52000,
        quantity: 30,
        category: "Планшеты",
      },
      {
        id: 7,
        name: "Apple Watch Series 9",
        price: 39900,
        cost: 28000,
        quantity: 65,
        category: "Аксессуары",
      },
      {
        id: 8,
        name: "PlayStation 5",
        price: 69900,
        cost: 55000,
        quantity: 22,
        category: "Игры",
      },
      {
        id: 9,
        name: "RTX 4090",
        price: 199900,
        cost: 170000,
        quantity: 0,
        category: "Комплектующие",
      },
      {
        id: 10,
        name: "Samsung 990 Pro 2TB",
        price: 18900,
        cost: 14000,
        quantity: 0,
        category: "Комплектующие",
      },
    ];

    const updatedWarehouse = { ...warehouseData, products: testProducts };
    const savedWarehouses = localStorage.getItem("warehouses");
    if (savedWarehouses) {
      const warehouses = JSON.parse(savedWarehouses);
      const updatedWarehouses = warehouses.map((w) =>
        w.id === warehouseData.id ? updatedWarehouse : w,
      );
      localStorage.setItem("warehouses", JSON.stringify(updatedWarehouses));
    }
    setInventory(testProducts);
  };

  const loadEmployees = () => {
    const savedEmployees = localStorage.getItem("employees");
    if (savedEmployees) {
      const allEmployees = JSON.parse(savedEmployees);
      // Фильтруем сотрудников, привязанных к этому складу
      const warehouseWorkers = allEmployees.filter((emp) => {
        const isAssignedToWarehouse = emp.assignedTo?.some(
          (assignment) =>
            assignment.id === parseInt(id) && assignment.type === "warehouse",
        );
        return isAssignedToWarehouse;
      });
      setEmployees(warehouseWorkers);
    }
  };

  const loadMovements = () => {
    const savedMovements = localStorage.getItem("warehouseMovements");
    let allMovements = savedMovements ? JSON.parse(savedMovements) : [];

    let warehouseMovements = allMovements.filter(
      (m) => m.warehouseId === parseInt(id),
    );

    if (warehouseMovements.length === 0 && inventory.length > 0) {
      warehouseMovements = generateTestMovements();
    }

    setMovements(warehouseMovements);
    calculateStatistics(warehouseMovements);
  };

  const generateTestMovements = () => {
    const testMovements = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    const movementTypes = ["incoming", "outgoing", "writeoff"];
    const reasons = {
      incoming: [
        "Поставка от поставщика",
        "Возврат от магазина",
        "Новая партия",
      ],
      outgoing: [
        "Отгрузка в магазин",
        "Перемещение на другой склад",
        "Выдача сотруднику",
      ],
      writeoff: ["Испорченный товар", "Истекший срок", "Брак"],
    };

    let movementId = Date.now();

    // Генерируем движения без привязки к сотрудникам
    for (let i = 0; i < 50; i++) {
      const movementDate = new Date(startDate);
      movementDate.setDate(
        startDate.getDate() + Math.floor(Math.random() * 90),
      );
      const product = inventory[Math.floor(Math.random() * inventory.length)];
      if (!product) continue;

      const type =
        movementTypes[Math.floor(Math.random() * movementTypes.length)];
      let quantity = Math.floor(Math.random() * 30) + 1;

      if (type === "writeoff") quantity = Math.min(quantity, 5);
      if (type === "outgoing")
        quantity = Math.min(quantity, product.quantity || 100);

      testMovements.push({
        id: movementId++,
        warehouseId: parseInt(id),
        productId: product.id,
        productName: product.name,
        type: type,
        quantity: quantity,
        date: movementDate.toISOString(),
        reason: reasons[type][Math.floor(Math.random() * reasons[type].length)],
        workerId: null,
        workerName: null,
        workerPosition: null,
        documentNumber: `${type === "incoming" ? "IN" : type === "outgoing" ? "OUT" : "WO"}-${String(i + 1).padStart(6, "0")}`,
      });
    }

    testMovements.sort((a, b) => new Date(b.date) - new Date(a.date));

    const savedMovements = localStorage.getItem("warehouseMovements");
    let allMovements = savedMovements ? JSON.parse(savedMovements) : [];
    allMovements = [...allMovements, ...testMovements];
    localStorage.setItem("warehouseMovements", JSON.stringify(allMovements));

    return testMovements;
  };

  const assignWorkerToMovement = (movementId, worker) => {
    const savedMovements = localStorage.getItem("warehouseMovements");
    let allMovements = savedMovements ? JSON.parse(savedMovements) : [];

    const updatedMovements = allMovements.map((movement) => {
      if (movement.id === movementId) {
        return {
          ...movement,
          workerId: worker.id,
          workerName: worker.name,
          workerPosition: worker.position,
        };
      }
      return movement;
    });

    localStorage.setItem(
      "warehouseMovements",
      JSON.stringify(updatedMovements),
    );

    // Обновляем текущие движения
    const updatedWarehouseMovements = updatedMovements.filter(
      (m) => m.warehouseId === parseInt(id),
    );
    setMovements(updatedWarehouseMovements);
    calculateStatistics(updatedWarehouseMovements);
    setShowAssignWorkerModal(false);
    setSelectedMovement(null);
  };

  const removeWorkerFromMovement = (movementId) => {
    const savedMovements = localStorage.getItem("warehouseMovements");
    let allMovements = savedMovements ? JSON.parse(savedMovements) : [];

    const updatedMovements = allMovements.map((movement) => {
      if (movement.id === movementId) {
        const { workerId, workerName, workerPosition, ...rest } = movement;
        return rest;
      }
      return movement;
    });

    localStorage.setItem(
      "warehouseMovements",
      JSON.stringify(updatedMovements),
    );

    const updatedWarehouseMovements = updatedMovements.filter(
      (m) => m.warehouseId === parseInt(id),
    );
    setMovements(updatedWarehouseMovements);
    calculateStatistics(updatedWarehouseMovements);
  };

  const calculateStatistics = (movementsData) => {
    const totalStockValue = inventory.reduce((sum, product) => {
      const cost = product.cost || product.price * 0.7;
      return sum + product.quantity * cost;
    }, 0);

    const totalItems = inventory.reduce(
      (sum, product) => sum + product.quantity,
      0,
    );
    const uniqueProducts = inventory.length;

    const topProducts = [...inventory]
      .filter((p) => p.quantity > 0)
      .sort(
        (a, b) =>
          b.quantity * (b.cost || b.price * 0.7) -
          a.quantity * (a.cost || a.price * 0.7),
      )
      .slice(0, 5)
      .map((p) => ({
        ...p,
        totalValue: p.quantity * (p.cost || p.price * 0.7),
      }));

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const slowMovingProducts = inventory
      .filter((product) => {
        const lastMovement = movementsData
          .filter((m) => m.productId === product.id)
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        return (
          product.quantity > 0 &&
          (!lastMovement || new Date(lastMovement.date) < thirtyDaysAgo)
        );
      })
      .slice(0, 5);

    const outOfStock = inventory.filter((p) => p.quantity === 0);
    const lowStock = inventory.filter((p) => p.quantity > 0 && p.quantity < 10);

    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

    const recentMovements = movementsData.filter(
      (m) => new Date(m.date) > oneMonthAgo,
    );
    const incomingLastMonth = recentMovements
      .filter((m) => m.type === "incoming")
      .reduce((sum, m) => sum + m.quantity, 0);
    const outgoingLastMonth = recentMovements
      .filter((m) => m.type === "outgoing")
      .reduce((sum, m) => sum + m.quantity, 0);
    const writeOffs = recentMovements
      .filter((m) => m.type === "writeoff")
      .reduce((sum, m) => sum + m.quantity, 0);

    const turnoverRate =
      totalItems > 0 ? (outgoingLastMonth / (totalItems / 30)) * 100 : 0;

    // Статистика по сотрудникам
    const workerStatsMap = {};
    movementsData.forEach((movement) => {
      if (movement.workerName) {
        if (!workerStatsMap[movement.workerName]) {
          workerStatsMap[movement.workerName] = {
            name: movement.workerName,
            position: movement.workerPosition || "Кладовщик",
            incomingCount: 0,
            outgoingCount: 0,
            writeoffCount: 0,
            totalOperations: 0,
            totalItems: 0,
          };
        }
        workerStatsMap[movement.workerName].totalOperations++;
        workerStatsMap[movement.workerName].totalItems += movement.quantity;
        if (movement.type === "incoming") {
          workerStatsMap[movement.workerName].incomingCount +=
            movement.quantity;
        } else if (movement.type === "outgoing") {
          workerStatsMap[movement.workerName].outgoingCount +=
            movement.quantity;
        } else if (movement.type === "writeoff") {
          workerStatsMap[movement.workerName].writeoffCount +=
            movement.quantity;
        }
      }
    });

    const workerStats = Object.values(workerStatsMap).sort(
      (a, b) => b.totalOperations - a.totalOperations,
    );
    const topWorkers = workerStats.slice(0, 3);

    const monthlyStats = {};
    movementsData.forEach((movement) => {
      const date = new Date(movement.date);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyStats[month]) {
        monthlyStats[month] = {
          month: date.toLocaleString("default", {
            month: "long",
            year: "numeric",
          }),
          incoming: 0,
          outgoing: 0,
          writeoff: 0,
        };
      }
      monthlyStats[month][movement.type] += movement.quantity;
    });

    setStatistics({
      totalStockValue,
      totalItems,
      uniqueProducts,
      averageTurnover: turnoverRate,
      topProducts,
      slowMovingProducts,
      outOfStock,
      lowStock,
      incomingLastMonth,
      outgoingLastMonth,
      writeOffs,
      occupancyRate: Math.min((totalItems / 2000) * 100, 100),
      turnoverRate,
      topWorkers,
      workerStats,
      monthlyStats: Object.values(monthlyStats).reverse(),
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("ru-RU").format(Math.round(price)) + " ₽";
  };

  if (!warehouse) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <div className={styles.statisticsPage}>
      <div className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => navigate("/warehouses")}
        >
          ← Назад к складам
        </button>
        <h1 className="section-title">
          Статистика склада: <span>{warehouse.name}</span>
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
          className={`${styles.tab} ${activeTab === "inventory" ? styles.active : ""}`}
          onClick={() => setActiveTab("inventory")}
        >
          📦 Товары ({inventory.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "movements" ? styles.active : ""}`}
          onClick={() => setActiveTab("movements")}
        >
          🚚 Движение ({movements.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "workers" ? styles.active : ""}`}
          onClick={() => setActiveTab("workers")}
        >
          👷 Сотрудники ({statistics.workerStats.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "analytics" ? styles.active : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          📈 Аналитика
        </button>
      </div>

      {/* Остальные вкладки (overview, inventory, workers, analytics) остаются без изменений */}
      {activeTab === "overview" && (
        <div className={styles.overview}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>💰</div>
              <div className={styles.statInfo}>
                <h3>Общая стоимость</h3>
                <div className={styles.statValue}>
                  {formatPrice(statistics.totalStockValue)}
                </div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📦</div>
              <div className={styles.statInfo}>
                <h3>Всего товаров</h3>
                <div className={styles.statValue}>{statistics.totalItems}</div>
                <div className={styles.statSub}>
                  {statistics.uniqueProducts} уникальных
                </div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🔄</div>
              <div className={styles.statInfo}>
                <h3>Оборачиваемость</h3>
                <div className={styles.statValue}>
                  {statistics.turnoverRate.toFixed(1)}%
                </div>
                <div className={styles.statSub}>за последние 30 дней</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📊</div>
              <div className={styles.statInfo}>
                <h3>Загруженность</h3>
                <div className={styles.statValue}>
                  {statistics.occupancyRate.toFixed(1)}%
                </div>
                <div className={styles.statSub}>
                  от максимальной вместимости
                </div>
              </div>
            </div>
          </div>

          <div className={styles.warningsGrid}>
            {statistics.outOfStock.length > 0 && (
              <div className={styles.warningCard}>
                <div className={styles.warningIcon}>⚠️</div>
                <div className={styles.warningInfo}>
                  <h3>Товары с нулевым остатком</h3>
                  <p>
                    {statistics.outOfStock.length} товаров отсутствуют на складе
                  </p>
                </div>
              </div>
            )}
            {statistics.lowStock.length > 0 && (
              <div className={styles.warningCard}>
                <div className={styles.warningIcon}>📉</div>
                <div className={styles.warningInfo}>
                  <h3>Низкий остаток</h3>
                  <p>{statistics.lowStock.length} товаров требуют пополнения</p>
                </div>
              </div>
            )}
            {statistics.slowMovingProducts.length > 0 && (
              <div className={styles.warningCard}>
                <div className={styles.warningIcon}>🐌</div>
                <div className={styles.warningInfo}>
                  <h3>Залежавшиеся товары</h3>
                  <p>Более 30 дней без движений</p>
                </div>
              </div>
            )}
          </div>

          <div className={styles.chartsSection}>
            <div className={styles.chartCard}>
              <h3>🏆 Топ товаров по стоимости</h3>
              {statistics.topProducts.map((product, idx) => (
                <div key={idx} className={styles.topProductItem}>
                  <div className={styles.productRank}>{idx + 1}</div>
                  <div className={styles.productInfo}>
                    <div className={styles.productName}>{product.name}</div>
                    <div className={styles.productStats}>
                      {product.quantity} шт ×{" "}
                      {formatPrice(product.cost || product.price * 0.7)}
                    </div>
                  </div>
                  <div className={styles.productValue}>
                    {formatPrice(product.totalValue)}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.chartCard}>
              <h3>👷 Лучшие сотрудники склада</h3>
              {statistics.topWorkers.map((worker, idx) => (
                <div key={idx} className={styles.topWorkerItem}>
                  <div className={styles.workerRank}>{idx + 1}</div>
                  <div className={styles.workerInfo}>
                    <div className={styles.workerName}>{worker.name}</div>
                    <div className={styles.workerStats}>
                      {worker.position} | 📥 {worker.incomingCount} | 📤{" "}
                      {worker.outgoingCount}
                    </div>
                  </div>
                  <div className={styles.workerOperations}>
                    {worker.totalOperations} опер.
                  </div>
                </div>
              ))}
              {statistics.topWorkers.length === 0 && (
                <div className={styles.emptyState}>
                  <p>Нет данных о сотрудниках склада</p>
                  <button
                    className={styles.linkBtn}
                    onClick={() => navigate("/employees")}
                  >
                    Назначить сотрудников
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "inventory" && (
        <div className={styles.inventorySection}>
          <div className={styles.inventoryTable}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Товар</th>
                  <th>Категория</th>
                  <th>Количество</th>
                  <th>Цена закупки</th>
                  <th>Цена продажи</th>
                  <th>Общая стоимость</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((product) => (
                  <tr key={product.id}>
                    <td className={styles.productName}>{product.name}</td>
                    <td>{product.category || "Без категории"}</td>
                    <td
                      className={
                        product.quantity === 0
                          ? styles.zeroStock
                          : styles.normalStock
                      }
                    >
                      {product.quantity} шт
                    </td>
                    <td>{formatPrice(product.cost || product.price * 0.7)}</td>
                    <td>{formatPrice(product.price)}</td>
                    <td>
                      {formatPrice(
                        (product.cost || product.price * 0.7) *
                          product.quantity,
                      )}
                    </td>
                    <td>
                      {product.quantity === 0 && (
                        <span className={styles.badgeDanger}>
                          Нет в наличии
                        </span>
                      )}
                      {product.quantity > 0 && product.quantity < 10 && (
                        <span className={styles.badgeWarning}>Мало</span>
                      )}
                      {product.quantity >= 10 && (
                        <span className={styles.badgeSuccess}>В наличии</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "movements" && (
        <div className={styles.movementsSection}>
          <div className={styles.movementsSummary}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>📥</div>
              <div className={styles.summaryInfo}>
                <h3>Поступления</h3>
                <div className={styles.summaryValue}>
                  {statistics.incomingLastMonth} шт
                </div>
                <div className={styles.summarySub}>за 30 дней</div>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>📤</div>
              <div className={styles.summaryInfo}>
                <h3>Отгрузки</h3>
                <div className={styles.summaryValue}>
                  {statistics.outgoingLastMonth} шт
                </div>
                <div className={styles.summarySub}>за 30 дней</div>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>🗑️</div>
              <div className={styles.summaryInfo}>
                <h3>Списания</h3>
                <div className={styles.summaryValue}>
                  {statistics.writeOffs} шт
                </div>
                <div className={styles.summarySub}>за 30 дней</div>
              </div>
            </div>
          </div>

          <div className={styles.movementsTable}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Документ</th>
                  <th>Товар</th>
                  <th>Тип</th>
                  <th>Количество</th>
                  <th>Причина</th>
                  <th>Сотрудник</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {movements.slice(0, 50).map((movement) => (
                  <tr key={movement.id}>
                    <td>{new Date(movement.date).toLocaleDateString()}</td>
                    <td>{movement.documentNumber}</td>
                    <td>{movement.productName}</td>
                    <td>
                      <span
                        className={
                          movement.type === "incoming"
                            ? styles.typeIncoming
                            : movement.type === "outgoing"
                              ? styles.typeOutgoing
                              : styles.typeWriteoff
                        }
                      >
                        {movement.type === "incoming"
                          ? "📥 Поступление"
                          : movement.type === "outgoing"
                            ? "📤 Отгрузка"
                            : "🗑️ Списание"}
                      </span>
                    </td>
                    <td
                      className={
                        movement.type === "incoming"
                          ? styles.positive
                          : styles.negative
                      }
                    >
                      {movement.type === "incoming" ? "+" : "-"}
                      {movement.quantity} шт
                    </td>
                    <td>{movement.reason}</td>
                    <td
                      className={
                        movement.workerName ? styles.hasWorker : styles.noWorker
                      }
                    >
                      {movement.workerName || "Не назначен"}
                    </td>
                    <td>
                      {!movement.workerName ? (
                        <button
                          className={styles.assignWorkerBtn}
                          onClick={() => {
                            setSelectedMovement(movement);
                            setShowAssignWorkerModal(true);
                          }}
                        >
                          👤 Назначить
                        </button>
                      ) : (
                        <button
                          className={styles.removeWorkerBtn}
                          onClick={() => removeWorkerFromMovement(movement.id)}
                          title="Снять назначение"
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "workers" && (
        <div className={styles.workersSection}>
          <div className={styles.workersGrid}>
            {statistics.workerStats.map((worker, idx) => (
              <div key={idx} className={styles.workerCard}>
                <div className={styles.workerHeader}>
                  <div className={styles.workerAvatar}>👷</div>
                  <div className={styles.workerTitle}>
                    <h3>{worker.name}</h3>
                    <div className={styles.workerPosition}>
                      {worker.position}
                    </div>
                  </div>
                </div>
                <div className={styles.workerMetrics}>
                  <div className={styles.metric}>
                    <div className={styles.metricValue}>
                      {worker.totalOperations}
                    </div>
                    <div className={styles.metricLabel}>Операций</div>
                  </div>
                  <div className={styles.metric}>
                    <div className={styles.metricValue}>
                      {worker.totalItems}
                    </div>
                    <div className={styles.metricLabel}>Единиц товара</div>
                  </div>
                </div>
                <div className={styles.workerBreakdown}>
                  <div className={styles.breakdownItem}>
                    <span>📥 Поступления</span>
                    <span className={styles.breakdownValue}>
                      {worker.incomingCount} шт
                    </span>
                  </div>
                  <div className={styles.breakdownItem}>
                    <span>📤 Отгрузки</span>
                    <span className={styles.breakdownValue}>
                      {worker.outgoingCount} шт
                    </span>
                  </div>
                  {worker.writeoffCount > 0 && (
                    <div className={styles.breakdownItem}>
                      <span>🗑️ Списания</span>
                      <span className={styles.breakdownValue}>
                        {worker.writeoffCount} шт
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {statistics.workerStats.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>👷</div>
                <h3>Нет данных о сотрудниках</h3>
                <p>
                  Назначьте сотрудников на этот склад на странице "Сотрудники"
                </p>
                <button
                  className={styles.linkBtn}
                  onClick={() => navigate("/employees")}
                >
                  Перейти к сотрудникам
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className={styles.analyticsSection}>
          <div className={styles.analyticsGrid}>
            <div className={styles.analyticsCard}>
              <h3>Динамика движения товаров по месяцам</h3>
              {statistics.monthlyStats.map((month, idx) => (
                <div key={idx} className={styles.monthlyStats}>
                  <div className={styles.monthName}>{month.month}</div>
                  <div className={styles.monthBars}>
                    <div className={styles.barLabel}>📥</div>
                    <div className={styles.barContainer}>
                      <div
                        className={styles.barIncoming}
                        style={{
                          width: `${(month.incoming / Math.max(...statistics.monthlyStats.map((m) => m.incoming), 1)) * 100}%`,
                        }}
                      >
                        {month.incoming} шт
                      </div>
                    </div>
                  </div>
                  <div className={styles.monthBars}>
                    <div className={styles.barLabel}>📤</div>
                    <div className={styles.barContainer}>
                      <div
                        className={styles.barOutgoing}
                        style={{
                          width: `${(month.outgoing / Math.max(...statistics.monthlyStats.map((m) => m.outgoing), 1)) * 100}%`,
                        }}
                      >
                        {month.outgoing} шт
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.analyticsCard}>
              <h3>Рекомендации по пополнению</h3>
              {statistics.lowStock.map((product, idx) => (
                <div key={idx} className={styles.recommendationItem}>
                  <div className={styles.recommendationProduct}>
                    {product.name}
                  </div>
                  <div className={styles.recommendationDetails}>
                    Остаток: {product.quantity} шт
                    <button className={styles.orderBtn}>Заказать</button>
                  </div>
                </div>
              ))}
              {statistics.lowStock.length === 0 && (
                <div className={styles.noRecommendations}>
                  ✅ Все товары в достаточном количестве
                </div>
              )}
              <h3 style={{ marginTop: "2rem" }}>📊 Инсайты</h3>
              <div className={styles.insightsList}>
                <div className={styles.insightItem}>
                  💡 Самая высокая оборачиваемость у товаров категории
                  "Аксессуары"
                </div>
                <div className={styles.insightItem}>
                  💡 Рекомендуется увеличить запас смартфонов перед праздниками
                </div>
                <div className={styles.insightItem}>
                  💡 Товары категории "Дроны" имеют низкую оборачиваемость
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно назначения сотрудника */}
      {showAssignWorkerModal && selectedMovement && (
        <div
          className={styles.modal}
          onClick={() => setShowAssignWorkerModal(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Назначить сотрудника</h2>
            <p className={styles.movementInfo}>
              Документ: {selectedMovement.documentNumber}
              <br />
              Товар: {selectedMovement.productName}
              <br />
              Тип:{" "}
              {selectedMovement.type === "incoming"
                ? "Поступление"
                : selectedMovement.type === "outgoing"
                  ? "Отгрузка"
                  : "Списание"}
              <br />
              Количество: {selectedMovement.quantity} шт
            </p>

            <div className={styles.workersList}>
              <h3>Выберите сотрудника</h3>
              {employees.map((employee) => (
                <button
                  key={employee.id}
                  className={styles.workerSelectBtn}
                  onClick={() =>
                    assignWorkerToMovement(selectedMovement.id, employee)
                  }
                >
                  <div className={styles.workerIcon}>👷</div>
                  <div className={styles.workerDetails}>
                    <div className={styles.workerName}>{employee.name}</div>
                    <div className={styles.workerPosition}>
                      {employee.position}
                    </div>
                  </div>
                </button>
              ))}
              {employees.length === 0 && (
                <div className={styles.emptyState}>
                  <p>Нет доступных сотрудников, привязанных к этому складу</p>
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
              <button onClick={() => setShowAssignWorkerModal(false)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseStatisticsPage;
