import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/index.js";
import api from "../services/api.js";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@convoy.local");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setAuthState } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) { setError("CREDENTIALS REQUIRED"); return; }
    setLoading(true); setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;
      setAuthState(user, token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "AUTHENTICATION FAILED");
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight:"100vh", background:"#050810",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'IBM Plex Mono', monospace",
      position:"relative", overflow:"hidden",
    }}>
      {/* Grid bg */}
      <div style={{
        position:"absolute", inset:0,
        backgroundImage:"linear-gradient(rgba(26,39,68,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(26,39,68,0.4) 1px, transparent 1px)",
        backgroundSize:"40px 40px",
      }}/>
      {/* Glow */}
      <div style={{ position:"absolute", top:"30%", left:"50%", transform:"translate(-50%,-50%)",
        width:600, height:600, background:"radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)", pointerEvents:"none" }}/>

      <div style={{ position:"relative", width:"100%", maxWidth:420, padding:24 }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{
            width:64, height:64, margin:"0 auto 16px",
            background:"linear-gradient(135deg, #f59e0b, #d97706)",
            clipPath:"polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:28, fontWeight:900, color:"#000",
          }}>C</div>
          <div style={{ fontSize:28, fontWeight:700, letterSpacing:8, color:"#f59e0b" }}>CONVOY</div>
          <div style={{ fontSize:10, color:"#334155", letterSpacing:4, marginTop:4 }}>FLEET & CONVOY MANAGEMENT SYSTEM</div>
        </div>

        {/* Card */}
        <div style={{
          background:"rgba(10,15,30,0.95)", border:"1px solid #1a2744",
          borderRadius:12, padding:32, backdropFilter:"blur(10px)",
          boxShadow:"0 20px 60px rgba(0,0,0,0.5)",
        }}>
          <div style={{ fontSize:10, color:"#334155", letterSpacing:3, marginBottom:24, textAlign:"center" }}>
            AUTHENTICATE TO PROCEED
          </div>

          {error && (
            <div style={{
              padding:"10px 14px", background:"rgba(239,68,68,0.1)",
              border:"1px solid rgba(239,68,68,0.3)", borderRadius:6,
              color:"#ef4444", fontSize:11, letterSpacing:1, marginBottom:16, textAlign:"center",
            }}>{error}</div>
          )}

          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:9, color:"#334155", letterSpacing:3, marginBottom:8 }}>EMAIL</div>
            <input value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{
                width:"100%", padding:"12px 14px", background:"rgba(15,23,42,0.8)",
                border:"1px solid #1a2744", borderRadius:6, color:"#e2e8f0",
                fontFamily:"'IBM Plex Mono', monospace", fontSize:12, outline:"none",
                boxSizing:"border-box", transition:"border-color 0.15s",
              }}
              onFocus={e => e.target.style.borderColor="#f59e0b44"}
              onBlur={e => e.target.style.borderColor="#1a2744"}
            />
          </div>

          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:9, color:"#334155", letterSpacing:3, marginBottom:8 }}>PASSWORD</div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{
                width:"100%", padding:"12px 14px", background:"rgba(15,23,42,0.8)",
                border:"1px solid #1a2744", borderRadius:6, color:"#e2e8f0",
                fontFamily:"'IBM Plex Mono', monospace", fontSize:12, outline:"none",
                boxSizing:"border-box", transition:"border-color 0.15s",
              }}
              onFocus={e => e.target.style.borderColor="#f59e0b44"}
              onBlur={e => e.target.style.borderColor="#1a2744"}
            />
          </div>

          <button onClick={handleLogin} disabled={loading} style={{
            width:"100%", padding:"14px", borderRadius:6, border:"none",
            background: loading ? "#1a2744" : "linear-gradient(135deg, #f59e0b, #d97706)",
            color: loading ? "#475569" : "#000",
            fontFamily:"'IBM Plex Mono', monospace", fontSize:12, fontWeight:700,
            letterSpacing:4, cursor: loading ? "not-allowed" : "pointer",
            transition:"all 0.15s",
          }}>
            {loading ? "AUTHENTICATING..." : "SIGN IN"}
          </button>

          <div style={{ marginTop:20, padding:"12px 16px", background:"rgba(15,23,42,0.5)",
            borderRadius:6, border:"1px solid #0f1729" }}>
            <div style={{ fontSize:9, color:"#334155", letterSpacing:2, marginBottom:6 }}>DEMO ACCESS</div>
            <div style={{ fontSize:10, color:"#475569" }}>admin@convoy.local</div>
            <div style={{ fontSize:10, color:"#475569" }}>password123</div>
          </div>
        </div>

        <div style={{ textAlign:"center", marginTop:20, fontSize:9, color:"#1a2744", letterSpacing:2 }}>
          SECURE MILITARY-GRADE OPERATIONS CENTER
        </div>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');`}</style>
    </div>
  );
}
