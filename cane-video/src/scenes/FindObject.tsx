import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { theme } from "../theme";
import { clips, findObjectSteps, timeline } from "../data";
import { fadeInOut, easeOut, prog } from "../ui/anim";
import { pointAt, toD, walkSchedule, type Pt } from "../ui/path";
import { AppFlow } from "../components/AppFlow";
import { GripZoom } from "../components/GripZoom";
import { VideoCard } from "../components/VideoCard";
import { TypeText } from "../components/TypeText";

const EXPLAIN = 300; // 10s 설명 애니메이션

/** 32–55s: 사용 1 · 물건 찾기(의자) — 방 미니맵 경로 + 진동 인셋 → 실사 클립 */
export const FindObject: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const op = fadeInOut(frame, duration, 10, 14);

  // ── 미니맵 (화면 좌표) ──
  const map = { x: 120, y: 250, w: 900, h: 660 };
  const path: Pt[] = [
    { x: map.x + 150, y: map.y + 560 },
    { x: map.x + 150, y: map.y + 300 },
    { x: map.x + 620, y: map.y + 300 },
    { x: map.x + 620, y: map.y + 150 },
  ];
  const chair = { x: map.x + 620, y: map.y + 92 };
  const sched = walkSchedule(path, 70, 34, 34); // 정지 34f → 이동 34f × 3구간, 도착 ≈ 274
  const walkStart = sched.starts[0];
  const walker = pointAt(path, sched.tAt(frame));
  const mapIn = easeOut(prog(frame, 6, 16));
  const drawP = easeOut(prog(frame, 30, 40));
  // 스텝별 표시 시작 프레임: 각 구간 정지 시작 + 도착
  const stepFrames = [...sched.starts, sched.arrive];
  const furniture = [
    { x: 40, y: 40, w: 260, h: 150, label: "침대" },
    { x: 560, y: 40, w: 260, h: 110, label: "책상" },
    { x: 700, y: 420, w: 140, h: 200, label: "옷장" },
  ];

  return (
    <AbsoluteFill style={{ opacity: op, fontFamily: theme.font, color: theme.ink }}>
      <Sequence from={0} durationInFrames={EXPLAIN} name="설명 애니메이션">
        <div style={{ position: "absolute", left: 140, top: 150 }}>
          <div style={{ fontFamily: theme.mono, fontSize: 19, letterSpacing: 4, color: theme.blue }}>물건 찾기</div>
          <div style={{ fontSize: 48, fontWeight: 800, marginTop: 8 }}>
            <TypeText text="“의자 찾아 줘” 한마디면, 진동이 방향을 알려줍니다." start={6} fps={fps} cps={18} />
          </div>
        </div>

        <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
          {/* 미니맵 카드 */}
          <g opacity={mapIn} transform={`translate(0 ${(1 - mapIn) * 20})`}>
            <rect x={map.x} y={map.y} width={map.w} height={map.h} rx={18} fill="#fff" stroke={theme.panelBorder} strokeWidth={1.5} style={{ filter: "drop-shadow(0 16px 40px rgba(15,27,45,0.10))" }} />
            <text x={map.x + 28} y={map.y + 40} fontFamily={theme.mono} fontSize={14} letterSpacing={2} fill={theme.blue}>ROOM MAP · 사용자 위치 → 의자 위치</text>
            {furniture.map((f) => (
              <g key={f.label}>
                <rect x={map.x + f.x} y={map.y + f.y + 30} width={f.w} height={f.h} rx={10} fill={theme.bg} stroke={theme.line} strokeWidth={1.5} />
                <text x={map.x + f.x + f.w / 2} y={map.y + f.y + 30 + f.h / 2 + 6} textAnchor="middle" fontSize={16} fill={theme.grey} fontWeight={600}>{f.label}</text>
              </g>
            ))}
            {/* 의자 (목표 객체) */}
            <g transform={`translate(${chair.x} ${chair.y})`}>
              <circle r={28 + 14 * ((frame % 40) / 40)} fill="none" stroke={theme.blue} strokeWidth={2} opacity={1 - (frame % 40) / 40} />
              <rect x={-16} y={-24} width={32} height={14} rx={4} fill={theme.blue} />
              <rect x={-18} y={-8} width={36} height={12} rx={4} fill={theme.ink} />
              <rect x={-15} y={4} width={4} height={16} fill={theme.ink} />
              <rect x={11} y={4} width={4} height={16} fill={theme.ink} />
              <text y={42} textAnchor="middle" fontSize={15} fontWeight={700} fill={theme.blue}>의자</text>
            </g>
            {/* 경로 */}
            <path d={toD(path)} fill="none" stroke={theme.line} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 14" />
            <path d={toD(path)} fill="none" stroke={theme.blue} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - drawP} style={{ filter: `drop-shadow(0 0 6px ${theme.cyan})` }} />
            {/* 사용자(시작) */}
            <g transform={`translate(${path[0].x} ${path[0].y})`}>
              <circle r={16} fill="#fff" stroke={theme.grey} strokeWidth={2} />
              <text y={5} textAnchor="middle" fontSize={14} fill={theme.grey}>S</text>
              <text y={40} textAnchor="middle" fontSize={15} fontWeight={700} fill={theme.grey}>사용자</text>
            </g>
            {/* 워커 */}
            <g transform={`translate(${walker.x} ${walker.y})`} opacity={frame >= walkStart ? 1 : 0}>
              <circle r={22} fill={theme.blue} opacity={0.18} />
              <circle r={12} fill={theme.blue} stroke="#fff" strokeWidth={3} />
            </g>
          </g>

          {/* 스텝별 그립 확대 */}
          {findObjectSteps.map((s, i) => {
            const at = Math.round(stepFrames[i]);
            const end = i < findObjectSteps.length - 1 ? Math.round(stepFrames[i + 1]) : EXPLAIN - 8;
            const p = i === findObjectSteps.length - 1 ? path[path.length - 1] : path[i];
            const off = i === 0 ? { x: 250, y: -80 } : i === 3 ? { x: 250, y: 120 } : i % 2 === 0 ? { x: 250, y: -20 } : { x: 250, y: 60 };
            return (
              <GripZoom key={s.label} x={p.x + off.x} y={p.y + off.y} from={p} motors={s.motors} start={at} end={end} label={`${s.label} · ${s.motors.length === 4 ? "4개 모터 동시" : `${s.motors.map((m) => ({ up: "위쪽", down: "아래쪽", left: "왼쪽", right: "오른쪽" })[m]).join("·")} 모터`} 진동`} />
            );
          })}
        </svg>

        {/* TTS 말풍선 */}
        {findObjectSteps.map((s, i) => {
          const at = Math.round(stepFrames[i]);
          const end = i < findObjectSteps.length - 1 ? Math.round(stepFrames[i + 1]) : EXPLAIN;
          const o = interpolate(frame, [at, at + 10, Math.max(at + 11, end - 8), Math.max(at + 12, end)], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={s.label} style={{ position: "absolute", right: width - (map.x + map.w) + 24, top: map.y + 18, opacity: o, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ background: theme.ink, color: "#fff", fontFamily: theme.mono, fontSize: 13, letterSpacing: 2, padding: "6px 10px", borderRadius: 6 }}>TTS</span>
              <span style={{ fontSize: 20, fontWeight: 700 }}>“{s.tts}”</span>
            </div>
          );
        })}

        <AppFlow x={1100} y={250} width={680} start={10} voice="의자 찾아 줘" intent="물건 찾기 · find_object" target="chair" action="YOLOv8n 탐지 → 3×3 방향 판단 → 진동 · TTS" />
      </Sequence>

      <Sequence from={EXPLAIN} durationInFrames={duration - EXPLAIN} name="실사: 물건 찾기">
        <VideoCard src={clips.findObject.src} label={clips.findObject.label} note={clips.findObject.note} width={1320} x={(width - 1320) / 2} y={140} volume={0.55} absStartSec={timeline.findObject[0] + EXPLAIN / fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
