function toCamelCase (str) { 
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

const elementIds = [

];

async function init() {
    window.Spruce.store("GLOBALS", Object.freeze(
        elementIds.reduce((enumObj, id) => {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`No element with ${id}`);
                return;
            }
            enumObj[toCamelCase(id)] = element;
            return enumObj;
        }, {})
    ));
}


export default {
    init
}