import * as html from "./html";
import * as styles from "./stylesheetLoader";
import * as media from "./watchMediaBreakpoints";

export default {
    init() {
        window.utils = {};

        Object.assign(
            window.utils, 
            html, 
            styles, 
            media,
        )
    }
}
