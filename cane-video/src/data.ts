/**
 * 영상 콘텐츠 데이터 — 한이음 드림업 설명서(서비스 흐름도·하드웨어 설계도·화면 설계서) 기준.
 * 자료가 바뀌면 이 파일만 수정.
 * 좌표(anchor)는 지팡이 좌표계(viewBox 0 0 1400 400, 축 y=200) 기준. x=0 팁, x=1400 손잡이 끝.
 */
export type Dir = { dx: number; dy: number; len: number };

export type Feature = {
  id: string;
  code: string;
  title: string;
  sub: string;
  desc: string;
  spec: { label: string; value: string }[];
  anchor: { x: number; y: number };
  dir: Dir;
};

export const product = {
  name: "SmartCane",
  nameKo: "AI 기반 스마트 지팡이 보행 보조 시스템",
  tagline: "말하면 찾고, 진동으로 길을 알려주는 지팡이",
  team: "Group 30",
  org: "한이음 드림업",
  contest: "[2026 시각장애인 지팡이 공모전] 출품작",
  version: "PROTOTYPE",
  caneImage: null as string | null, // public/cane.png 등 실제 제품 이미지 사용 시
};

/** 하드웨어 콜아웃 — 설명서의 하드웨어 설계도 기준 */
export const features: Feature[] = [
  {
    id: "camera",
    code: "HW-01 // PI CAMERA 3 WIDE",
    title: "광각 카메라",
    sub: "YOLOv8n 실시간 객체 탐지",
    desc: "카메라 영상을 Raspberry Pi 5가 YOLOv8n으로 분석해 찾는 물건의 위치를 3×3 영역으로 판단합니다.",
    spec: [
      { label: "모델", value: "YOLOv8n" },
      { label: "신뢰도 기준", value: "≥ 0.35" },
    ],
    anchor: { x: 1040, y: 168 },
    dir: { dx: -90, dy: -150, len: -260 },
  },
  {
    id: "tof",
    code: "HW-02 // ToF SENSOR ×8",
    title: "ToF 거리 센서 8개",
    sub: "왼쪽 1 · 정면 3 · 오른쪽 1 · 위쪽 3",
    desc: "8개 ToF 센서가 상시 장애물 거리를 측정하고, 위험 시 거리별로 1~3회 진동과 TTS로 경고합니다.",
    spec: [
      { label: "연결", value: "I²C + XSHUT" },
      { label: "경고", value: "거리별 1~3회 진동" },
    ],
    anchor: { x: 1150, y: 246 },
    dir: { dx: -40, dy: 285, len: -60 },
  },
  {
    id: "motor",
    code: "HW-03 // VIBRATION MOTOR ×4",
    title: "4방향 진동모터",
    sub: "위 · 아래 · 왼쪽 · 오른쪽",
    desc: "방향에 따라 4개 모터를 단독 또는 복합으로 작동합니다. 대각선은 인접한 2개, 정면은 4개 동시 진동.",
    spec: [
      { label: "구동", value: "PCA9685 PWM → MOSFET" },
      { label: "정면", value: "4개 동시" },
    ],
    anchor: { x: 1345, y: 200 },
    dir: { dx: -40, dy: -170, len: -220 },
  },
  {
    id: "core",
    code: "HW-04 // RASPBERRY PI 5 + POWER",
    title: "Raspberry Pi 5 코어",
    sub: "X120x 전원 관리 모듈 · 배터리 팩",
    desc: "객체 탐지·거리 판단·모터 제어를 처리하고, 배터리·CPU·팬 상태를 약 5초마다 앱으로 전송합니다.",
    spec: [
      { label: "상태 갱신", value: "약 5초" },
      { label: "전원", value: "배터리 팩 → X120x" },
    ],
    anchor: { x: 1250, y: 190 },
    dir: { dx: 40, dy: 300, len: -160 },
  },
  {
    id: "ble",
    code: "HW-05 // BLE ↔ SMARTPHONE APP",
    title: "BLE 앱 연동",
    sub: "STT · Gemini 의도 분석 · 카카오 API · TTS",
    desc: "스마트폰 앱이 음성을 인식해 의도를 분석하고, BLE로 명령·결과·상태를 지팡이와 주고받습니다.",
    spec: [
      { label: "의도", value: "find_object · navigate · status · stop" },
    ],
    anchor: { x: 1015, y: 235 },
    dir: { dx: -120, dy: -160, len: -300 },
  },
];

/** 그립 진동모터 (위/아래/왼/오른) */
export type MotorId = "up" | "down" | "left" | "right";
export const motorLabel: Record<MotorId, string> = { up: "위쪽", down: "아래쪽", left: "왼쪽", right: "오른쪽" };

/** 사용 시나리오 1: 물건 찾기 (의자) — 방 안 미니맵 경로 */
export const findObjectSteps: { label: string; motors: MotorId[]; tts: string }[] = [
  { label: "직진", motors: ["up"], tts: "의자가 앞쪽에 있습니다" },
  { label: "오른쪽", motors: ["right"], tts: "오른쪽으로 이동하세요" },
  { label: "직진", motors: ["up"], tts: "의자가 앞쪽에 있습니다" },
  { label: "정면 도착", motors: ["up", "down", "left", "right"], tts: "의자가 정면에 있습니다" },
];

/** 사용 시나리오 2: 길안내 — 카카오 경로 */
export const navigateSteps: { label: string; motors: MotorId[]; tts: string; dist: string }[] = [
  { label: "직진", motors: ["up"], tts: "현재 방향 그대로 직진하세요", dist: "66 m" },
  { label: "우회전", motors: ["right"], tts: "잠시 후 우회전하세요", dist: "16 m" },
  { label: "직진", motors: ["up"], tts: "현재 방향 그대로 직진하세요", dist: "90 m" },
  { label: "우회전", motors: ["right"], tts: "잠시 후 우회전하세요", dist: "20 m" },
  { label: "도착", motors: ["up", "down", "left", "right"], tts: "목적지 주변에 도착했습니다", dist: "18 m 이내" },
];

export const appFunctions = [
  { code: "01", title: "음성 명령", desc: "STT → Gemini 의도 분석" },
  { code: "02", title: "물건 찾기", desc: "YOLOv8n 탐지 → 3×3 방향 진동" },
  { code: "03", title: "길안내", desc: "카카오 도보 경로 → 방향 진동 · TTS" },
  { code: "04", title: "장애물 위험 감지", desc: "ToF 8개 상시 감지 → 우선 경고" },
  { code: "05", title: "기기 상태 확인", desc: "배터리 · CPU · 팬 · 센서, 약 5초 갱신" },
];

/** 타임라인 (초) — 총 90초 */
export const timeline = {
  intro: [0, 5],
  reveal: [5, 9],
  features: [9, 32],
  findObject: [32, 55], // 설명 애니메이션 10s + 실사 13s
  navigate: [55, 82], // 설명 10s + 장애물 4s + 실사 13s
  outro: [82, 90],
} as const;

/** 실사 클립 (public/clips) — 초안 영상에서 잘라낸 구간 */
export const clips = {
  findObject: { src: "clips/find_object.mp4", label: "실제 사용 영상 · 물건 찾기", note: "“의자 찾아 줘” · YOLOv8n chair 탐지 → 방향 진동 · TTS" },
  obstacle: { src: "clips/obstacle.mp4", label: "실제 사용 영상 · 장애물 위험 감지", note: "정면 위험 감지 · 감지 거리 89~127 cm" },
  navigate: { src: "clips/navigate.mp4", label: "실제 사용 영상 · 길안내", note: "카카오 경로 · 직진 / 우회전 진동" },
};
