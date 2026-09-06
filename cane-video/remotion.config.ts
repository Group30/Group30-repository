import { Config } from "@remotion/cli/config";
import fs from "fs";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(2);

// 원격 실행 환경에 미리 설치된 Chrome Headless Shell 사용.
// 로컬에서 없으면 Remotion 이 자동으로 알맞은 브라우저를 내려받음.
const candidates = [
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell",
  process.env.REMOTION_BROWSER ?? "",
].filter(Boolean);
const found = candidates.find((p) => fs.existsSync(p));
if (found) Config.setBrowserExecutable(found);
