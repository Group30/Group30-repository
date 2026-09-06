# SmartCane 공모전 제출 영상 (Remotion)

AI 기반 스마트 지팡이 보행 보조 시스템(한이음 드림업 · Group 30) 제출용 90초 영상 시안.
지팡이 손잡이 모듈을 하이라이트하고, 각 하드웨어에서 콜아웃 라인이 뻗어 나오는 "사이보그" 스타일로 설명한 뒤,
사용 시나리오 2개(물건 찾기 · 길안내 + 장애물 감지)를 애니메이션 + 실사 클립으로 보여줍니다.

## 실행

```bash
cd cane-video
npm install
npm run dev              # Remotion Studio (브라우저 미리보기 · 타임라인 스크럽)
npm run render           # out/main.mp4 (1920×1080 · 30fps · 90s)
npm run still -- --frame=480   # 특정 프레임 스틸 확인
```

원격 실행 환경(Claude Code on the web)에서는 `remotion.config.ts`가 미리 설치된 Chrome Headless Shell을 자동으로 사용합니다. 로컬에서는 Remotion이 브라우저를 알아서 내려받습니다.

## 타임라인 (총 1:30)

| 구간 | 시간 | 내용 |
|---|---|---|
| Intro | 0:00–0:06 | 부팅 로그(Pi 5 · ToF ×8 · 모터 ×4 · BLE) → **SmartCane** 타이틀 |
| Device Reveal | 0:06–0:09.5 | 지팡이 와이어프레임 드로잉 → 채움 → 스캔 스윕 → 손잡이 모듈 스포트라이트 |
| Hardware 콜아웃 | 0:09.5–0:35 | 5개 하드웨어 순차 콜아웃(약 5.1초씩): ① Pi Camera 3 Wide(YOLOv8n) ② ToF 센서 ×8 ③ 4방향 진동모터 ④ Raspberry Pi 5 + X120x 전원 ⑤ BLE ↔ 앱 |
| Use Case 1 · 물건 찾기 | 0:35–0:45 | "의자 찾아 줘" → 앱 카드(STT → Gemini `find_object` → BLE) + 방 미니맵: 사용자 → 의자 경로 애니메이션, 꺾을 때마다 그립 확대 인셋에서 해당 진동모터 펄스 + TTS 문구 |
| | 0:45–0:57 | 실사 클립 `clips/find_object.mp4` (초안 영상 0–12s, "의자 찾아 줘") |
| Use Case 2 · 길안내 | 0:57–1:07 | "근처 편의점으로 안내해 줘" → 카카오 경로 미니맵 + 앱 길안내 패널(현재 안내 · 연결된 진동모터 표시), 직진/우회전마다 그립 인셋 + TTS |
| 장애물 위험 감지 | 1:07–1:11 | ToF 8개 빔 → 장애물 접근(220→89cm) → 빨간 경고 "정면 위험 감지" + 거리별 1~3회 진동 + 앱 경고 배너 |
| | 1:11–1:16 | 실사 클립 `clips/obstacle.mp4` (초안 18–23s, 정면 위험 감지 89~127cm) |
| | 1:16–1:23 | 실사 클립 `clips/navigate.mp4` (초안 58–65s, 횡단보도 · 우회전 진동) |
| Outro | 1:23–1:30 | 앱 기능 5개 요약 → SmartCane · Group 30 · 공모전명 · QR/로고 자리 |

## 나레이션

- 대본·타이밍: `src/narration.json` (id · start/end 초 · text). `Main.tsx` 가 이 파일을 읽어 `<Audio>` 로 배치합니다.
- 음성 생성: `python3 scripts/make-vo.py` → `public/vo/<id>.mp3` (Edge TTS `ko-KR-InJoonNeural`, 원음 속도). 각 문장이 구간(window) 안에 들어가는지 길이를 출력합니다. `pip install edge-tts` 필요.
- 다른 목소리로 바꾸려면 `python3 scripts/make-vo.py ko-KR-HyunsuMultilingualNeural` 처럼 voice 인자를 주면 됩니다. 외부에서 녹음한 mp3 를 같은 id 이름으로 `public/vo/` 에 넣어도 됩니다.
- 실사 클립 원본 소리는 35% 로 낮춰 나레이션 아래에 깔립니다 (`VideoCard volume`).

## 자료 교체 포인트 (`src/data.ts` 한 파일)

- `product` — 제품명 · 팀명 · 공모전명 · 단체명. `caneImage: "cane.png"` 로 바꾸고 `public/cane.png` 를 넣으면 SVG 대신 실제 제품 사진 사용(가로로 눕힌 이미지, 팁이 왼쪽 · 손잡이가 오른쪽).
- `features[]` — 하드웨어 콜아웃 5개. `anchor` 는 지팡이 좌표계(1400×400, 팁 x=0 · 손잡이 x=1400) 기준, `dir` 는 선이 꺾이는 방향(`dx, dy`)과 수평 길이(`len`, 음수면 박스가 왼쪽으로).
- `findObjectSteps` / `navigateSteps` — 시나리오 단계별 방향 · 진동모터 · TTS 문구.
- `clips` — 실사 클립 경로 · 라벨 · 주석. `public/clips/` 에 mp4 를 넣고 경로만 바꾸면 됩니다. 최종 촬영본이 오면 여기서 교체.
- `timeline` — 구간별 초 단위. 합이 90이어야 합니다(`src/Root.tsx` 의 `TOTAL_SECONDS`).

## 구조

```
src/
  Root.tsx              # Composition 등록 (Main 1920×1080, 30fps, 2700f)
  Main.tsx              # 씬 시퀀스 배치
  data.ts               # 모든 텍스트/좌표/타임라인
  theme.ts              # 화이트 테마 색상 · 폰트
  fonts.ts              # Pretendard Variable 로드 (public/fonts)
  scenes/               # Intro · CaneScene(리빌+콜아웃) · FindObject · Navigate · Outro
  components/
    Cane.tsx            # 실기기 구조를 따른 지팡이 SVG (팁 · 샤프트 · 모듈 박스 · 그립)
    caneTransform.ts    # 지팡이 좌표 → 화면 좌표 (배치는 여기서만 조정)
    Callout.tsx         # 앵커 펄스 → 엘보 라인 → 라벨 박스 → 타이핑
    GripZoom.tsx        # 그립 확대 인셋 (4방향 진동모터 펄스)
    AppFlow.tsx         # 앱 음성 처리 흐름 카드 (STT → Gemini → BLE)
    NavPanel.tsx        # 앱 길안내 패널 (연결된 진동모터 표시)
    VideoCard.tsx       # 실사 클립 카드 (OffthreadVideo)
    Background.tsx / HUD.tsx / TypeText.tsx
  ui/anim.ts · ui/path.ts   # 이징 · 폴리라인 · 정지→이동 스케줄
public/
  fonts/PretendardVariable.woff2
  clips/*.mp4           # 초안 영상에서 잘라낸 실사 구간
```

## 남은 작업 (자료 확보 후)

- [ ] 실제 제품 사진(측면, 배경 제거) → `public/cane.png` + `features[].anchor` 미세 조정
- [ ] BGM 트랙 (`public/bgm.mp3` → `Main.tsx` 에 `<Audio>` 한 줄)
- [ ] 팀 로고 · QR (Outro 우하단 자리)
- [ ] 공모전 공식 명칭 확인 (`product.contest`)
