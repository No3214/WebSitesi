import { Composition } from "remotion";
import { HeritageSnippet } from "./HeritageSnippet";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HeritageSnippet"
        component={HeritageSnippet}
        durationInFrames={150} // 5 seconds at 30fps
        fps={30}
        width={1080}
        height={1920} // Vertical video (9:16)
        defaultProps={{
          title: "Kozbeyli Konağı",
          subtitle: "500 Yıllık Miras",
          description: "Horasan harcı ve andezit taşın hikayesi...",
        }}
      />
    </>
  );
};
