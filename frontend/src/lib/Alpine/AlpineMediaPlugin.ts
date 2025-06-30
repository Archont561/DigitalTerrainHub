import AlpinePluginBuilder from "./AlpinePluginBuilder";

declare module "alpinejs" {
  interface Alpine {
    mediaPlugin: typeof AlpineMediaPlugin;
  }
}

interface MediaQueryBroadcaster {
  mediaQuery: MediaQueryList;
  callbacks: CallableFunction[];

  init(): void;
  broadcast(e: MediaQueryListEvent): void;
  unsubscrbe(callback: CallableFunction): void;
  subscribe(callback: CallableFunction): void;
}

interface MediaPluginSettings {
  breakpoints: Record<string, string>;
}

const AlpineMediaPlugin = AlpinePluginBuilder.create<MediaPluginSettings>("mediaPlugin")
.setSettings({
  breakpoints: {
    xs: '30rem',   // 480px
    sm: '40rem',   // 640px
    md: '48rem',   // 768px
    lg: '64rem',   // 1024px
    xl: '80rem',   // 1280px
    '2xl': '96rem' // 1536px
  }
}).extend(plugin => {
  const pluginSettings = plugin.getSettings();
  return {
    mediaQueriesStorage: new Map<string, MediaQueryBroadcaster>(),

    normalizeLength(length: number | string): string {
      if (typeof length === "number" || (/^\d+(\.\d+)?$/.test(length))) {
        return `${length}px`;
      }
      return length;
    },

    replaceBreakpointAliases(expr: string): string {
      return expr.replace(/\b([a-zA-Z_][\w-]*)\b/g, (match) => {
        if (match in pluginSettings.breakpoints) {
          return this.normalizeLength(pluginSettings.breakpoints[match]);
        }
        return match;
      });
    },

    getBreakpointValue(value: string): string {
      if (/^calc\(.+\)$/.test(value.trim())) {
        const insideCalc = value.trim().slice(5, -1);
        const replaced = this.replaceBreakpointAliases(insideCalc);
        return `calc(${replaced})`;
      }

      const toReturn = value in pluginSettings.breakpoints
        ? pluginSettings.breakpoints[value]
        : value;

      return this.normalizeLength(toReturn);
    },

    getMediaQueryBroadcaster(query: string): MediaQueryBroadcaster {
      if (this.mediaQueriesStorage.has(query)) {
        return this.mediaQueriesStorage.get(query)!;
      }
      return this.registerMediaQueryBroadcaster(query);
    },

    registerMediaQueryBroadcaster(query: string): MediaQueryBroadcaster {
      const mediaQueriesStorage = this.mediaQueriesStorage;

      const mediaQueryBroadcaster: MediaQueryBroadcaster = {
        mediaQuery: window.matchMedia(query),
        callbacks: [],

        init() {
          this.mediaQuery.addEventListener("change", this.broadcast.bind(this));
        },

        subscribe(callback) {
          this.callbacks.push(callback);
          if (this.mediaQuery.matches) callback(this.mediaQuery);
        },

        unsubscrbe(callback) {
          const i = this.callbacks.findIndex(cb => cb === callback);
          if (i !== -1) this.callbacks.splice(i, 1);
          if (this.callbacks.length === 0) {
            this.mediaQuery.removeEventListener("change", this.broadcast.bind(this));
            mediaQueriesStorage.delete(query);
          }
        },

        broadcast(e) {
          this.callbacks.forEach(cb => cb(this.mediaQuery));
        },
      };

      mediaQueryBroadcaster.init();
      mediaQueriesStorage.set(query, mediaQueryBroadcaster);
      return mediaQueryBroadcaster;
    }
  }
}).addDirective((plugin) => ({
  name: "screen",
  callback: (el, { expression, value }, { evaluate, cleanup }) => {
    if (!value.trim()) {
      throw new Error("x-screen directive must have value defined!");
    }

    const mediaQueryString = (() => {
      if (value.includes("-")) {
        const [minBreakpoint, maxBreakpoint] = value.split("-").map(plugin.getBreakpointValue.bind(plugin));
        return `(min-width: ${minBreakpoint}) and (max-width: calc(${maxBreakpoint} - 0.02px))`;
      }
      return `(min-width: ${plugin.getBreakpointValue(value)})`;
    })();

    const mediaQueryBroadcaster = plugin.getMediaQueryBroadcaster(mediaQueryString);

    const callback = (mediaQuery: MediaQueryList) => {
      evaluate(expression, { scope: { "$mediaQuery": mediaQuery } });
    };

    mediaQueryBroadcaster.subscribe(callback);

    cleanup(() => {
      mediaQueryBroadcaster.unsubscrbe(callback);
    });
  },
}));

export default AlpineMediaPlugin;
