import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, staticFile } from "remotion";
import { theme } from "../theme";
import { features, product } from "../data";
import { Cane } from "../components/Cane";
import { CANE_H, CANE_W, groupTransform, placementFor, toScreen } from "../components/caneTransform";
import { Callout, DoneMarker } from "../components/Callout";
import { easeOut, easeInOut, prog, fadeInOut } from "../ui/anim";
import { TypeText } from "../components/TypeText";

/** 5–32s: 지팡이 리빌(와이어프레임 → 채움 → 스캔 → 모듈 스포트라이트) → 하드웨어 콜아웃 5개 */
export const CaneScene: React.FC<{ duration: number; revealFrames: number }> = ({ duration, revealFrames }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const place = placementFor(width, height);
  const op = fadeInOut(frame, duration, 10, 14);

  const slide = 900 * (1 - easeOut(prog(frame, 0, 36)));
  const wire = easeInOut(prog(frame, 6, 50));
  const fill = easeOut(prog(frame, 44, 36));
  const scanP = prog(frame, 56, 45);
  const focusP = easeOut(prog(frame, 92, 28));

  const per = Math.floor((duration - revealFrames) / features.length);
  const fi = Math.min(features.length - 1, Math.max(-1, Math.floor((frame - revealFrames) / per)));
  const active = fi >= 0 ? features[fi] : null;
  const activeStart = revealFrames + fi * per;

  const MODULE = { x: 1145, y: 200 };
  const prevAnchor = fi > 0 ? features[fi - 1].anchor : MODULE;
  const curAnchor = active ? active.anchor : MODULE;
  const moveP = active ? easeInOut(prog(frame, activeStart, 22)) : 1;
  const focus = toScreen(place, prevAnchor.x + (curAnchor.x - prevAnchor.x) * moveP, prevAnchor.y + (curAnchor.y - prevAnchor.y) * moveP);
  const focusR = active ? 250 : 330;

  const scanX = interpolate(scanP, [0, 1], [-100, CANE_W + 100]);
  const scan = { a: toScreen(place, scanX, -150, slide), b: toScreen(place, scanX, CANE_H + 150, slide) };
  const motors = active?.id === "motor" ? 0.5 + 0.5 * Math.abs(Math.sin(frame / 4)) : 0;
  const tofOn = active?.id === "tof" ? 1 : 0;
  const glow = active ? (active.id === "camera" || active.id === "core" ? 0.9 : 0.4) : focusP * 0.9;

  return (
    <AbsoluteFill style={{ opacity: op, fontFamily: theme.font }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="focusGrad" cx={focus.x} cy={focus.y} r={focusR} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="black" />
            <stop offset="0.55" stopColor="black" stopOpacity="0.9" />
            <stop offset="1" stopColor="white" />
          </radialGradient>
          <mask id="focusMask">
            <rect width={width} height={height} fill="url(#focusGrad)" />
          </mask>
        </defs>

        <g transform={groupTransform(place, slide)}>
          {product.caneImage ? (
            <image href={staticFile(product.caneImage)} x={0} y={0} width={CANE_W} height={CANE_H} preserveAspectRatio="xMidYMid meet" opacity={fill} />
          ) : null}
          <Cane wire={wire} fill={product.caneImage ? 0 : fill} glow={glow} motors={motors} tofOn={tofOn} />
        </g>

        {scanP > 0 && scanP < 1 ? (
          <line x1={scan.a.x} y1={scan.a.y} x2={scan.b.x} y2={scan.b.y} stroke={theme.cyan} strokeWidth={3} opacity={0.9} style={{ filter: `drop-shadow(0 0 10px ${theme.cyan})` }} />
        ) : null}

        {/* 스포트라이트: 포커스 밖은 흰색으로 눌러줌 */}
        <rect width={width} height={height} fill={theme.bg} opacity={0.72 * focusP} mask="url(#focusMask)" />
        <circle cx={focus.x} cy={focus.y} r={focusR * 0.55} fill="none" stroke={theme.blue} strokeWidth={1.5} opacity={0.35 * focusP} strokeDasharray="6 10" />
        <g transform={`rotate(${-frame * 0.5} ${focus.x} ${focus.y})`} opacity={0.5 * focusP}>
          <circle cx={focus.x} cy={focus.y} r={focusR * 0.62} fill="none" stroke={theme.cyan} strokeWidth={2} strokeDasharray="80 60" />
        </g>

        {features.map((f, i) => (i < fi ? <DoneMarker key={f.id} anchor={toScreen(place, f.anchor.x, f.anchor.y)} index={i} opacity={0.9} /> : null))}
        {active ? (
          <Callout key={active.id} feature={active} anchor={toScreen(place, active.anchor.x, active.anchor.y)} start={activeStart + 6} index={fi} fadeOut={activeStart + per - 14} />
        ) : null}
      </svg>

      {!active ? (
        <div style={{ position: "absolute", left: 140, top: 150, color: theme.ink, opacity: interpolate(frame, [16, 36, revealFrames - 16, revealFrames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <div style={{ fontFamily: theme.mono, fontSize: 19, letterSpacing: 4, color: theme.blue }}>// 01  DEVICE</div>
          <div style={{ fontSize: 56, fontWeight: 800, marginTop: 10 }}>
            <TypeText text="보고, 재고, 진동으로 알려주는 지팡이." start={24} fps={fps} cps={16} />
          </div>
          <div style={{ fontSize: 26, color: theme.ink2, marginTop: 10, opacity: focusP }}>손잡이 모듈 하나에 카메라 · ToF 센서 8개 · Raspberry Pi 5 · 4방향 진동모터.</div>
        </div>
      ) : (
        <>
          <div style={{ position: "absolute", left: 140, top: 150, fontFamily: theme.mono, fontSize: 19, letterSpacing: 4, color: theme.blue }}>// 02  HARDWARE</div>
          <div style={{ position: "absolute", left: 140, top: height - 250, maxWidth: 980, color: theme.ink, fontSize: 30, lineHeight: 1.35, opacity: easeOut(prog(frame, activeStart + 40, 16)) * (1 - prog(frame, activeStart + per - 14, 12)) }}>
            <span style={{ display: "inline-block", width: 34, height: 3, background: theme.blue, verticalAlign: "middle", marginRight: 14 }} />
            {active.desc}
          </div>
          <div style={{ position: "absolute", right: 126, bottom: 46, fontFamily: theme.mono, fontSize: 24, letterSpacing: 4, color: theme.ink }}>
            {String(fi + 1).padStart(2, "0")} / {String(features.length).padStart(2, "0")}
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
