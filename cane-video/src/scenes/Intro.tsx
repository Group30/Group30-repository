import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { theme } from "../theme";
import { product } from "../data";
import { fadeInOut, easeOut, prog } from "../ui/anim";
import { TypeText } from "../components/TypeText";

/** 0–5s: 부팅 로그 → 제품명 → 한 줄 설명 */
export const Intro: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const op = fadeInOut(frame, duration, 6, 14);
  const boot = ["> RASPBERRY PI 5 ...... OK", "> ToF SENSOR ×8 ....... OK", "> VIBRATION MOTOR ×4 .. OK", "> BLE LINK: APP ....... OK"];
  const titleIn = easeOut(prog(frame, 40, 18));
  const tagIn = easeOut(prog(frame, 70, 20));
  const ringR = interpolate(frame, [20, 110], [0, Math.max(width, height) * 0.8], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: op, fontFamily: theme.font, color: theme.ink }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <circle cx={width / 2} cy={height / 2} r={ringR} fill="none" stroke={theme.blue} strokeWidth={2} opacity={interpolate(frame, [20, 110], [0.6, 0])} />
        <circle cx={width / 2} cy={height / 2} r={ringR * 0.6} fill="none" stroke={theme.cyan} strokeWidth={1.5} opacity={interpolate(frame, [20, 110], [0.5, 0])} />
      </svg>
      <div style={{ position: "absolute", left: 140, top: 140, fontFamily: theme.mono, fontSize: 21, color: theme.blue, opacity: 0.85, lineHeight: 1.8 }}>
        {boot.map((l, i) => (
          <div key={l} style={{ opacity: frame > 4 + i * 8 ? 1 : 0 }}>{l}</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: height * 0.36, textAlign: "center", transform: `translateY(${(1 - titleIn) * 40}px)`, opacity: titleIn }}>
        <div style={{ fontFamily: theme.mono, fontSize: 22, letterSpacing: 8, color: theme.blue, marginBottom: 16 }}>AI SMART CANE · {product.org}</div>
        <div style={{ fontSize: 150, fontWeight: 900, letterSpacing: -4, color: theme.ink, lineHeight: 1 }}>
          Smart<span style={{ color: theme.blue }}>Cane</span>
        </div>
        <div style={{ fontSize: 40, fontWeight: 600, color: theme.ink2, marginTop: 24, opacity: tagIn }}>
          <TypeText text={product.nameKo} start={74} fps={fps} cps={20} />
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 120, left: 0, right: 0, textAlign: "center", fontFamily: theme.mono, fontSize: 19, letterSpacing: 4, color: theme.grey, opacity: tagIn }}>
        {product.contest} · {product.team}
      </div>
    </AbsoluteFill>
  );
};
