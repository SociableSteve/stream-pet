import * as dotenv from "dotenv";
dotenv.config();
import * as express from "express";
import * as ws from "ws";
import * as path from "path";
import * as http from "http";
import * as tmi from "tmi.js";
import Pet from "./pet";

import * as pg from "pg";
const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
db.connect().then(() => {
  db.query(
    "create table if not exists status (name varchar(25) not null unique, current int)"
  );
  db.query(
    "create table if not exists stats (name varchar(25) not null unique, value int)"
  );
});

// Set up express
const app = express();
app.use(express.static(path.resolve(__dirname, "../public")));

// Set up HTTP server
const server = http.createServer(app);
server.listen(process.env.PORT || 8080);

const pet = new Pet(db);

// Set up WebSocket server
const wss = new ws.Server({ server });
wss.on("connection", (socket, req) => {
  socket.send(JSON.stringify(pet.toJSON()));
});

pet.on("activity", (activity) =>
  wss.clients.forEach((client) => client.send(JSON.stringify({ activity })))
);
pet.on("status", (status) =>
  wss.clients.forEach((client) => client.send(JSON.stringify({ status })))
);
pet.on("stats", (stats) =>
  wss.clients.forEach((client) => client.send(JSON.stringify({ stats })))
);

const twitch = new tmi.Client({
  connection: {
    reconnect: true,
    secure: true,
  },
  identity: {
    username: process.env.TWITCH_USER,
    password: process.env.TWITCH_PASS,
  },
  channels: [process.env.TWITCH_CHANNEL],
});

const users_seen = [];

twitch.on("message", (channel, tags, message, self) => {
  if (self) return;
  if (tags["display-name"].toLowerCase() === "streamelements") return;
  pet.setLastMessage(Date.now());
  if (users_seen.includes(tags["display-name"])) return;
  users_seen.push(tags["display-name"]);
  pet.addHappiness(1);

  wss.clients.forEach((client) =>
    client.send(JSON.stringify({ seen: tags["display-name"] }))
  );
});
twitch.on("subscription", (channel, username) => {
  wss.clients.forEach((client) =>
    client.send(JSON.stringify({ subscription: username }))
  );
  pet.addHappiness(3);
});
twitch.on("ban", (channel, username) => {
  wss.clients.forEach((client) =>
    client.send(JSON.stringify({ ban: username }))
  );
  pet.addHappiness(-1);
});

const bitmote_checks = new RegExp(
  /^(Cheer|DoodleCheer|BibleThump|cheerwhal|Corgo|Scoops|uni|ShowLove|Party|SeemsGood|Pride|Kappa|FrankerZ|HeyGuys|DansGame|EleGiggle|TriHard|Kreygasm|4Head|SwiftRage|NotLikeThis|FailFish|VoHiYo|PJSalt|MrDestructoid|bday|RIPCheer|Shamrock|BitBoss|Streamlabs|Muxy|HolidayCheer|Goal|Anon|Charity)(\d+)/
);

twitch.on("cheer", (channel, userstate, message) => {
  pet.addBits(parseInt(userstate.bits));
  wss.clients.forEach((client) =>
    client.send(JSON.stringify({ bitsFrom: userstate["display-name"] }))
  );
  const words = message.split(" ");
  words.forEach((word) => {
    let match: RegExpExecArray;
    if ((match = bitmote_checks.exec(word))) {
      wss.clients.forEach((client) =>
        client.send(
          JSON.stringify({ bits: { type: match[1], amount: match[2] } })
        )
      );
    }
  });
  pet.addHappiness(2);
});

twitch.connect();
