import type { Uppy } from "@uppy/core";

interface UppyWidgetElement extends HTMLElement {
    uppy: Uppy;
    dataset: {
      endpoint: string;
      csrftoken: string;
    };
  }

interface UppyWidgetComponent {
    $el: UppyWidgetElement;
    init(): void;
    close(): void;
    setDashboard(): void;
    setCustomStyle(): void;
    setTusProtocol(): void;
}


export {
    UppyWidgetComponent
}