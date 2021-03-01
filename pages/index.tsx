import Head from "next/head";
import { useEffect, useState } from "react";
import Pet from "../components/Pet";
import StatusBar from "../components/StatusBar";
import styles from "../styles/Home.module.css";
import io from "socket.io-client";

export default function Home() {
  const [status, setStatus] = useState(null);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    let socket: io.Socket;
    fetch("/api/socket").finally(() => {
      socket = io.io();

      socket.on("init", (data) => {
        console.log("INIT", data);
        setStats(data.stats);
        setStatus(data.status);
        setActivity(data.activity);
      });
      socket.on("stats", (data) => {
        setStats(data);
      });
      socket.on("status", (data) => {
        setStatus(data);
      });
      socket.on("activity", (data) => {
        setActivity(data);
      });
    });

    () => {
      if (socket) socket.close();
    };
  }, []);
  if (!status || !stats || !activity) return null;
  return (
    <div className={styles.container}>
      <Pet activity={activity} />
      <StatusBar stats={stats} status={status} />
    </div>
  );
}
