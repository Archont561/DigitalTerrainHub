import { Control } from "ol/control";


export default class HTMLOlMapControl extends HTMLElement {
    static positionStyles = {
        "top-left": {
            top: `calc(.5em + var(--offset, 0px) + var(--offset-top, 0px))`,
            left: `calc(.5em + var(--offset, 0px) + var(--offset-left, 0px))`
        },
        "top-right": {
            top: `calc(.5em + var(--offset, 0px) + var(--offset-top, 0px))`,
            right: `calc(.5em + var(--offset, 0px) + var(--offset-right, 0px))`
        },
        "top-center": {
            top: `calc(.5em + var(--offset, 0px) + var(--offset-top, 0px))`,
            left: `calc(50% + var(--offset, 0px) + var(--offset-left, 0px))`,
            transform: "translateX(-50%)"
        },
        "bottom-left": {
            bottom: `calc(.5em + var(--offset, 0px) + var(--offset-bottom, 0px))`,
            left: `calc(.5em + var(--offset, 0px) + var(--offset-left, 0px))`
        },
        "bottom-right": {
            bottom: `calc(.5em + var(--offset, 0px) + var(--offset-bottom, 0px))`,
            right: `calc(.5em + var(--offset, 0px) + var(--offset-right, 0px))`
        },
        "bottom-center": {
            bottom: `calc(.5em + var(--offset, 0px) + var(--offset-bottom, 0px))`,
            left: `calc(50% + var(--offset, 0px) + var(--offset-left, 0px))`,
            transform: "translateX(-50%)"
        },
        "center-left": {
            left: `calc(.5em + var(--offset, 0px) + var(--offset-left, 0px))`,
            top: `calc(50% + var(--offset, 0px) + var(--offset-top, 0px))`,
            transform: "translateY(-50%)"
        },
        "center-right": {
            right: `calc(.5em + var(--offset, 0px) + var(--offset-right, 0px))`,
            top: `calc(50% + var(--offset, 0px) + var(--offset-top, 0px))`,
            transform: "translateY(-50%)"
        },
        "center": {
            top: `calc(50% + var(--offset, 0px) + var(--offset-top, 0px))`,
            left: `calc(50% + var(--offset, 0px) + var(--offset-left, 0px))`,
            transform: "translate(-50%, -50%)"
        }
    } as Record<string, Record<string, string>>;


    static get observedAttributes() {
        return ['offset', 'offset.top', 'offset.bottom', "offset.left", "offset.right", "position"];
    }
    
    private control: Control;

    getControl() { return this.control; }

    constructor() {
        super();
        this.classList.add("ol-unselectable", "absolute");

        this.control = new Control({ element: this });
        const mapContainer = this.closest("ol-map") as HTMLOlMap;
        mapContainer?.getMap().addControl(this.control);
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (newValue === oldValue) return;

        switch (name) {
            case 'offset':
            case 'offset.top':
            case 'offset.bottom':
            case 'offset.left':
            case 'offset.right':
                const propertyName = `--${name.replace('.', '-')}`;
                this.style.setProperty(propertyName, newValue || "0px");
                break;
            case 'position':
                const styles = HTMLOlMapControl.positionStyles[newValue || "top-right"];
                ["top", "left", "right", "bottom", "transform"].forEach(style => {
                    const propertyStyle = styles[style];
                    if (propertyStyle) this.style.setProperty(style, propertyStyle);
                    else this.style.removeProperty(style);
                });
                break;
            default:
                console.log(`Callback function for attribute ${name} change not implemented!`);
        }
    }
}
