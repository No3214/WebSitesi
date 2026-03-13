import { CollectionConfig } from 'payload';

export const HotelRunnerEvents: CollectionConfig = {
  slug: 'hotelrunner-events',
  admin: {
    useAsTitle: 'messageUid',
    defaultColumns: ['messageUid', 'event', 'status', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => !!user,
    create: () => false, // Only created via API
    update: () => false,
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'messageUid',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'event',
      type: 'text',
      required: true,
    },
    {
      name: 'payload',
      type: 'json',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'processed',
      options: [
        { label: 'Processed', value: 'processed' },
        { label: 'Failed', value: 'failed' },
        { label: 'Duplicate', value: 'duplicate' },
      ],
    },
    {
      name: 'error',
      type: 'text',
    }
  ],
  timestamps: true,
};
