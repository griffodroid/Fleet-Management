import { useState, useEffect } from "react";
import { useVehicleStore } from "../store/index.js";

const STATUS_COLORS = { active:"#22c55e", idle:"#3b82f6", maintenance:"#f59e0b", offline:"#ef4444", deployed:"#a855f7" };

export default function FleetPage() {
  const { vehicles, fetchVehicles, loading } = useVehicleStore();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => { fetchVehicles?.(); }, []);

  const filtered = (vehicles || []).filter(v => {
    const matchStatus = filter === "all" || v.status === filter;
    const matchSearch = !search || (v.registration || "").toLowerCase().includes(search.toLowerCase()) ||
      (v.type || "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
          <div style={{ width:3, height:24, background:"#3b82f6", borderRadius:2 }}/>
          <h1 style={{ fontSize:20, fontWeight:700, letterSpacing:4, color:"#e2e8f0", margin:0 }}>FLEET REGISTRY</h1>
        </div>
        <div style={{ fontSize:10, color:"#334155", letterSpacing:3, paddingLeft:15 }}>
          {filtered.length} UNITS DISPLAYED
        </div>
      </div>

      {/* Controls */}
      <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="SEARCH REGISTRATION / TYPE..."
          style={{
            flex:1, minWidth:200, padding:"10px 14px", background:"rgba(10,15,30,0.9)",
            border:"1px solid #1a2744", borderRadius:6, color:"#e2e8f0",
            fontFamily:"'IBM Plex Mono', monospace", fontSize:11, outline:"none",
          }}/>
        {["all","active","idle","maintenance","offline"].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding:"10px 16px", borderRadius:6, border:"1px solid",
            borderColor: filter === s ? STATUS_COLORS[s] || "#f59e0b" : "#1a2744",
            background: filter === s ? `${STATUS_COLORS[s] || "#f59e0b"}18` : "rgba(10,15,30,0.9)",
            color: filter === s ? STATUS_COLORS[s] || "#f59e0b" : "#475569",
            fontFamily:"'IBM Plex Mono', monospace", fontSize:10, letterSpacing:2,
            cursor:"pointer", transition:"all 0.15s",
          }}>{s.toUpperCase()}</button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign:"center", color:"#334155", padding:60, letterSpacing:3, fontSize:11 }}>LOADING...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:"center", color:"#334155", padding:60, letterSpacing:3, fontSize:11 }}>NO UNITS FOUND</div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px,1fr))", gap:16 }}>
          {filtered.map((v, i) => {
            const sc = STATUS_COLORS[v.status] || "#475569";
            const fuel = v.fuel_level ?? Math.floor(Math.random()*100);
            return (
              <div key={v.id || i} style={{
                background:"linear-gradient(135deg, rgba(10,15,30,0.95), rgba(15,22,45,0.95))",
                border:`1px solid ${sc}33`, borderRadius:8, padding:20,
                position:"relative", overflow:"hidden", cursor:"pointer",
                transition:"all 0.2s",
                boxShadow:`0 4px 20px ${sc}08`,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=`${sc}88`; e.currentTarget.style.transform="translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=`${sc}33`; e.currentTarget.style.transform="translateY(0)"; }}>
                <div style={{ position:"absolute", top:0, right:0, width:60, height:60,
                  background:`radial-gradient(circle, ${sc}18, transparent 70%)` }}/>

                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:"#e2e8f0", letterSpacing:2 }}>
                      {v.registration || "UNKNOWN"}
                    </div>
                    <div style={{ fontSize:10, color:"#475569", letterSpacing:1, marginTop:2 }}>
                      {v.make || ""} {v.model || v.type || ""}
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ width:8, height:8, borderRadius:"50%", background:sc, boxShadow:`0 0 8px ${sc}` }}/>
                    <span style={{ fontSize:9, color:sc, letterSpacing:2 }}>{(v.status || "UNKNOWN").toUpperCase()}</span>
                  </div>
                </div>

                {/* Fuel bar */}
                <div style={{ marginBottom:8 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:9, color:"#334155", letterSpacing:2 }}>FUEL</span>
                    <span style={{ fontSize:9, color: fuel < 20 ? "#ef4444" : "#64748b" }}>{fuel}%</span>
                  </div>
                  <div style={{ height:3, background:"#0f1729", borderRadius:2 }}>
                    <div style={{ width:`${fuel}%`, height:"100%", borderRadius:2, transition:"width 0.5s",
                      background: fuel < 20 ? "#ef4444" : fuel < 50 ? "#f59e0b" : "#22c55e",
                      boxShadow: fuel < 20 ? "0 0 6px #ef4444" : "none",
                    }}/>
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:12 }}>
                  {[
                    { label:"REGION", value: v.region || "—" },
                    { label:"MILEAGE", value: v.mileage ? `${Math.round(v.mileage).toLocaleString()} km` : "—" },
                    { label:"SPEED", value: v.speed ? `${v.speed} km/h` : "STATIC" },
                    { label:"CAPACITY", value: v.capacity || "—" },
                  ].map(d => (
                    <div key={d.label}>
                      <div style={{ fontSize:8, color:"#334155", letterSpacing:2 }}>{d.label}</div>
                      <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{d.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
