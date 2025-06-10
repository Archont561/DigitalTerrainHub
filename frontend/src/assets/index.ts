import Anon from "./anonymus.svg?url";
import Astro from "./astro.svg?url";
import Favicon from "./favicon.svg?url";

import AvailablePrests from "./dummy/availablePresets.json";
import GCPoints from "./dummy/gcppoints.json";
import Notification from "./dummy/notification.json";
import Task from "./dummy/task.json";
import User from "./dummy/user.json";
import Workspace from "./dummy/workspace.json";

import Global from "./styles/global.css?url";
import OpenLayers from "./styles/openlayers.css?url";
import Uppy from "./styles/uppy.css?url";

export const SVGURLs = {
    Anon,
    Astro,
    Favicon,
};

export const DummyData = {
    AvailablePrests,
    GCPoints,
    Notification,
    Task,
    User,
    Workspace,
};

export const StylesURLs = {
    Global,
    OpenLayers,
    Uppy,
}

export { DjangoURLs } from "./urls";
