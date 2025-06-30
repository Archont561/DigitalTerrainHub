import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';

export default {
  login: defineAction({
    input: z.object({  }),
    handler(input, context) {
        return;
    },
  })
}