import * as html from "./html";
import * as styles from "./stylesheetLoader";
import * as media from "./watchMediaBreakpoints";

export default {
    ...html, 
    ...styles, 
    ...media,
}
