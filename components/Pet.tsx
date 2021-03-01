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

const Pet = ({ activity }) => {
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
      if (delta + position + pet.clientWidth >= window.innerWidth - 20)
        setDirection("left");
      pet.style.bottom = statusBar.offsetHeight + "px";
      pet.style.left = position + delta + "px";
    }
  }

  useEffect(() => {
    setDirection(Math.random() < 0.5 ? "right" : "left");
    let timer = setInterval(move, 100);
    return () => clearInterval(timer);
  }, [activity]);

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
