import * as express from "express";
import * as ws from "ws";
import * as path from "path";
import * as http from "http";

// Set up express
const app = express();
app.use(express.static(path.resolve(__dirname, "../public")));

// Set up HTTP server
const server = http.createServer(app);
server.listen(process.env.PORT || 8080);
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
let activity = activities[0];

let status = [
  { name: "happiness", max: 5, current: 1 },
  { name: "hunger", max: 5, current: 2 },
  { name: "health", max: 5, current: 3 },
  { name: "social", max: 5, current: 4 },
];

let stats = [
  { name: "Age", value: 0 },
  { name: "Weight", value: 0 },
];

// Set up WebSocket server
const wss = new ws.Server({ server });
wss.on("connection", (socket, req) => {
  console.log("connection received");
  socket.send(
    JSON.stringify({
      status,
      stats,
      activity,
    })
  );
  socket.on("message", (message) => console.log(message));
});

setInterval(() => {
  activity = activities[Math.floor(Math.random() * activities.length)];
  wss.clients.forEach((client) => client.send(JSON.stringify({ activity })));

  for (let stat of status) {
    stat.current = Math.floor(Math.random() * stat.max);
  }
  wss.clients.forEach((client) => client.send(JSON.stringify({ status })));

  for (let stat of stats) {
    stat.value = Math.floor(Math.random() * 9) + 1;
  }
  wss.clients.forEach((client) => client.send(JSON.stringify({ stats })));
}, 5000);
