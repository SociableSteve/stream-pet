import Head from "next/head";
import Pet from "../components/Pet";
import StatusBar from "../components/StatusBar";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Pet />
      <StatusBar />
    </div>
  );
}
