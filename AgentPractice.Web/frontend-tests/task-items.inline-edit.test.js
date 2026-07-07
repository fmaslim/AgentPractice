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
        <div id="task-items-filter" role="group" aria-label="Filter task items">
            <button id="task-items-filter-all" type="button" data-task-filter="all" aria-pressed="true"></button>
            <button id="task-items-filter-open" type="button" data-task-filter="open" aria-pressed="false"></button>
            <button id="task-items-filter-done" type="button" data-task-filter="done" aria-pressed="false"></button>
        </div>
        <input id="task-items-search" type="search" />
        <button id="task-items-clear-search" type="button" class="d-none">Clear Search</button>
        <div id="task-items-loading"></div>
        <div id="task-items-error" class="d-none"></div>
        <div id="task-items-count" class="d-none"></div>
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

    it("filters all, open, and done items without refetching", async () => {
        const items = [
            { id: 1, title: "Open task", isDone: false },
            { id: 2, title: "Done task", isDone: true },
            { id: 3, title: "Second open task", isDone: false }
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

        const allButton = document.getElementById("task-items-filter-all");
        const openButton = document.getElementById("task-items-filter-open");
        const doneButton = document.getElementById("task-items-filter-done");

        expect(allButton.getAttribute("aria-pressed")).toBe("true");
        expect(document.getElementById("task-items-list").textContent).toContain("Open task");
        expect(document.getElementById("task-items-list").textContent).toContain("Done task");

        openButton.click();

        await vi.waitFor(() => {
            const rows = document.querySelectorAll("#task-items-list .list-group-item");
            expect(rows.length).toBe(2);
            expect(document.getElementById("task-items-list").textContent).toContain("Open task");
            expect(document.getElementById("task-items-list").textContent).not.toContain("Done task");
            expect(openButton.getAttribute("aria-pressed")).toBe("true");
        });

        doneButton.click();

        await vi.waitFor(() => {
            const rows = document.querySelectorAll("#task-items-list .list-group-item");
            expect(rows.length).toBe(1);
            expect(document.getElementById("task-items-list").textContent).toContain("Done task");
            expect(document.getElementById("task-items-list").textContent).not.toContain("Second open task");
            expect(doneButton.getAttribute("aria-pressed")).toBe("true");
        });

        allButton.click();

        await vi.waitFor(() => {
            const rows = document.querySelectorAll("#task-items-list .list-group-item");
            expect(rows.length).toBe(3);
            expect(allButton.getAttribute("aria-pressed")).toBe("true");
        });

        const getCalls = global.fetch.mock.calls.filter(([url, options]) =>
            url === "/api/TaskItems" && (!options?.method || options.method === "GET")
        );

        expect(getCalls.length).toBe(1);
    });

    it("applies title search with status filter without refetching", async () => {
        const items = [
            { id: 1, title: "Buy milk", isDone: false },
            { id: 2, title: "Pay bills", isDone: true },
            { id: 3, title: "Milk delivery", isDone: true }
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

        const searchInput = document.getElementById("task-items-search");
        const doneButton = document.getElementById("task-items-filter-done");

        searchInput.value = "milk";
        searchInput.dispatchEvent(new Event("input"));

        await vi.waitFor(() => {
            const rows = document.querySelectorAll("#task-items-list .list-group-item");
            expect(rows.length).toBe(2);
            expect(document.getElementById("task-items-list").textContent).toContain("Buy milk");
            expect(document.getElementById("task-items-list").textContent).toContain("Milk delivery");
            expect(document.getElementById("task-items-list").textContent).not.toContain("Pay bills");
        });

        doneButton.click();

        await vi.waitFor(() => {
            const rows = document.querySelectorAll("#task-items-list .list-group-item");
            expect(rows.length).toBe(1);
            expect(document.getElementById("task-items-list").textContent).toContain("Milk delivery");
            expect(document.getElementById("task-items-list").textContent).not.toContain("Buy milk");
            expect(doneButton.getAttribute("aria-pressed")).toBe("true");
        });

        const getCalls = global.fetch.mock.calls.filter(([url, options]) =>
            url === "/api/TaskItems" && (!options?.method || options.method === "GET")
        );

        expect(getCalls.length).toBe(1);
    });

    it("shows clear search button only with text and clears immediately while keeping selected status filter", async () => {
        const items = [
            { id: 1, title: "Buy milk", isDone: false },
            { id: 2, title: "Milk delivery", isDone: true },
            { id: 3, title: "Pay bills", isDone: true }
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

        const doneButton = document.getElementById("task-items-filter-done");
        const searchInput = document.getElementById("task-items-search");
        const clearButton = document.getElementById("task-items-clear-search");

        expect(clearButton.classList.contains("d-none")).toBe(true);

        doneButton.click();

        await vi.waitFor(() => {
            const rows = document.querySelectorAll("#task-items-list .list-group-item");
            expect(rows.length).toBe(2);
            expect(doneButton.getAttribute("aria-pressed")).toBe("true");
        });

        searchInput.value = "milk";
        searchInput.dispatchEvent(new Event("input"));

        await vi.waitFor(() => {
            const rows = document.querySelectorAll("#task-items-list .list-group-item");
            expect(rows.length).toBe(1);
            expect(document.getElementById("task-items-list").textContent).toContain("Milk delivery");
            expect(clearButton.classList.contains("d-none")).toBe(false);
        });

        clearButton.click();

        await vi.waitFor(() => {
            const rows = document.querySelectorAll("#task-items-list .list-group-item");
            expect(rows.length).toBe(2);
            expect(searchInput.value).toBe("");
            expect(doneButton.getAttribute("aria-pressed")).toBe("true");
            expect(document.getElementById("task-items-list").textContent).toContain("Milk delivery");
            expect(document.getElementById("task-items-list").textContent).toContain("Pay bills");
            expect(clearButton.classList.contains("d-none")).toBe(true);
        });

        const getCalls = global.fetch.mock.calls.filter(([url, options]) =>
            url === "/api/TaskItems" && (!options?.method || options.method === "GET")
        );

        expect(getCalls.length).toBe(1);
    });

    it("updates task count for all, filtered, searched, and empty results", async () => {
        const items = [
            { id: 1, title: "Open alpha", isDone: false },
            { id: 2, title: "Done beta", isDone: true },
            { id: 3, title: "Open gamma", isDone: false }
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

        const count = document.getElementById("task-items-count");
        const doneButton = document.getElementById("task-items-filter-done");
        const openButton = document.getElementById("task-items-filter-open");
        const searchInput = document.getElementById("task-items-search");

        await vi.waitFor(() => {
            expect(count.textContent).toBe("Showing 3 tasks");
            expect(count.classList.contains("d-none")).toBe(false);
        });

        doneButton.click();

        await vi.waitFor(() => {
            expect(count.textContent).toBe("Showing 1 task");
        });

        openButton.click();

        await vi.waitFor(() => {
            expect(count.textContent).toBe("Showing 2 tasks");
        });

        searchInput.value = "zzz";
        searchInput.dispatchEvent(new Event("input"));

        await vi.waitFor(() => {
            expect(count.textContent).toBe("Showing 0 tasks");
        });
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

describe("task-items filter persistence", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        buildPageShell();
    });

    it("Open filter remains active after create reloads the list", async () => {
        const initialItems = [
            { id: 1, title: "Open task", isDone: false },
            { id: 2, title: "Done task", isDone: true }
        ];
        const afterCreateItems = [
            { id: 1, title: "Open task", isDone: false },
            { id: 2, title: "Done task", isDone: true },
            { id: 3, title: "New open task", isDone: false }
        ];

        let getCount = 0;

        global.fetch = vi.fn(async (url, options = {}) => {
            const method = options.method ?? "GET";

            if (url === "/api/TaskItems" && method === "GET") {
                getCount += 1;
                return createJsonResponse(getCount >= 2 ? afterCreateItems : initialItems);
            }

            if (url === "/api/TaskItems" && method === "POST") {
                return createJsonResponse({ id: 3, title: "New open task", isDone: false });
            }

            throw new Error(`Unexpected fetch: ${method} ${url}`);
        });

        const script = fs.readFileSync(scriptPath, "utf8");
        global.eval(script);

        await waitForRender();

        const openButton = document.getElementById("task-items-filter-open");
        openButton.click();

        await vi.waitFor(() => {
            const listText = document.getElementById("task-items-list").textContent;
            expect(openButton.getAttribute("aria-pressed")).toBe("true");
            expect(listText).toContain("Open task");
            expect(listText).not.toContain("Done task");
        });

        const titleInput = document.getElementById("task-item-title");
        titleInput.value = "New open task";
        const createForm = document.getElementById("task-item-create-form");
        createForm.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

        await vi.waitFor(() => {
            const rows = document.querySelectorAll("#task-items-list .list-group-item");
            const listText = document.getElementById("task-items-list").textContent;
            expect(rows.length).toBe(2);
            expect(openButton.getAttribute("aria-pressed")).toBe("true");
            expect(listText).toContain("Open task");
            expect(listText).toContain("New open task");
            expect(listText).not.toContain("Done task");
        });
    });

    it("Done filter remains active after edit reloads the list", async () => {
        const initialItems = [
            { id: 1, title: "Open task", isDone: false },
            { id: 2, title: "Done task", isDone: true }
        ];
        const afterSaveItems = [
            { id: 1, title: "Open task", isDone: false },
            { id: 2, title: "Done task renamed", isDone: true }
        ];

        let getCount = 0;

        global.fetch = vi.fn(async (url, options = {}) => {
            const method = options.method ?? "GET";

            if (url === "/api/TaskItems" && method === "GET") {
                getCount += 1;
                return createJsonResponse(getCount >= 3 ? afterSaveItems : initialItems);
            }

            if (url === "/api/TaskItems/2" && method === "PUT") {
                return createJsonResponse({ id: 2, title: "Done task renamed", isDone: true });
            }

            throw new Error(`Unexpected fetch: ${method} ${url}`);
        });

        const script = fs.readFileSync(scriptPath, "utf8");
        global.eval(script);

        await waitForRender();

        const doneButton = document.getElementById("task-items-filter-done");
        doneButton.click();

        await vi.waitFor(() => {
            const listText = document.getElementById("task-items-list").textContent;
            expect(doneButton.getAttribute("aria-pressed")).toBe("true");
            expect(listText).toContain("Done task");
            expect(listText).not.toContain("Open task");
        });

        const editButton = Array.from(document.querySelectorAll("button")).find(button => button.textContent === "Edit");
        expect(editButton).toBeTruthy();
        editButton.click();

        let editInput;
        await vi.waitFor(() => {
            editInput = document.querySelector("input[aria-label='Edit title for task 2']");
            expect(editInput).toBeTruthy();
        });

        editInput.value = "Done task renamed";

        const saveButton = Array.from(document.querySelectorAll("button")).find(button => button.textContent === "Save");
        expect(saveButton).toBeTruthy();
        saveButton.click();

        await vi.waitFor(() => {
            const rows = document.querySelectorAll("#task-items-list .list-group-item");
            const listText = document.getElementById("task-items-list").textContent;
            expect(rows.length).toBe(1);
            expect(doneButton.getAttribute("aria-pressed")).toBe("true");
            expect(listText).toContain("Done task renamed");
            expect(listText).not.toContain("Open task");
        });
    });

    it("Done filter remains active after delete reloads the list", async () => {
        const initialItems = [
            { id: 1, title: "Open task", isDone: false },
            { id: 2, title: "Done task", isDone: true },
            { id: 3, title: "Second done task", isDone: true }
        ];
        const afterDeleteItems = [
            { id: 1, title: "Open task", isDone: false },
            { id: 3, title: "Second done task", isDone: true }
        ];

        let getCount = 0;

        vi.spyOn(window, "confirm").mockReturnValue(true);

        global.fetch = vi.fn(async (url, options = {}) => {
            const method = options.method ?? "GET";

            if (url === "/api/TaskItems" && method === "GET") {
                getCount += 1;
                return createJsonResponse(getCount >= 2 ? afterDeleteItems : initialItems);
            }

            if (url === "/api/TaskItems/2" && method === "DELETE") {
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

        const doneButton = document.getElementById("task-items-filter-done");
        doneButton.click();

        await vi.waitFor(() => {
            const rows = document.querySelectorAll("#task-items-list .list-group-item");
            const listText = document.getElementById("task-items-list").textContent;
            expect(rows.length).toBe(2);
            expect(doneButton.getAttribute("aria-pressed")).toBe("true");
            expect(listText).toContain("Done task");
            expect(listText).toContain("Second done task");
            expect(listText).not.toContain("Open task");
        });

        const deleteButton = Array.from(document.querySelectorAll("button")).find(button => button.textContent === "Delete");
        expect(deleteButton).toBeTruthy();
        deleteButton.click();

        await vi.waitFor(() => {
            const rows = document.querySelectorAll("#task-items-list .list-group-item");
            const listText = document.getElementById("task-items-list").textContent;
            expect(rows.length).toBe(1);
            expect(doneButton.getAttribute("aria-pressed")).toBe("true");
            expect(listText).toContain("Second done task");
            expect(listText).not.toContain("Open task");
            expect(listText).not.toContain("Done task");
        });
    });

    it("Open filter hides an item after complete reloads the list", async () => {
        const initialItems = [{ id: 1, title: "Open task", isDone: false }];
        const afterCompleteItems = [{ id: 1, title: "Open task", isDone: true }];

        let getCount = 0;

        global.fetch = vi.fn(async (url, options = {}) => {
            const method = options.method ?? "GET";

            if (url === "/api/TaskItems" && method === "GET") {
                getCount += 1;
                return createJsonResponse(getCount >= 2 ? afterCompleteItems : initialItems);
            }

            if (url === "/api/TaskItems/1/complete" && method === "PATCH") {
                return createJsonResponse({ id: 1, title: "Open task", isDone: true });
            }

            throw new Error(`Unexpected fetch: ${method} ${url}`);
        });

        const script = fs.readFileSync(scriptPath, "utf8");
        global.eval(script);

        await waitForRender();

        const openButton = document.getElementById("task-items-filter-open");
        openButton.click();

        await vi.waitFor(() => {
            const rows = document.querySelectorAll("#task-items-list .list-group-item");
            expect(rows.length).toBe(1);
            expect(openButton.getAttribute("aria-pressed")).toBe("true");
        });

        const completeButton = Array.from(document.querySelectorAll("button")).find(button => button.textContent === "Mark Complete");
        expect(completeButton).toBeTruthy();
        completeButton.click();

        await vi.waitFor(() => {
            const empty = document.getElementById("task-items-empty");
            const rows = document.querySelectorAll("#task-items-list .list-group-item");
            expect(openButton.getAttribute("aria-pressed")).toBe("true");
            expect(empty.classList.contains("d-none")).toBe(false);
            expect(rows.length).toBe(0);
        });
    });
});
