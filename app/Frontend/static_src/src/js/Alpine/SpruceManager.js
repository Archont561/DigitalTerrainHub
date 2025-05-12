function toCamelCase (str) { 
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

async function init() {
    window.Spruce.store("HTML", 
        Array.from(document.querySelectorAll("[id]"))
        .filter(el => el.id.trim() !== '')
        .reduce((enumObj, el) => {
            enumObj[toCamelCase(el.id)] = el;
            return enumObj;
        }, {})
    );
}


export default {
    init
}