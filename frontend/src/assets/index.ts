import Anon from "./anonymus.svg?url";
import Astro from "./astro.svg?url";
import AvailablePrests from "./dummy/availablePresets.json?url";
import GCPoints from "./dummy/gcppoints.json?url";
import Notification from "./dummy/notification.json?url";
import Task from "./dummy/task.json?url";
import User from "./dummy/user.json?url";
import Workspace from "./dummy/workspace.json?url";


export const SVGURLs = {
    Anon,
    Astro,
};

export const DummyDataURLs = {
    AvailablePrests,
    GCPoints,
    Notification,
    Task,
    User,
    Workspace,
};

import { resolveURLTree } from "@utils";
import { URLs } from "./urls.ts";

export const DjangoURLs = resolveURLTree(URLs).root;