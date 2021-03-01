import styles from "../styles/Home.module.css";
import Status from "../components/Status";
import Stat from "./Stat";

const StatusBar = ({ status, stats }) => {
  return (
    <div className={styles.stats} id="statusBar">
      {status.map((status) => (
        <Status key={status.name} {...status} />
      ))}
      <div>
        {stats.map((stat) => (
          <Stat key={stat.name} {...stat} />
        ))}
      </div>
    </div>
  );
};

export default StatusBar;
