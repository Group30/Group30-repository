import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { product } from "../data";

const Corner: React.FC<{ style: React.CSSProperties; flipX?: boolean; flipY?: boolean }> = ({ style, flipX, flipY }) => (
  <svg width="70" height="70" style={{ position: "absolute", ...style, transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})` }}>
    <path d="M 2 40 L 2 2 L 40 2" fill="none" stroke={theme.blue} strokeWidth="3" />
    <path d="M 2 60 L 2 50" stroke={theme.blue} strokeWidth="3" />
    <path d="M 50 2 L 60 2" stroke={theme.blue} strokeWidth="3" />
  </svg>
);

const pad = (n: number, l = 2) => String(n).padStart(l, "0");

/** 네 귀퉁이 브래킷 + 상단 정보 + 하단 진행 바 */
export const HUD: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const sec = Math.floor(frame / fps);
  const tc = `${pad(Math.floor(sec / 60))}:${pad(sec % 60)}:${pad(frame % fps)}`;
  const m = 36;
  const progress = frame / durationInFrames;
  const mono: React.CSSProperties = { fontFamily: theme.mono, fontSize: 19, letterSpacing: 3, color: theme.blue, opacity: 0.9 };

  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
      <Corner style={{ left: m, top: m }} />
      <Corner style={{ right: m, top: m }} flipX />
      <Corner style={{ left: m, bottom: m }} flipY />
      <Corner style={{ right: m, bottom: m }} flipX flipY />
      <div style={{ position: "absolute", left: m + 90, top: m + 12, ...mono }}>
        {product.name.toUpperCase()} // {product.version}
      </div>
      <div style={{ position: "absolute", right: m + 90, top: m + 12, ...mono }}>REC ● {tc}</div>
      <div style={{ position: "absolute", left: m + 90, bottom: m + 22, width: width - (m + 90) * 2 - 200, height: 2, background: theme.line }}>
        <div style={{ width: `${progress * 100}%`, height: "100%", background: theme.blue, boxShadow: `0 0 8px ${theme.cyan}` }} />
      </div>
      <svg width={12} height={height} style={{ position: "absolute", left: 18, top: 0, opacity: 0.6 }}>
        {Array.from({ length: Math.floor(height / 40) }).map((_, i) => (
          <line key={i} x1={0} x2={i % 5 === 0 ? 12 : 6} y1={i * 40 + 20} y2={i * 40 + 20} stroke={theme.blue} strokeWidth={1} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
