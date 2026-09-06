import React from "react";
import { OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { easeOut, prog } from "../ui/anim";

/** 실사 클립 카드 — 라벨 + 노트 + 1280×720 영상 */
export const VideoCard: React.FC<{
  src: string;
  label: string;
  note?: string;
  width: number;
  x: number;
  y: number;
  start?: number;
  startFrom?: number;
  volume?: number;
}> = ({ src, label, note, width, x, y, start = 0, startFrom = 0, volume = 1 }) => {
  const frame = useCurrentFrame();
  const inP = easeOut(prog(frame, start, 16));
  const h = (width * 9) / 16;
  return (
    <div style={{ position: "absolute", left: x, top: y, width, opacity: inP, transform: `translateY(${(1 - inP) * 30}px)`, fontFamily: theme.font }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        <span style={{ background: theme.red, color: "#fff", fontFamily: theme.mono, fontSize: 14, letterSpacing: 2, padding: "6px 12px", borderRadius: 4 }}>● LIVE</span>
        <span style={{ fontSize: 26, fontWeight: 800, color: theme.ink }}>{label}</span>
        {note ? <span style={{ fontSize: 17, color: theme.grey, marginLeft: "auto" }}>{note}</span> : null}
      </div>
      <div style={{ width, height: h, borderRadius: 14, overflow: "hidden", background: "#000", border: `2px solid ${theme.panelBorder}`, boxShadow: "0 20px 50px rgba(15,27,45,0.18)", position: "relative" }}>
        <OffthreadVideo src={staticFile(src)} startFrom={startFrom} volume={volume} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        {/* 코너 브래킷 */}
        {[
          [0, 0, 1, 1],
          [1, 0, -1, 1],
          [0, 1, 1, -1],
          [1, 1, -1, -1],
        ].map(([px, py, sx, sy], i) => (
          <svg key={i} width="40" height="40" style={{ position: "absolute", left: px ? undefined : 10, right: px ? 10 : undefined, top: py ? undefined : 10, bottom: py ? 10 : undefined, transform: `scale(${sx}, ${sy})` }}>
            <path d="M 2 26 L 2 2 L 26 2" fill="none" stroke={theme.cyan} strokeWidth="3" />
          </svg>
        ))}
      </div>
    </div>
  );
};
