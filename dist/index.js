"use strict";
exports.__esModule = true;
var express = require("express");
var ws = require("ws");
var path = require("path");
var http = require("http");
// Set up express
var app = express();
app.use(express.static(path.resolve(__dirname, "../public")));
// Set up HTTP server
var server = http.createServer(app);
server.listen(process.env.PORT || 8080);
var activities = [
    { image: "Sitting.gif", speed: 0 },
    { image: "Walking.gif", speed: 5 },
    { image: "Running.gif", speed: 10 },
    { image: "Sleeping.gif", speed: 0 },
];
var activity = activities[0];
var status = [
    { name: "happiness", max: 5, current: 1 },
    { name: "hunger", max: 5, current: 2 },
    { name: "health", max: 5, current: 3 },
    { name: "social", max: 5, current: 4 },
];
var stats = [
    { name: "Age", value: 0 },
    { name: "Weight", value: 0 },
];
// Set up WebSocket server
var wss = new ws.Server({ server: server });
wss.on("connection", function (socket, req) {
    console.log("connection received");
    socket.send(JSON.stringify({
        status: status,
        stats: stats,
        activity: activity
    }));
    socket.on("message", function (message) { return console.log(message); });
});
setInterval(function () {
    activity = activities[Math.floor(Math.random() * activities.length)];
    wss.clients.forEach(function (client) { return client.send(JSON.stringify({ activity: activity })); });
    for (var _i = 0, status_1 = status; _i < status_1.length; _i++) {
        var stat = status_1[_i];
        stat.current = Math.floor(Math.random() * stat.max);
    }
    wss.clients.forEach(function (client) { return client.send(JSON.stringify({ status: status })); });
    for (var _a = 0, stats_1 = stats; _a < stats_1.length; _a++) {
        var stat = stats_1[_a];
        stat.value = Math.floor(Math.random() * 9) + 1;
    }
    wss.clients.forEach(function (client) { return client.send(JSON.stringify({ stats: stats })); });
}, 5000);
