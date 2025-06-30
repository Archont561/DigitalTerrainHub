import _ from "lodash";
import clsx, { type ClassValue } from "clsx";
import type { ComponentProps } from "astro/types";
import { experimental_AstroContainer as AstroContainer, type ContainerRenderOptions } from "astro/container";


export function mergeClass(...args: ClassValue[]) {
    return clsx(...args);
}

type StyleValue = boolean | string | string[] | Record<string, any>;

export function mergeStyle(...args: StyleValue[]) {
    const styles: string[] = [];
    _.forEach(args, arg => {
        if (_.isString(arg)) arg && styles.push(arg);
        else if (_.isArray(arg)) styles.push(...arg.filter(Boolean));
        else if (_.isObject(arg)) styles.push(_.map(
            _.pickBy(arg, Boolean), 
            (value, key) => `${key}:${value};`
        ).join(""));
    });
    return styles.join("");
}

type AstroComponentFactory = Parameters<AstroContainer["renderToString"]>[0];

type ComponentContainerRenderOptions<T extends AstroComponentFactory> = Omit<ContainerRenderOptions, 'props'> & {
  // @ts-expect-error
  props?: ComponentProps<T>;
};

export async function render<T extends AstroComponentFactory>(
  Component: T,
  context: ComponentContainerRenderOptions<T> = {},
  status = 200,
): Promise<Response> {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Component, context);
  return new Response(result, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

export function jsonify(object: Record<string, unknown> | unknown[], status = 200) {
  return new Response(JSON.stringify(object), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
