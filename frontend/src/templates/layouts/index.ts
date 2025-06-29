import Base from "./Base.astro";
import Melt from "./Melt.astro";
import Clamp from "./Clamp.astro";
import Drawer from "./Drawer.astro";
import FullScreen from "./FullScreen.astro";

import Flex from "./Flex/Self.astro";
import Grid from "./Grid/Self.astro";
import GreatestGrid from "./Grid/Variants/Greatest.astro";
import Subgrid from "./Grid/Variants/Subgrid.astro";

import FlexItem from "./Flex/Item.astro";
import GridCell from "./Grid/Cell.astro";
import GridFlexCell from "./Grid/Variants/FlexCell.astro";

const Partials = {
    FlexItem,
    GridCell,
    GridFlexCell,
    Subgrid,
}
export default {
    Base,
    Melt,
    Clamp,
    Drawer,
    Grid,
    Flex,
    GreatestGrid,
    FullScreen,
    Partials,
}