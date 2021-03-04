import { EventEmitter } from "events";
import type * as pg from "pg";

interface Activity {
  image: string;
  speed: number;
}
const activities: Activity[] = [
  { image: "Sitting.gif", speed: 0 },
  { image: "Walking.gif", speed: 5 },
  { image: "Running.gif", speed: 10 },
  { image: "Sleeping.gif", speed: 0 },
];

const socialTimers = [30, 60, 300, 600];
const hungerRating = 10;

class Pet extends EventEmitter {
  activity = activities[0];

  food = 30;

  status = [
    { name: "happiness", max: 5, current: 3 },
    {
      name: "hunger",
      max: 5,
      current: Math.max(1, Math.round(this.food / hungerRating)),
    },
    { name: "health", max: 5, current: 4 },
    { name: "social", max: 5, current: 3 },
  ];

  stats = [
    { name: "Age", value: 0, suffix: " Streams" },
    { name: "Weight", value: 0, suffix: " Bits" },
  ];

  lastMessage = Date.now();

  toJSON() {
    return { activity: this.activity, status: this.status, stats: this.stats };
  }

  constructor(private db: pg.Client) {
    super();

    this.updateSocial.bind(this);
    this.setLastMessage.bind(this);

    this.load().then(() => {
      setInterval(() => {
        this.setActivity(
          activities[Math.floor(Math.random() * activities.length)]
        );

        this.updateSocial();
        this.updateFood();
        this.updateHappiness();
        this.updateHealth();
        this.emit("status", this.status);
        this.save();
      }, 5000);
    });
  }

  setActivity(activity: Activity) {
    this.activity = activity;
    this.emit("activity", this.activity);
  }

  setLastMessage(timestamp: number) {
    const social = this.status.find((s) => s.name === "social");
    if (social.current < 5) {
      const diff = (Date.now() - this.lastMessage) / 1000;
      if (diff <= socialTimers[5 - social.current - 1]) {
        this.lastMessage = Date.now();
        social.current++;
        this.emit("status", this.status);
        this.save();
      }
    }

    this.lastMessage = timestamp;
  }

  updateSocial() {
    const social = this.status.find((s) => s.name === "social");
    if (social.current <= 1) return;

    const diff = (Date.now() - this.lastMessage) / 1000;
    if (diff >= socialTimers[5 - social.current]) {
      this.lastMessage = Date.now();
      social.current--;
    }
  }

  updateFood() {
    this.food = Math.max(0, this.food--);

    const hunger = this.status.find((s) => s.name === "hunger");
    hunger.current = Math.max(
      1,
      Math.min(5, Math.round(this.food / hungerRating))
    );
  }

  updateHappiness() {
    const happy = this.status.find((s) => s.name === "happiness");
    if (Math.random() < 0.05) {
      happy.current = Math.max(1, happy.current - 1);
    }
  }

  updateHealth() {
    if (
      this.status
        .filter((s) => s.name !== "health")
        .some((s) => s.current === 1)
    ) {
      const health = this.status.find((s) => s.name === "health");
      health.current = Math.max(1, health.current - 1);
    } else if (
      this.status
        .filter((s) => s.name !== "health")
        .every((s) => s.current >= 3)
    ) {
      const health = this.status.find((s) => s.name === "health");
      health.current = Math.min(5, health.current + 1);
    }
  }

  addHappiness(happiness: number) {
    const happy = this.status.find((s) => s.name === "happiness");
    happy.current = Math.max(1, Math.min(5, happy.current + happiness));

    this.emit("status", this.status);
    this.save();
  }

  addBits(bits: number) {
    this.stats.find((s) => s.name === "Weight").value += bits;
    this.emit("stats", this.stats);
    this.save();

    this.food += bits;
  }

  async save() {
    for (const status of this.status) {
      await this.db.query(
        "insert into status (name, current) values ($2, $1) on conflict (name) do update set current=$1 where status.name=$2",
        [status.current, status.name]
      );
    }
    for (const stats of this.stats) {
      await this.db.query(
        "insert into stats (name, value) values ($2, $1) on conflict (name) do update set value=$1 where stats.name=$2",
        [stats.value, stats.name]
      );
    }
  }

  async load() {
    let results = await this.db.query("select * from status");
    results.rows.forEach((row) => {
      this.status.find((s) => s.name === row.name).current = row.current;
    });
    results = await this.db.query("select * from stats");
    results.rows.forEach((row) => {
      this.stats.find((s) => s.name === row.name).value = row.value;
    });
  }
}

export default Pet;
