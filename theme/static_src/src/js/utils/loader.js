export function toggleLoader(event, show) {
    const loader = document.querySelector("#global-loader");
    if (!loader) return;  
    
    let action;
    if (!show) action = loader.close;
    
    if (shouldShowLoader(event.target)) {
        action = shouldShowModal(event.target) ? loader.showModal : loader.show
    }
    loader.dispatchEvent(new CustomEvent("dialog-action", {
        cancelable: true,
        bubbles: false,
        composed: false,
        detail: { action: action.bind(loader) }
    }))
}

function shouldShowLoader(target) {
    return target && target.hasAttribute("data-show-loader");
}

function shouldShowModal(target) {
    return target.getAttribute("data-show-loader") === "modal";
}
