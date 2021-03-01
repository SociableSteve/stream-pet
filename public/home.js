const pet = document.getElementById("pet");
const petImg = pet.getElementsByTagName("img")[0];
const statusBar = document.getElementById("statusBar");
pet.style.bottom = statusBar.offsetHeight + "px";

let activity = { image: "Walking.gif", speed: 5 };
let direction = 1;

pet.getElementsByTagName("img")[0].src = activity.image;
function move() {
  const delta = activity.speed * direction;
  const position = parseInt(pet.style.left || "0");

  if (delta < 0) pet.style.transform = "scaleX(-1)";
  else pet.style.transform = "scale(1)";
  if (delta + position <= 0) direction = 1;
  if (delta + position + pet.clientWidth >= window.innerWidth) direction = -1;
  pet.style.left = position + delta + "px";
}
setInterval(move, 100);

function createWS() {
  const ws = new WebSocket(document.location.toString().replace("http", "ws"));
  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    Object.keys(data).forEach((key) => {
      switch (key) {
        case "status":
          data.status.forEach((status) => {
            const target = document
              .getElementById(`${status.name}Bar`)
              .getElementsByTagName("div")[1];
            target.innerHTML =
              `<img src="Filled Heart.png">`.repeat(status.current) +
              `<img src="Empty Heart.png">`.repeat(status.max - status.current);
          });
          break;
        case "stats":
          document.getElementById("stats").innerHTML = `
                ${data.stats
                  .map((stat) => `<div>${stat.name}: ${stat.value}</div>`)
                  .join("")}`;
          break;
        case "activity":
          petImg.src = data.activity.image;
          activity = data.activity;
          direction = Math.round(Math.random()) * 2 - 1;
          break;
      }
    });
  };

  ws.onclose = () => {
    setTimeout(createWS, 1000);
  };
}
createWS();
