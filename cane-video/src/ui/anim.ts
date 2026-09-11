import { interpolate, spring } from "remotion";

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** 0→1 선형 진행 (start 프레임부터 dur 프레임 동안) */
export const prog = (frame: number, start: number, dur: number) =>
  clamp((frame - start) / Math.max(1, dur));

export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** 씬 페이드 인/아웃 (씬 로컬 프레임 기준) */
export const fadeInOut = (
  frame: number,
  duration: number,
  fadeIn = 12,
  fadeOut = 12
) =>
  interpolate(
    frame,
    [0, fadeIn, duration - fadeOut, duration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

export const springIn = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 120, mass: 0.7 } });

/** 글리치 느낌의 랜덤 (결정적) */
export const noise = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};
