import { useAuthStore } from "../store/index.js";

export default function SettingsPage() {
  const { user } = useAuthStore();
  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
          <div style={{ width:3, height:24, background:"#64748b", borderRadius:2 }}/>
          <h1 style={{ fontSize:20, fontWeight:700, letterSpacing:4, color:"#e2e8f0", margin:0 }}>SYSTEM CONFIG</h1>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:16 }}>
        {[
          { label:"OPERATOR PROFILE", items:[
            { k:"EMAIL", v: user?.email || "—" },
            { k:"ROLE", v: (user?.role || "viewer").toUpperCase() },
            { k:"STATUS", v: "ACTIVE" },
          ]},
          { label:"SYSTEM STATUS", items:[
            { k:"API", v: "CONNECTED" },
            { k:"DATABASE", v: "ONLINE" },
            { k:"VERSION", v: "2.0.0" },
          ]},
        ].map(section => (
          <div key={section.label} style={{ background:"rgba(10,15,30,0.9)", border:"1px solid #1a2744", borderRadius:8, padding:20 }}>
            <div style={{ fontSize:10, color:"#f59e0b", letterSpacing:3, marginBottom:16 }}>▸ {section.label}</div>
            {section.items.map(item => (
              <div key={item.k} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid #0f1729" }}>
                <span style={{ fontSize:10, color:"#334155", letterSpacing:2 }}>{item.k}</span>
                <span style={{ fontSize:11, color:"#94a3b8" }}>{item.v}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
