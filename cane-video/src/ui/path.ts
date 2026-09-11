/** 폴리라인 유틸: 누적 길이, 진행률 t(0..1)에 해당하는 점, 세그먼트 인덱스 */
export type Pt = { x: number; y: number };

export const polyLength = (pts: Pt[]) => {
  const seg: number[] = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    seg.push(d);
    total += d;
  }
  return { seg, total };
};

export const pointAt = (pts: Pt[], t: number) => {
  const { seg, total } = polyLength(pts);
  let dist = Math.min(1, Math.max(0, t)) * total;
  for (let i = 0; i < seg.length; i++) {
    if (dist <= seg[i] || i === seg.length - 1) {
      const r = seg[i] === 0 ? 0 : Math.min(1, dist / seg[i]);
      return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * r, y: pts[i].y + (pts[i + 1].y - pts[i].y) * r, seg: i };
    }
    dist -= seg[i];
  }
  return { ...pts[pts.length - 1], seg: seg.length - 1 };
};

/** 세그먼트 i 시작 지점의 진행률 */
export const segStartT = (pts: Pt[], i: number) => {
  const { seg, total } = polyLength(pts);
  let d = 0;
  for (let k = 0; k < i; k++) d += seg[k];
  return d / total;
};

export const toD = (pts: Pt[]) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

/**
 * 구간별 '정지(hold) → 이동(move)' 스케줄.
 * starts[i] = 세그먼트 i 의 정지 시작 프레임(그립 인셋·TTS 표시), arrive = 마지막 이동이 끝나는 프레임.
 * tAt(frame) = 경로 진행률 0..1 (세그먼트 내 선형 이동)
 */
export const walkSchedule = (pts: Pt[], start: number, hold: number, move: number) => {
  const nSeg = pts.length - 1;
  const starts = Array.from({ length: nSeg }, (_, i) => start + i * (hold + move));
  const arrive = start + nSeg * (hold + move);
  const { seg, total } = polyLength(pts);
  const tAt = (frame: number) => {
    let d = 0;
    for (let i = 0; i < nSeg; i++) {
      if (frame < starts[i]) break;
      const p = Math.min(1, Math.max(0, (frame - (starts[i] + hold)) / move));
      d += seg[i] * p;
      if (p < 1) break;
    }
    return total === 0 ? 0 : d / total;
  };
  return { starts, arrive, tAt };
};
