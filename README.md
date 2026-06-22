# QueueCure

> Real-time clinic queue management. No more paper tokens. No more shouting.

Built for **Queue Cure '26** hackathon on Wooble.

---

## What it does

| Screen | Role | Description |
|--------|------|-------------|
| Receptionist | Clinic staff | Add patients, call next token, set avg consultation time |
| Waiting Room | Patients | See current token, queue position, estimated wait |

Both screens sync **instantly** via WebSockets — no refresh, no polling.

---

## Tech Stack

- **Frontend** — React 18, socket.io-client
- **Backend** — Node.js, Express, Socket.io
- **Transport** — WebSocket (socket.io fallback: HTTP long-polling)

---

## Run Locally

```bash
# Install all dependencies
cd server && npm install
cd ../client && npm install

# Terminal 1 — Start server (port 4000)
cd server && npm start

# Terminal 2 — Start client (port 3000)
cd client && npm start
```

Open:
- `http://localhost:3000` — patient waiting room view
- Switch to **Receptionist** tab to manage queue

---

## Socket Events

| Direction | Event | Payload | Description |
|-----------|-------|---------|-------------|
| Client → Server | `add_patient` | `{ name: string }` | Add a patient to queue |
| Client → Server | `call_next` | — | Dequeue and serve next patient |
| Client → Server | `set_avg_time` | `{ minutes: number }` | Update avg consultation time |
| Client → Server | `reset_queue` | — | Clear entire queue |
| Server → All Clients | `state_update` | `{ queue[], currentToken, avgConsultTime, totalServed }` | Broadcast new state |

---

## Wait Time Calculation

```
estimatedWait(patient) = positionAhead × avgConsultTime

positionAhead = index in queue (0-based) + 1
```

- Position 1 (next up): `1 × avgTime`
- Position 3: `3 × avgTime`
- `avgConsultTime` is set by the receptionist and reflects real clinic pace.

---

## Edge Cases Handled

- **Empty queue** — "Call Next" button is disabled; no crash.
- **Concurrent clients** — All clients share one server-side state; `state_update` broadcasts to every connected socket atomically.
- **Rapid adds** — Token numbers are auto-incremented server-side, never on the client. No duplicate tokens.
- **Reconnect** — On connect, server immediately emits current state to the joining client.
- **Invalid avg time** — Server validates: must be 1–120 minutes integer.

---

## Deploy

**Backend** → Railway / Render / Fly.io (set `PORT` env var)

**Frontend** → Vercel / Netlify (set `REACT_APP_SERVER_URL=https://your-backend.com`)

---

## Project Structure

```
queue-cure/
├── server/
│   ├── index.js          # Express + Socket.io server
│   └── package.json
└── client/
    ├── public/index.html
    └── src/
        ├── App.js         # Tab switcher + connection status
        ├── App.css
        ├── useSocket.js   # Socket connection hook
        ├── Receptionist.js
        ├── Receptionist.css
        ├── Patient.js
        ├── Patient.css
        └── index.js
```
