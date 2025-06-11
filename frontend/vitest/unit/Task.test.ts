import { renderAstroComponent } from "../helpers";
import { getByText } from "@testing-library/dom";
import { describe, expect, test } from 'vitest';
import Task from "../../src/templates/components/task/Partial.astro";

describe("Task components tests", async () => {
	const task = (await import("../../src/assets/dummy/task.json")).default as DjangoAPI.Task;

	test('renders task information correctly', async () => {
		const taskComponent = await renderAstroComponent(Task, {
			props: { task } 
		}) as HTMLElement;
		expect(getByText(taskComponent, task.uuid).textContent).toEqual(task.uuid);
		expect(getByText(taskComponent, task.name).textContent).toEqual(task.name);
		expect(getByText(taskComponent, task.status).textContent).toEqual(task.status);
		expect(getByText(taskComponent, task.workspace_uuid).textContent).toEqual(task.workspace_uuid);
		expect(taskComponent
			.querySelector('[x-data*="createdEpoch"]') as HTMLElement
		).toBeTruthy()
	});

});