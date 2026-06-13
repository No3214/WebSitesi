import React from "react";
import { Composition } from "remotion";

import { DURATION_IN_FRAMES, FPS, HEIGHT, Tanitim, WIDTH } from "./Tanitim";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Tanitim"
      component={Tanitim}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
