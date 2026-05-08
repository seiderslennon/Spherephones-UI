const express = require("express");
const { Client } = require("node-osc");

// Edit these to point at a different Bela / change the local UI port.
// Each is overridable via env var so the same checkout can run either on a
// laptop tethered to the Bela (defaults) or on the Bela itself (set
// BELA_HOST=127.0.0.1 in the systemd unit so OSC goes over loopback).
const BELA_HOST = process.env.BELA_HOST || "192.168.7.2";
const BELA_PORT = Number(process.env.BELA_PORT) || 9000;
const HTTP_PORT = Number(process.env.HTTP_PORT) || 3000;

const app = express();
const osc = new Client(BELA_HOST, BELA_PORT);

app.use(express.json());
app.use(express.static("public"));

// Bela expects /xyz with type tags `ffff` (object index, x, y, z — all floats).
// node-osc auto-encodes whole-number JS values as OSC int32, which would make
// the index (and any x/y/z that lands on 0 or 1) the wrong type. Wrap each
// arg as { type: 'f', value } to force float encoding.
const f = (v) => ({ type: "f", value: Number(v) });

// Log throttling: at most one log line per object per LOG_INTERVAL_MS so the
// terminal isn't drowned during slider drags. Set LOG_OSC=0 to silence.
const LOG_OSC = process.env.LOG_OSC !== "0";
const LOG_INTERVAL_MS = 250;
const lastLogged = new Map();

app.post("/xyz", (req, res) => {
  const { i, x, y, z } = req.body;
  osc.send("/xyz", f(i), f(x), f(y), f(z), () => {});
  if (LOG_OSC) {
    const now = Date.now();
    if (now - (lastLogged.get(i) || 0) >= LOG_INTERVAL_MS) {
      lastLogged.set(i, now);
      console.log(
        `→ /xyz ffff ${Number(i).toFixed(3)} ${Number(x).toFixed(3)} ${Number(y).toFixed(3)} ${Number(z).toFixed(3)}`,
      );
    }
  }
  res.sendStatus(204);
});

// Bela head tracker recenter — bare OSC message, no args. node-osc emits a
// type-tag string of just "," when no args are passed, which oscpkt's
// isOkNoMoreArgs() accepts.
app.post("/recenter", (_req, res) => {
  osc.send("/recenter", () => {});
  if (LOG_OSC) console.log("→ /recenter");
  res.sendStatus(204);
});

// Transport: /play takes a single OSC string (song name); /stop is bare.
// Bela's gPlayer.play(songName) opens the matching stems on the device.
app.post("/play", (req, res) => {
  const song = String((req.body && req.body.song) || "");
  osc.send("/play", song, () => {});
  if (LOG_OSC) console.log(`→ /play "${song}"`);
  res.sendStatus(204);
});

app.post("/stop", (_req, res) => {
  osc.send("/stop", () => {});
  if (LOG_OSC) console.log("→ /stop");
  res.sendStatus(204);
});

app.listen(HTTP_PORT, () => {
  console.log(`UI on http://localhost:${HTTP_PORT}`);
  console.log(`Sending OSC to ${BELA_HOST}:${BELA_PORT}`);
});

process.on("SIGINT", () => {
  osc.close();
  process.exit(0);
});
