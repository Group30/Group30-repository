# SmartCane 공모전 영상 — 인수인계 문서

다른 AI(ChatGPT/Codex 등)나 팀원이 이어서 작업할 수 있도록 지금까지의 맥락·결정·구조·남은 일을 정리한 문서.
저장소: `Group30/Group30-repository`, 브랜치 `claude/blind-cane-contest-video-1n8apf`, 폴더 `cane-video/`.

## 1. 무엇인가
- 한이음 드림업 팀 프로젝트 "AI 기반 스마트 지팡이 보행 보조 시스템(SmartCane)"의 **공모전 제출용 90초 영상**.
- 도구: **Remotion 4** (React로 영상을 코드로 만드는 프레임워크). 1920×1080, 30fps, 2700프레임.
- 출력물: `out/smartcane_v6_loud.mp4` 가 현재 최신본 (나레이션·자막·BGM·라우드니스 정규화 포함).

## 2. 제품 사실 (설명서 기준 — 이 범위 밖 기능을 지어내지 말 것)
- 하드웨어: Raspberry Pi 5, Pi Camera 3 Wide, ToF 거리 센서 8개(왼1·정면3·오른1·위3, I²C+XSHUT), PCA9685 PWM → MOSFET ×4 → 진동모터 4개(위/아래/왼/오른), X120x 전원 관리 모듈 + 배터리 팩, BLE로 스마트폰 앱 연결.
- 앱 기능: ① 음성 명령(STT → Gemini 의도 분석: find_object / navigate / status / stop) ② 물건 찾기(YOLOv8n 객체 탐지, 신뢰도 ≥0.35, 화면 3×3 영역으로 방향 판단 → 진동·TTS) ③ 길안내(카카오 API 도보 경로, GPS, 방향 진동 + TTS, 경로 이탈 3회 시 재탐색, 목적지 18m 이내 도착 처리) ④ 장애물 위험 감지(ToF 상시, 거리별 1~3회 진동, 물건 찾기·길안내보다 우선) ⑤ 기기 상태 확인(배터리·CPU·팬·센서, 약 5초 갱신).
- 실기기 외형: 손잡이 쪽에 검은 전자 모듈 박스(카메라·ToF·Pi), 흰색 샤프트. **낙차 감지·LED 안전등 같은 기능은 없다** (초기 시안에 있었다가 삭제됨).

## 3. 영상 구성 (총 1:30)
| 시간 | 씬 | 내용 |
|---|---|---|
| 0:00–0:06 | Intro | 부팅 로그 → SmartCane 타이틀 |
| 0:06–0:09.5 | Reveal | 지팡이 와이어프레임 → 채움 → 스캔 → 모듈 스포트라이트 |
| 0:09.5–0:35 | Hardware | 콜아웃 5개 순차 (카메라 · ToF ×8 · 진동모터 ×4 · Pi 5+전원 · BLE 앱) |
| 0:35–0:45 | 물건 찾기 설명 | "의자 찾아 줘" 앱 카드 + 방 미니맵 경로, 꺾을 때마다 그립 인셋에서 해당 모터 펄스 + TTS |
| 0:45–0:57 | 실사 | `public/clips/find_object.mp4` |
| 0:57–1:07 | 길안내 설명 | 풀폭 카카오 경로 미니맵 + 우측 앱 길안내 패널(연결된 진동모터 표시) |
| 1:07–1:11 | 장애물 감지 | ToF 빔 → 장애물 접근 → "정면 위험 감지 89 cm" 경고 |
| 1:11–1:23 | 실사 | `clips/obstacle.mp4` 5s → `clips/navigate.mp4` 7s |
| 1:23–1:30 | Outro | 앱 기능 5개 요약 → SmartCane · Group 30 · 크레딧 |

## 4. 사용자가 내린 결정 (바꾸지 말 것)
- 배경은 **화이트**, 액센트는 앱 UI의 블루 1색, 콜아웃 라인은 시안색 글로우("사이보그 느낌"은 사용자 요청).
- 물건 찾기 시나리오는 **"의자 찾아 줘"** (휴대폰 아님).
- 나레이션: **Edge TTS `ko-KR-InJoonNeural` 원음 속도** (쇼츠식 빠른 톤·피치 변경 없음).
- BGM: **"Life of Riley" (Kevin MacLeod, incompetech.com, CC BY 4.0)** — 아웃트로에 크레딧 자동 표기. 제출 설명란에도 같은 문구 필요.
- 자막은 나레이션과 동일 문장·동일 타이밍, 하단 중앙 흰 글자/남색 띠.
- `kbh-anti-slop` 검수 반영: 섹션 번호 아이브로우 없음, `REC`/`LIVE` 같은 가짜 상태 표시 없음, em-dash 없음, 근거 없는 숫자는 "(예시)" 표기, 코너 라디우스 12–16 통일, 두 사용 씬은 서로 다른 레이아웃.

## 5. 코드 구조
```
src/
  Root.tsx / Main.tsx      # 컴포지션 등록 · 씬 시퀀스 · 나레이션/BGM/자막 배치
  data.ts                  # 제품명·팀명·하드웨어 콜아웃·시나리오 단계·클립·타임라인(초). 자료 교체는 여기서
  narration.json           # 나레이션 13줄 (id·start·end·text·dur). 음성·자막·덕킹이 모두 이 파일 기준
  theme.ts                 # 색·폰트
  scenes/  Intro · CaneScene(리빌+콜아웃) · FindObject · Navigate(길안내+장애물+실사) · Outro
  components/  Cane(SVG 지팡이) · caneTransform(좌표계) · Callout · GripZoom · AppFlow · NavPanel · VideoCard · Subtitles · Bgm · HUD · Background · TypeText
  ui/  anim.ts(이징) · path.ts(폴리라인·정지→이동 스케줄) · duck.ts(나레이션 구간 덕킹)
scripts/make-vo.py         # narration.json → public/vo/*.mp3 (edge-tts) + 길이 검사 + dur 기록
public/  fonts/PretendardVariable.woff2 · clips/*.mp4 · vo/*.mp3 · bgm.mp3
remotion.config.ts         # 원격 환경용 headless_shell 경로 자동 감지 (로컬은 자동 다운로드)
```

## 6. 실행 · 렌더
```bash
cd cane-video
npm install
npm run dev                      # Remotion Studio 미리보기
npx remotion render Main out/main.mp4 --concurrency=4 --crf=24
# 라우드니스 정규화 (권장 마지막 단계)
ffmpeg -i out/main.mp4 -c:v copy -af "loudnorm=I=-16:TP=-1.5:LRA=11" -c:a aac -b:a 192k out/main_loud.mp4
# 나레이션 다시 만들기 (문장 수정 후)
pip install edge-tts && python3 scripts/make-vo.py
```
오디오 믹스: 나레이션 1.0 / BGM 0.26 → 나레이션 중 0.09 / 실사 클립 0.55 → 나레이션 중 0.04.

## 7. 남은 일 (자료 필요)
- [ ] 팀 로고 · QR → `Outro.tsx` 우하단 자리
- [ ] 앱 화면 녹화본(폰 원본 해상도) → `AppFlow`/`NavPanel` 도형 UI 대체
- [ ] 제품 측면 사진(배경 제거) → `public/cane.png` + `data.ts` `caneImage`, `features[].anchor` 미세 조정
- [ ] 공모전 정식 명칭 → `data.ts` `product.contest`
- [ ] (선택) 물건 찾기 실사 촬영본 교체 → `data.ts` `clips.findObject`

## 8. 알려진 제약
- YouTube 미디어 다운로드는 클라우드 IP에서 차단됨. 실사 소스는 사용자가 올린 초안 mp4에서 잘라 씀.
- FreePD는 사이트 폐쇄. BGM은 incompetech(CC BY 4.0)만 확인됨.
- Remotion 렌더는 Chrome Headless Shell 필요. 원격 환경은 `remotion.config.ts` 가 경로를 잡아줌.
