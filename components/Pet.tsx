import React, { useEffect, useState } from "react";
import PetPlay from "./activities/PetPlay";
import PetSit from "./activities/PetSit";
import PetSleep from "./activities/PetSleep";
import PetWalk from "./activities/PetWalk";
import PetRun from "./activities/PetRun";
import styles from "../styles/Home.module.css";
interface Activity {
  name: string;
  speed: number;
}
const activities: Activity[] = [
  { name: "sit", speed: 0 },
  { name: "walk", speed: 5 },
  { name: "run", speed: 10 },
  { name: "sleep", speed: 0 },
  // { name: "play", speed: 0 },
];

const Pet = () => {
  const [activity, setActivity] = useState<Activity>(activities[0]);
  const [direction, setDirection] = useState<string>("right");

  function move() {
    const pet = document.getElementById("pet");
    const statusBar = document.getElementById("statusBar");
    if (pet) {
      const delta = activity.speed * (direction === "right" ? 1 : -1);
      const position = parseInt(pet.style.left || "0");

      if (delta < 0) pet.style.transform = "scaleX(-1)";
      else pet.style.transform = "scale(1)";
      if (delta + position <= 10) setDirection("right");
      if (delta + position + pet.clientWidth >= window.innerWidth - 10)
        setDirection("left");
      pet.style.bottom = statusBar.offsetHeight + "px";
      pet.style.left = position + delta + "px";
    }
  }

  useEffect(() => {
    let moveTimer = setInterval(move, 100);
    const getTimeout = () => Math.random() * 10000 + 5000;
    let timeout = setTimeout(changeActivity, getTimeout());
    function changeActivity() {
      setActivity(activities[Math.floor(Math.random() * activities.length)]);
      setDirection(Math.random() < 0.5 ? "right" : "left");
      timeout = setTimeout(changeActivity, getTimeout());
    }
    return () => {
      if (timeout) clearTimeout(timeout);
      if (moveTimer) clearInterval(moveTimer);
    };
  });

  function getContent() {
    switch (activity.name) {
      case "walk":
        return <PetWalk />;
      case "run":
        return <PetRun />;
      case "sit":
        return <PetSit />;
      case "sleep":
        return <PetSleep />;
      case "play":
        return <PetPlay />;
    }
  }

  return (
    <div id="pet" className={styles.pet}>
      {getContent()}
    </div>
  );
};

export default Pet;
