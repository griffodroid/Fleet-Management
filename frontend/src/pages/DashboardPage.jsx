import { useState, useEffect } from "react";
import { useConvoyStore, useVehicleStore } from "../store/index.js";
const Stat = ({ label, value, color, delta }) => (
  <div style={{ background:"linear-gradient(135deg,rgba(10,15,30,0.9),rgba(15,22,45,0.9))", border:`1px solid ${color}33`, borderRadius:8, padding:"20px 24px", position:"relative", overflow:"hidden", boxShadow:`0 0 20px ${color}11` }}>
    <div style={{ position:"absolute", top:0, right:0, width:80, height:80, background:`radial-gradient(circle at 70% 30%,${color}22,transparent 70%)` }}/>
    <div style={{ fontSize:10, color:"#475569", letterSpacing:3, marginBottom:8 }}>{label}</div>
    <div style={{ fontSize:36, fontWeight:700, color, fontFamily:"IBM Plex Mono,monospace" }}>{value}</div>
    {delta !== undefined && <div style={{ fontSize:10, color:delta>=0?"#22c55e":"#ef4444", marginTop:4 }}>{delta>=0?"▲":"▼"} {Math.abs(delta)}% vs last cycle</div>}
    <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${color}44,${color},${color}44)`, opacity:0.5 }}/>
  </div>
);
export default function DashboardPage() {
  const { convoys, fetchConvoys } = useConvoyStore();
  const { vehicles, fetchVehicles } = useVehicleStore();
  useEffect(() => {
    fetchConvoys?.(); fetchVehicles?.();
    const t = setInterval(() => { fetchConvoys?.(); fetchVehicles?.(); }, 30000);
    return () => clearInterval(t);
  }, []);
  const activeConvoys = convoys?.filter(c=>c.status==="active")?.length||0;
  const totalVehicles = vehicles?.length||0;
  const activeVehicles = vehicles?.filter(v=>v.status==="active")?.length||0;
  const incidents = convoys?.reduce((a,c)=>a+(c.incidents||0),0)||0;
  const SC = { active:"#22c55e", idle:"#3b82f6", maintenance:"#f59e0b", offline:"#ef4444" };
  const PC = { critical:"#ef4444", high:"#f59e0b", medium:"#3b82f6", low:"#22c55e" };
  const counts = {}; (vehicles||[]).forEach(v=>{ counts[v.status]=(counts[v.status]||0)+1; });
  const total = (vehicles||[]).length||1;
  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
          <div style={{ width:3, height:24, background:"#f59e0b", borderRadius:2 }}/>
          <h1 style={{ fontSize:20, fontWeight:700, letterSpacing:4, color:"#e2e8f0", margin:0 }}>SITUATION REPORT</h1>
        </div>
        <div style={{ fontSize:10, color:"#334155", letterSpacing:3, paddingLeft:15 }}>OPERATIONAL OVERVIEW</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:24 }}>
        <Stat label="ACTIVE CONVOYS" value={activeConvoys} color="#f59e0b" delta={2}/>
        <Stat label="FLEET STRENGTH" value={totalVehicles} color="#3b82f6" delta={0}/>
        <Stat label="COMBAT READY" value={activeVehicles} color="#22c55e" delta={5}/>
        <Stat label="INCIDENTS" value={incidents} color="#ef4444" delta={-1}/>
      </div>
      <div style={{ background:"rgba(10,15,30,0.9)", border:"1px solid #1a2744", borderRadius:8, padding:20, marginBottom:24 }}>
        <div style={{ fontSize:10, color:"#f59e0b", letterSpacing:3, marginBottom:16 }}>▸ FLEET STATUS MATRIX</div>
        <div style={{ display:"flex", height:8, borderRadius:4, overflow:"hidden", gap:2, marginBottom:16 }}>
          {[["active","#22c55e"],["idle","#3b82f6"],["maintenance","#f59e0b"],["offline","#ef4444"]].map(([s,c])=>(
            <div key={s} style={{ flex:counts[s]||0, background:c, boxShadow:`0 0 8px ${c}88`, minWidth:counts[s]?4:0 }}/>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
          {[["ACTIVE","active","#22c55e"],["IDLE","idle","#3b82f6"],["MAINT","maintenance","#f59e0b"],["OFFLINE","offline","#ef4444"]].map(([l,s,c])=>(
            <div key={s} style={{ textAlign:"center" }}>
              <div style={{ fontSize:20, fontWeight:700, color:c }}>{counts[s]||0}</div>
              <div style={{ fontSize:9, color:"#475569", letterSpacing:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background:"rgba(10,15,30,0.9)", border:"1px solid #1a2744", borderRadius:8, padding:20 }}>
        <div style={{ fontSize:10, color:"#f59e0b", letterSpacing:3, marginBottom:16 }}>▸ ACTIVE OPERATIONS</div>
        {!convoys?.length ? (
          <div style={{ color:"#334155", textAlign:"center", padding:"40px 0", letterSpacing:3, fontSize:11 }}>NO ACTIVE OPERATIONS</div>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
            <thead><tr style={{ borderBottom:"1px solid #1a2744" }}>
              {["DESIGNATION","REGION","PRIORITY","STATUS","VEHICLES","PROGRESS"].map(h=>(
                <th key={h} style={{ padding:"8px 12px", textAlign:"left", color:"#334155", letterSpacing:2, fontSize:9, fontWeight:600 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{convoys.slice(0,8).map((c,i)=>{
              const sc=SC[c.status]||"#475569"; const pc=PC[c.priority]||"#475569";
              return (
                <tr key={c.id||i} style={{ borderBottom:"1px solid #0f1729" }}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(245,158,11,0.04)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"10px 12px", color:"#e2e8f0", fontWeight:600 }}>{c.name||"UNNAMED"}</td>
                  <td style={{ padding:"10px 12px", color:"#64748b" }}>{c.region||"—"}</td>
                  <td style={{ padding:"10px 12px" }}><span style={{ fontSize:9, padding:"2px 8px", borderRadius:3, background:`${pc}22`, color:pc, letterSpacing:1 }}>{(c.priority||"MED").toUpperCase()}</span></td>
                  <td style={{ padding:"10px 12px" }}><span style={{ display:"flex", alignItems:"center", gap:6 }}><span style={{ width:6, height:6, borderRadius:"50%", background:sc, boxShadow:`0 0 6px ${sc}` }}/><span style={{ color:sc, fontSize:10 }}>{(c.status||"?").toUpperCase()}</span></span></td>
                  <td style={{ padding:"10px 12px", color:"#64748b" }}>{c.vehicle_count||0}</td>
                  <td style={{ padding:"10px 12px", minWidth:120 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ flex:1, height:4, background:"#0f1729", borderRadius:2 }}><div style={{ width:`${c.completion_pct||0}%`, height:"100%", background:"#f59e0b", boxShadow:"0 0 6px #f59e0b88" }}/></div>
                      <span style={{ fontSize:10, color:"#64748b" }}>{c.completion_pct||0}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}