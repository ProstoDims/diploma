import { useState, useEffect } from "react";
import styles from "./EmployeesPage.module.css";

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [stores, setStores] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    position: "",
    phone: "",
    email: "",
    salary: "",
    hireDate: new Date().toISOString().split("T")[0],
    assignedTo: [],
  });
  const [editingEmployee, setEditingEmployee] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedEmployees = localStorage.getItem("employees");
    if (savedEmployees) setEmployees(JSON.parse(savedEmployees));

    const savedStores = localStorage.getItem("stores");
    if (savedStores) setStores(JSON.parse(savedStores));

    const savedWarehouses = localStorage.getItem("warehouses");
    if (savedWarehouses) setWarehouses(JSON.parse(savedWarehouses));
  };

  const saveEmployees = (data) => {
    localStorage.setItem("employees", JSON.stringify(data));
    setEmployees(data);
  };

  const addEmployee = () => {
    if (!newEmployee.name || !newEmployee.position) return;
    const updated = [...employees, { ...newEmployee, id: Date.now() }];
    saveEmployees(updated);
    resetNewEmployee();
    setShowModal(false);
  };

  const editEmployee = () => {
    if (!editingEmployee) return;
    const updated = employees.map((emp) =>
      emp.id === editingEmployee.id ? editingEmployee : emp,
    );
    saveEmployees(updated);
    setShowEditModal(false);
    setEditingEmployee(null);
  };

  const openEditModal = (employee) => {
    setEditingEmployee({ ...employee });
    setShowEditModal(true);
  };

  const deleteEmployee = (id) => {
    if (confirm("Удалить сотрудника? Это действие нельзя отменить.")) {
      const updated = employees.filter((e) => e.id !== id);
      saveEmployees(updated);
    }
  };

  const resetNewEmployee = () => {
    setNewEmployee({
      name: "",
      position: "",
      phone: "",
      email: "",
      salary: "",
      hireDate: new Date().toISOString().split("T")[0],
      assignedTo: [],
    });
  };

  const openAssignModal = (employee) => {
    setSelectedEmployee(employee);
    setShowAssignModal(true);
  };

  const assignLocation = (locationId, locationType) => {
    const updatedEmployees = employees.map((emp) => {
      if (emp.id === selectedEmployee.id) {
        const alreadyAssigned = emp.assignedTo.some(
          (a) => a.id === locationId && a.type === locationType,
        );
        if (!alreadyAssigned) {
          emp.assignedTo.push({
            id: locationId,
            type: locationType,
            name:
              locationType === "store"
                ? stores.find((s) => s.id === locationId)?.name
                : warehouses.find((w) => w.id === locationId)?.name,
          });
        }
      }
      return emp;
    });
    saveEmployees(updatedEmployees);
    setShowAssignModal(false);
  };

  const removeAssignment = (employeeId, assignmentIndex) => {
    const updatedEmployees = employees.map((emp) => {
      if (emp.id === employeeId) {
        emp.assignedTo.splice(assignmentIndex, 1);
      }
      return emp;
    });
    saveEmployees(updatedEmployees);
  };

  const getPositionIcon = (position) => {
    const icons = {
      Директор: "👔",
      Менеджер: "📊",
      Продавец: "🛒",
      Кладовщик: "📦",
      Бухгалтер: "💰",
      Администратор: "👨‍💼",
    };
    return icons[position] || "👤";
  };

  const getPositionColor = (position) => {
    const colors = {
      Директор: "#ff4444",
      Менеджер: "#ff9800",
      Продавец: "#4caf50",
      Кладовщик: "#2196f3",
      Бухгалтер: "#9c27b0",
      Администратор: "#00bcd4",
    };
    return colors[position] || "#a0a0b0";
  };

  // Подсчет статистики для сотрудника
  const getEmployeeStats = (employeeId) => {
    const savedSales = localStorage.getItem("sales");
    const savedMovements = localStorage.getItem("warehouseMovements");

    let salesCount = 0;
    let salesRevenue = 0;
    let movementsCount = 0;

    if (savedSales) {
      const sales = JSON.parse(savedSales);
      const employeeSales = sales.filter((s) => s.sellerId === employeeId);
      salesCount = employeeSales.length;
      salesRevenue = employeeSales.reduce((sum, s) => sum + s.totalAmount, 0);
    }

    if (savedMovements) {
      const movements = JSON.parse(savedMovements);
      const employeeMovements = movements.filter(
        (m) => m.workerId === employeeId,
      );
      movementsCount = employeeMovements.length;
    }

    return { salesCount, salesRevenue, movementsCount };
  };

  // Фильтрация сотрудников
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.phone?.includes(searchTerm) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition =
      positionFilter === "all" || emp.position === positionFilter;
    return matchesSearch && matchesPosition;
  });

  // Уникальные должности для фильтра
  const uniquePositions = ["all", ...new Set(employees.map((e) => e.position))];

  // Экспорт в CSV
  const exportToCSV = () => {
    const headers = [
      "ФИО",
      "Должность",
      "Телефон",
      "Email",
      "Зарплата",
      "Дата найма",
      "Назначения",
    ];
    const rows = employees.map((emp) => [
      emp.name,
      emp.position,
      emp.phone || "",
      emp.email || "",
      emp.salary || "",
      emp.hireDate || "",
      emp.assignedTo?.map((a) => a.name).join(", ") || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", "employees.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalMonthlySalary = employees.reduce(
    (sum, emp) => sum + (parseInt(emp.salary) || 0),
    0,
  );

  return (
    <div className={styles.employeesPage}>
      <div className={styles.header}>
        <h1 className="section-title">
          Управление <span>сотрудниками</span>
        </h1>
        <div className={styles.headerActions}>
          <button className="cta-btn" onClick={() => setShowModal(true)}>
            + Добавить сотрудника
          </button>
          <button className={styles.exportBtn} onClick={exportToCSV}>
            📥 Экспорт
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className={styles.statsBar}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Всего сотрудников</span>
          <span className={styles.statValue}>{employees.length}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>ФОТ в месяц</span>
          <span className={styles.statValue}>
            {totalMonthlySalary.toLocaleString()} ₽
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Средняя зарплата</span>
          <span className={styles.statValue}>
            {employees.length > 0
              ? Math.round(
                  totalMonthlySalary / employees.length,
                ).toLocaleString()
              : 0}{" "}
            ₽
          </span>
        </div>
      </div>

      {/* Фильтры */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="🔍 Поиск по имени, телефону, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <select
          className={styles.filterSelect}
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
        >
          {uniquePositions.map((pos) => (
            <option key={pos} value={pos}>
              {pos === "all" ? "Все должности" : pos}
            </option>
          ))}
        </select>
        {searchTerm && (
          <button
            className={styles.clearFilter}
            onClick={() => setSearchTerm("")}
          >
            ✕ Очистить
          </button>
        )}
      </div>

      <div className={styles.employeesGrid}>
        {filteredEmployees.map((employee) => {
          const stats = getEmployeeStats(employee.id);
          return (
            <div key={employee.id} className={styles.employeeCard}>
              <div className={styles.cardHeader}>
                <div
                  className={styles.avatar}
                  style={{
                    background: `linear-gradient(135deg, ${getPositionColor(employee.position)}, ${getPositionColor(employee.position)}80)`,
                  }}
                >
                  {getPositionIcon(employee.position)}
                </div>
                <div className={styles.cardActions}>
                  <button
                    className={styles.editBtn}
                    onClick={() => openEditModal(employee)}
                    title="Редактировать"
                  >
                    ✏️
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => deleteEmployee(employee.id)}
                    title="Удалить"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <h3>{employee.name}</h3>
              <div
                className={styles.position}
                style={{ color: getPositionColor(employee.position) }}
              >
                {employee.position}
              </div>

              {/* KPI сотрудника */}
              <div className={styles.kpiGrid}>
                <div className={styles.kpiItem}>
                  <div className={styles.kpiValue}>{stats.salesCount}</div>
                  <div className={styles.kpiLabel}>Продаж</div>
                </div>
                <div className={styles.kpiItem}>
                  <div className={styles.kpiValue}>
                    {stats.salesRevenue.toLocaleString()} ₽
                  </div>
                  <div className={styles.kpiLabel}>Выручка</div>
                </div>
                <div className={styles.kpiItem}>
                  <div className={styles.kpiValue}>{stats.movementsCount}</div>
                  <div className={styles.kpiLabel}>Операций</div>
                </div>
              </div>

              <div className={styles.contactInfo}>
                {employee.phone && <p>📞 {employee.phone}</p>}
                {employee.email && <p>✉️ {employee.email}</p>}
                {employee.salary && (
                  <p>💰 {Number(employee.salary).toLocaleString()} ₽</p>
                )}
                {employee.hireDate && <p>📅 с {employee.hireDate}</p>}
              </div>

              <div className={styles.assignmentsSection}>
                <div className={styles.assignmentsHeader}>
                  <span>
                    🏢 Назначения ({employee.assignedTo?.length || 0})
                  </span>
                  <button
                    className={styles.assignBtn}
                    onClick={() => openAssignModal(employee)}
                  >
                    + Назначить
                  </button>
                </div>

                <div className={styles.assignmentsList}>
                  {employee.assignedTo?.map((assignment, idx) => (
                    <div key={idx} className={styles.assignmentItem}>
                      <span>
                        {assignment.type === "store" ? "🏬" : "🏪"}{" "}
                        {assignment.name}
                      </span>
                      <button
                        className={styles.removeAssignBtn}
                        onClick={() => removeAssignment(employee.id, idx)}
                        title="Удалить назначение"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {(!employee.assignedTo ||
                    employee.assignedTo.length === 0) && (
                    <p className={styles.emptyAssignments}>Нет назначений</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEmployees.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>👥</div>
          <h3>Сотрудники не найдены</h3>
          <p>
            Попробуйте изменить параметры поиска или добавьте нового сотрудника
          </p>
          <button className="cta-btn" onClick={() => setShowModal(true)}>
            + Добавить сотрудника
          </button>
        </div>
      )}

      {/* Модальное окно добавления сотрудника */}
      {showModal && (
        <div className={styles.modal} onClick={() => setShowModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Добавить сотрудника</h2>
            <input
              type="text"
              placeholder="ФИО сотрудника *"
              value={newEmployee.name}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, name: e.target.value })
              }
            />
            <select
              value={newEmployee.position}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, position: e.target.value })
              }
            >
              <option value="">Выберите должность *</option>
              <option value="Директор">Директор</option>
              <option value="Менеджер">Менеджер</option>
              <option value="Продавец">Продавец</option>
              <option value="Кладовщик">Кладовщик</option>
              <option value="Бухгалтер">Бухгалтер</option>
              <option value="Администратор">Администратор</option>
            </select>
            <input
              type="text"
              placeholder="Телефон"
              value={newEmployee.phone}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, phone: e.target.value })
              }
            />
            <input
              type="email"
              placeholder="Email"
              value={newEmployee.email}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, email: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Зарплата"
              value={newEmployee.salary}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, salary: e.target.value })
              }
            />
            <input
              type="date"
              placeholder="Дата найма"
              value={newEmployee.hireDate}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, hireDate: e.target.value })
              }
            />
            <div className={styles.modalButtons}>
              <button onClick={() => setShowModal(false)}>Отмена</button>
              <button className="cta-btn" onClick={addEmployee}>
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования сотрудника */}
      {showEditModal && editingEmployee && (
        <div className={styles.modal} onClick={() => setShowEditModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Редактировать сотрудника</h2>
            <input
              type="text"
              placeholder="ФИО сотрудника *"
              value={editingEmployee.name}
              onChange={(e) =>
                setEditingEmployee({ ...editingEmployee, name: e.target.value })
              }
            />
            <select
              value={editingEmployee.position}
              onChange={(e) =>
                setEditingEmployee({
                  ...editingEmployee,
                  position: e.target.value,
                })
              }
            >
              <option value="">Выберите должность *</option>
              <option value="Директор">Директор</option>
              <option value="Менеджер">Менеджер</option>
              <option value="Продавец">Продавец</option>
              <option value="Кладовщик">Кладовщик</option>
              <option value="Бухгалтер">Бухгалтер</option>
              <option value="Администратор">Администратор</option>
            </select>
            <input
              type="text"
              placeholder="Телефон"
              value={editingEmployee.phone || ""}
              onChange={(e) =>
                setEditingEmployee({
                  ...editingEmployee,
                  phone: e.target.value,
                })
              }
            />
            <input
              type="email"
              placeholder="Email"
              value={editingEmployee.email || ""}
              onChange={(e) =>
                setEditingEmployee({
                  ...editingEmployee,
                  email: e.target.value,
                })
              }
            />
            <input
              type="number"
              placeholder="Зарплата"
              value={editingEmployee.salary || ""}
              onChange={(e) =>
                setEditingEmployee({
                  ...editingEmployee,
                  salary: e.target.value,
                })
              }
            />
            <input
              type="date"
              placeholder="Дата найма"
              value={editingEmployee.hireDate || ""}
              onChange={(e) =>
                setEditingEmployee({
                  ...editingEmployee,
                  hireDate: e.target.value,
                })
              }
            />
            <div className={styles.modalButtons}>
              <button onClick={() => setShowEditModal(false)}>Отмена</button>
              <button className="cta-btn" onClick={editEmployee}>
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно назначения на объект */}
      {showAssignModal && (
        <div className={styles.modal} onClick={() => setShowAssignModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Назначить {selectedEmployee?.name}</h2>
            {stores.length > 0 && (
              <>
                <h3>Магазины</h3>
                <div className={styles.locationsList}>
                  {stores.map((store) => {
                    const isAssigned = selectedEmployee?.assignedTo?.some(
                      (a) => a.id === store.id && a.type === "store",
                    );
                    return (
                      <button
                        key={store.id}
                        className={`${styles.locationBtn} ${isAssigned ? styles.assigned : ""}`}
                        onClick={() => assignLocation(store.id, "store")}
                        disabled={isAssigned}
                      >
                        🏬 {store.name}
                        {isAssigned && (
                          <span className={styles.assignedBadge}>✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            {warehouses.length > 0 && (
              <>
                <h3>Склады</h3>
                <div className={styles.locationsList}>
                  {warehouses.map((warehouse) => {
                    const isAssigned = selectedEmployee?.assignedTo?.some(
                      (a) => a.id === warehouse.id && a.type === "warehouse",
                    );
                    return (
                      <button
                        key={warehouse.id}
                        className={`${styles.locationBtn} ${isAssigned ? styles.assigned : ""}`}
                        onClick={() =>
                          assignLocation(warehouse.id, "warehouse")
                        }
                        disabled={isAssigned}
                      >
                        🏪 {warehouse.name}
                        {isAssigned && (
                          <span className={styles.assignedBadge}>✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            {stores.length === 0 && warehouses.length === 0 && (
              <p className={styles.emptyState}>
                Нет доступных магазинов или складов
              </p>
            )}
            <div className={styles.modalButtons}>
              <button onClick={() => setShowAssignModal(false)}>Закрыть</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;
