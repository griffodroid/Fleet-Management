import { useState, useEffect } from "react";
import { useConvoyStore } from "../store/index.js";

const PRIO_COLORS = { critical:"#ef4444", high:"#f59e0b", medium:"#3b82f6", low:"#22c55e" };
const STATUS_COLORS = { active:"#22c55e", planned:"#3b82f6", completed:"#475569", archived:"#334155" };

export default function ConvoysPage() {
  const { convoys, fetchConvoys, loading } = useConvoyStore();
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => { fetchConvoys?.(); }, []);

  const filtered = (convoys || []).filter(c => filter === "all" || c.status === filter);
  const sel = selected ? convoys?.find(c => c.id === selected) : null;

  return (
    <div style={{ display:"grid", gridTemplateColumns: sel ? "1fr 380px" : "1fr", gap:20, height:"calc(100vh - 120px)" }}>
      {/* List */}
      <div>
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
            <div style={{ width:3, height:24, background:"#f59e0b", borderRadius:2 }}/>
            <h1 style={{ fontSize:20, fontWeight:700, letterSpacing:4, color:"#e2e8f0", margin:0 }}>CONVOY OPS</h1>
          </div>
          <div style={{ fontSize:10, color:"#334155", letterSpacing:3, paddingLeft:15 }}>{filtered.length} OPERATIONS</div>
        </div>

        <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
          {["all","active","planned","completed"].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding:"8px 14px", borderRadius:6, border:"1px solid",
              borderColor: filter === s ? "#f59e0b" : "#1a2744",
              background: filter === s ? "rgba(245,158,11,0.12)" : "rgba(10,15,30,0.9)",
              color: filter === s ? "#f59e0b" : "#475569",
              fontFamily:"'IBM Plex Mono', monospace", fontSize:10, letterSpacing:2, cursor:"pointer",
            }}>{s.toUpperCase()}</button>
          ))}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:10, overflowY:"auto", maxHeight:"calc(100vh - 240px)" }}>
          {loading ? (
            <div style={{ color:"#334155", textAlign:"center", padding:60, letterSpacing:3, fontSize:11 }}>LOADING...</div>
          ) : filtered.length === 0 ? (
            <div style={{ color:"#334155", textAlign:"center", padding:60, letterSpacing:3, fontSize:11 }}>NO OPERATIONS</div>
          ) : filtered.map((c, i) => {
            const sc = STATUS_COLORS[c.status] || "#475569";
            const pc = PRIO_COLORS[c.priority] || "#475569";
            const isSelected = selected === c.id;
            return (
              <div key={c.id || i} onClick={() => setSelected(isSelected ? null : c.id)} style={{
                background: isSelected ? "rgba(245,158,11,0.06)" : "rgba(10,15,30,0.9)",
                border: isSelected ? "1px solid #f59e0b44" : "1px solid #1a2744",
                borderRadius:8, padding:"16px 20px", cursor:"pointer",
                transition:"all 0.15s",
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor="#2d3f6e"; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor="#1a2744"; }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:"#e2e8f0", letterSpacing:2 }}>{c.name}</span>
                    <span style={{ fontSize:9, padding:"2px 8px", borderRadius:3, background:`${pc}22`, color:pc, letterSpacing:1 }}>
                      {(c.priority || "MED").toUpperCase()}
                    </span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:sc, boxShadow:`0 0 6px ${sc}` }}/>
                    <span style={{ fontSize:9, color:sc, letterSpacing:2 }}>{(c.status || "?").toUpperCase()}</span>
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:12 }}>
                  {[
                    { label:"VEHICLES", value: c.vehicle_count || 0 },
                    { label:"REGION", value: c.region || "—" },
                    { label:"INCIDENTS", value: c.incidents || 0 },
                  ].map(d => (
                    <div key={d.label}>
                      <div style={{ fontSize:8, color:"#334155", letterSpacing:2 }}>{d.label}</div>
                      <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>{d.value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ flex:1, height:4, background:"#0f1729", borderRadius:2 }}>
                    <div style={{ width:`${c.completion_pct || 0}%`, height:"100%", borderRadius:2,
                      background:"linear-gradient(90deg, #f59e0b, #fbbf24)", transition:"width 0.5s ease" }}/>
                  </div>
                  <span style={{ fontSize:10, color:"#64748b", minWidth:32 }}>{c.completion_pct || 0}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      {sel && (
        <div style={{
          background:"rgba(10,15,30,0.95)", border:"1px solid #1a2744",
          borderRadius:8, padding:24, overflowY:"auto",
          animation:"slideIn 0.2s ease",
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#f59e0b", letterSpacing:3 }}>OP DETAIL</div>
            <button onClick={() => setSelected(null)} style={{
              background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:16,
            }}>✕</button>
          </div>

          <div style={{ fontSize:18, fontWeight:700, color:"#e2e8f0", letterSpacing:2, marginBottom:4 }}>{sel.name}</div>
          <div style={{ fontSize:10, color:"#475569", marginBottom:20 }}>{sel.description || "No description"}</div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
            {[
              { label:"STATUS", value: (sel.status||"?").toUpperCase(), color: STATUS_COLORS[sel.status] },
              { label:"PRIORITY", value: (sel.priority||"?").toUpperCase(), color: PRIO_COLORS[sel.priority] },
              { label:"VEHICLES", value: sel.vehicle_count || 0 },
              { label:"INCIDENTS", value: sel.incidents || 0 },
              { label:"DISTANCE", value: sel.distance ? `${sel.distance} km` : "—" },
              { label:"RISK", value: (sel.risk_level||"—").toUpperCase() },
            ].map(d => (
              <div key={d.label} style={{ padding:"12px 16px", background:"rgba(15,23,42,0.8)", borderRadius:6 }}>
                <div style={{ fontSize:9, color:"#334155", letterSpacing:2, marginBottom:4 }}>{d.label}</div>
                <div style={{ fontSize:14, fontWeight:600, color: d.color || "#94a3b8" }}>{d.value}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:9, color:"#334155", letterSpacing:2, marginBottom:8 }}>MISSION PROGRESS</div>
            <div style={{ height:8, background:"#0f1729", borderRadius:4, overflow:"hidden" }}>
              <div style={{ width:`${sel.completion_pct||0}%`, height:"100%",
                background:"linear-gradient(90deg, #f59e0b, #fbbf24)",
                boxShadow:"0 0 10px #f59e0b88", transition:"width 0.5s" }}/>
            </div>
            <div style={{ textAlign:"right", fontSize:11, color:"#64748b", marginTop:6 }}>{sel.completion_pct||0}%</div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
      `}</style>
    </div>
  );
}
