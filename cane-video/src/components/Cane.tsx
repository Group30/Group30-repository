import React from "react";
import { theme } from "../theme";

/**
 * 실기기 구조를 따른 플레이스홀더 지팡이 (지팡이 좌표계 1400×400, 축 y=200)
 *  팁 0–90 / 흰 샤프트 90–1000 / 모듈 박스(Pi 5·카메라·ToF·전원) 1000–1290 / 그립(4 진동모터) 1290–1400
 *  wire: 와이어프레임 드로잉 진행 0→1, fill: 채움 0→1, glow: 모듈 박스 발광, motors: 활성 모터 강조 0→1
 */
export const Cane: React.FC<{ wire: number; fill: number; glow: number; motors?: number; tofOn?: number }> = ({
  wire,
  fill,
  glow,
  motors = 0,
  tofOn = 0,
}) => {
  const dash = { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - wire } as const;
  const box = "#1c2430";
  const boxEdge = "#3a4757";

  const tofFront = [1130, 1150, 1170];
  const tofTop = [1085, 1105, 1125];

  return (
    <g>
      <defs>
        <filter id="caneGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="20" />
        </filter>
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <linearGradient id="shaftGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#eef2f7" />
          <stop offset="1" stopColor="#b9c4d1" />
        </linearGradient>
      </defs>

      {/* 모듈 박스 발광 */}
      <ellipse cx="1145" cy="200" rx="230" ry="120" fill={theme.cyan} opacity={0.3 * glow} filter="url(#caneGlow)" />

      {/* ───── 채움 ───── */}
      <g opacity={fill}>
        {/* 팁 */}
        <circle cx="34" cy="200" r="18" fill="#2b3441" />
        <polygon points="46,190 92,186 92,214 46,210" fill="#c7d0db" />
        {/* 샤프트 */}
        <rect x="90" y="186" width="915" height="28" rx="4" fill="url(#shaftGrad)" stroke="#c3ccd7" strokeWidth="1.5" />
        <rect x="150" y="186" width="80" height="28" fill="#d63c3c" />

        {/* 모듈 박스 */}
        <rect x="1000" y="140" width="292" height="120" rx="16" fill={box} stroke={boxEdge} strokeWidth="2" />
        <rect x="1012" y="150" width="268" height="100" rx="10" fill="none" stroke="#2b3644" strokeWidth="1.5" />
        {/* 카메라 */}
        <circle cx="1040" cy="168" r="21" fill="#0a1018" stroke="#4a5a6e" strokeWidth="2.5" />
        <circle cx="1040" cy="168" r="12" fill="#0f2740" stroke={theme.cyan} strokeWidth="2" />
        <circle cx="1040" cy="168" r="5" fill={theme.cyan} opacity="0.9" filter="url(#softGlow)" />
        {/* ToF 정면 3 / 위 3 / 좌우 1 */}
        {tofFront.map((x) => (
          <rect key={x} x={x - 7} y="238" width="14" height="14" rx="3" fill="#0a1018" stroke={tofOn ? theme.red : "#4a5a6e"} strokeWidth="2" />
        ))}
        {tofTop.map((x) => (
          <rect key={x} x={x - 7} y="148" width="14" height="14" rx="3" fill="#0a1018" stroke="#4a5a6e" strokeWidth="2" />
        ))}
        <rect x="1002" y="193" width="10" height="14" rx="3" fill="#0a1018" stroke="#4a5a6e" strokeWidth="2" />
        <rect x="1280" y="193" width="10" height="14" rx="3" fill="#0a1018" stroke="#4a5a6e" strokeWidth="2" />
        {/* Raspberry Pi 5 보드 표시 */}
        <rect x="1205" y="170" width="70" height="52" rx="6" fill="#0b3d2e" stroke="#1f7a5a" strokeWidth="1.5" />
        <text x="1240" y="201" textAnchor="middle" fontFamily={theme.mono} fontSize="14" fill="#7ee0b8" fontWeight="700">Pi 5</text>
        {/* 전원 모듈 + 상태 LED */}
        <rect x="1130" y="170" width="60" height="40" rx="5" fill="#0f1620" stroke="#3a4757" strokeWidth="1.5" />
        <text x="1160" y="195" textAnchor="middle" fontFamily={theme.mono} fontSize="11" fill="#9fb0c3">X120x</text>
        <circle cx="1268" cy="152" r="4" fill={theme.green} filter="url(#softGlow)" />
        {/* BLE 표시 */}
        <text x="1016" y="240" fontFamily={theme.mono} fontSize="13" fill="#7fb2ff" fontWeight="700">BLE</text>

        {/* 그립 + 4 진동모터 */}
        <rect x="1292" y="168" width="106" height="64" rx="22" fill="#2a3441" stroke={boxEdge} strokeWidth="2" />
        {[1306, 1318, 1330, 1372, 1384].map((x) => (
          <rect key={x} x={x} y="176" width="6" height="48" rx="3" fill="#1c2430" />
        ))}
        {(
          [
            [1345, 180],
            [1345, 220],
            [1325, 200],
            [1365, 200],
          ] as const
        ).map(([x, y]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r={5.5} fill={theme.cyan} opacity={0.55 + 0.45 * motors} filter={motors ? "url(#softGlow)" : undefined} />
        ))}
        <circle cx="1345" cy="200" r="3" fill="#0a1018" />
      </g>

      {/* ───── 와이어프레임 ───── */}
      <g fill="none" stroke={theme.blue} strokeWidth="2.5" opacity={0.95 - 0.7 * fill}>
        <circle cx="34" cy="200" r="18" {...dash} />
        <rect x="90" y="186" width="915" height="28" rx="4" {...dash} />
        <rect x="1000" y="140" width="292" height="120" rx="16" {...dash} />
        <circle cx="1040" cy="168" r="21" {...dash} />
        <rect x="1205" y="170" width="70" height="52" rx="6" {...dash} />
        <rect x="1292" y="168" width="106" height="64" rx="22" {...dash} />
      </g>
    </g>
  );
};
