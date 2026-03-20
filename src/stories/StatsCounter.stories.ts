import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StatsCounter } from '@/components/stats-counter';

const meta = {
  title: 'Components/StatsCounter',
  component: StatsCounter,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof StatsCounter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Turkish: Story = {
  args: { locale: 'tr' },
};

export const English: Story = {
  args: { locale: 'en' },
};
