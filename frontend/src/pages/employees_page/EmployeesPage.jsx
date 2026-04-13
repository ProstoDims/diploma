import { useState, useEffect } from "react";
import styles from "./EmployeesPage.module.css";

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [stores, setStores] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    position: "",
    phone: "",
    email: "",
    salary: "",
    hireDate: new Date().toISOString().split("T")[0],
    assignedTo: [],
  });

  useEffect(() => {
    // Загрузка сотрудников
    const savedEmployees = localStorage.getItem("employees");
    if (savedEmployees) setEmployees(JSON.parse(savedEmployees));

    // Загрузка магазинов и складов для назначения
    const savedStores = localStorage.getItem("stores");
    if (savedStores) setStores(JSON.parse(savedStores));

    const savedWarehouses = localStorage.getItem("warehouses");
    if (savedWarehouses) setWarehouses(JSON.parse(savedWarehouses));
  }, []);

  const saveEmployees = (data) => {
    localStorage.setItem("employees", JSON.stringify(data));
    setEmployees(data);
  };

  const addEmployee = () => {
    if (!newEmployee.name || !newEmployee.position) return;
    const updated = [...employees, { ...newEmployee, id: Date.now() }];
    saveEmployees(updated);
    setNewEmployee({
      name: "",
      position: "",
      phone: "",
      email: "",
      salary: "",
      hireDate: new Date().toISOString().split("T")[0],
      assignedTo: [],
    });
    setShowModal(false);
  };

  const deleteEmployee = (id) => {
    if (confirm("Удалить сотрудника?")) {
      const updated = employees.filter((e) => e.id !== id);
      saveEmployees(updated);
    }
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

  return (
    <div className={styles.employeesPage}>
      <div className={styles.header}>
        <h1 className="section-title">
          Управление <span>сотрудниками</span>
        </h1>
        <button className="cta-btn" onClick={() => setShowModal(true)}>
          + Добавить сотрудника
        </button>
      </div>

      <div className={styles.employeesGrid}>
        {employees.map((employee) => (
          <div key={employee.id} className={styles.employeeCard}>
            <div className={styles.cardHeader}>
              <div className={styles.avatar}>
                {getPositionIcon(employee.position)}
              </div>
              <button
                className={styles.deleteBtn}
                onClick={() => deleteEmployee(employee.id)}
              >
                🗑️
              </button>
            </div>

            <h3>{employee.name}</h3>
            <div className={styles.position}>{employee.position}</div>

            <div className={styles.contactInfo}>
              {employee.phone && <p>📞 {employee.phone}</p>}
              {employee.email && <p>✉️ {employee.email}</p>}
              {employee.salary && <p>💰 {employee.salary} ₽</p>}
              {employee.hireDate && <p>📅 с {employee.hireDate}</p>}
            </div>

            <div className={styles.assignmentsSection}>
              <div className={styles.assignmentsHeader}>
                <span>🏢 Назначения</span>
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
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {(!employee.assignedTo || employee.assignedTo.length === 0) && (
                  <p className={styles.emptyAssignments}>Нет назначений</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

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
              placeholder="ФИО сотрудника"
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
              <option value="">Выберите должность</option>
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

      {/* Модальное окно назначения на объект */}
      {showAssignModal && (
        <div className={styles.modal} onClick={() => setShowAssignModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Назначить {selectedEmployee?.name}</h2>
            <h3>Магазины</h3>
            <div className={styles.locationsList}>
              {stores.map((store) => (
                <button
                  key={store.id}
                  className={styles.locationBtn}
                  onClick={() => assignLocation(store.id, "store")}
                >
                  🏬 {store.name}
                </button>
              ))}
            </div>
            <h3>Склады</h3>
            <div className={styles.locationsList}>
              {warehouses.map((warehouse) => (
                <button
                  key={warehouse.id}
                  className={styles.locationBtn}
                  onClick={() => assignLocation(warehouse.id, "warehouse")}
                >
                  🏪 {warehouse.name}
                </button>
              ))}
            </div>
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
