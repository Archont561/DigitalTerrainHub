import { LitElement, css, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Control } from 'ol/control';
import { type HTMLOlMap } from '.';


type OlControlPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'center-left'
  | 'center-right'
  | 'center';

type CSSLength = `${number}${'px' | 'em' | 'rem' | 'vw' | 'vh' | '%'}`;
type OffsetString = 
  |`${CSSLength}`
  | `${CSSLength} ${CSSLength}`
  | `${CSSLength} ${CSSLength} ${CSSLength} ${CSSLength}`;

export interface HTMLOlMapControlProps {
  offset?: OffsetString;
  position?: OlControlPosition;
}


@customElement('ol-map-control')
export class HTMLOlMapControl extends LitElement implements HTMLOlMapControlProps {
  static styles = css`
    :host {
      position: absolute;
      top: var(--_flag-top, calc(.5em + var(--_offset-top, 0px)));
      left: var(--_flag-left, calc(.5em + var(--_offset-left, 0px)));
      bottom: var(--_flag-bottom, calc(.5em + var(--_offset-bottom, 0px)));
      right: var(--_flag-right, calc(.5em + var(--_offset-right, 0px)));
      translate: var(--_translate, unset);
    }
  `;

  static positionStyles: Record<string, Record<string, string>> = {
    'top-left': {
      '--_flag-top': 'auto',
      '--_flag-left': 'auto',
      '--_flag-bottom': 'unset',
      '--_flag-right': 'unset',
    },
    'top-right': {
      '--_flag-top': 'auto',
      '--_flag-right': 'auto',
      '--_flag-left': 'unset',
      '--_flag-bottom': 'unset',
      '--_translate': '0 0',
    },
    'top-center': {
      '--_flag-top': 'auto',
      '--_flag-left': 'unset',
      '--_flag-right': 'unset',
      '--_flag-bottom': 'unset',
      '--_translate': '-50% 0',
    },
    'bottom-left': {
      '--_flag-bottom': 'auto',
      '--_flag-left': 'auto',
      '--_flag-top': 'unset',
      '--_flag-right': 'unset',
      '--_translate': 'unset',
    },
    'bottom-right': {
      '--_flag-bottom': 'auto',
      '--_flag-right': 'auto',
      '--_flag-top': 'unset',
      '--_flag-left': 'unset',
    },
    'bottom-center': {
      '--_flag-bottom': 'auto',
      '--_flag-left': 'unset',
      '--_flag-right': 'unset',
      '--_flag-top': 'unset',
      '--_translate': '-50% 0',
    },
    'center-left': {
      '--_flag-left': 'auto',
      '--_flag-top': 'unset',
      '--_flag-bottom': 'unset',
      '--_flag-right': 'unset',
      '--_translate': '0 -50%',
    },
    'center-right': {
      '--_flag-right': 'auto',
      '--_flag-top': 'unset',
      '--_flag-left': 'unset',
      '--_flag-bottom': 'unset',
      '--_translate': '0 -50%',
    },
    'center-center': {
      '--_flag-top': 'unset',
      '--_flag-left': 'unset',
      '--_flag-bottom': 'unset',
      '--_flag-right': 'unset',
      '--_translate': '-50% -50%',
    }
  };

  @property({ type: String, reflect: true }) offset: OffsetString = "0px"; 
  @property({ type: String, reflect: true }) position: OlControlPosition = 'top-right';

  private readonly control: Control;

  constructor() {
    super();
    this.classList.add('ol-unselectable');
    this.control = new Control({ element: this });
  }

  get map() {
    return this.control.getMap();
  }

  connectedCallback() {
    super.connectedCallback();
    const mapContainer = this.closest('ol-map') as HTMLOlMap;
    mapContainer?.map.addControl(this.control);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.map?.removeControl(this.control);
  }

  updated(changedProperties: PropertyValues<this>) {
    super.updated(changedProperties);

    if (changedProperties.has('offset')) {
      this.applyOffsetStyles();
    }

    if (changedProperties.has('position')) {
      this.updatePositionProperties();
    }
  }

  applyOffsetStyles() {
    const values = this.offset.split(' ');
  
    if (values.length === 1) {
      this.style.setProperty('--_offset-top', values[0]);
      this.style.setProperty('--_offset-bottom', values[0]);
      this.style.setProperty('--_offset-left', values[0]);
      this.style.setProperty('--_offset-right', values[0]);
    } else if (values.length === 2) {
      this.style.setProperty('--_offset-top', values[0]);
      this.style.setProperty('--_offset-bottom', values[0]);
      this.style.setProperty('--_offset-left', values[1]);
      this.style.setProperty('--_offset-right', values[1]);
    } else if (values.length === 4) {
      this.style.setProperty('--_offset-top', values[0]);
      this.style.setProperty('--_offset-right', values[1]);
      this.style.setProperty('--_offset-bottom', values[2]);
      this.style.setProperty('--_offset-left', values[3]);
    } else {
      console.warn("Invalid offset value. Please provide 1, 2, or 4 values.");
    }
  }

  private updatePositionProperties() {
    const styles = HTMLOlMapControl.positionStyles[this.position] || {};
    Object.entries(styles).forEach(([cssVar, value]) => {
      this.style.setProperty(cssVar, value);
    });
  }
}