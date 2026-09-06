import React from "react";
import { Composition } from "remotion";
import "./fonts";
import { Main } from "./Main";
import { FPS } from "./theme";

const TOTAL_SECONDS = 90;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Main" component={Main} durationInFrames={TOTAL_SECONDS * FPS} fps={FPS} width={1920} height={1080} />
  </>
);
