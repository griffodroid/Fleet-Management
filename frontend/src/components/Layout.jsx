import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/index.js";

const NAV = [
  { path: "/dashboard", label: "SITREP", icon: "⬡", roles: ["admin","operator","viewer"] },
  { path: "/fleet",     label: "FLEET",  icon: "◈", roles: ["admin","operator"] },
  { path: "/convoys",   label: "CONVOY", icon: "◆", roles: ["admin","operator"] },
  { path: "/settings",  label: "CONFIG", icon: "⚙", roles: ["admin"] },
];

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };
  const role = user?.role || "viewer";

  return (
    <div style={{ display:"flex", height:"100vh", background:"#050810", color:"#e2e8f0", fontFamily:"'IBM Plex Mono', monospace", overflow:"hidden" }}>

      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 64 : 220,
        background: "linear-gradient(180deg, #0a0f1e 0%, #050810 100%)",
        borderRight: "1px solid #1a2744",
        display:"flex", flexDirection:"column",
        transition: "width 0.2s ease",
        flexShrink: 0,
        position:"relative",
        zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ padding:"24px 16px 20px", borderBottom:"1px solid #1a2744" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{
              width:36, height:36, background:"linear-gradient(135deg, #f59e0b, #d97706)",
              clipPath:"polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:16, fontWeight:900, color:"#000", flexShrink:0,
            }}>C</div>
            {!collapsed && (
              <div>
                <div style={{ fontSize:15, fontWeight:700, letterSpacing:4, color:"#f59e0b" }}>CONVOY</div>
                <div style={{ fontSize:9, color:"#475569", letterSpacing:2 }}>COMMAND & CONTROL</div>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"16px 8px", display:"flex", flexDirection:"column", gap:4 }}>
          {NAV.filter(n => n.roles.includes(role)).map(item => (
            <NavLink key={item.path} to={item.path} style={({ isActive }) => ({
              display:"flex", alignItems:"center", gap:12, padding:"10px 12px",
              borderRadius:6, textDecoration:"none", transition:"all 0.15s",
              background: isActive ? "rgba(245,158,11,0.12)" : "transparent",
              color: isActive ? "#f59e0b" : "#64748b",
              borderLeft: isActive ? "2px solid #f59e0b" : "2px solid transparent",
              fontSize:11, fontWeight:600, letterSpacing:3,
            })}>
              <span style={{ fontSize:16, flexShrink:0 }}>{item.icon}</span>
              {!collapsed && item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding:"16px 12px", borderTop:"1px solid #1a2744" }}>
          {!collapsed && (
            <div style={{ marginBottom:8, fontSize:10, color:"#475569", letterSpacing:2 }}>
              {user?.email || "OPERATOR"}
            </div>
          )}
          <button onClick={handleLogout} style={{
            width:"100%", padding:"8px 12px", background:"rgba(239,68,68,0.1)",
            border:"1px solid rgba(239,68,68,0.3)", borderRadius:6,
            color:"#ef4444", fontSize:10, letterSpacing:2, cursor:"pointer",
            fontFamily:"inherit", transition:"all 0.15s",
          }}
          onMouseEnter={e => e.target.style.background="rgba(239,68,68,0.2)"}
          onMouseLeave={e => e.target.style.background="rgba(239,68,68,0.1)"}
          >{collapsed ? "⏻" : "LOGOUT"}</button>
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)} style={{
          position:"absolute", top:"50%", right:-12, transform:"translateY(-50%)",
          width:24, height:24, background:"#1a2744", border:"1px solid #2d3f6e",
          borderRadius:"50%", color:"#64748b", cursor:"pointer", fontSize:10,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>{collapsed ? "›" : "‹"}</button>
      </aside>

      {/* Main */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Topbar */}
        <header style={{
          height:52, background:"rgba(10,15,30,0.95)",
          borderBottom:"1px solid #1a2744",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0 24px", flexShrink:0,
          backdropFilter:"blur(8px)",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 6px #22c55e" }}/>
              <span style={{ fontSize:10, color:"#22c55e", letterSpacing:2 }}>LIVE</span>
            </div>
            <span style={{ fontSize:10, color:"#334155", letterSpacing:1 }}>|</span>
            <span style={{ fontSize:10, color:"#475569", letterSpacing:2 }}>SYS NOMINAL</span>
          </div>
          <div style={{ fontSize:10, color:"#334155", letterSpacing:2 }}>
            {new Date().toUTCString().toUpperCase()}
          </div>
        </header>

        {/* Content */}
        <main style={{ flex:1, overflow:"auto", padding:24, position:"relative" }}>
          {/* Grid overlay effect */}
          <div style={{
            position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
            backgroundImage:"linear-gradient(rgba(26,39,68,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(26,39,68,0.3) 1px, transparent 1px)",
            backgroundSize:"40px 40px",
          }}/>
          <div style={{ position:"relative", zIndex:1 }}>{children}</div>
        </main>
      </div>
    </div>
  );
}
