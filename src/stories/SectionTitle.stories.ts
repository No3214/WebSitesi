import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SectionTitle } from '@/components/section-title';

const meta = {
  title: 'Components/SectionTitle',
  component: SectionTitle,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof SectionTitle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    eyebrow: 'Odalar',
    title: 'Taş Duvarların Arasında Huzur',
    text: 'Her biri özenle restore edilmiş 16 butik odamızda Ege ruhunu hissedin.',
  },
};

export const WithoutText: Story = {
  args: {
    eyebrow: 'Galeri',
    title: 'Kozbeyli Konağı Fotoğrafları',
  },
};

export const English: Story = {
  args: {
    eyebrow: 'Rooms',
    title: 'Peace Among Stone Walls',
    text: 'Feel the Aegean spirit in our 16 meticulously restored boutique rooms.',
  },
};
