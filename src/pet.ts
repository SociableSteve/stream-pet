import { EventEmitter } from "events";

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

class Pet extends EventEmitter {
  activity = activities[0];

  status = [
    { name: "happiness", max: 5, current: 4 },
    { name: "hunger", max: 5, current: 4 },
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

  constructor() {
    super();

    this.updateSocial.bind(this);
    this.setLastMessage.bind(this);
    setInterval(() => {
      this.setActivity(
        activities[Math.floor(Math.random() * activities.length)]
      );

      this.updateSocial();
    }, 5000);
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
      this.emit("status", this.status);
    }
  }

  addBits(bits: number) {
    this.stats.find((s) => s.name === "Weight").value += bits;
    this.emit("stats", this.stats);

    // TODO affect hunger here!
  }
}

export default Pet;
