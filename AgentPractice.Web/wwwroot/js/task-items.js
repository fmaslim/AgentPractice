(function () {
    const loadingEl = document.getElementById("task-items-loading");
    const errorEl = document.getElementById("task-items-error");
    const emptyEl = document.getElementById("task-items-empty");
    const listEl = document.getElementById("task-items-list");

    if (!loadingEl || !errorEl || !emptyEl || !listEl) {
        return;
    }

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

    function buildStatusBadge(isDone) {
        const badge = document.createElement("span");
        badge.className = isDone ? "badge text-bg-success" : "badge text-bg-secondary";
        badge.textContent = isDone ? "Done" : "Open";
        return badge;
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

    loadTaskItems();
})();
