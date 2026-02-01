import { defineCollection, z } from 'astro:content';

const statii = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    permalink: z.string(),
  }),
});

export const collections = { statii };
