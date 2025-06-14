import type { Uppy } from "@uppy/core";
import { AlpineComponent } from "alpinejs";

interface UppyWidgetElement extends HTMLElement {
    uppy: Uppy;
    dataset: {
      endpoint: string;
      csrftoken: string;
    };
  }

interface UppyWidget {
    $el: UppyWidgetElement;
    init(): void;
    close(): void;
    setDashboard(): void;
    setTusProtocol(): void;
}


type UppyWidgetComponent = AlpineComponent<UppyWidget>;

export {
  UppyWidgetElement,
  UppyWidgetComponent,
}