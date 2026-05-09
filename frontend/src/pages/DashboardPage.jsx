import { useState, useEffect } from "react";
import { useConvoyStore, useVehicleStore } from "../store/index.js";

const Stat = ({ label, value, unit, color, glow, delta }) => (
  <div style={{
    background:"linear-gradient(135deg, rgba(10,15,30,0.9) 0%, rgba(15,22,45,0.9) 100%)",
    border:`1px solid ${color}33`,
    borderRadius:8, padding:"20px 24px",
    position:"relative", overflow:"hidden",
    boxShadow:`0 0 20px ${color}11`,
  }}>
    <div style={{
      position:"absolute", top:0, right:0, width:80, height:80,
      background:`radial-gradient(circle at 70% 30%, ${color}22, transparent 70%)`,
    }}/>
    <div style={{ fontSize:10, color:"#475569", letterSpacing:3, marginBottom:8 }}>{label}</div>
    <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
      <span style={{ fontSize:36, fontWeight:700, color, fontFamily:"'IBM Plex Mono', monospace",
        textShadow: glow ? `0 0 20px ${color}` : "none" }}>{value}</span>
      {unit && <span style={{ fontSize:12, color:"#475569" }}>{unit}</span>}
    </div>
    {delta !== undefined && (
      <div style={{ fontSize:10, color: delta >= 0 ? "#22c55e" : "#ef4444", marginTop:4, letterSpacing:1 }}>
        {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% from last cycle
      </div>
    )}
    <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2,
      background:`linear-gradient(90deg, ${color}44, ${color}, ${color}44)`,
      opacity:0.5 }}/>
  </div>
);

const EventLog = ({ events }) => (
  <div style={{
    background:"rgba(10,15,30,0.9)", border:"1px solid #1a2744",
    borderRadius:8, padding:20, height:320, overflow:"hidden", position:"relative",
  }}>
    <div style={{ fontSize:10, color:"#f59e0b", letterSpacing:3, marginBottom:16 }}>▸ EVENT STREAM</div>
    <div style={{ overflowY:"auto", height:"calc(100% - 36px)" }}>
      {events.length === 0 ? (
        <div style={{ color:"#334155", fontSize:11, textAlign:"center", paddingTop:60 }}>NO EVENTS</div>
      ) : events.map((e, i) => (
        <div key={i} style={{
          display:"flex", gap:12, padding:"8px 0",
          borderBottom:"1px solid #0f1729", alignItems:"flex-start",
          animation:"fadeIn 0.3s ease",
        }}>
          <span style={{ fontSize:9, color:"#334155", flexShrink:0, paddingTop:2 }}>
            {new Date(e.time || Date.now()).toLocaleTimeString()}
          </span>
          <span style={{
            fontSize:9, padding:"2px 6px", borderRadius:3, flexShrink:0,
            background: e.type === "alert" ? "rgba(239,68,68,0.2)" : e.type === "warning" ? "rgba(245,158,11,0.2)" : "rgba(34,197,94,0.2)",
            color: e.type === "alert" ? "#ef4444" : e.type === "warning" ? "#f59e0b" : "#22c55e",
            letterSpacing:1,
          }}>{(e.type || "INFO").toUpperCase()}</span>
          <span style={{ fontSize:11, color:"#94a3b8" }}>{e.message || e.description || "System event"}</span>
        </div>
      ))}
    </div>
    <div style={{ position:"absolute", bottom:0, left:0, right:0, height:40,
      background:"linear-gradient(transparent, rgba(10,15,30,0.95))" }}/>
  </div>
);

const FleetBar = ({ vehicles }) => {
  const counts = { active:0, idle:0, maintenance:0, offline:0 };
  vehicles.forEach(v => { counts[v.status] = (counts[v.status] || 0) + 1; });
  const total = vehicles.length || 1;
  const bars = [
    { key:"active", color:"#22c55e", label:"ACTIVE" },
    { key:"idle", color:"#3b82f6", label:"IDLE" },
    { key:"maintenance", color:"#f59e0b", label:"MAINT" },
    { key:"offline", color:"#ef4444", label:"OFFLINE" },
  ];
  return (
    <div style={{ background:"rgba(10,15,30,0.9)", border:"1px solid #1a2744", borderRadius:8, padding:20 }}>
      <div style={{ fontSize:10, color:"#f59e0b", letterSpacing:3, marginBottom:16 }}>▸ FLEET STATUS MATRIX</div>
      <div style={{ display:"flex", height:8, borderRadius:4, overflow:"hidden", gap:2, marginBottom:16 }}>
        {bars.map(b => (
          <div key={b.key} style={{
            flex: counts[b.key] || 0,
            background: b.color,
            boxShadow:`0 0 8px ${b.color}88`,
            minWidth: counts[b.key] ? 4 : 0,
            transition:"flex 0.5s ease",
          }}/>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {bars.map(b => (
          <div key={b.key} style={{ textAlign:"center" }}>
            <div style={{ fontSize:20, fontWeight:700, color:b.color }}>{counts[b.key] || 0}</div>
            <div style={{ fontSize:9, color:"#475569", letterSpacing:2 }}>{b.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { convoys, fetchConvoys } = useConvoyStore();
  const { vehicles, fetchVehicles } = useVehicleStore();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    fetchConvoys?.();
    fetchVehicles?.();
    const t = setInterval(() => {
      fetchConvoys?.();
      fetchVehicles?.();
      setTick(x => x+1);
    }, 30000);
    return () => clearInterval(t);
  }, []);

  const activeConvoys = convoys?.filter(c => c.status === "active")?.length || 0;
  const totalVehicles = vehicles?.length || 0;
  const activeVehicles = vehicles?.filter(v => v.status === "active")?.length || 0;
  const incidents = convoys?.reduce((a, c) => a + (c.incidents || 0), 0) || 0;

  const mockEvents = [
    { type:"info", message:"Convoy ALPHA-7 waypoint reached", time: Date.now()-120000 },
    { type:"warning", message:"Vehicle TK-441 fuel below 20%", time: Date.now()-300000 },
    { type:"alert", message:"Route deviation detected: BRAVO-3", time: Date.now()-600000 },
    { type:"info", message:"Maintenance scheduled: 3 vehicles", time: Date.now()-900000 },
    { type:"info", message:"System health check passed", time: Date.now()-1200000 },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
          <div style={{ width:3, height:24, background:"#f59e0b", borderRadius:2 }}/>
          <h1 style={{ fontSize:20, fontWeight:700, letterSpacing:4, color:"#e2e8f0", margin:0 }}>SITUATION REPORT</h1>
        </div>
        <div style={{ fontSize:10, color:"#334155", letterSpacing:3, paddingLeft:15 }}>
          OPERATIONAL OVERVIEW — CYCLE {tick.toString().padStart(4,"0")}
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px,1fr))", gap:16, marginBottom:24 }}>
        <Stat label="ACTIVE CONVOYS" value={activeConvoys} color="#f59e0b" glow delta={2} />
        <Stat label="FLEET STRENGTH" value={totalVehicles} color="#3b82f6" delta={0} />
        <Stat label="COMBAT READY" value={activeVehicles} color="#22c55e" glow delta={5} />
        <Stat label="INCIDENTS" value={incidents} color="#ef4444" delta={-1} />
      </div>

      {/* Middle row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
        <FleetBar vehicles={vehicles || []} />
        <EventLog events={mockEvents} />
      </div>

      {/* Convoy table */}
      <div style={{ background:"rgba(10,15,30,0.9)", border:"1px solid #1a2744", borderRadius:8, padding:20 }}>
        <div style={{ fontSize:10, color:"#f59e0b", letterSpacing:3, marginBottom:16 }}>▸ ACTIVE OPERATIONS</div>
        {(!convoys || convoys.length === 0) ? (
          <div style={{ color:"#334155", fontSize:11, textAlign:"center", padding:"40px 0", letterSpacing:2 }}>
            NO ACTIVE OPERATIONS
          </div>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
            <thead>
              <tr style={{ borderBottom:"1px solid #1a2744" }}>
                {["DESIGNATION","REGION","PRIORITY","STATUS","VEHICLES","PROGRESS"].map(h => (
                  <th key={h} style={{ padding:"8px 12px", textAlign:"left", color:"#334155", letterSpacing:2, fontSize:9, fontWeight:600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {convoys.slice(0,8).map((c, i) => {
                const statusColor = { active:"#22c55e", planned:"#3b82f6", completed:"#475569", archived:"#334155" }[c.status] || "#475569";
                const prioColor = { critical:"#ef4444", high:"#f59e0b", medium:"#3b82f6", low:"#22c55e" }[c.priority] || "#475569";
                return (
                  <tr key={c.id || i} style={{ borderBottom:"1px solid #0f1729", transition:"background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background="rgba(245,158,11,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <td style={{ padding:"10px 12px", color:"#e2e8f0", fontWeight:600 }}>{c.name || "UNNAMED"}</td>
                    <td style={{ padding:"10px 12px", color:"#64748b" }}>{c.region || "—"}</td>
                    <td style={{ padding:"10px 12px" }}>
                      <span style={{ fontSize:9, padding:"2px 8px", borderRadius:3, background:`${prioColor}22`, color:prioColor, letterSpacing:1 }}>
                        {(c.priority || "med").toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding:"10px 12px" }}>
                      <span style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ width:6, height:6, borderRadius:"50%", background:statusColor, boxShadow:`0 0 6px ${statusColor}` }}/>
                        <span style={{ color:statusColor, fontSize:10, letterSpacing:1 }}>{(c.status || "unknown").toUpperCase()}</span>
                      </span>
                    </td>
                    <td style={{ padding:"10px 12px", color:"#64748b" }}>{c.vehicle_count || 0}</td>
                    <td style={{ padding:"10px 12px", minWidth:120 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ flex:1, height:4, background:"#0f1729", borderRadius:2, overflow:"hidden" }}>
                          <div style={{ width:`${c.completion_pct || 0}%`, height:"100%", background:"#f59e0b",
                            boxShadow:"0 0 6px #f59e0b88", transition:"width 0.5s ease" }}/>
                        </div>
                        <span style={{ fontSize:10, color:"#64748b", minWidth:28 }}>{c.completion_pct || 0}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');
        @keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-track { background:#050810; }
        ::-webkit-scrollbar-thumb { background:#1a2744; border-radius:2px; }
      `}</style>
    </div>
  );
}
