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
    let editingTaskItemId = null;

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

    function buildEditButton() {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-sm btn-outline-primary";
        button.textContent = "Edit";
        return button;
    }

    function buildSaveButton() {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-sm btn-primary";
        button.textContent = "Save";
        return button;
    }

    function buildCancelButton() {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-sm btn-outline-secondary";
        button.textContent = "Cancel";
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

    async function updateTaskItem(itemId, title, isDone) {
        const response = await fetch(`/api/TaskItems/${itemId}`, {
            method: "PUT",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title: title, isDone: isDone })
        });

        if (!response.ok) {
            throw new Error("Update failed with status " + response.status + ".");
        }
    }

    function renderList(items) {
        for (const item of items) {
            const row = document.createElement("div");
            row.className = "list-group-item d-flex justify-content-between align-items-start py-3";

            const content = document.createElement("div");
            content.className = "me-3";

            const isEditingRow = editingTaskItemId === item.id;

            let editTitleInput = null;

            if (isEditingRow) {
                editTitleInput = document.createElement("input");
                editTitleInput.type = "text";
                editTitleInput.className = "form-control form-control-sm";
                editTitleInput.value = item.title;
                editTitleInput.maxLength = 200;
                editTitleInput.autocomplete = "off";
                editTitleInput.setAttribute("aria-label", "Edit title for task " + item.id);
                content.appendChild(editTitleInput);
            } else {
                const title = document.createElement("h2");
                title.className = "h6 mb-1";
                title.textContent = item.title;
                content.appendChild(title);
            }

            const meta = document.createElement("p");
            meta.className = "mb-0 text-muted small";
            meta.textContent = "Task #" + item.id;

            content.appendChild(meta);

            const actions = document.createElement("div");
            actions.className = "d-flex align-items-center gap-2";
            actions.appendChild(buildStatusBadge(Boolean(item.isDone)));

            if (isEditingRow && editTitleInput) {
                const saveButton = buildSaveButton();
                const cancelButton = buildCancelButton();

                saveButton.addEventListener("click", async function () {
                    const nextTitle = editTitleInput.value.trim();

                    if (!nextTitle) {
                        errorEl.textContent = "Title is required.";
                        setVisible(errorEl, true);
                        return;
                    }

                    setVisible(errorEl, false);
                    errorEl.textContent = "";
                    saveButton.disabled = true;
                    cancelButton.disabled = true;
                    saveButton.textContent = "Saving...";

                    try {
                        await updateTaskItem(item.id, nextTitle, Boolean(item.isDone));
                        editingTaskItemId = null;
                        await loadTaskItems();
                    } catch (error) {
                        saveButton.disabled = false;
                        cancelButton.disabled = false;
                        saveButton.textContent = "Save";
                        errorEl.textContent = "Unable to save task item.";
                        setVisible(errorEl, true);
                    }
                });

                cancelButton.addEventListener("click", async function () {
                    editingTaskItemId = null;

                    try {
                        await loadTaskItems();
                    } catch (error) {
                        errorEl.textContent = "Unable to refresh task items. Please reload.";
                        setVisible(errorEl, true);
                    }
                });

                actions.appendChild(saveButton);
                actions.appendChild(cancelButton);
            } else if (!item.isDone) {
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

            if (!isEditingRow) {
                const editButton = buildEditButton();
                editButton.disabled = editingTaskItemId !== null;

                editButton.addEventListener("click", async function () {
                    if (editingTaskItemId !== null) {
                        return;
                    }

                    editingTaskItemId = item.id;

                    try {
                        await loadTaskItems();
                    } catch (error) {
                        editingTaskItemId = null;
                        errorEl.textContent = "Unable to start editing task item.";
                        setVisible(errorEl, true);
                    }
                });

                actions.appendChild(editButton);
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
