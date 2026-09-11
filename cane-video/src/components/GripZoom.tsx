import React from "react";
import { useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { motorLabel, type MotorId } from "../data";
import { easeOut, prog } from "../ui/anim";

const POS: Record<MotorId, [number, number]> = { up: [0, -52], down: [0, 52], left: [-52, 0], right: [52, 0] };

/**
 * 그립 확대 인셋 — 4방향 진동모터 중 활성 모터가 펄스.
 * 화면 좌표 (x,y)는 인셋 중심. from 이 있으면 from → 인셋으로 연결선.
 */
export const GripZoom: React.FC<{
  x: number;
  y: number;
  motors: MotorId[];
  start: number;
  end?: number;
  from?: { x: number; y: number };
  label?: string;
  scale?: number;
}> = ({ x, y, motors, start, end, from, label, scale = 1 }) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0) return null;
  const inP = easeOut(prog(t, 0, 14));
  const outP = end !== undefined ? 1 - prog(frame, end - 10, 10) : 1;
  const op = inP * outP;
  const R = 96 * scale;
  const pulse = ((frame - start) % 18) / 18;
  const active = new Set(motors);
  const text = label ?? `${motors.map((m) => motorLabel[m]).join(" · ")} 모터 진동`;

  return (
    <g opacity={op} style={{ fontFamily: theme.font }}>
      {from ? (
        <line x1={from.x} y1={from.y} x2={x} y2={y} stroke={theme.blue} strokeWidth={2} strokeDasharray="6 6" opacity={0.8} />
      ) : null}
      <g transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * inP})`}>
        <circle r={R + 6} fill="none" stroke={theme.cyan} strokeWidth={2} strokeDasharray="14 10" opacity={0.7} transform={`rotate(${frame * 1.2})`} />
        <circle r={R} fill="#fff" stroke={theme.blue} strokeWidth={2.5} style={{ filter: "drop-shadow(0 10px 20px rgba(15,27,45,0.15))" }} />
        {/* 그립 단면 */}
        <rect x={-30 * scale} y={-70 * scale} width={60 * scale} height={140 * scale} rx={24 * scale} fill="#2a3441" />
        {[-18, -6, 6, 18].map((dy) => (
          <rect key={dy} x={-22 * scale} y={(dy - 2) * scale} width={44 * scale} height={3 * scale} rx={1.5} fill="#1c2430" opacity={0.8} />
        ))}
        {(Object.keys(POS) as MotorId[]).map((m) => {
          const [mx, my] = POS[m];
          const on = active.has(m);
          return (
            <g key={m} transform={`translate(${mx * scale} ${my * scale})`}>
              {on ? (
                <>
                  <circle r={(12 + 26 * pulse) * scale} fill="none" stroke={theme.blue} strokeWidth={2.5} opacity={1 - pulse} />
                  <circle r={(12 + 26 * ((pulse + 0.5) % 1)) * scale} fill="none" stroke={theme.cyan} strokeWidth={2} opacity={1 - ((pulse + 0.5) % 1)} />
                </>
              ) : null}
              <circle r={11 * scale} fill={on ? theme.blue : "#e6ebf2"} stroke={on ? theme.blue : theme.line} strokeWidth={2} />
              <text y={4 * scale} textAnchor="middle" fontFamily={theme.mono} fontSize={10 * scale} fontWeight={700} fill={on ? "#fff" : theme.grey}>
                {m === "up" ? "▲" : m === "down" ? "▼" : m === "left" ? "◀" : "▶"}
              </text>
            </g>
          );
        })}
      </g>
      {/* 라벨 */}
      <g transform={`translate(${x} ${y + R + 34})`}>
        <rect x={-120} y={-18} width={240} height={36} rx={18} fill={theme.blue} />
        <text textAnchor="middle" y={6} fontFamily={theme.font} fontSize={17} fontWeight={700} fill="#fff">
          {text}
        </text>
      </g>
    </g>
  );
};
