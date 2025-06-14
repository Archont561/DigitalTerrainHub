import Base from "./Base.astro";
import Melt from "./Melt.astro";
import Clamp from "./Clamp.astro";
import Flex from "./Flex/Self.astro";
import Grid from "./Grid/Self.astro";
import GreatestGrid from "./Grid/Variants/Greatest.astro";

import FlexItem from "./Flex/Item.astro";
import GridCell from "./Grid/Cell.astro";
import GridFlexCell from "./Grid/Variants/FlexCell.astro";

const Partials = {
    FlexItem,
    GridCell,
    GridFlexCell,
}

export default {
    Base,
    Melt,
    Clamp,
    Grid,
    Flex,
    GreatestGrid,
    Partials,
}