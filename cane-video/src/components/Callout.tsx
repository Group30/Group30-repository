import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import type { Feature } from "../data";
import { easeOut, prog } from "../ui/anim";
import { TypeText } from "./TypeText";

const BOX_W = 490;
const BOX_H = 186;

/**
 * 콜아웃: 앵커 펄스 → 엘보 라인 → 라벨 박스 → 텍스트 타이핑 → 스펙
 * dir: anchor → (dx,dy) 엘보 → 수평 len (부호 = 박스가 뻗는 방향)
 */
export const Callout: React.FC<{
  feature: Feature;
  anchor: { x: number; y: number };
  start: number;
  index: number;
  fadeOut?: number;
}> = ({ feature, anchor, start, index, fadeOut }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - start;
  if (t < 0) return null;

  const { dx, dy, len } = feature.dir;
  const side = Math.sign(len) || 1;
  const E = { x: anchor.x + dx, y: anchor.y + dy };
  const L = { x: E.x + len, y: E.y };

  const ring = prog(t, 0, 24);
  const line = easeOut(prog(t, 8, 20));
  const box = easeOut(prog(t, 24, 14));
  const specP = easeOut(prog(t, 60, 18));
  const out = fadeOut !== undefined ? 1 - prog(frame, fadeOut, 12) : 1;

  const boxX = side > 0 ? L.x : L.x - BOX_W;
  const boxY = L.y - BOX_H / 2;
  const pulse = (frame % 40) / 40;

  return (
    <g opacity={out} style={{ fontFamily: theme.font }}>
      {/* 앵커 */}
      <circle cx={anchor.x} cy={anchor.y} r={10 + 60 * pulse} fill="none" stroke={theme.cyan} strokeWidth={2} opacity={(1 - pulse) * 0.8 * ring} />
      <circle cx={anchor.x} cy={anchor.y} r={14} fill="none" stroke={theme.blue} strokeWidth={2.5} opacity={ring} />
      <circle cx={anchor.x} cy={anchor.y} r={5} fill={theme.blue} opacity={ring} />
      <g transform={`rotate(${frame * 1.6} ${anchor.x} ${anchor.y})`} opacity={ring * 0.9}>
        <circle cx={anchor.x} cy={anchor.y} r={30} fill="none" stroke={theme.cyan} strokeWidth={2} strokeDasharray="30 18" />
      </g>

      {/* 라인 */}
      <path
        d={`M ${anchor.x} ${anchor.y} L ${E.x} ${E.y} L ${L.x} ${L.y}`}
        fill="none"
        stroke={theme.blue}
        strokeWidth={2.5}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - line}
        style={{ filter: `drop-shadow(0 0 5px ${theme.cyan})` }}
      />
      <circle cx={L.x} cy={L.y} r={5} fill={theme.blue} opacity={line >= 1 ? 1 : 0} />

      {/* 박스 */}
      <g opacity={box}>
        <rect
          x={side > 0 ? boxX : boxX + BOX_W * (1 - box)}
          y={boxY}
          width={BOX_W * box}
          height={BOX_H}
          rx={6}
          fill={theme.panel}
          stroke={theme.panelBorder}
          strokeWidth={1.5}
          style={{ filter: "drop-shadow(0 10px 24px rgba(15,27,45,0.12))" }}
        />
        <path d={`M ${boxX} ${boxY + 26} L ${boxX} ${boxY} L ${boxX + 26} ${boxY}`} fill="none" stroke={theme.blue} strokeWidth={3} />
        <path d={`M ${boxX + BOX_W} ${boxY + BOX_H - 26} L ${boxX + BOX_W} ${boxY + BOX_H} L ${boxX + BOX_W - 26} ${boxY + BOX_H}`} fill="none" stroke={theme.blue} strokeWidth={3} />
        <rect x={side > 0 ? boxX : boxX + BOX_W - 4} y={boxY} width={4} height={BOX_H} fill={theme.blue} />
        <foreignObject x={boxX + 24} y={boxY + 14} width={BOX_W - 48} height={BOX_H - 24}>
          <div style={{ fontFamily: theme.font, color: theme.ink, lineHeight: 1.2 }}>
            <div style={{ fontFamily: theme.mono, fontSize: 14, letterSpacing: 2, color: theme.blue }}>
              <TypeText text={feature.code} start={start + 30} fps={fps} cps={44} cursor={false} />
            </div>
            <div style={{ fontSize: 34, fontWeight: 800, marginTop: 6 }}>
              <TypeText text={feature.title} start={start + 36} fps={fps} cps={24} cursor={false} />
            </div>
            <div style={{ fontSize: 18, color: theme.ink2, marginTop: 4, fontWeight: 500 }}>
              <TypeText text={feature.sub} start={start + 48} fps={fps} cps={30} cursor={false} />
            </div>
            <div style={{ display: "flex", gap: 18, marginTop: 14, opacity: specP, flexWrap: "wrap" }}>
              {feature.spec.map((s) => (
                <div key={s.label} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontFamily: theme.mono, fontSize: 12, color: theme.grey, letterSpacing: 1 }}>{s.label}</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: theme.blue }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </foreignObject>
      </g>
      {/* 인덱스 배지 */}
      <g opacity={ring}>
        <circle cx={anchor.x - 30 * Math.sign(dx || 1)} cy={anchor.y - 30} r={15} fill="#fff" stroke={theme.blue} strokeWidth={2} />
        <text x={anchor.x - 30 * Math.sign(dx || 1)} y={anchor.y - 24} textAnchor="middle" fontFamily={theme.mono} fontSize={15} fill={theme.blue} fontWeight={700}>
          {String(index + 1).padStart(2, "0")}
        </text>
      </g>
    </g>
  );
};

export const DoneMarker: React.FC<{ anchor: { x: number; y: number }; index: number; opacity: number }> = ({ anchor, index, opacity }) => (
  <g opacity={opacity}>
    <circle cx={anchor.x} cy={anchor.y} r={10} fill="#fff" stroke={theme.blue} strokeWidth={2} />
    <text x={anchor.x} y={anchor.y + 4} textAnchor="middle" fontFamily={theme.mono} fontSize={11} fill={theme.blue} fontWeight={700}>
      {String(index + 1).padStart(2, "0")}
    </text>
  </g>
);
