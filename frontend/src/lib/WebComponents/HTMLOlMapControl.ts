import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Control } from 'ol/control';
import type HTMLOlMap from './HTMLOlMap';

@customElement('ol-map-control')
export class HTMLOlMapControl extends LitElement {
  static styles = css`
    :host {
      position: absolute;
    }
    :host(.ol-unselectable) {
      user-select: none;
    }
  `;

  static positionStyles: Record<string, Record<string, string>> = {
    'top-left': {
      top: `calc(.5em + var(--offset, 0px) + var(--offset-top, 0px))`,
      left: `calc(.5em + var(--offset, 0px) + var(--offset-left, 0px))`,
    },
    'top-right': {
      top: `calc(.5em + var(--offset, 0px) + var(--offset-top, 0px))`,
      right: `calc(.5em + var(--offset, 0px) + var(--offset-right, 0px))`,
    },
    'top-center': {
      top: `calc(.5em + var(--offset, 0px) + var(--offset-top, 0px))`,
      left: `calc(50% + var(--offset, 0px) + var(--offset-left, 0px))`,
      transform: 'translateX(-50%)',
    },
    'bottom-left': {
      bottom: `calc(.5em + var(--offset, 0px) + var(--offset-bottom, 0px))`,
      left: `calc(.5em + var(--offset, 0px) + var(--offset-left, 0px))`,
    },
    'bottom-right': {
      bottom: `calc(.5em + var(--offset, 0px) + var(--offset-bottom, 0px))`,
      right: `calc(.5em + var(--offset, 0px) + var(--offset-right, 0px))`,
    },
    'bottom-center': {
      bottom: `calc(.5em + var(--offset, 0px) + var(--offset-bottom, 0px))`,
      left: `calc(50% + var(--offset, 0px) + var(--offset-left, 0px))`,
      transform: 'translateX(-50%)',
    },
    'center-left': {
      left: `calc(.5em + var(--offset, 0px) + var(--offset-left, 0px))`,
      top: `calc(50% + var(--offset, 0px) + var(--offset-top, 0px))`,
      transform: 'translateY(-50%)',
    },
    'center-right': {
      right: `calc(.5em + var(--offset, 0px) + var(--offset-right, 0px))`,
      top: `calc(50% + var(--offset, 0px) + var(--offset-top, 0px))`,
      transform: 'translateY(-50%)',
    },
    'center': {
      top: `calc(50% + var(--offset, 0px) + var(--offset-top, 0px))`,
      left: `calc(50% + var(--offset, 0px) + var(--offset-left, 0px))`,
      transform: 'translate(-50%, -50%)',
    },
  };

  @property({ type: String, reflect: true }) offset = "0px";
  @property({ type: String, reflect: true, attribute: 'offset.top' }) top = "0px";
  @property({ type: String, reflect: true, attribute: 'offset.bottom' }) bottom = "0px";
  @property({ type: String, reflect: true, attribute: 'offset.left' }) left = "0px";
  @property({ type: String, reflect: true, attribute: 'offset.right' }) right = "0px";
  @property({ type: String, reflect: true }) position = 'top-right';

  private _control: Control;

  constructor() {
    super();
    this.classList.add('ol-unselectable');
    this._control = new Control({ element: this });
  }

  connectedCallback() {
    super.connectedCallback();
    const mapContainer = this.closest('ol-map') as HTMLOlMap;
    mapContainer?.map.addControl(this.control);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    const mapContainer = this.closest('ol-map') as HTMLOlMap;
    mapContainer?.map.removeControl(this.control);
  }

  updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);
  
    const properties = [
      { property: 'offset', cssVar: '--offset' },
      { property: 'top', cssVar: '--offset-top' },
      { property: 'bottom', cssVar: '--offset-bottom' },
      { property: 'left', cssVar: '--offset-left' },
      { property: 'right', cssVar: '--offset-right' }
    ];

    properties.forEach(({ property, cssVar }) => {
      if (changedProperties.has(property)) {
        const value = this[property as keyof this];
        if (typeof value === 'string') {
          this.style.setProperty(cssVar, value);
        } else {
          console.warn(`Expected a string for ${property}, but got ${typeof value}`);
        }
      }
    });
  
    // Handle 'position' property change
    if (changedProperties.has('position')) {
      const styles = HTMLOlMapControl.positionStyles[this.position];
      ['top', 'left', 'right', 'bottom', 'transform'].forEach((style) => {
        const propertyStyle = styles[style];
        if (propertyStyle) {
          this.style.setProperty(style, propertyStyle);
        } else {
          this.style.removeProperty(style);
        }
      });
    }
  }

  get control() {
    return this._control;
  }
}