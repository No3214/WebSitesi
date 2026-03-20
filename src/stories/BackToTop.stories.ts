import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { BackToTop } from '@/components/back-to-top';

const meta = {
  title: 'Components/BackToTop',
  component: BackToTop,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      // Create tall container so scroll activates the button
      const wrapper = document.createElement('div');
      wrapper.style.height = '2000px';
      wrapper.style.padding = '20px';
      wrapper.innerHTML = '<p style="margin-bottom:800px">Aşağı kaydırın...</p>';
      const storyEl = document.createElement('div');
      wrapper.appendChild(storyEl);
      return Story();
    },
  ],
} satisfies Meta<typeof BackToTop>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
