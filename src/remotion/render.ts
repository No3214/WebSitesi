import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";

export async function renderHeritageVideo(
  id: string,
  inputProps: { title: string; subtitle: string; description: string }
) {
  const entryPoint = path.resolve("src/remotion/Root.tsx");
  console.log("Bundling video...");
  const bundled = await bundle(entryPoint);

  const composition = await selectComposition({
    serveUrl: bundled,
    id: "HeritageSnippet",
    inputProps,
  });

  const outputLocation = path.resolve(`public/videos/gen-${id}.mp4`);
  
  console.log("Rendering video to:", outputLocation);
  await renderMedia({
    composition,
    serveUrl: bundled,
    outputLocation,
    inputProps,
    codec: "h264",
  });

  return outputLocation;
}
