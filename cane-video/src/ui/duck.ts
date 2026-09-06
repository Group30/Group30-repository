import narration from "../narration.json";

const RAMP = 0.3; // 초

/** 절대 시간 t(초)에서 나레이션 덕킹 정도 0(없음)…1(나레이션 중). 램프는 앞 0.3s · 뒤 0.3s */
export const duckAt = (t: number) => {
  let duck = 0;
  for (const n of narration) {
    const a = n.start - RAMP;
    const b = n.start + n.dur + 0.15;
    if (t >= a && t <= b + RAMP) {
      const inP = Math.min(1, Math.max(0, (t - a) / RAMP));
      const outP = Math.min(1, Math.max(0, (b + RAMP - t) / RAMP));
      duck = Math.max(duck, Math.min(inP, outP));
    }
  }
  return duck;
};
