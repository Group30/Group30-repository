import React from "react";
import { useCurrentFrame } from "remotion";
import { theme } from "../theme";

/** 타자기 텍스트 */
export const TypeText: React.FC<{
  text: string;
  start?: number;
  fps?: number;
  cps?: number;
  cursor?: boolean;
  style?: React.CSSProperties;
}> = ({ text, start = 0, fps = 30, cps = 22, cursor = true, style }) => {
  const frame = useCurrentFrame();
  const chars = Math.max(0, Math.floor(((frame - start) / fps) * cps));
  const shown = text.slice(0, chars);
  const done = chars >= text.length;
  const blink = Math.floor(frame / 8) % 2 === 0;
  return (
    <span style={style}>
      {shown}
      {cursor && (!done || frame - start < text.length * (fps / cps) + 30) ? (
        <span style={{ color: theme.blue, opacity: blink ? 1 : 0 }}>▌</span>
      ) : null}
    </span>
  );
};
