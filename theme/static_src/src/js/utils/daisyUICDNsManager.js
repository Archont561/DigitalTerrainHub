import daisyUICDNs from "./daisyUICDNs";
import { loadStylesheet } from "./stylesheetLoader";

const CDNRoot = "https://cdn.jsdelivr.net/combine/";
const CDNPrefix = "npm/daisyui@5/";
const CDNSuffix = ".css";

function loadCDNs(...names) {
    const urlParts = [];
    names.forEach(name => {
        const groupName = Object.keys(daisyUICDNs).find(key => daisyUICDNs[key].includes(name));
        if (!groupName) return;
        urlParts.push(`${CDNPrefix}${groupName}/${name}${CDNSuffix}`);
    });
    const fullURL = `${CDNRoot}${urlParts.join(",")}`
    loadStylesheet(fullURL);
}


function init() {
    const CDNsToLoad = new Set();
    const elements = document.querySelectorAll("[daisyui]");
    elements.forEach(el => {

        const CDNs = el.getAttribute("daisyui").replaceAll(" ", "").split(",");
        CDNs.forEach(CDN => { CDNsToLoad.add(CDN); });
    });
    loadCDNs(...CDNsToLoad);
}

export default {
    init
}