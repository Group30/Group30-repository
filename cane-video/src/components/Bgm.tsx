import React from "react";
import { Audio, staticFile, useVideoConfig } from "remotion";
import { duckAt } from "../ui/duck";

const BASE = 0.26; // 나레이션 없을 때
const DUCK = 0.09; // 나레이션 중

/** BGM + 나레이션 구간 덕킹 */
export const Bgm: React.FC<{ src?: string }> = ({ src = "bgm.mp3" }) => {
  const { fps } = useVideoConfig();
  return <Audio src={staticFile(src)} volume={(f) => BASE + (DUCK - BASE) * duckAt(f / fps)} />;
};
