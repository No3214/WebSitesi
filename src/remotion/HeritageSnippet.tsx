import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export const HeritageSnippet: React.FC<{
  title: string;
  subtitle: string;
  description: string;
}> = ({ title, subtitle, description }) => {
  const frame = useCurrentFrame();
  // const { width, height } = useVideoConfig();

  // Animations
  const opacity = interpolate(frame, [0, 15, 135, 150], [0, 1, 1, 0]);
  const scale = interpolate(frame, [0, 150], [1, 1.1]);
  const contentY = interpolate(frame, [0, 30], [50, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        fontFamily: "'Playfair Display', serif",
        color: "#f8f1e7", // Off-white/Cream
        overflow: "hidden",
      }}
    >
      {/* Background Layer (Abstract Gradient) */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)",
          transform: `scale(${scale})`,
        }}
      />

      {/* Glassmorphism Card */}
      <AbsoluteFill
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 60,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            border: "1px solid rgba(212, 175, 55, 0.3)", // Subtle Gold
            background: "rgba(20, 20, 20, 0.4)",
            backdropFilter: "blur(20px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            opacity,
            transform: `translateY(${contentY}px)`,
            position: "relative",
          }}
        >
          {/* Decorative Corner */}
          <div style={{ position: "absolute", top: 20, left: 20, width: 40, height: 40, borderTop: "2px solid #d4af37", borderLeft: "2px solid #d4af37" }} />
          <div style={{ position: "absolute", bottom: 20, right: 20, width: 40, height: 40, borderBottom: "2px solid #d4af37", borderRight: "2px solid #d4af37" }} />

          <div style={{ letterSpacing: "8px", fontSize: 28, textTransform: "uppercase", marginBottom: 40, color: "#d4af37" }}>
            No. 3214 Prestige
          </div>
          
          <h1 style={{ fontSize: 110, margin: "0 0 20px 0", fontWeight: 700, lineHeight: 1 }}>
            {title}
          </h1>
          
          <h2 style={{ fontSize: 45, fontWeight: 300, fontStyle: "italic", marginBottom: 60, color: "rgba(248, 241, 231, 0.7)" }}>
            {subtitle}
          </h2>

          <div style={{ height: 2, width: 100, backgroundColor: "#d4af37", marginBottom: 60 }} />

          <p style={{ fontSize: 32, maxWidth: 800, lineHeight: 1.6, fontWeight: 300 }}>
            {description}
          </p>

          <div style={{ marginTop: 80, fontSize: 24, textTransform: "uppercase", letterSpacing: "4px" }}>
            Mirasımızı Keşfedin
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
