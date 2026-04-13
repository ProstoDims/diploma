import Sidebar from "../Sidebar/Sidebar";
import styles from "./LayoutDashboard.module.css";

const LayoutDashboard = ({ children }) => {
  return (
    <div className={styles.layout}>
      <div className="gradient-bg"></div>
      <div className={styles.container}>
        <Sidebar />
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
};

export default LayoutDashboard;
