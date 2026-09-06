import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { easeOut, prog } from "../ui/anim";
import { TypeText } from "./TypeText";

/** 앱 처리 흐름 카드 — 음성 → STT → Gemini 의도 → BLE 전송 (설명서 '음성 명령 처리 흐름' 기준) */
export const AppFlow: React.FC<{
  x: number;
  y: number;
  width: number;
  start: number;
  voice: string;
  intent: string;
  target: string;
  action: string;
}> = ({ x, y, width, start, voice, intent, target, action }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inP = easeOut(prog(frame, start, 14));
  const rows = [
    { k: "1", title: "인식된 음성", body: `“${voice}”`, at: start + 10, type: true },
    { k: "2", title: "Gemini 의도 분석", body: `${intent} · ${target}`, at: start + 46 },
    { k: "3", title: "BLE 전송 → Raspberry Pi 5", body: action, at: start + 70 },
  ];
  const listening = frame < start + 40;
  const pulse = (frame % 30) / 30;

  return (
    <div style={{ position: "absolute", left: x, top: y, width, opacity: inP, transform: `translateY(${(1 - inP) * 20}px)`, fontFamily: theme.font, background: "#fff", border: `1.5px solid ${theme.panelBorder}`, borderRadius: 18, boxShadow: "0 16px 40px rgba(15,27,45,0.10)", padding: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: theme.ink }}>SmartCane</div>
          <div style={{ fontSize: 13, color: theme.grey }}>AI 기반 보행 보조 서비스</div>
        </div>
        <div style={{ fontSize: 13, color: theme.green, fontWeight: 700 }}>● 연결됨</div>
      </div>
      <div style={{ textAlign: "center", marginTop: 22 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: theme.ink }}>무엇을 도와드릴까요?</div>
        <div style={{ position: "relative", width: 96, height: 96, margin: "16px auto 6px" }}>
          {listening ? <div style={{ position: "absolute", inset: -14 * pulse, borderRadius: "50%", border: `2px solid ${theme.blue}`, opacity: 1 - pulse }} /> : null}
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: listening ? theme.blue : theme.red, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 34 }}>
            {listening ? "🎤" : "■"}
          </div>
        </div>
        <div style={{ fontSize: 14, color: theme.grey }}>{listening ? "듣고 있어요. 말씀하신 내용을 듣고 있습니다." : "듣기 종료. 의도를 분석합니다."}</div>
      </div>
      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((r) => {
          const p = easeOut(prog(frame, r.at, 12));
          return (
            <div key={r.k} style={{ opacity: p, transform: `translateX(${(1 - p) * 16}px)`, background: theme.bg, borderRadius: 12, padding: "12px 16px", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: theme.blue, color: "#fff", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{r.k}</div>
              <div>
                <div style={{ fontSize: 14, color: theme.grey, fontWeight: 600 }}>{r.title}</div>
                <div style={{ fontSize: 18, color: theme.ink, fontWeight: 700, marginTop: 2 }}>
                  {r.type ? <TypeText text={r.body} start={r.at + 4} fps={fps} cps={14} cursor={false} /> : r.body}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
