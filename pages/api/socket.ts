import { Server } from "socket.io";

const status = [
  { name: "Happiness", max: 5, current: 3 },
  { name: "Hunger", max: 5, current: 2 },
  { name: "Health", max: 5, current: 3 },
  { name: "Social", max: 5, current: 4 },
];

const stats = [
  { name: "Age", value: "X days" },
  { name: "Weight", value: "2 kg" },
  { name: "Bits Consumed", value: "123" },
];

interface Activity {
  name: string;
  speed: number;
}
const activities: Activity[] = [
  { name: "sit", speed: 0 },
  { name: "walk", speed: 5 },
  { name: "run", speed: 10 },
  { name: "sleep", speed: 0 },
];

let activity: Activity = activities[0];
function setActivity() {
  activity = activities[Math.floor(Math.random() * activities.length)];
  setTimeout(setActivity, Math.random() * 10000 + 5000);
}
setActivity();
const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);

    io.on("connection", (socket) => {
      console.log("CONNECTION");
      socket.emit("init", { status, stats, activity });

      let timer = setInterval(() => {
        socket.emit("status", status);
        socket.emit("stats", stats);
        socket.emit("activity", activity);
      }, 1000);
      socket.on("close", () => {
        clearInterval(timer);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default ioHandler;
