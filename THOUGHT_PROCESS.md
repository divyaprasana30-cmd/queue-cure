# Thought Process Sheet — QueueCure
**Queue Cure '26 | Wooble Hackathon**

---

## Problem Understanding

76% of Indian clinics run on paper tokens and verbal announcements. Patients have zero visibility into wait times, leading to anxiety and walkouts. Receptionists carry queue state in their heads — one distraction breaks the whole flow.

Core insight: **the queue is a shared real-time data structure**. Two actors (receptionist, patients) need a consistent, always-fresh view of it. This is a perfect fit for WebSockets.

---

## Architecture Decision

**Why WebSockets over polling?**

| | Polling (setInterval) | WebSockets |
|---|---|---|
| Latency | 1–5 seconds lag | Instant (< 50ms) |
| Server load | Constant requests | Event-driven |
| UX | Page feels stale | Feels live |

Socket.io was chosen over raw WebSockets for its automatic fallback to HTTP long-polling (handles corporate firewalls in clinics) and built-in reconnection.

**Why server-side state?**

All queue mutations happen on the server. Clients only send commands; they never compute state. This guarantees:
- Every client sees identical data
- No race conditions from simultaneous "Call Next" clicks
- Reconnecting clients get full state immediately on join

---

## Wait Time Calculation

```
estimatedWait(patient_at_index_i) = (i + 1) × avgConsultTime
```

- `avgConsultTime` is set by the receptionist based on the actual day's pace
- It's not hardcoded — the receptionist can update it mid-session
- Index `i` is recalculated after every `call_next` event

**Why not use `addedAt` timestamps?**

Using `addedAt` would require knowing how long the current consultation has been running, which introduces clock sync issues across devices. The `avgConsultTime × position` model is simpler, auditable, and accurate enough for a clinic context.

---

## Concurrency & Edge Cases

### Race condition: two receptionists click "Call Next" simultaneously

Both emit `call_next` to the server. Node.js is single-threaded — event loop processes them sequentially. First call shifts the queue; second call shifts the new head. No patient is skipped or duplicated. The state broadcast after each call corrects both clients.

### Client reconnect

On `connection`, server immediately emits current state:
```js
socket.emit("state_update", currentState);
```
Reconnecting patient screen snaps to current truth with no polling needed.

### Empty queue

`call_next` on an empty queue is a no-op (server guards: `if (queue.length === 0) return`). The button is also disabled client-side.

### Token numbering

`nextTokenNumber` lives on the server and is never sent back for clients to compute. Tokens are always `server.nextTokenNumber++`. No duplicate tokens possible even with concurrent adds.

### Invalid inputs

- Patient name: empty string rejected server-side
- Avg time: validated as integer 1–120; out-of-range ignored
- All validation happens server-side — client-side is UX only

---

## UX Decisions

**Receptionist screen** — optimized for speed under pressure:
- Single-field form (name only, Enter to submit)
- "Call Next" is the biggest button, disabled state clearly visible
- Queue list shows estimated wait so receptionist can answer patient questions instantly

**Patient screen** — optimized for legibility at distance:
- Current token is 88px mono font — readable across a waiting room
- Next-in-queue row highlighted in blue
- "No refresh needed" is explicitly stated — patients don't know about WebSockets

---

## What I'd add with more time

1. **Per-patient timer** — track how long current consultation is running, auto-update estimates
2. **SMS notification** — Twilio/MSG91 alert when 2 patients ahead
3. **Doctor dashboard** — separate view showing doctor's pace vs. estimated vs. actual
4. **Multi-doctor routing** — assign tokens to specific doctors
5. **Persistent state** — Redis so server restart doesn't lose the queue
