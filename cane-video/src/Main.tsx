import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { Background } from "./components/Background";
import { HUD } from "./components/HUD";
import { Subtitles } from "./components/Subtitles";
import { Bgm } from "./components/Bgm";
import { Intro } from "./scenes/Intro";
import { CaneScene } from "./scenes/CaneScene";
import { FindObject } from "./scenes/FindObject";
import { Navigate } from "./scenes/Navigate";
import { Outro } from "./scenes/Outro";
import { timeline } from "./data";
import narration from "./narration.json";

/** 전체 90초 타임라인 — data.ts 의 timeline(초)로 구간 조정 */
export const Main: React.FC = () => {
  const { fps } = useVideoConfig();
  const s = (t: readonly [number, number]) => ({ from: Math.round(t[0] * fps), dur: Math.round((t[1] - t[0]) * fps) });
  const intro = s(timeline.intro);
  const cane = { from: Math.round(timeline.reveal[0] * fps), dur: Math.round((timeline.features[1] - timeline.reveal[0]) * fps) };
  const revealFrames = Math.round((timeline.reveal[1] - timeline.reveal[0]) * fps);
  const find = s(timeline.findObject);
  const nav = s(timeline.navigate);
  const outro = s(timeline.outro);

  return (
    <AbsoluteFill>
      <Background />
      <Sequence from={intro.from} durationInFrames={intro.dur} name="Intro">
        <Intro duration={intro.dur} />
      </Sequence>
      <Sequence from={cane.from} durationInFrames={cane.dur} name="Device: Reveal + Hardware">
        <CaneScene duration={cane.dur} revealFrames={revealFrames} />
      </Sequence>
      <Sequence from={find.from} durationInFrames={find.dur} name="Use 1: 물건 찾기">
        <FindObject duration={find.dur} />
      </Sequence>
      <Sequence from={nav.from} durationInFrames={nav.dur} name="Use 2: 길안내 + 장애물">
        <Navigate duration={nav.dur} />
      </Sequence>
      <Sequence from={outro.from} durationInFrames={outro.dur} name="Outro">
        <Outro duration={outro.dur} />
      </Sequence>
      {/* 나레이션 (public/vo, scripts/make-vo.py 로 생성) */}
      {narration.map((n) => (
        <Sequence key={n.id} from={Math.round(n.start * fps)} name={`VO ${n.id}`}>
          <Audio src={staticFile(`vo/${n.id}.mp3`)} />
        </Sequence>
      ))}
      <Bgm />
      <Subtitles />
      <HUD />
    </AbsoluteFill>
  );
};
