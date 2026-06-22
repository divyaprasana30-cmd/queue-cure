import React, { useState } from "react";
import { useSocket } from "./useSocket";
import Receptionist from "./Receptionist";
import Patient from "./Patient";
import "./App.css";

export default function App() {
  const { connected, queueState, emit } = useSocket();
  const [view, setView] = useState("patient"); // "receptionist" | "patient"

  return (
    <div className="app">
      {/* Top bar */}
      <div className="topbar">
        <div className="topbar-brand">
          <span className="brand-mark">Q</span>
          <span className="brand-name">QueueCure</span>
        </div>

        <div className="topbar-center">
          <button
            className={`tab ${view === "patient" ? "tab--active" : ""}`}
            onClick={() => setView("patient")}
          >
            Waiting Room
          </button>
          <button
            className={`tab ${view === "receptionist" ? "tab--active" : ""}`}
            onClick={() => setView("receptionist")}
          >
            Receptionist
          </button>
        </div>

        <div className={`conn-dot ${connected ? "conn-dot--on" : "conn-dot--off"}`}>
          <span className="conn-pulse" />
          <span className="conn-label">{connected ? "Live" : "Connecting…"}</span>
        </div>
      </div>

      {/* View */}
      <div className="app-body">
        {view === "receptionist" ? (
          <Receptionist queueState={queueState} emit={emit} />
        ) : (
          <Patient queueState={queueState} />
        )}
      </div>
    </div>
  );
}
