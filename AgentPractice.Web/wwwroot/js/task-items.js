(function () {
    const createFormEl = document.getElementById("task-item-create-form");
    const titleInputEl = document.getElementById("task-item-title");
    const addButtonEl = document.getElementById("task-item-add-button");
    const createSuccessEl = document.getElementById("task-item-create-success");
    const createErrorEl = document.getElementById("task-item-create-error");
    const loadingEl = document.getElementById("task-items-loading");
    const errorEl = document.getElementById("task-items-error");
    const emptyEl = document.getElementById("task-items-empty");
    const listEl = document.getElementById("task-items-list");

    if (!createFormEl || !titleInputEl || !addButtonEl || !createSuccessEl || !createErrorEl || !loadingEl || !errorEl || !emptyEl || !listEl) {
        return;
    }

    let isSubmittingCreate = false;

    function setVisible(element, visible) {
        element.classList.toggle("d-none", !visible);
    }

    function clearStates() {
        setVisible(loadingEl, false);
        setVisible(errorEl, false);
        setVisible(emptyEl, false);
        setVisible(listEl, false);
        errorEl.textContent = "";
        listEl.innerHTML = "";
    }

    function clearCreateFeedback() {
        createSuccessEl.textContent = "";
        createErrorEl.textContent = "";
        setVisible(createSuccessEl, false);
        setVisible(createErrorEl, false);
    }

    function setCreateSubmitting(isSubmitting) {
        addButtonEl.disabled = isSubmitting;
        addButtonEl.textContent = isSubmitting ? "Adding..." : "Add";
    }

    function buildStatusBadge(isDone) {
        const badge = document.createElement("span");
        badge.className = isDone ? "badge text-bg-success" : "badge text-bg-secondary";
        badge.textContent = isDone ? "Done" : "Open";
        return badge;
    }

    function buildCompleteButton() {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-sm btn-outline-success";
        button.textContent = "Mark Complete";
        return button;
    }

    async function completeTaskItem(itemId) {
        const response = await fetch(`/api/TaskItems/${itemId}/complete`, {
            method: "PATCH",
            headers: {
                Accept: "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Complete failed with status " + response.status + ".");
        }
    }

    function renderList(items) {
        for (const item of items) {
            const row = document.createElement("div");
            row.className = "list-group-item d-flex justify-content-between align-items-start py-3";

            const content = document.createElement("div");
            content.className = "me-3";

            const title = document.createElement("h2");
            title.className = "h6 mb-1";
            title.textContent = item.title;

            const meta = document.createElement("p");
            meta.className = "mb-0 text-muted small";
            meta.textContent = "Task #" + item.id;

            content.appendChild(title);
            content.appendChild(meta);

            const actions = document.createElement("div");
            actions.className = "d-flex align-items-center gap-2";
            actions.appendChild(buildStatusBadge(Boolean(item.isDone)));

            if (!item.isDone) {
                const completeButton = buildCompleteButton();

                completeButton.addEventListener("click", async function () {
                    const originalLabel = completeButton.textContent;

                    setVisible(errorEl, false);
                    errorEl.textContent = "";
                    completeButton.disabled = true;
                    completeButton.textContent = "Completing...";

                    try {
                        await completeTaskItem(item.id);
                    } catch (error) {
                        completeButton.disabled = false;
                        completeButton.textContent = originalLabel;
                        errorEl.textContent = "Unable to complete task item.";
                        setVisible(errorEl, true);
                        return;
                    }

                    try {
                        await loadTaskItems();
                    } catch (error) {
                        completeButton.disabled = false;
                        completeButton.textContent = originalLabel;
                        errorEl.textContent = "Task completed, but the list could not be refreshed. Please reload.";
                        setVisible(errorEl, true);
                    }
                });

                actions.appendChild(completeButton);
            }

            row.appendChild(content);
            row.appendChild(actions);
            listEl.appendChild(row);
        }
    }

    async function loadTaskItems() {
        try {
            clearStates();
            setVisible(loadingEl, true);

            const response = await fetch("/api/TaskItems", {
                method: "GET",
                headers: {
                    Accept: "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Request failed with status " + response.status + ".");
            }

            const items = await response.json();

            clearStates();

            if (!Array.isArray(items) || items.length === 0) {
                setVisible(emptyEl, true);
                return;
            }

            renderList(items);
            setVisible(listEl, true);
        } catch (error) {
            clearStates();
            errorEl.textContent = "Unable to load task items. " + (error instanceof Error ? error.message : "Please try again.");
            setVisible(errorEl, true);
        }
    }

    async function createTaskItem(title) {
        const response = await fetch("/api/TaskItems", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title: title })
        });

        if (!response.ok) {
            throw new Error("Create failed with status " + response.status + ".");
        }
    }

    createFormEl.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (isSubmittingCreate) {
            return;
        }

        clearCreateFeedback();

        const title = titleInputEl.value.trim();

        if (!title) {
            createErrorEl.textContent = "Title is required.";
            setVisible(createErrorEl, true);
            return;
        }

        try {
            isSubmittingCreate = true;
            setCreateSubmitting(true);
            await createTaskItem(title);
            await loadTaskItems();

            titleInputEl.value = "";
            createSuccessEl.textContent = "Task item created.";
            setVisible(createSuccessEl, true);
        } catch (error) {
            createErrorEl.textContent = "Unable to create task item. " + (error instanceof Error ? error.message : "Please try again.");
            setVisible(createErrorEl, true);
        } finally {
            isSubmittingCreate = false;
            setCreateSubmitting(false);
        }
    });

    loadTaskItems();
})();
