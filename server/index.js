const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ── State ──────────────────────────────────────────────────────────────────
let state = {
  queue: [],          // [{ token, name, addedAt }]
  currentToken: null, // { token, name, calledAt }
  avgConsultTime: 10, // minutes
  nextTokenNumber: 1,
  totalServed: 0,
};

// ── Helpers ────────────────────────────────────────────────────────────────
function computeWait(positionAhead) {
  // position 0 = next to be called (1 person ahead = avgConsultTime wait)
  return positionAhead * state.avgConsultTime;
}

function broadcastState() {
  const payload = {
    queue: state.queue.map((p, idx) => ({
      ...p,
      position: idx + 1,
      estimatedWait: computeWait(idx + 1), // +1 because current is being served
    })),
    currentToken: state.currentToken,
    avgConsultTime: state.avgConsultTime,
    totalServed: state.totalServed,
  };
  io.emit("state_update", payload);
}

// ── REST endpoints (optional, sockets handle everything) ───────────────────
app.get("/health", (_, res) => res.json({ ok: true }));

// ── Socket events ──────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Send current state immediately on connect
  socket.emit("state_update", {
    queue: state.queue.map((p, idx) => ({
      ...p,
      position: idx + 1,
      estimatedWait: computeWait(idx + 1),
    })),
    currentToken: state.currentToken,
    avgConsultTime: state.avgConsultTime,
    totalServed: state.totalServed,
  });

  // ── add_patient ──────────────────────────────────────────────────────────
  // payload: { name: string }
  socket.on("add_patient", ({ name }) => {
    if (!name || !name.trim()) return;

    const patient = {
      token: state.nextTokenNumber++,
      name: name.trim(),
      addedAt: Date.now(),
    };
    state.queue.push(patient);
    console.log(`Added: ${patient.name} → Token #${patient.token}`);
    broadcastState();
  });

  // ── call_next ────────────────────────────────────────────────────────────
  socket.on("call_next", () => {
    if (state.queue.length === 0) return;

    const next = state.queue.shift();
    state.currentToken = { ...next, calledAt: Date.now() };
    state.totalServed++;
    console.log(`Calling: Token #${next.token} — ${next.name}`);
    broadcastState();
  });

  // ── set_avg_time ─────────────────────────────────────────────────────────
  // payload: { minutes: number }
  socket.on("set_avg_time", ({ minutes }) => {
    const val = parseInt(minutes, 10);
    if (isNaN(val) || val < 1 || val > 120) return;
    state.avgConsultTime = val;
    broadcastState();
  });

  // ── reset_queue ──────────────────────────────────────────────────────────
  socket.on("reset_queue", () => {
    state = {
      queue: [],
      currentToken: null,
      avgConsultTime: state.avgConsultTime,
      nextTokenNumber: 1,
      totalServed: 0,
    };
    broadcastState();
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`QueueCure server running on :${PORT}`));
