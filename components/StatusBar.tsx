import styles from "../styles/Home.module.css";
import Status from "../components/Status";
import Stat from "./Stat";

const StatusBar = () => {
  const status = [
    { name: "Happiness", max: 5, current: 1 },
    { name: "Hunger", max: 5, current: 2 },
    { name: "Health", max: 5, current: 3 },
    { name: "Social", max: 5, current: 4 },
  ];

  const stats = [
    { name: "Age", value: "X days" },
    { name: "Weight", value: "2 kg" },
    { name: "Bits Consumed", value: "123" },
  ];

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
