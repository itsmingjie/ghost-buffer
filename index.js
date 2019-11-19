var express = require("express");
var bodyParser = require("body-parser");
var axios = require("axios");

// initialize Express
var app = express();
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.listen(process.env.PORT || 3000, () => {
    console.log("Ghost buffer is running.")
})

var charges = 0;

require("dotenv").config();

app.get("/charge/:key", (req, res) => {
  console.log("Launch request received.");

  console.log("Key: " + req.params.key);
  console.log("API Key: " + process.env.API_KEY);

  if (req.params.key == process.env.API_KEY) {
    charge();
    console.log("Charge successful. Current charge: " + charges);
    res.send(200);
  } else {
    res.send(403);
  }
});

app.get("/launch/:key", (req, res) => {
  console.log("Launch request received.");

  console.log("Key: " + req.params.key);
  console.log("API Key: " + process.env.API_KEY);

  if (req.params.key == process.env.API_KEY) {
    charge();
    res.send(200);
  } else {
    res.send(403);
  }
});

// charge up the capacitor
function charge() {
  charges++;

  if (charges >= parseInt(process.env.CAPACITANCE)) launch();
}

// launch build hook
function launch() {
  axios
    .post(process.env.BUILD_HOOK)
    .then(res => {
      console.log("Hook launched successfully to " + process.env.BUILD_HOOK);
      console.log("Response: " + res);

      charges = 0;
    })
    .catch(err => {
      console.error("Hook launch failed.");
      console.error(err);
    });
}

const http = require("http");

// gracefully handle SIGTERM and SIGINT
process
  .on("SIGTERM", shutdown("SIGTERM"))
  .on("SIGINT", shutdown("SIGINT"))
  .on("uncaughtException", shutdown("uncaughtException"));

setInterval(console.log.bind(console, "tick-tock"), 1000);
http
  .createServer((req, res) => res.end("hi"))
  .listen(process.env.PORT || 3000, () => console.log("Listening"));

function shutdown(signal) {
  return err => {
    if (charges > 0) {
      console.log(`${signal} received. Flushing all charges.`);
      launch();

      if (err) console.error(err.stack || err);
      setTimeout(() => {
        console.log("Waited 20s, ghost buffer is exiting.");
        process.exit(err ? 1 : 0);
      }, 20000).unref();
    }
  };
}
