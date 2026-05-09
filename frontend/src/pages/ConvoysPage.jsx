import { useState, useEffect } from "react";
import { useConvoyStore } from "../store/index.js";
const PC = { critical:"#ef4444", high:"#f59e0b", medium:"#3b82f6", low:"#22c55e" };
const SC = { active:"#22c55e", planned:"#3b82f6", completed:"#475569", archived:"#334155" };
export default function ConvoysPage() {
  const { convoys, fetchConvoys, loading } = useConvoyStore();
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  useEffect(() => { fetchConvoys?.(); }, []);
  const filtered = (convoys||[]).filter(c=>filter==="all"||c.status===filter);
  const sel = selected ? (convoys||[]).find(c=>c.id===selected) : null;
  return (
    <div style={{ display:"grid", gridTemplateColumns:sel?"1fr 360px":"1fr", gap:20 }}>
      <div>
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
            <div style={{ width:3, height:24, background:"#f59e0b", borderRadius:2 }}/>
            <h1 style={{ fontSize:20, fontWeight:700, letterSpacing:4, color:"#e2e8f0", margin:0 }}>CONVOY OPS</h1>
          </div>
          <div style={{ fontSize:10, color:"#334155", letterSpacing:3, paddingLeft:15 }}>{filtered.length} OPERATIONS</div>
        </div>
        <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
          {["all","active","planned","completed"].map(s=>(
            <button key={s} onClick={()=>setFilter(s)} style={{ padding:"8px 14px", borderRadius:6, border:"1px solid", borderColor:filter===s?"#f59e0b":"#1a2744", background:filter===s?"rgba(245,158,11,0.12)":"rgba(10,15,30,0.9)", color:filter===s?"#f59e0b":"#475569", fontFamily:"IBM Plex Mono,monospace", fontSize:10, letterSpacing:2, cursor:"pointer" }}>{s.toUpperCase()}</button>
          ))}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {loading ? <div style={{ color:"#334155", textAlign:"center", padding:60, letterSpacing:3 }}>LOADING...</div>
          : filtered.length===0 ? <div style={{ color:"#334155", textAlign:"center", padding:60, letterSpacing:3 }}>NO OPERATIONS</div>
          : filtered.map((c,i)=>{
            const sc=SC[c.status]||"#475569"; const pc=PC[c.priority]||"#475569";
            const isSel=selected===c.id;
            return (
              <div key={c.id||i} onClick={()=>setSelected(isSel?null:c.id)} style={{ background:isSel?"rgba(245,158,11,0.06)":"rgba(10,15,30,0.9)", border:isSel?"1px solid #f59e0b44":"1px solid #1a2744", borderRadius:8, padding:"16px 20px", cursor:"pointer", transition:"all 0.15s" }}
                onMouseEnter={e=>{if(!isSel)e.currentTarget.style.borderColor="#2d3f6e";}}
                onMouseLeave={e=>{if(!isSel)e.currentTarget.style.borderColor="#1a2744";}}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:"#e2e8f0", letterSpacing:2 }}>{c.name}</span>
                    <span style={{ fontSize:9, padding:"2px 8px", borderRadius:3, background:`${pc}22`, color:pc, letterSpacing:1 }}>{(c.priority||"MED").toUpperCase()}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:sc, boxShadow:`0 0 6px ${sc}` }}/>
                    <span style={{ fontSize:9, color:sc, letterSpacing:2 }}>{(c.status||"?").toUpperCase()}</span>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:12 }}>
                  {[["VEHICLES",c.vehicle_count||0],["REGION",c.region||"—"],["INCIDENTS",c.incidents||0]].map(([l,v])=>(
                    <div key={l}><div style={{ fontSize:8, color:"#334155", letterSpacing:2 }}>{l}</div><div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>{v}</div></div>
                  ))}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ flex:1, height:4, background:"#0f1729", borderRadius:2 }}>
                    <div style={{ width:`${c.completion_pct||0}%`, height:"100%", borderRadius:2, background:"linear-gradient(90deg,#f59e0b,#fbbf24)" }}/>
                  </div>
                  <span style={{ fontSize:10, color:"#64748b" }}>{c.completion_pct||0}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {sel && (
        <div style={{ background:"rgba(10,15,30,0.95)", border:"1px solid #1a2744", borderRadius:8, padding:24, height:"fit-content" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#f59e0b", letterSpacing:3 }}>OP DETAIL</div>
            <button onClick={()=>setSelected(null)} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:16 }}>✕</button>
          </div>
          <div style={{ fontSize:18, fontWeight:700, color:"#e2e8f0", letterSpacing:2, marginBottom:4 }}>{sel.name}</div>
          <div style={{ fontSize:10, color:"#475569", marginBottom:20 }}>{sel.description||"No description"}</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
            {[["STATUS",(sel.status||"?").toUpperCase(),SC[sel.status]],["PRIORITY",(sel.priority||"?").toUpperCase(),PC[sel.priority]],["VEHICLES",sel.vehicle_count||0],["INCIDENTS",sel.incidents||0],["DISTANCE",sel.distance?`${sel.distance} km`:"—"],["RISK",(sel.risk_level||"—").toUpperCase()]].map(([l,v,c])=>(
              <div key={l} style={{ padding:"12px 16px", background:"rgba(15,23,42,0.8)", borderRadius:6 }}>
                <div style={{ fontSize:9, color:"#334155", letterSpacing:2, marginBottom:4 }}>{l}</div>
                <div style={{ fontSize:14, fontWeight:600, color:c||"#94a3b8" }}>{v}</div>
              </div>
            ))}
          </div>
          <div><div style={{ fontSize:9, color:"#334155", letterSpacing:2, marginBottom:8 }}>MISSION PROGRESS</div>
          <div style={{ height:8, background:"#0f1729", borderRadius:4 }}>
            <div style={{ width:`${sel.completion_pct||0}%`, height:"100%", background:"linear-gradient(90deg,#f59e0b,#fbbf24)", boxShadow:"0 0 10px #f59e0b88" }}/>
          </div>
          <div style={{ textAlign:"right", fontSize:11, color:"#64748b", marginTop:6 }}>{sel.completion_pct||0}%</div></div>
        </div>
      )}
    </div>
  );
}