// @vitest-environment jsdom

import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const scriptPath = path.resolve(process.cwd(), "AgentPractice.Web/wwwroot/js/task-items.js");

function buildPageShell() {
    document.body.innerHTML = `
        <form id="task-item-create-form"></form>
        <input id="task-item-title" />
        <button id="task-item-add-button" type="submit"></button>
        <div id="task-item-create-success" class="d-none"></div>
        <div id="task-item-create-error" class="d-none"></div>
        <div id="task-items-loading"></div>
        <div id="task-items-error" class="d-none"></div>
        <div id="task-items-empty" class="d-none"></div>
        <div id="task-items-list" class="d-none"></div>
    `;
}

function createJsonResponse(data) {
    return {
        ok: true,
        status: 200,
        json: async () => data
    };
}

async function waitForRender() {
    await vi.waitFor(() => {
        const rows = document.querySelectorAll("#task-items-list .list-group-item");
        expect(rows.length).toBeGreaterThan(0);
    });
}

describe("task-items inline edit behavior", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        buildPageShell();
    });

    it("only the clicked row enters edit mode", async () => {
        const items = [
            { id: 1, title: "First task", isDone: false },
            { id: 2, title: "Second task", isDone: false }
        ];

        global.fetch = vi.fn(async (url, options = {}) => {
            if (url === "/api/TaskItems" && (!options.method || options.method === "GET")) {
                return createJsonResponse(items);
            }

            throw new Error(`Unexpected fetch: ${url}`);
        });

        const script = fs.readFileSync(scriptPath, "utf8");
        global.eval(script);

        await waitForRender();

        const editButtons = Array.from(document.querySelectorAll("button")).filter(button => button.textContent === "Edit");
        expect(editButtons.length).toBe(2);

        editButtons[0].click();

        await vi.waitFor(() => {
            const editInputs = document.querySelectorAll("input[aria-label^='Edit title for task']");
            expect(editInputs.length).toBe(1);
            expect(editInputs[0].getAttribute("aria-label")).toContain("task 1");
        });

        const secondRow = Array.from(document.querySelectorAll("#task-items-list .list-group-item")).find(row =>
            row.textContent.includes("Task #2")
        );

        expect(secondRow).toBeTruthy();
        expect(secondRow.querySelector("input[aria-label^='Edit title for task']")).toBeNull();
    });

    it("Save sends PUT to /api/TaskItems/{id} and preserves original isDone while changing title", async () => {
        const initialItems = [
            { id: 1, title: "Original title", isDone: true },
            { id: 2, title: "Other task", isDone: false }
        ];

        const updatedItems = [
            { id: 1, title: "Renamed title", isDone: true },
            { id: 2, title: "Other task", isDone: false }
        ];

        let getCount = 0;

        global.fetch = vi.fn(async (url, options = {}) => {
            const method = options.method ?? "GET";

            if (url === "/api/TaskItems" && method === "GET") {
                getCount += 1;
                return createJsonResponse(getCount >= 2 ? updatedItems : initialItems);
            }

            if (url === "/api/TaskItems/1" && method === "PUT") {
                return createJsonResponse({ id: 1, title: "Renamed title", isDone: true });
            }

            throw new Error(`Unexpected fetch: ${method} ${url}`);
        });

        const script = fs.readFileSync(scriptPath, "utf8");
        global.eval(script);

        await waitForRender();

        const firstEdit = Array.from(document.querySelectorAll("button")).find(button => button.textContent === "Edit");
        expect(firstEdit).toBeTruthy();
        firstEdit.click();

        let titleInput;
        await vi.waitFor(() => {
            titleInput = document.querySelector("input[aria-label='Edit title for task 1']");
            expect(titleInput).toBeTruthy();
        });

        titleInput.value = "Renamed title";

        const saveButton = Array.from(document.querySelectorAll("button")).find(button => button.textContent === "Save");
        expect(saveButton).toBeTruthy();
        saveButton.click();

        await vi.waitFor(() => {
            const putCall = global.fetch.mock.calls.find(([url, options]) =>
                url === "/api/TaskItems/1" && options?.method === "PUT"
            );
            expect(putCall).toBeTruthy();
        });

        const putCall = global.fetch.mock.calls.find(([url, options]) =>
            url === "/api/TaskItems/1" && options?.method === "PUT"
        );

        const putPayload = JSON.parse(putCall[1].body);
        expect(putPayload.title).toBe("Renamed title");
        expect(putPayload.isDone).toBe(true);
    });

    it("empty edit title shows validation and does not send PUT", async () => {
        const items = [
            { id: 1, title: "First task", isDone: false }
        ];

        global.fetch = vi.fn(async (url, options = {}) => {
            if (url === "/api/TaskItems" && (!options.method || options.method === "GET")) {
                return createJsonResponse(items);
            }

            throw new Error(`Unexpected fetch: ${url}`);
        });

        const script = fs.readFileSync(scriptPath, "utf8");
        global.eval(script);

        await waitForRender();

        const editButton = Array.from(document.querySelectorAll("button")).find(button => button.textContent === "Edit");
        expect(editButton).toBeTruthy();
        editButton.click();

        let titleInput;
        await vi.waitFor(() => {
            titleInput = document.querySelector("input[aria-label='Edit title for task 1']");
            expect(titleInput).toBeTruthy();
        });

        titleInput.value = "   ";

        const saveButton = Array.from(document.querySelectorAll("button")).find(button => button.textContent === "Save");
        expect(saveButton).toBeTruthy();
        saveButton.click();

        await vi.waitFor(() => {
            const error = document.getElementById("task-items-error");
            expect(error.textContent).toBe("Title is required.");
            expect(error.classList.contains("d-none")).toBe(false);
        });

        const putCalls = global.fetch.mock.calls.filter(([url, options]) =>
            url.includes("/api/TaskItems/") && options?.method === "PUT"
        );

        expect(putCalls.length).toBe(0);
    });

    it("Cancel exits edit mode and does not send PUT", async () => {
        const items = [
            { id: 1, title: "First task", isDone: false },
            { id: 2, title: "Second task", isDone: false }
        ];

        global.fetch = vi.fn(async (url, options = {}) => {
            if (url === "/api/TaskItems" && (!options.method || options.method === "GET")) {
                return createJsonResponse(items);
            }

            throw new Error(`Unexpected fetch: ${url}`);
        });

        const script = fs.readFileSync(scriptPath, "utf8");
        global.eval(script);

        await waitForRender();

        const editButton = Array.from(document.querySelectorAll("button")).find(button => button.textContent === "Edit");
        expect(editButton).toBeTruthy();
        editButton.click();

        await vi.waitFor(() => {
            const editInput = document.querySelector("input[aria-label='Edit title for task 1']");
            expect(editInput).toBeTruthy();
        });

        const cancelButton = Array.from(document.querySelectorAll("button")).find(button => button.textContent === "Cancel");
        expect(cancelButton).toBeTruthy();
        cancelButton.click();

        await vi.waitFor(() => {
            const editInput = document.querySelector("input[aria-label='Edit title for task 1']");
            expect(editInput).toBeNull();
        });

        const putCalls = global.fetch.mock.calls.filter(([url, options]) =>
            url.includes("/api/TaskItems/") && options?.method === "PUT"
        );

        expect(putCalls.length).toBe(0);
    });
});

describe("task-items delete behavior", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        buildPageShell();
    });

    it("canceling confirm does nothing", async () => {
        const items = [{ id: 1, title: "First task", isDone: false }];
        const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

        global.fetch = vi.fn(async (url, options = {}) => {
            if (url === "/api/TaskItems" && (!options.method || options.method === "GET")) {
                return createJsonResponse(items);
            }

            throw new Error(`Unexpected fetch: ${options.method ?? "GET"} ${url}`);
        });

        const script = fs.readFileSync(scriptPath, "utf8");
        global.eval(script);

        await waitForRender();

        const deleteButton = Array.from(document.querySelectorAll("button")).find(button => button.textContent === "Delete");
        expect(deleteButton).toBeTruthy();
        deleteButton.click();

        expect(confirmSpy).toHaveBeenCalledOnce();

        const deleteCalls = global.fetch.mock.calls.filter(([url, options]) =>
            url === "/api/TaskItems/1" && options?.method === "DELETE"
        );

        expect(deleteCalls.length).toBe(0);

        const getCalls = global.fetch.mock.calls.filter(([url, options]) =>
            url === "/api/TaskItems" && (!options?.method || options.method === "GET")
        );

        expect(getCalls.length).toBe(1);
    });

    it("confirming calls DELETE /api/TaskItems/{id}", async () => {
        const items = [{ id: 1, title: "First task", isDone: false }];

        vi.spyOn(window, "confirm").mockReturnValue(true);

        global.fetch = vi.fn(async (url, options = {}) => {
            const method = options.method ?? "GET";

            if (url === "/api/TaskItems" && method === "GET") {
                return createJsonResponse(items);
            }

            if (url === "/api/TaskItems/1" && method === "DELETE") {
                return {
                    ok: true,
                    status: 204,
                    json: async () => null
                };
            }

            throw new Error(`Unexpected fetch: ${method} ${url}`);
        });

        const script = fs.readFileSync(scriptPath, "utf8");
        global.eval(script);

        await waitForRender();

        const deleteButton = Array.from(document.querySelectorAll("button")).find(button => button.textContent === "Delete");
        expect(deleteButton).toBeTruthy();
        deleteButton.click();

        await vi.waitFor(() => {
            const deleteCall = global.fetch.mock.calls.find(([url, options]) =>
                url === "/api/TaskItems/1" && options?.method === "DELETE"
            );
            expect(deleteCall).toBeTruthy();
        });
    });

    it("successful delete reloads task list", async () => {
        const initialItems = [
            { id: 1, title: "First task", isDone: false },
            { id: 2, title: "Second task", isDone: false }
        ];
        const afterDeleteItems = [{ id: 2, title: "Second task", isDone: false }];

        let getCount = 0;

        vi.spyOn(window, "confirm").mockReturnValue(true);

        global.fetch = vi.fn(async (url, options = {}) => {
            const method = options.method ?? "GET";

            if (url === "/api/TaskItems" && method === "GET") {
                getCount += 1;
                return createJsonResponse(getCount >= 2 ? afterDeleteItems : initialItems);
            }

            if (url === "/api/TaskItems/1" && method === "DELETE") {
                return {
                    ok: true,
                    status: 204,
                    json: async () => null
                };
            }

            throw new Error(`Unexpected fetch: ${method} ${url}`);
        });

        const script = fs.readFileSync(scriptPath, "utf8");
        global.eval(script);

        await waitForRender();

        const deleteButton = Array.from(document.querySelectorAll("button")).find(button => button.textContent === "Delete");
        expect(deleteButton).toBeTruthy();
        deleteButton.click();

        await vi.waitFor(() => {
            const rows = document.querySelectorAll("#task-items-list .list-group-item");
            expect(rows.length).toBe(1);
            expect(rows[0].textContent).toContain("Task #2");
        });

        const getCalls = global.fetch.mock.calls.filter(([url, options]) =>
            url === "/api/TaskItems" && (options?.method ?? "GET") === "GET"
        );

        expect(getCalls.length).toBe(2);
    });

    it("failed delete shows error message", async () => {
        const items = [{ id: 1, title: "First task", isDone: false }];

        vi.spyOn(window, "confirm").mockReturnValue(true);

        global.fetch = vi.fn(async (url, options = {}) => {
            const method = options.method ?? "GET";

            if (url === "/api/TaskItems" && method === "GET") {
                return createJsonResponse(items);
            }

            if (url === "/api/TaskItems/1" && method === "DELETE") {
                return {
                    ok: false,
                    status: 500,
                    json: async () => ({})
                };
            }

            throw new Error(`Unexpected fetch: ${method} ${url}`);
        });

        const script = fs.readFileSync(scriptPath, "utf8");
        global.eval(script);

        await waitForRender();

        const deleteButton = Array.from(document.querySelectorAll("button")).find(button => button.textContent === "Delete");
        expect(deleteButton).toBeTruthy();
        deleteButton.click();

        await vi.waitFor(() => {
            const error = document.getElementById("task-items-error");
            expect(error.textContent).toBe("Unable to delete task item.");
            expect(error.classList.contains("d-none")).toBe(false);
        });
    });

    it("row in edit mode does not show a Delete button", async () => {
        const items = [
            { id: 1, title: "First task", isDone: false },
            { id: 2, title: "Second task", isDone: false }
        ];

        global.fetch = vi.fn(async (url, options = {}) => {
            if (url === "/api/TaskItems" && (!options.method || options.method === "GET")) {
                return createJsonResponse(items);
            }

            throw new Error(`Unexpected fetch: ${options.method ?? "GET"} ${url}`);
        });

        const script = fs.readFileSync(scriptPath, "utf8");
        global.eval(script);

        await waitForRender();

        const firstEditButton = Array.from(document.querySelectorAll("button")).find(button => button.textContent === "Edit");
        expect(firstEditButton).toBeTruthy();
        firstEditButton.click();

        await vi.waitFor(() => {
            const editInput = document.querySelector("input[aria-label='Edit title for task 1']");
            expect(editInput).toBeTruthy();
        });

        const rows = Array.from(document.querySelectorAll("#task-items-list .list-group-item"));
        const editingRow = rows.find(row => row.textContent.includes("Task #1"));
        const nonEditingRow = rows.find(row => row.textContent.includes("Task #2"));

        expect(editingRow).toBeTruthy();
        expect(nonEditingRow).toBeTruthy();

        const editingRowButtons = Array.from(editingRow.querySelectorAll("button")).map(button => button.textContent);
        const nonEditingRowButtons = Array.from(nonEditingRow.querySelectorAll("button")).map(button => button.textContent);

        expect(editingRowButtons).not.toContain("Delete");
        expect(nonEditingRowButtons).toContain("Delete");
    });
});
