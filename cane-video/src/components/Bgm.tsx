import React from "react";
import { Audio, staticFile, useVideoConfig } from "remotion";
import narration from "../narration.json";

const BASE = 0.26; // 나레이션 없을 때
const DUCK = 0.09; // 나레이션 중
const RAMP = 0.35; // 초

/** BGM + 나레이션 구간 덕킹 (narration.json 의 start·dur 기준으로 부드럽게 내렸다 올림) */
export const Bgm: React.FC<{ src?: string }> = ({ src = "bgm.mp3" }) => {
  const { fps } = useVideoConfig();
  const volumeAt = (f: number) => {
    const t = f / fps;
    let duck = 0; // 0 = BASE, 1 = DUCK
    for (const n of narration) {
      const a = n.start - RAMP;
      const b = n.start + n.dur + 0.2;
      if (t >= a && t <= b + RAMP) {
        const inP = Math.min(1, Math.max(0, (t - a) / RAMP));
        const outP = Math.min(1, Math.max(0, (b + RAMP - t) / RAMP));
        duck = Math.max(duck, Math.min(inP, outP));
      }
    }
    return BASE + (DUCK - BASE) * duck;
  };
  return <Audio src={staticFile(src)} volume={volumeAt} />;
};
