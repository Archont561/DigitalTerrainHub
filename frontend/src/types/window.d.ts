import type { HTMLAttributes, HTMLTag } from 'astro/types';

export {};

declare global {
    interface Window {
        Alpine: import('alpinejs').Alpine & {
            Manager: alpine.AlpineManager;
        };
        htmx: typeof import("htmx.org");
        utils: import("./utils").Utils;
    }

    namespace Astro {
        interface HTMLComponentProps<T extends HTMLTag> extends HTMLAttributes<T> {
            [key: string]: any;
        }
        interface ComponentProps extends HTMLAttributes<"div"> {
            [key: string]: any;
        }
    }
}