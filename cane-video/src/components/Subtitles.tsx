import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { theme } from "../theme";
import narration from "../narration.json";

/** 나레이션과 동일 타이밍의 하단 자막 (narration.json 의 start · dur) */
export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;
  const seg = narration.find((n) => t >= n.start - 0.1 && t <= n.start + n.dur + 0.35);
  if (!seg) return null;
  const a = seg.start - 0.1;
  const b = seg.start + seg.dur + 0.35;
  const op = interpolate(t, [a, a + 0.2, b - 0.2, b], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 82, display: "flex", justifyContent: "center", pointerEvents: "none", opacity: op }}>
      <div
        style={{
          maxWidth: width * 0.78,
          fontFamily: theme.font,
          fontSize: 34,
          fontWeight: 700,
          lineHeight: 1.35,
          color: "#fff",
          background: "rgba(15,27,45,0.86)",
          padding: "10px 30px",
          borderRadius: 12,
          textAlign: "center",
          boxShadow: "0 8px 24px rgba(15,27,45,0.18)",
          wordBreak: "keep-all",
        }}
      >
        {seg.text}
      </div>
    </div>
  );
};
