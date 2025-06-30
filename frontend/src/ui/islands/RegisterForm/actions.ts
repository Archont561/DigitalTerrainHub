import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';

export default {
  register: defineAction({
    input: z.object({  }),
    handler(input, context) {
        return;
    },
  })
}