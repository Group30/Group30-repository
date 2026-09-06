import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { theme } from "../theme";
import { clips, navigateSteps, type MotorId } from "../data";
import { fadeInOut, easeOut, prog } from "../ui/anim";
import { pointAt, toD, walkSchedule, type Pt } from "../ui/path";
import { NavPanel } from "../components/NavPanel";
import { GripZoom } from "../components/GripZoom";
import { VideoCard } from "../components/VideoCard";
import { TypeText } from "../components/TypeText";

const EXPLAIN = 300; // 길안내 설명 10s
const OBST = 120; // 장애물 감지 4s
const CLIP1 = 150; // 장애물 실사 5s

/** 55–82s: 사용 2 · 길안내(카카오 경로 + 진동) → 장애물 위험 감지 → 실사 2클립 */
export const Navigate: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const op = fadeInOut(frame, duration, 10, 14);

  const map = { x: 120, y: 250, w: 900, h: 660 };
  const path: Pt[] = [
    { x: map.x + 120, y: map.y + 580 },
    { x: map.x + 120, y: map.y + 330 },
    { x: map.x + 480, y: map.y + 330 },
    { x: map.x + 480, y: map.y + 120 },
    { x: map.x + 760, y: map.y + 120 },
  ];
  const dest = path[path.length - 1];
  const sched = walkSchedule(path, 70, 28, 24); // 정지 28f → 이동 24f × 4구간, 도착 ≈ 278
  const walkStart = sched.starts[0];
  const walker = pointAt(path, sched.tAt(frame));
  const mapIn = easeOut(prog(frame, 6, 16));
  const drawP = easeOut(prog(frame, 30, 40));
  const stepFrames = [...sched.starts, sched.arrive];
  const stepIdx = Math.max(0, stepFrames.findIndex((f, i) => frame >= f && (i === stepFrames.length - 1 || frame < stepFrames[i + 1])));
  const cur = frame >= stepFrames[0] ? navigateSteps[stepIdx] : null;

  // 도로 블록 (간략 지도)
  const blocks: { x: number; y: number; w: number; h: number }[] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) blocks.push({ x: 40 + c * 300, y: 60 + r * 210, w: 220, h: 150 });

  // ── 장애물 감지 파트 (로컬 프레임 = frame - EXPLAIN) ──
  const ot = frame - EXPLAIN;
  const obstIn = easeOut(prog(ot, 0, 16));
  const obstacleX = interpolate(ot, [20, 70], [560, 330], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dangerP = easeOut(prog(ot, 60, 12));
  const distCm = Math.round(interpolate(obstacleX, [330, 560], [89, 220]));
  const vibCount = distCm < 100 ? 3 : distCm < 150 ? 2 : 1;
  const obstMotors: MotorId[] = dangerP > 0 ? ["up"] : [];

  return (
    <AbsoluteFill style={{ opacity: op, fontFamily: theme.font, color: theme.ink }}>
      {/* ── 길안내 설명 ── */}
      <Sequence from={0} durationInFrames={EXPLAIN} name="설명: 길안내">
        <div style={{ position: "absolute", left: 140, top: 150 }}>
          <div style={{ fontFamily: theme.mono, fontSize: 19, letterSpacing: 4, color: theme.blue }}>// 04  USE CASE 2 · 길안내</div>
          <div style={{ fontSize: 48, fontWeight: 800, marginTop: 8 }}>
            <TypeText text="“근처 편의점으로 안내해 줘” — 카카오 경로를 진동으로." start={6} fps={fps} cps={18} />
          </div>
        </div>
        <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
          <g opacity={mapIn} transform={`translate(0 ${(1 - mapIn) * 20})`}>
            <rect x={map.x} y={map.y} width={map.w} height={map.h} rx={18} fill="#fff" stroke={theme.panelBorder} strokeWidth={1.5} style={{ filter: "drop-shadow(0 16px 40px rgba(15,27,45,0.10))" }} />
            <text x={map.x + 28} y={map.y + 40} fontFamily={theme.mono} fontSize={14} letterSpacing={2} fill={theme.blue}>KAKAO ROUTE · 도보 경로 · 총 거리 392 m · 예상 6분</text>
            {blocks.map((b, i) => (
              <rect key={i} x={map.x + b.x} y={map.y + b.y} width={b.w} height={b.h} rx={8} fill={theme.bg} stroke={theme.line} strokeWidth={1.5} />
            ))}
            <path d={toD(path)} fill="none" stroke={theme.line} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 16" />
            <path d={toD(path)} fill="none" stroke={theme.blue} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - drawP} style={{ filter: `drop-shadow(0 0 6px ${theme.cyan})` }} />
            {/* 목적지 핀 */}
            <g transform={`translate(${dest.x} ${dest.y})`}>
              <circle r={26 + 14 * ((frame % 40) / 40)} fill="none" stroke={theme.red} strokeWidth={2} opacity={1 - (frame % 40) / 40} />
              <path d="M 0 6 C -16 -12 -16 -34 0 -34 C 16 -34 16 -12 0 6 Z" fill={theme.red} />
              <circle cy={-22} r={6} fill="#fff" />
              <text y={34} textAnchor="middle" fontSize={15} fontWeight={700} fill={theme.red}>편의점</text>
            </g>
            <g transform={`translate(${path[0].x} ${path[0].y})`}>
              <circle r={16} fill="#fff" stroke={theme.grey} strokeWidth={2} />
              <text y={5} textAnchor="middle" fontSize={14} fill={theme.grey}>S</text>
              <text y={40} textAnchor="middle" fontSize={15} fontWeight={700} fill={theme.grey}>현재 위치 (GPS)</text>
            </g>
            <g transform={`translate(${walker.x} ${walker.y})`} opacity={frame >= walkStart ? 1 : 0}>
              <circle r={22} fill={theme.blue} opacity={0.18} />
              <circle r={12} fill={theme.blue} stroke="#fff" strokeWidth={3} />
            </g>
          </g>
          {navigateSteps.map((s, i) => {
            const at = Math.round(stepFrames[i]);
            const end = i < navigateSteps.length - 1 ? Math.round(stepFrames[i + 1]) : EXPLAIN - 8;
            const p = i === navigateSteps.length - 1 ? dest : path[i];
            const off = i === 4 ? { x: -40, y: 180 } : i % 2 === 0 ? { x: 250, y: -10 } : { x: 250, y: 70 };
            return <GripZoom key={s.label} x={p.x + off.x} y={p.y + off.y} from={p} motors={s.motors} start={at} end={end} label={`${s.label} ${s.dist} · ${s.motors.length === 4 ? "4개 모터" : s.motors[0] === "up" ? "위쪽 모터" : "오른쪽 모터"} 진동`} />;
          })}
        </svg>
        {navigateSteps.map((s, i) => {
          const at = Math.round(stepFrames[i]);
          const end = i < navigateSteps.length - 1 ? Math.round(stepFrames[i + 1]) : EXPLAIN;
          const o = interpolate(frame, [at, at + 10, Math.max(at + 11, end - 8), Math.max(at + 12, end)], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={s.label} style={{ position: "absolute", left: map.x, top: map.y + map.h + 22, opacity: o, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ background: theme.ink, color: "#fff", fontFamily: theme.mono, fontSize: 13, letterSpacing: 2, padding: "6px 10px", borderRadius: 6 }}>TTS</span>
              <span style={{ fontSize: 24, fontWeight: 700 }}>“{s.tts}”</span>
            </div>
          );
        })}
        <NavPanel x={1100} y={250} width={680} start={10} dest="근처 편의점 (카카오 API 검색)" total="총 거리 392 m / 예상 시간 6분" guide={cur ? cur.tts : "경로를 검색하고 있습니다."} dist={cur ? cur.dist : "—"} motors={cur ? cur.motors : []} />
      </Sequence>

      {/* ── 장애물 위험 감지 ── */}
      <Sequence from={EXPLAIN} durationInFrames={OBST} name="설명: 장애물 감지">
        <div style={{ position: "absolute", left: 140, top: 150, opacity: obstIn }}>
          <div style={{ fontFamily: theme.mono, fontSize: 19, letterSpacing: 4, color: theme.red}}>// 04+  ALWAYS-ON · 장애물 위험 감지</div>
          <div style={{ fontSize: 48, fontWeight: 800, marginTop: 8 }}>길안내 중에도, ToF 센서 8개는 항상 앞을 봅니다.</div>
        </div>
        <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity: obstIn }}>
          <g transform={`translate(${map.x} ${map.y})`}>
            <rect width={map.w} height={map.h} rx={18} fill="#fff" stroke={theme.panelBorder} strokeWidth={1.5} style={{ filter: "drop-shadow(0 16px 40px rgba(15,27,45,0.10))" }} />
            <text x={28} y={40} fontFamily={theme.mono} fontSize={14} letterSpacing={2} fill={theme.red}>ToF ×8 · 상시 반복 측정 (왼 1 · 정면 3 · 오른 1 · 위 3)</text>
            {/* 위에서 본 사용자 + 지팡이 모듈 */}
            <g transform={`translate(${map.w - 200} ${map.h / 2})`}>
              <circle r={34} fill={theme.bg} stroke={theme.grey} strokeWidth={2} />
              <text y={6} textAnchor="middle" fontSize={15} fontWeight={700} fill={theme.grey}>사용자</text>
              <rect x={-110} y={-18} width={70} height={36} rx={8} fill="#1c2430" />
              <rect x={-330} y={-6} width={220} height={12} rx={4} fill="#dfe6ef" stroke="#c3ccd7" />
              {/* 센서 빔 (정면 3 · 좌우 1) */}
              {[-28, -12, 0, 12, 28].map((deg, i) => {
                const rad = (deg * Math.PI) / 180;
                const L = 560;
                const hit = Math.abs(deg) <= 12 && dangerP > 0;
                return (
                  <g key={i}>
                    <line x1={-110} y1={0} x2={-110 - L * Math.cos(rad)} y2={-L * Math.sin(rad)} stroke={hit ? theme.red : theme.cyan} strokeWidth={hit ? 3 : 2} strokeDasharray="10 8" opacity={0.7} />
                  </g>
                );
              })}
              {/* 장애물 */}
              <g transform={`translate(${-obstacleX - 110} 0)`}>
                <rect x={-30} y={-70} width={60} height={140} rx={8} fill={dangerP > 0 ? theme.redSoft : theme.bg} stroke={dangerP > 0 ? theme.red : theme.grey} strokeWidth={2.5} />
                <text y={6} textAnchor="middle" fontSize={15} fontWeight={700} fill={dangerP > 0 ? theme.red : theme.grey}>장애물</text>
                {/* 거리 표시 */}
                <line x1={30} y1={95} x2={obstacleX + 30} y2={95} stroke={theme.ink} strokeWidth={1.5} />
                <text x={obstacleX / 2 + 30} y={122} textAnchor="middle" fontFamily={theme.mono} fontSize={18} fontWeight={700} fill={dangerP > 0 ? theme.red : theme.ink}>정면 {distCm} cm</text>
              </g>
            </g>
            {/* 경고 카드 */}
            <g transform={`translate(28 ${map.h - 150})`} opacity={dangerP}>
              <rect width={520} height={112} rx={14} fill={theme.redSoft} stroke={theme.red} strokeWidth={2} />
              <text x={22} y={42} fontSize={26} fontWeight={800} fill={theme.red}>⚠ 정면 위험 감지 · 감지 거리 {distCm} cm</text>
              <text x={22} y={80} fontSize={18} fill={theme.ink2}>거리별 {vibCount}회 진동 + TTS 경고 · 물건 찾기 · 길안내보다 우선 처리</text>
            </g>
          </g>
          <GripZoom x={map.x + map.w - 200} y={map.y + 150} from={{ x: map.x + map.w - 200, y: map.y + map.h / 2 - 34 }} motors={obstMotors} start={EXPLAIN + 62} label={`위험 방향 · ${vibCount}회 진동`} />
        </svg>
        <NavPanel x={1100} y={250} width={680} start={0} dest="근처 편의점 (카카오 API 검색)" total="총 거리 392 m / 예상 시간 6분" guide="현재 방향 그대로 직진하세요" dist="90 m" motors={obstMotors} warning={dangerP > 0 ? `정면 위험 감지 · 감지 거리 정면 ${distCm} cm` : undefined} />
      </Sequence>

      {/* ── 실사 ── */}
      <Sequence from={EXPLAIN + OBST} durationInFrames={CLIP1} name="실사: 장애물 감지">
        <VideoCard src={clips.obstacle.src} label={clips.obstacle.label} note={clips.obstacle.note} width={1500} x={(width - 1500) / 2} y={150} startFrom={75} />
      </Sequence>
      <Sequence from={EXPLAIN + OBST + CLIP1} durationInFrames={duration - EXPLAIN - OBST - CLIP1} name="실사: 길안내">
        <VideoCard src={clips.navigate.src} label={clips.navigate.label} note={clips.navigate.note} width={1500} x={(width - 1500) / 2} y={150} startFrom={22 * 30} volume={0.35} />
      </Sequence>
    </AbsoluteFill>
  );
};
