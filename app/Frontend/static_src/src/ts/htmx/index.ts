import InnerExtension from "./innerExtension";

export default {
    init() {
        window.htmx = htmx;
        window.htmx.defineExtension('inner', InnerExtension);
    }
}