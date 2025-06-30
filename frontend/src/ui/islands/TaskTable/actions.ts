import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';

export default {
  getTaskStatus: defineAction({
    input: z.object({  }),
    handler(input, context) {
        return;
    },
  })
}