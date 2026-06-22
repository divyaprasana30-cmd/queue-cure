import React, { useState } from "react";
import "./Receptionist.css";

export default function Receptionist({ queueState, emit }) {
  const [name, setName] = useState("");
  const [timeInput, setTimeInput] = useState(queueState.avgConsultTime);
  const [editingTime, setEditingTime] = useState(false);

  const { queue, currentToken, avgConsultTime, totalServed } = queueState;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    emit("add_patient", { name });
    setName("");
  };

  const handleCallNext = () => {
    emit("call_next");
  };

  const handleTimeUpdate = () => {
    emit("set_avg_time", { minutes: timeInput });
    setEditingTime(false);
  };

  const handleReset = () => {
    if (window.confirm("Reset the entire queue? This cannot be undone.")) {
      emit("reset_queue");
    }
  };

  return (
    <div className="rec-root">
      {/* Header */}
      <div className="rec-header">
        <div>
          <span className="rec-label">RECEPTIONIST</span>
          <h1 className="rec-title">Queue Control</h1>
        </div>
        <div className="rec-stats">
          <div className="rec-stat">
            <span className="stat-val">{totalServed}</span>
            <span className="stat-label">Served today</span>
          </div>
          <div className="rec-stat">
            <span className="stat-val">{queue.length}</span>
            <span className="stat-label">Waiting</span>
          </div>
        </div>
      </div>

      {/* Current token */}
      <div className="rec-current">
        <span className="rec-section-label">NOW SERVING</span>
        {currentToken ? (
          <div className="current-display">
            <span className="current-token">#{currentToken.token}</span>
            <span className="current-name">{currentToken.name}</span>
          </div>
        ) : (
          <div className="current-empty">No patient yet</div>
        )}
      </div>

      {/* Call next */}
      <button
        className="btn-call"
        onClick={handleCallNext}
        disabled={queue.length === 0}
      >
        Call Next
        {queue.length > 0 && (
          <span className="call-preview"> → #{queue[0].token} {queue[0].name}</span>
        )}
      </button>

      {/* Add patient */}
      <div className="rec-section">
        <span className="rec-section-label">ADD PATIENT</span>
        <form onSubmit={handleAdd} className="add-form">
          <input
            className="rec-input"
            type="text"
            placeholder="Patient name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            autoComplete="off"
          />
          <button className="btn-add" type="submit" disabled={!name.trim()}>
            Add
          </button>
        </form>
      </div>

      {/* Avg consultation time */}
      <div className="rec-section">
        <span className="rec-section-label">AVG CONSULTATION TIME</span>
        {editingTime ? (
          <div className="time-edit">
            <input
              className="rec-input time-input"
              type="number"
              min={1}
              max={120}
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
            />
            <span className="time-unit">min</span>
            <button className="btn-save" onClick={handleTimeUpdate}>Save</button>
            <button className="btn-cancel" onClick={() => setEditingTime(false)}>×</button>
          </div>
        ) : (
          <div className="time-display">
            <span className="time-val">{avgConsultTime} min</span>
            <button className="btn-edit" onClick={() => { setTimeInput(avgConsultTime); setEditingTime(true); }}>
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Queue list */}
      {queue.length > 0 && (
        <div className="rec-section">
          <span className="rec-section-label">QUEUE ({queue.length})</span>
          <div className="queue-list">
            {queue.map((p, idx) => (
              <div className="queue-row" key={p.token}>
                <span className="q-pos">{idx + 1}</span>
                <span className="q-token">#{p.token}</span>
                <span className="q-name">{p.name}</span>
                <span className="q-wait">~{p.estimatedWait}m</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset */}
      <button className="btn-reset" onClick={handleReset}>
        Reset Queue
      </button>
    </div>
  );
}
