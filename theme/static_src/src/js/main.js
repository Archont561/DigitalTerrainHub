import "../assets/anonymus.svg";
import "../assets/hero.jpg";
import Alpine from "alpinejs";
import { loadAlpineComponent, loadAlpinePlugin, AlpineDataAttrName, AlpinePluginsAttrName } from "./utils/pluginUtils";
import { toggleLoader } from "./utils/loader";

window.addEventListener("DOMContentLoaded", async () => {
    window.htmx = htmx;
    window.Alpine = Alpine;

    const elements = document.querySelectorAll(`[${AlpineDataAttrName}], [${AlpinePluginsAttrName}]`);
    elements.forEach(el => {
        if (el.hasAttribute(AlpinePluginsAttrName)) {
            const plugins = el.getAttribute(AlpinePluginsAttrName).split(',').map(p => p.trim());
            plugins.forEach(plugin => loadAlpinePlugin);
        }

        if (el.hasAttribute(AlpineDataAttrName)) {
            const dataAttrValue = el.getAttribute(AlpineDataAttrName).trim();
            !dataAttrValue.startsWith("{") ? loadAlpineComponent(xData) : null ;
        }
    });

    Alpine.start();

    document.addEventListener("htmx:configRequest", event => {
        toggleLoader(event, true);
    });
    
    document.addEventListener("htmx:afterRequest", event => {
        toggleLoader(event, false);    
    });
    
    document.addEventListener("htmx:responseError", event => {
        toggleLoader(event, false);
    });
    
    document.addEventListener('htmx:afterSwap', event => {
        const target = event.target;
        switch (target.id) {
            case "login-form":
            case "register-form":
                const errorTemplate = target.querySelector(".non-field-errors");
                const errorDialog = document.querySelector("#error-dialog");
                const errorDialogErrorList = errorDialog.querySelector(".error-list");
                if (!errorTemplate || !errorDialog || !errorDialogErrorList) return;    
    
                errorDialog.dispatchEvent(new CustomEvent("dialog-action", {
                    cancelable: true,
                    bubbles: false,
                    composed: false,
                    detail: {
                        action() {
                            errorDialogErrorList.innerHTML = '';
                            errorDialogErrorList.appendChild(errorTemplate.content.cloneNode(true));
                            errorDialog.showModal();
                        }
                    }
                }));
                break;
            default:
                break;
        }
    
        if (target.hasAttribute('alpine-reinit')) {
            target.removeAttribute('alpine-reinit');
            window.Alpine.initTree(target);
        }
    });
});