import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { theme } from "../theme";
import { product, appFunctions } from "../data";
import { fadeInOut, springIn, easeOut, prog } from "../ui/anim";

/** 82–90s: 기능 요약 → 제품명 · 팀 · 공모전 */
export const Outro: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const op = fadeInOut(frame, duration, 10, 30);
  const titleIn = easeOut(prog(frame, 110, 24));
  const listOut = interpolate(frame, [100, 118], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: op, fontFamily: theme.font, color: theme.ink }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: height * 0.2, opacity: listOut }}>
        <div style={{ textAlign: "center", fontFamily: theme.mono, fontSize: 19, letterSpacing: 4, color: theme.blue, marginBottom: 30 }}>// 05  SUMMARY · 앱 기능</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
          {appFunctions.map((f, i) => {
            const s = springIn(frame, fps, 8 + i * 8);
            return (
              <div key={f.code} style={{ display: "flex", alignItems: "center", gap: 24, width: 900, opacity: s, transform: `translateX(${(1 - s) * 40}px)`, background: "#fff", border: `1.5px solid ${theme.panelBorder}`, borderRadius: 14, padding: "16px 28px", boxShadow: "0 10px 30px rgba(15,27,45,0.08)" }}>
                <span style={{ fontFamily: theme.mono, fontSize: 18, color: theme.blue, letterSpacing: 2 }}>{f.code}</span>
                <span style={{ width: 36, height: 2, background: theme.blue }} />
                <span style={{ fontSize: 32, fontWeight: 800 }}>{f.title}</span>
                <span style={{ fontSize: 20, color: theme.ink2, marginLeft: "auto" }}>{f.desc}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: height * 0.32, textAlign: "center", opacity: titleIn, transform: `scale(${0.92 + 0.08 * titleIn})` }}>
        <div style={{ fontFamily: theme.mono, fontSize: 22, letterSpacing: 8, color: theme.blue }}>AI SMART CANE · {product.org}</div>
        <div style={{ fontSize: 130, fontWeight: 900, letterSpacing: -4, marginTop: 8, lineHeight: 1 }}>
          Smart<span style={{ color: theme.blue }}>Cane</span>
        </div>
        <div style={{ fontSize: 36, color: theme.ink2, marginTop: 20 }}>{product.tagline}</div>
        <div style={{ width: 120, height: 3, background: theme.blue, margin: "40px auto" }} />
        <div style={{ fontSize: 34, fontWeight: 800 }}>{product.team}</div>
        <div style={{ fontFamily: theme.mono, fontSize: 19, letterSpacing: 3, color: theme.grey, marginTop: 10 }}>{product.contest}</div>
      </div>
      <div style={{ position: "absolute", right: 160, bottom: 130, width: 130, height: 130, border: `2px dashed ${theme.line}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: theme.mono, fontSize: 13, color: theme.grey, textAlign: "center", opacity: titleIn }}>
        QR /<br />로고 자리
      </div>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity: 0.35 * titleIn }}>
        <circle cx={width / 2} cy={height / 2} r={interpolate(frame, [110, 300], [200, 900])} fill="none" stroke={theme.blue} strokeWidth={1} strokeDasharray="4 14" />
      </svg>
    </AbsoluteFill>
  );
};
