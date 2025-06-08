import type { ComponentProps } from "astro/types";
import { experimental_AstroContainer as AstroContainer, type ContainerRenderOptions } from "astro/container";

type AstroComponentFactory = Parameters<AstroContainer["renderToString"]>[0];

type ComponentContainerRenderOptions<T extends AstroComponentFactory> = Omit<ContainerRenderOptions, 'props'> & {
  // @ts-expect-error
  props?: ComponentProps<T>;
};

export async function renderAstroComponent<T extends AstroComponentFactory>(
  Component: T, 
  options: ComponentContainerRenderOptions<T> = {},
  asDocumentFragment: boolean = false,
) {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Component, options);

  if (asDocumentFragment) {
    const template = document.createElement("template");
    template.innerHTML = result;
    return template.content;
  }  else {
    const div = document.createElement("div");
    div.innerHTML = result;
    div.classList.add("vitest-component-wrapper");
    return div;
  }
}