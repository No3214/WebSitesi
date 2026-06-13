import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

export const FPS = 30;
export const DURATION_IN_FRAMES = 900;
export const WIDTH = 1080;
export const HEIGHT = 1920;

const GOLD = "#b3925c";
const IVORY = "#faf9f6";
const INK = "#14161a";
const SERIF = 'Georgia, "Times New Roman", serif';

const CLIP_FADE_IN_FRAMES = 12;

type OverlayTextProps = {
  title: string;
  subtitle?: string;
  align?: "center" | "lower";
};

const OverlayText: React.FC<OverlayTextProps> = ({
  title,
  subtitle,
  align = "lower",
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [12, 36], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [12, 36], [28, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: align === "center" ? "center" : "flex-end",
        paddingBottom: align === "center" ? 0 : 220,
        paddingLeft: 80,
        paddingRight: 80,
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px)`,
          textAlign: "center",
          color: IVORY,
          fontFamily: SERIF,
          textShadow: "0 2px 24px rgba(20, 22, 26, 0.75)",
        }}
      >
        <div
          style={{
            fontSize: align === "center" ? 84 : 64,
            letterSpacing: "0.14em",
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              marginTop: 28,
              fontSize: 34,
              letterSpacing: "0.42em",
              color: IVORY,
              opacity: 0.88,
              textTransform: "uppercase",
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

type ClipProps = {
  src: string;
  startFrom?: number;
  title: string;
  subtitle?: string;
  align?: "center" | "lower";
};

const Clip: React.FC<ClipProps> = ({
  src,
  startFrom,
  title,
  subtitle,
  align,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, CLIP_FADE_IN_FRAMES], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: INK, opacity }}>
      <OffthreadVideo
        src={staticFile(src)}
        startFrom={startFrom}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(20, 22, 26, 0.62) 0%, rgba(20, 22, 26, 0) 40%)",
        }}
      />
      <OverlayText title={title} subtitle={subtitle} align={align} />
    </AbsoluteFill>
  );
};

const LogoMarkGold: React.FC<{ width: number }> = ({ width }) => {
  return (
    <svg
      viewBox="0 0 120 150"
      width={width}
      height={(width * 150) / 120}
      fill="none"
      stroke={GOLD}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 56 A42 42 0 0 1 102 56" />
      <path d="M23 56 A37 37 0 0 1 97 56" />
      <path d="M48 56 A12 12 0 0 1 72 56" />
      <path d="M60 44 L60 19" />
      <path d="M55.4 44.9 L45.6 21.8" />
      <path d="M51.5 47.5 L34 31" />
      <path d="M48.6 51.4 L26 41.5" />
      <path d="M64.6 44.9 L74.4 21.8" />
      <path d="M68.5 47.5 L86 31" />
      <path d="M71.4 51.4 L94 41.5" />
      <path d="M18 56 H102" />
      <path d="M18 60 H102" />
      <path d="M18 60 V138 H102 V60" />
      <path d="M60 60 V138" />
      <rect x="27" y="68" width="26" height="56" rx="1.5" />
      <rect x="30.5" y="71.5" width="19" height="49" rx="1" />
      <path d="M40 71.5 V120.5" />
      <path d="M30.5 88 H49.5" />
      <path d="M30.5 104 H49.5" />
      <rect x="67" y="68" width="26" height="56" rx="1.5" />
      <rect x="70.5" y="71.5" width="19" height="49" rx="1" />
      <path d="M80 71.5 V120.5" />
      <path d="M70.5 88 H89.5" />
      <path d="M70.5 104 H89.5" />
      <circle cx="56.6" cy="95" r="1.7" fill={GOLD} stroke="none" />
      <circle cx="63.4" cy="95" r="1.7" fill={GOLD} stroke="none" />
      <path d="M18 72 H27 M18 84 H27 M18 97 H27 M18 110 H27 M18 123 H27" />
      <path d="M22.5 60 V72 M22.5 84 V97 M22.5 110 V123 M22.5 130 V138" />
      <path d="M18 130 H27" />
      <path d="M93 72 H102 M93 84 H102 M93 97 H102 M93 110 H102 M93 123 H102" />
      <path d="M97.5 72 V84 M97.5 97 V110 M97.5 123 V130" />
      <path d="M93 130 H102" />
      <path d="M53 76 H67 M53 86 H67 M53 106 H67 M53 116 H67 M53 128 H67" />
      <path d="M27 124 H53 M67 124 H93" />
      <path d="M34 124 V138 M47 131 V138 M73 131 V138 M86 124 V138" />
      <path d="M27 131 H53 M67 131 H93" />
    </svg>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const cardOpacity = interpolate(frame, [0, 24], [0, 1], {
    extrapolateRight: "clamp",
  });
  const textOpacity = interpolate(frame, [18, 48], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textTranslateY = interpolate(frame, [18, 48], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: INK,
        alignItems: "center",
        justifyContent: "center",
        opacity: cardOpacity,
        fontFamily: SERIF,
      }}
    >
      <LogoMarkGold width={340} />
      <div
        style={{
          marginTop: 72,
          opacity: textOpacity,
          transform: `translateY(${textTranslateY}px)`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            color: IVORY,
            fontSize: 68,
            letterSpacing: "0.16em",
            lineHeight: 1.2,
          }}
        >
          {"KOZBEYLİ KONAĞI"}
        </div>
        <div
          style={{
            marginTop: 26,
            color: GOLD,
            fontSize: 30,
            letterSpacing: "0.34em",
            textTransform: "uppercase",
          }}
        >
          {"Taş Otel & Restaurant"}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Tanitim: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: INK, fontFamily: SERIF }}>
      <Sequence from={0} durationInFrames={180} name="Hero - Drone">
        <Clip
          src="videos/hero.mp4"
          title="KOZBEYLİ KONAĞI"
          subtitle="Foça, İzmir"
          align="center"
        />
      </Sequence>
      <Sequence from={180} durationInFrames={210} name="Chef">
        <Clip src="videos/chef.mp4" title="Taş Fırından Sofraya" />
      </Sequence>
      <Sequence from={390} durationInFrames={210} name="Sunset">
        <Clip src="videos/sunset.mp4" title={"Ege’de Gün Batımı"} />
      </Sequence>
      <Sequence from={600} durationInFrames={180} name="Hero - Şömine">
        <Clip
          src="videos/hero.mp4"
          startFrom={165}
          title="Şömine Başında"
        />
      </Sequence>
      <Sequence from={780} durationInFrames={120} name="Bitiş Kartı">
        <EndCard />
      </Sequence>
    </AbsoluteFill>
  );
};
