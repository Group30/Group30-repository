import { continueRender, delayRender, staticFile } from "remotion";

// Pretendard Variable (public/fonts) 로드. 실패해도 렌더는 계속 진행.
if (typeof document !== "undefined" && "fonts" in document) {
  const handle = delayRender("Loading Pretendard");
  const face = new FontFace(
    "Pretendard",
    `url(${staticFile("fonts/PretendardVariable.woff2")}) format("woff2")`,
    { weight: "100 900", style: "normal" }
  );
  face
    .load()
    .then((loaded) => {
      (document.fonts as unknown as { add: (f: FontFace) => void }).add(loaded);
      continueRender(handle);
    })
    .catch(() => continueRender(handle));
}
