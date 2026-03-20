import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CookieConsent } from '@/components/cookie-consent';

const meta = {
  title: 'Components/CookieConsent',
  component: CookieConsent,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      // Clear consent so the banner appears
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cookie_consent_v2');
      }
      return Story();
    },
  ],
} satisfies Meta<typeof CookieConsent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
