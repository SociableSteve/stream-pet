const pet = document.getElementById("pet");
const petImg = pet.getElementsByTagName("img")[0];
const statusBar = document.getElementById("statusBar");
pet.style.bottom = statusBar.offsetHeight + "px";

function observerFn(entries, observer) {
  console.log(...entries);
}
let observer = new IntersectionObserver(observerFn, { root: pet });

let activity = { image: "Walking.gif", speed: 5 };
let direction = 1;
let toSay = [];
let talking = false;

const voice = new Audio("/voice.mp3");

setSrc(activity.image);
function setSrc(src) {
  const today = new Date();
  if (today.getMonth() === 2 && today.getDate() === 11) {
    src = src.replace(".gif", "-birthday.gif");
  }
  if (
    new URL(pet.getElementsByTagName("img")[0].src).pathname.substr(1) !== src
  ) {
    pet.getElementsByTagName("img")[0].src = src;
  }
}
function talk() {
  if (talking) return;
  talking = true;
  setSrc("Sitting.gif");
  let speech = document.getElementById("speech");
  speech.style.opacity = 100;
  speech.innerText = toSay[0];
  voice.play();

  if (parseInt(pet.style.left) > window.innerWidth / 2) {
    speech.style.right = 0;
    speech.style.left = "auto";
  } else {
    speech.style.left = 0;
    speech.style.right = "auto";
  }

  setTimeout(() => {
    speech.style.opacity = 0;
    talking = false;
    toSay.shift();
  }, 10000);
}

function move() {
  if (toSay.length) {
    pet.style.transform = "scale(1)";
    return talk();
  }
  setSrc(activity.image);

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
                  .map(
                    (stat) =>
                      `<div>${stat.name}: ${stat.value} ${stat.suffix}</div>`
                  )
                  .join("")}`;
          break;
        case "activity":
          activity = data.activity;
          direction = Math.round(Math.random()) * 2 - 1;
          break;
        case "seen":
          toSay.push(`YAY! ${data.seen} is here!`);
          break;
        case "subscription":
          toSay.push(`Thanks for your subscription, ${data.subscription}!`);
          break;
        case "follow":
          toSay.push(
            `A new friend! Welcome to the Squishy club, ${data.follow}!`
          );
          break;
        case "ban":
          toSay.push(`You've been naughty, ${data.ban}! See you never!`);
          break;
        case "bitsFrom":
          toSay.push(
            `It's raining bits! Thanks for the support, ${data.bitsFrom}!`
          );
          break;
        case "bits":
          const bitDelay = 10000;
          while (data.bits.amount--) {
            let img = document.createElement("img");
            img.src = `https://d3aqoihi2n8ty8.cloudfront.net/actions/${data.bits.type.toLowerCase()}/dark/animated/1/2.gif`;
            img.className = "bitDrop";
            document.body.appendChild(img);
            const duration = Math.random() * 3000 + 1000;
            img.style.transitionDuration = duration + "ms";
            setTimeout(() => (img.style.bottom = pet.style.bottom), 100);
            img.style.left = Math.random() * window.innerWidth + "px";

            setTimeout(() => (img.style.opacity = 0), duration + bitDelay);
            setTimeout(
              () => document.body.removeChild(img),
              duration * 2 + bitDelay
            );
          }
      }
    });
  };

  ws.onclose = () => {
    setTimeout(createWS, 1000);
  };
}
createWS();
