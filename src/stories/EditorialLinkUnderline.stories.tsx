import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { EditorialLinkUnderline } from "@/components/editorial-link-underline";

const meta = {
  title: "Kozbeyli/Editorial Link Underline",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const StoneAndLight: Story = {
  render: () => (
    <div
      style={{
        background: "#fbf6eb",
        color: "#2c3729",
        padding: "64px 48px",
        fontSize: 20,
        lineHeight: 1.8,
        maxWidth: 560,
      }}
    >
      <p>
        Konağın ritmini{" "}
        <EditorialLinkUnderline href="/odalar">Odaları İncele</EditorialLinkUnderline>{" "}
        ile keşfedin, ardından{" "}
        <EditorialLinkUnderline href="/menu">Menüyü Gör</EditorialLinkUnderline>{" "}
        ve{" "}
        <EditorialLinkUnderline href="/hikayemiz">Hikâyeyi Keşfet</EditorialLinkUnderline>.
      </p>
    </div>
  ),
};
