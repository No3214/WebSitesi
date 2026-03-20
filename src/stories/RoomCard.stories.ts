import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { RoomCard } from '@/components/room-card';

const meta = {
  title: 'Components/RoomCard',
  component: RoomCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      const el = document.createElement('div');
      el.style.maxWidth = '400px';
      el.style.width = '100%';
      return Story();
    },
  ],
} satisfies Meta<typeof RoomCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    slug: 'standart-oda',
    title: 'Standart Oda',
    short: 'Huzurlu bir konaklama deneyimi sunan, taş duvarlı klasik odamız.',
    capacity: '2 Kişi',
    view: 'Bahçe Manzarası',
    size: '24 m²',
    image: '/images/rooms/standart.jpg',
    price: 4500,
    locale: 'tr',
    detailLabel: 'Odayı İncele',
  },
};

export const Compact: Story = {
  args: {
    ...Default.args,
    compact: true,
  },
};

export const WithoutPrice: Story = {
  args: {
    slug: 'deniz-manzarali-suit',
    title: 'Deniz Manzaralı Süit',
    capacity: '2+1 Kişi',
    view: 'Deniz Manzarası',
    size: '45 m²',
    image: '/images/rooms/suite.jpg',
    locale: 'tr',
  },
};

export const English: Story = {
  args: {
    slug: 'standard-room',
    title: 'Standard Room',
    short: 'A peaceful stay experience in our classic stone-walled room.',
    capacity: '2 Guests',
    view: 'Garden View',
    size: '24 m²',
    image: '/images/rooms/standart.jpg',
    price: 4500,
    locale: 'en',
    detailLabel: 'View Room',
  },
};
