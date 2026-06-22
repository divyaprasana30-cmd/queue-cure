import React from "react";
import "./Patient.css";

export default function Patient({ queueState }) {
  const { queue, currentToken, avgConsultTime } = queueState;

  return (
    <div className="pat-root">
      {/* Header */}
      <div className="pat-header">
        <span className="pat-label">WAITING ROOM</span>
        <h1 className="pat-title">Queue Status</h1>
        <p className="pat-sub">Live updates · No refresh needed</p>
      </div>

      {/* Now serving — BIG */}
      <div className="now-serving-card">
        <span className="now-label">NOW SERVING</span>
        <div className="now-token">
          {currentToken ? `#${currentToken.token}` : "·"}
        </div>
        {currentToken && (
          <div className="now-name">{currentToken.name}</div>
        )}
        {!currentToken && (
          <div className="now-idle">Clinic not started yet</div>
        )}
      </div>

      {/* Queue info */}
      {queue.length > 0 ? (
        <>
          <div className="pat-queue-header">
            <span className="rec-section-label">PATIENTS WAITING</span>
            <span className="avg-note">~{avgConsultTime} min per patient</span>
          </div>
          <div className="pat-queue">
            {queue.map((p, idx) => (
              <div className={`pat-row ${idx === 0 ? "pat-row--next" : ""}`} key={p.token}>
                <div className="pat-row-left">
                  <span className="pat-pos">
                    {idx === 0 ? "NEXT" : `${idx + 1}`}
                  </span>
                  <span className="pat-token">#{p.token}</span>
                  <span className="pat-name">{p.name}</span>
                </div>
                <div className="pat-wait-badge">
                  ~{p.estimatedWait} min
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="pat-empty">
          {currentToken
            ? "No more patients in queue."
            : "Queue is empty."}
        </div>
      )}

      {/* Footer note */}
      <div className="pat-footer">
        Please stay in the waiting area and listen for your token number.
      </div>
    </div>
  );
}
