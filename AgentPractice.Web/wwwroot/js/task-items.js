(function () {
    const createFormEl = document.getElementById("task-item-create-form");
    const titleInputEl = document.getElementById("task-item-title");
    const createPrioritySelectEl = document.getElementById("task-item-priority");
    const addButtonEl = document.getElementById("task-item-add-button");
    const createSuccessEl = document.getElementById("task-item-create-success");
    const createErrorEl = document.getElementById("task-item-create-error");
    const loadingEl = document.getElementById("task-items-loading");
    const errorEl = document.getElementById("task-items-error");
    const countEl = document.getElementById("task-items-count");
    const emptyEl = document.getElementById("task-items-empty");
    const listEl = document.getElementById("task-items-list");
    const filterButtonEls = Array.from(document.querySelectorAll("[data-task-filter]"));
    const searchInputEl = document.getElementById("task-items-search");
    const clearSearchButtonEl = document.getElementById("task-items-clear-search");
    const sortSelectEl = document.getElementById("task-items-sort");
    const clearCompletedButtonEl = document.getElementById("task-items-clear-completed");

    if (!createFormEl || !titleInputEl || !createPrioritySelectEl || !addButtonEl || !createSuccessEl || !createErrorEl || !loadingEl || !errorEl || !countEl || !emptyEl || !listEl || !searchInputEl || !clearSearchButtonEl || !sortSelectEl || !clearCompletedButtonEl) {
        return;
    }

    let isSubmittingCreate = false;
    let editingTaskItemId = null;
    let selectedFilter = "all";
    let selectedSort = "newest";
    let searchTerm = "";
    let taskItems = [];

    const emptyStateNoTasksMessage = "No tasks yet. Add your first task to get started.";
    const emptyStateNoResultsMessage = "No tasks found.";

    function setVisible(element, visible) {
        element.classList.toggle("d-none", !visible);
    }

    function clearStates() {
        setVisible(loadingEl, false);
        setVisible(errorEl, false);
        setVisible(countEl, false);
        setVisible(emptyEl, false);
        setVisible(listEl, false);
        errorEl.textContent = "";
        countEl.textContent = "";
        listEl.innerHTML = "";
    }

    function clearListState() {
        setVisible(emptyEl, false);
        setVisible(listEl, false);
        emptyEl.textContent = "";
        listEl.innerHTML = "";
    }

    function setTaskCount(count) {
        const label = count === 1 ? "task" : "tasks";
        countEl.textContent = `Showing ${count} ${label}`;
        setVisible(countEl, true);
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

    function setFilterButtonState() {
        for (const button of filterButtonEls) {
            const isActive = button.dataset.taskFilter === selectedFilter;
            button.classList.toggle("active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        }
    }

    function setSearchButtonState() {
        const hasSearchText = searchTerm.trim().length > 0;
        setVisible(clearSearchButtonEl, hasSearchText);
    }

    function setSortState() {
        sortSelectEl.value = selectedSort;
    }

    function setClearCompletedButtonState(items) {
        const hasCompletedItems = items.some(item => Boolean(item.isDone));
        clearCompletedButtonEl.disabled = !hasCompletedItems;
    }

    function getVisibleItems(items) {
        const normalizedSearchTerm = searchTerm.trim().toLowerCase();

        const statusFilteredItems = items.filter(item => {
            if (selectedFilter === "open") {
                return !item.isDone;
            }

            if (selectedFilter === "done") {
                return Boolean(item.isDone);
            }

            return true;
        });

        const searchFilteredItems = normalizedSearchTerm
            ? statusFilteredItems.filter(item =>
                String(item.title ?? "").toLowerCase().includes(normalizedSearchTerm)
            )
            : statusFilteredItems;

        const sortedItems = searchFilteredItems.slice();
        sortedItems.sort((a, b) => {
            if (selectedSort === "oldest") {
                return Number(a.id) - Number(b.id);
            }

            return Number(b.id) - Number(a.id);
        });

        return sortedItems;
    }

    function handleSearchInput() {
        searchTerm = searchInputEl.value || "";
        renderTaskItems();
    }

    function clearSearch() {
        if (!searchInputEl.value && !searchTerm) {
            return;
        }

        searchInputEl.value = "";
        searchTerm = "";
        renderTaskItems();
        searchInputEl.focus();
    }

    async function clearCompletedTaskItems() {
        const completedItems = taskItems.filter(item => Boolean(item.isDone));

        if (completedItems.length === 0) {
            return;
        }

        const shouldClear = window.confirm("Clear all completed tasks?");

        if (!shouldClear) {
            return;
        }

        clearCompletedButtonEl.disabled = true;
        clearCompletedButtonEl.textContent = "Clearing...";

        try {
            for (const item of completedItems) {
                await deleteTaskItem(item.id);
            }

            await loadTaskItems();
        } catch (error) {
            errorEl.textContent = "Unable to clear completed task items.";
            setVisible(errorEl, true);
            setClearCompletedButtonState(taskItems);
        } finally {
            clearCompletedButtonEl.textContent = "Clear completed";
        }
    }

    function buildStatusBadge(isDone) {
        const badge = document.createElement("span");
        badge.className = isDone ? "badge text-bg-success" : "badge text-bg-secondary";
        badge.textContent = isDone ? "Done" : "Open";
        return badge;
    }

    function normalizePriority(priority) {
        const value = String(priority ?? "").trim().toLowerCase();

        if (value === "low") {
            return "Low";
        }

        if (value === "high") {
            return "High";
        }

        return "Medium";
    }

    function buildPriorityBadge(priority) {
        const normalizedPriority = normalizePriority(priority);
        const badge = document.createElement("span");

        if (normalizedPriority === "High") {
            badge.className = "badge text-bg-danger";
        } else if (normalizedPriority === "Low") {
            badge.className = "badge text-bg-info";
        } else {
            badge.className = "badge text-bg-warning";
        }

        badge.textContent = normalizedPriority;

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

    function buildDeleteButton() {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-sm btn-outline-danger";
        button.textContent = "Delete";
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

    async function updateTaskItem(itemId, title, isDone, priority) {
        const response = await fetch(`/api/TaskItems/${itemId}`, {
            method: "PUT",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title: title, isDone: isDone, priority: priority })
        });

        if (!response.ok) {
            throw new Error("Update failed with status " + response.status + ".");
        }
    }

    async function deleteTaskItem(itemId) {
        const response = await fetch(`/api/TaskItems/${itemId}`, {
            method: "DELETE",
            headers: {
                Accept: "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Delete failed with status " + response.status + ".");
        }
    }

    function renderList(items) {
        for (const item of items) {
            const row = document.createElement("div");
            row.className = "list-group-item d-flex justify-content-between align-items-start py-3";

            const content = document.createElement("div");
            content.className = "me-3";

            const isEditingRow = editingTaskItemId === item.id;
            const itemPriority = normalizePriority(item.priority);

            let editTitleInput = null;
            let editPrioritySelect = null;

            if (isEditingRow) {
                editTitleInput = document.createElement("input");
                editTitleInput.type = "text";
                editTitleInput.className = "form-control form-control-sm";
                editTitleInput.value = item.title;
                editTitleInput.maxLength = 200;
                editTitleInput.autocomplete = "off";
                editTitleInput.setAttribute("aria-label", "Edit title for task " + item.id);
                content.appendChild(editTitleInput);

                editPrioritySelect = document.createElement("select");
                editPrioritySelect.className = "form-select form-select-sm mt-2";
                editPrioritySelect.setAttribute("aria-label", "Edit priority for task " + item.id);

                const priorities = ["Low", "Medium", "High"];
                for (const priority of priorities) {
                    const option = document.createElement("option");
                    option.value = priority;
                    option.textContent = priority;

                    if (priority === itemPriority) {
                        option.selected = true;
                    }

                    editPrioritySelect.appendChild(option);
                }

                content.appendChild(editPrioritySelect);
            } else {
                const title = document.createElement("h2");
                title.className = "h6 mb-1";
                title.textContent = item.title;
                content.appendChild(title);
            }

            const meta = document.createElement("p");
            meta.className = "mb-0 text-muted small";
            meta.textContent = "Task #" + item.id + " • Priority: " + itemPriority;

            content.appendChild(meta);

            const actions = document.createElement("div");
            actions.className = "d-flex align-items-center gap-2";
            actions.appendChild(buildStatusBadge(Boolean(item.isDone)));
            actions.appendChild(buildPriorityBadge(itemPriority));

            if (isEditingRow && editTitleInput && editPrioritySelect) {
                const saveButton = buildSaveButton();
                const cancelButton = buildCancelButton();

                saveButton.addEventListener("click", async function () {
                    const nextTitle = editTitleInput.value.trim();
                    const nextPriority = normalizePriority(editPrioritySelect.value);

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
                        await updateTaskItem(item.id, nextTitle, Boolean(item.isDone), nextPriority);
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

                const deleteButton = buildDeleteButton();

                deleteButton.addEventListener("click", async function () {
                    setVisible(errorEl, false);
                    errorEl.textContent = "";

                    const shouldDelete = window.confirm("Delete this task item?");

                    if (!shouldDelete) {
                        return;
                    }

                    deleteButton.disabled = true;
                    deleteButton.textContent = "Deleting...";

                    try {
                        await deleteTaskItem(item.id);
                    } catch (error) {
                        deleteButton.disabled = false;
                        deleteButton.textContent = "Delete";
                        errorEl.textContent = "Unable to delete task item.";
                        setVisible(errorEl, true);
                        return;
                    }

                    try {
                        await loadTaskItems();
                    } catch (error) {
                        deleteButton.disabled = false;
                        deleteButton.textContent = "Delete";
                        errorEl.textContent = "Task deleted, but the list could not be refreshed. Please reload.";
                        setVisible(errorEl, true);
                    }
                });

                actions.appendChild(deleteButton);
            }

            row.appendChild(content);
            row.appendChild(actions);
            listEl.appendChild(row);
        }
    }

    function renderTaskItems() {
        clearListState();
        setFilterButtonState();
        setSearchButtonState();
        setSortState();
        setClearCompletedButtonState(Array.isArray(taskItems) ? taskItems : []);

        const visibleItems = Array.isArray(taskItems) ? getVisibleItems(taskItems) : [];
        setTaskCount(visibleItems.length);

        if (!Array.isArray(taskItems) || taskItems.length === 0) {
            emptyEl.textContent = emptyStateNoTasksMessage;
            setVisible(emptyEl, true);
            return;
        }

        if (visibleItems.length === 0) {
            emptyEl.textContent = emptyStateNoResultsMessage;
            setVisible(emptyEl, true);
            return;
        }

        renderList(visibleItems);
        setVisible(listEl, true);
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
            taskItems = Array.isArray(items) ? items : [];

            clearStates();
            renderTaskItems();
        } catch (error) {
            clearStates();
            errorEl.textContent = "Unable to load task items. " + (error instanceof Error ? error.message : "Please try again.");
            setVisible(errorEl, true);
        }
    }

    async function createTaskItem(title, priority) {
        const response = await fetch("/api/TaskItems", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title: title, priority: priority })
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
        const priority = normalizePriority(createPrioritySelectEl.value);

        if (!title) {
            createErrorEl.textContent = "Title is required.";
            setVisible(createErrorEl, true);
            return;
        }

        try {
            isSubmittingCreate = true;
            setCreateSubmitting(true);
            await createTaskItem(title, priority);
            await loadTaskItems();

            titleInputEl.value = "";
            createPrioritySelectEl.value = "Medium";
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

    for (const button of filterButtonEls) {
        button.addEventListener("click", function () {
            const nextFilter = button.dataset.taskFilter;

            if (!nextFilter || nextFilter === selectedFilter) {
                return;
            }

            selectedFilter = nextFilter;
            renderTaskItems();
        });
    }

    searchInputEl.addEventListener("input", handleSearchInput);
    clearSearchButtonEl.addEventListener("click", clearSearch);
    sortSelectEl.addEventListener("change", function () {
        const nextSort = sortSelectEl.value;

        if (nextSort !== "newest" && nextSort !== "oldest") {
            return;
        }

        selectedSort = nextSort;
        renderTaskItems();
    });
    clearCompletedButtonEl.addEventListener("click", clearCompletedTaskItems);

    setFilterButtonState();

    loadTaskItems();
})();
