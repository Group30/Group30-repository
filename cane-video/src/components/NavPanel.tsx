import React from "react";
import { useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { motorLabel, type MotorId } from "../data";
import { easeOut, prog } from "../ui/anim";

/** 앱 '길안내' 패널 — 목적지, 현재 안내, 연결된 진동모터 표시 (화면 설계서 UI-03-01 기준) */
export const NavPanel: React.FC<{
  x: number;
  y: number;
  width: number;
  start: number;
  dest: string;
  total: string;
  guide: string;
  dist: string;
  motors: MotorId[];
  warning?: string;
}> = ({ x, y, width, start, dest, total, guide, dist, motors, warning }) => {
  const frame = useCurrentFrame();
  const inP = easeOut(prog(frame, start, 14));
  const pulse = (frame % 16) / 16;
  const active = new Set(motors);
  const Btn: React.FC<{ m: MotorId; style: React.CSSProperties }> = ({ m, style }) => {
    const on = active.has(m);
    return (
      <div style={{ position: "absolute", width: 64, height: 64, borderRadius: 12, border: `2px solid ${on ? theme.blue : theme.line}`, background: on ? theme.blue : "#fff", color: on ? "#fff" : theme.grey, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, boxShadow: on ? `0 0 0 ${6 * pulse}px rgba(37,99,235,${0.35 * (1 - pulse)})` : undefined, ...style }}>
        <span style={{ fontSize: 16 }}>{m === "up" ? "▲" : m === "down" ? "▼" : m === "left" ? "◀" : "▶"}</span>
        {motorLabel[m]}
      </div>
    );
  };
  return (
    <div style={{ position: "absolute", left: x, top: y, width, opacity: inP, transform: `translateY(${(1 - inP) * 20}px)`, fontFamily: theme.font, background: "#fff", border: `1.5px solid ${theme.panelBorder}`, borderRadius: 18, boxShadow: "0 16px 40px rgba(15,27,45,0.10)", padding: 26 }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: theme.ink }}>길안내</div>
      {warning ? (
        <div style={{ marginTop: 12, background: theme.redSoft, border: `1.5px solid ${theme.red}`, borderRadius: 12, padding: "10px 14px", color: theme.red, fontWeight: 800, fontSize: 17 }}>⚠ {warning}</div>
      ) : null}
      <div style={{ marginTop: 12, background: theme.bg, borderRadius: 12, padding: "12px 16px" }}>
        <div style={{ fontSize: 13, color: theme.grey }}>목적지</div>
        <div style={{ fontSize: 19, fontWeight: 700, color: theme.ink }}>{dest}</div>
        <div style={{ fontSize: 13, color: theme.grey, marginTop: 2 }}>{total}</div>
      </div>
      <div style={{ marginTop: 12, background: theme.blueSoft, borderRadius: 12, padding: "12px 16px", display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: theme.blue, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>➤</div>
        <div>
          <div style={{ fontSize: 13, color: theme.blue, fontWeight: 700 }}>현재 안내 · {dist}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: theme.ink }}>{guide}</div>
        </div>
      </div>
      <div style={{ marginTop: 14, fontSize: 14, color: theme.ink2, fontWeight: 600 }}>◐ 현재 안내와 연결된 진동모터 표시</div>
      <div style={{ position: "relative", height: 210, marginTop: 6 }}>
        <div style={{ position: "absolute", left: "50%", top: 62, width: 16, height: 90, marginLeft: -8, borderRadius: 8, background: "#2a3441" }} />
        <Btn m="up" style={{ left: "50%", marginLeft: -32, top: 0 }} />
        <Btn m="down" style={{ left: "50%", marginLeft: -32, top: 146 }} />
        <Btn m="left" style={{ left: "50%", marginLeft: -120, top: 73 }} />
        <Btn m="right" style={{ left: "50%", marginLeft: 56, top: 73 }} />
      </div>
      <div style={{ fontSize: 13, color: theme.grey, fontFamily: theme.mono }}>
        {motors.length ? `${motors.map((m) => motorLabel[m]).join("·")} 모터 : activated` : "현재 울리는 모터 없음"}
      </div>
    </div>
  );
};
