import Anon from "./anonymus.svg?url";
import Astro from "./astro.svg?url";

import AvailablePrests from "./dummy/availablePresets.json";
import GCPoints from "./dummy/gcppoints.json";
import Notification from "./dummy/notification.json";
import Task from "./dummy/task.json";
import User from "./dummy/user.json";
import Workspace from "./dummy/workspace.json";


export const SVGURLs = {
    Anon,
    Astro,
};

export const DummyData = {
    AvailablePrests,
    GCPoints,
    Notification,
    Task,
    User,
    Workspace,
};

import { resolveURLTree } from "@utils";
import { URLs } from "./urls.ts";

export const DjangoURLs = resolveURLTree(URLs.root);