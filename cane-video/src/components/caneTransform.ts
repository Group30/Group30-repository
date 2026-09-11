/**
 * 지팡이 좌표계(1400×400, 축 y=200; x=0 팁, x=1400 손잡이 끝) → 화면 좌표 변환.
 * 배치(중심·회전·스케일)는 여기서만 정의 — 콜아웃 좌표가 자동으로 따라감.
 */
export type CanePlacement = { cx: number; cy: number; rot: number; scale: number };

export const CANE_W = 1400;
export const CANE_H = 400;

export const placementFor = (width: number, height: number): CanePlacement => {
  const portrait = height > width;
  if (portrait) {
    return { cx: width * 0.5, cy: height * 0.5, rot: -70, scale: (height / CANE_W) * 0.75 };
  }
  return { cx: width * 0.52, cy: height * 0.55, rot: -18, scale: (width / 1920) * 1.0 };
};

export const toScreen = (p: CanePlacement, x: number, y: number, slide = 0) => {
  const rad = (p.rot * Math.PI) / 180;
  const lx = (x - CANE_W / 2 + slide) * p.scale;
  const ly = (y - CANE_H / 2) * p.scale;
  return {
    x: p.cx + lx * Math.cos(rad) - ly * Math.sin(rad),
    y: p.cy + lx * Math.sin(rad) + ly * Math.cos(rad),
  };
};

export const groupTransform = (p: CanePlacement, slide = 0) =>
  `translate(${p.cx} ${p.cy}) rotate(${p.rot}) scale(${p.scale}) translate(${-CANE_W / 2 + slide} ${-CANE_H / 2})`;
