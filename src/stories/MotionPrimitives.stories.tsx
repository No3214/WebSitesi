import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MagneticLink, Parallax, RevealLines, StaggerContainer, TiltCard } from "@/components/animations";

const meta = {
  title: "Kozbeyli/Motion Primitives",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const cardStyle = {
  minHeight: 260,
  border: "1px solid rgba(61, 74, 59, 0.16)",
  background: "linear-gradient(180deg, #fffaf2, #f4ecdf)",
  boxShadow: "0 24px 70px rgba(68, 53, 31, 0.12)",
  padding: 28,
} as const;

export const StoneAndLight: Story = {
  render: () => (
    <main style={{ minHeight: "120vh", background: "#fbf6eb", color: "#2c3729", padding: "96px 32px" }}>
      <section style={{ maxWidth: 1120, margin: "0 auto" }}>
        <RevealLines
          lines={["Stone & Light", "Editorial Motion"]}
          as="h1"
          trigger="mount"
          className="serif"
        />

        <p style={{ maxWidth: 620, lineHeight: 1.7, marginTop: 18 }}>
          Lightweight motion primitives for the Kozbeyli visual system: no new dependency, reduced-motion
          fallback, pointer-safe interaction and real content hierarchy.
        </p>

        <div style={{ marginTop: 32 }}>
          <MagneticLink href="/rezervasyon" className="button gold magnetic-cta">
            Rezervasyon
          </MagneticLink>
        </div>

        <StaggerContainer
          className="motion-story-grid"
          delay={0.08}
          stagger={0.08}
        >
          <TiltCard style={cardStyle}>
            <strong style={{ display: "block", letterSpacing: "0.16em", textTransform: "uppercase", fontSize: 12 }}>
              TiltCard
            </strong>
            <h2 className="serif" style={{ marginTop: 18 }}>Pointer-fine artifact card</h2>
            <p style={{ lineHeight: 1.65 }}>
              Uses a maximum 4 degree transform and stays static on touch and reduced motion.
            </p>
          </TiltCard>

          <Parallax className="motion-story-panel" distance={18}>
            <div style={cardStyle}>
              <strong style={{ display: "block", letterSpacing: "0.16em", textTransform: "uppercase", fontSize: 12 }}>
                Parallax
              </strong>
              <h2 className="serif" style={{ marginTop: 18 }}>Bounded scroll depth</h2>
              <p style={{ lineHeight: 1.65 }}>
                Clamped to 24px and disabled below tablet width so mobile reading stays calm.
              </p>
            </div>
          </Parallax>
        </StaggerContainer>
      </section>

      <style>{`
        .motion-story-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
          margin-top: 56px;
        }

        @media (max-width: 760px) {
          .motion-story-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  ),
};
