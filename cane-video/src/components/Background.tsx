import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

/** 화이트 배경 + 연한 블루 그리드 + 스캔 밴드 */
export const Background: React.FC<{ grid?: boolean; scan?: boolean }> = ({ grid = true, scan = true }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const scanY = ((frame * 5) % (height + 300)) - 150;

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 55% 40%, ${theme.bg2} 0%, ${theme.bg} 75%)` }}>
      {grid && (
        <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke={theme.blue} strokeOpacity="0.08" strokeWidth="1" />
            </pattern>
            <pattern id="dots" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="0" cy="0" r="1.6" fill={theme.blue} fillOpacity="0.25" />
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#grid)" />
          <rect width={width} height={height} fill="url(#dots)" />
        </svg>
      )}
      {scan && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: scanY,
            height: 220,
            background: `linear-gradient(to bottom, transparent, ${theme.cyanSoft}, transparent)`,
            opacity: 0.5,
          }}
        />
      )}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, transparent 60%, rgba(37,99,235,0.06) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
