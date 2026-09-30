// ========================================
// DOM ELEMENTS
// ========================================

const taskInput = document.getElementById("task-input");
const addButton = document.getElementById("add-button");
const taskList = document.getElementById("task-list");

const apiButton = document.getElementById("api-button");
const apiResult = document.getElementById("api-result");

const statusMessage = document.getElementById("status-message");

const taskCounter = document.getElementById("task-counter");

const allButton = document.getElementById("all-button");
const activeButton = document.getElementById("active-button");
const completedButton = document.getElementById("completed-button");


// ========================================
// APPLICATION STATE
// ========================================

// All tasks loaded from the database
let allTasks = [];

// Currently selected filter
let currentFilter = "all";


// ========================================
// DISPLAY ONE TASK
// ========================================

function displayTask(task) {

    // Create list item
    const li = document.createElement("li");


    // ========================================
    // CHECKBOX
    // ========================================
// ========================================
// CHECKBOX
// ========================================

const checkbox = document.createElement("input");

checkbox.type = "checkbox";

checkbox.checked = task.completed === 1;


// ========================================
// TASK TEXT
// ========================================

const taskText = document.createElement("span");

taskText.textContent = task.title;


// Show completed style
if (task.completed === 1) {

    taskText.style.textDecoration = "line-through";

    taskText.style.opacity = "0.5";

}

    // ========================================
    // CHECKBOX CHANGE
    // ========================================

    checkbox.addEventListener("change", async function() {

        const newCompletedValue = checkbox.checked ? 1 : 0;

        try {

            const response = await fetch(
                `/api/tasks/${task.id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        title: task.title,
                        completed: newCompletedValue
                    })
                }
            );


            if (!response.ok) {

                throw new Error("Failed to update task.");

            }


            const updatedTask = await response.json();


            // Update local task
            task.completed = updatedTask.completed;


            // Update task inside allTasks
            const taskIndex = allTasks.findIndex(
                item => item.id === task.id
            );


            if (taskIndex !== -1) {

                allTasks[taskIndex] = updatedTask;

            }


            updateCounter();

            showTasks(currentFilter);

        }

        catch (error) {

            console.error(
                "Could not update task:",
                error
            );

            statusMessage.textContent =
                "Could not update task.";

        }

    });


    // ========================================
    // EDIT BUTTON
    // ========================================

    const editButton = document.createElement("button");

    editButton.textContent = "Edit";


    editButton.addEventListener("click", function() {

        // Create editing input
        const editInput = document.createElement("input");

        editInput.type = "text";

        editInput.value = task.title;


        // Create Save button
        const saveButton = document.createElement("button");

        saveButton.textContent = "Save";


        // Create Cancel button
        const cancelButton = document.createElement("button");

        cancelButton.textContent = "Cancel";


        // Hide normal task display
        taskText.style.display = "none";

        editButton.style.display = "none";

        deleteButton.style.display = "none";

        checkbox.style.display = "none";


        // Add editing elements
        li.appendChild(editInput);

        li.appendChild(saveButton);

        li.appendChild(cancelButton);


        // ========================================
        // SAVE EDIT
        // ========================================

        saveButton.addEventListener("click", async function() {

            const newTitle = editInput.value.trim();


            if (newTitle === "") {

                return;

            }


            try {

                const response = await fetch(
                    `/api/tasks/${task.id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            title: newTitle,
                            completed: task.completed
                        })
                    }
                );


                if (!response.ok) {

                    throw new Error(
                        "Failed to update task."
                    );

                }


                const updatedTask =
                    await response.json();


                // Update task object
                task.title = updatedTask.title;

                task.completed =
                    updatedTask.completed;


                // Update allTasks
                const taskIndex =
                    allTasks.findIndex(
                        item => item.id === task.id
                    );


                if (taskIndex !== -1) {

                    allTasks[taskIndex] =
                        updatedTask;

                }


                // Refresh display
                updateCounter();

                showTasks(currentFilter);

            }

            catch (error) {

                console.error(
                    "Could not edit task:",
                    error
                );

                statusMessage.textContent =
                    "Could not edit task.";

            }

        });


        // ========================================
        // CANCEL EDIT
        // ========================================

        cancelButton.addEventListener(
            "click",
            function() {

                showTasks(currentFilter);

            }
        );

    });


    // ========================================
    // DELETE BUTTON
    // ========================================

    const deleteButton = document.createElement("button");

    deleteButton.textContent = "Delete";


    deleteButton.addEventListener(
        "click",
        async function() {

            const confirmed = confirm(
                "Are you sure you want to delete this task?"
            );


            if (!confirmed) {

                return;

            }


            try {

                const response = await fetch(
                    `/api/tasks/${task.id}`,
                    {
                        method: "DELETE"
                    }
                );


                if (!response.ok) {

                    throw new Error(
                        "Failed to delete task."
                    );

                }


                // Remove task from local array
                allTasks = allTasks.filter(
                    item => item.id !== task.id
                );


                updateCounter();

                showTasks(currentFilter);


                statusMessage.textContent =
                    "Task deleted successfully!";

            }

            catch (error) {

                console.error(
                    "Could not delete task:",
                    error
                );

                statusMessage.textContent =
                    "Could not delete task.";

            }

        }
    );


    // ========================================
    // ADD ELEMENTS TO LIST ITEM
    // ========================================

    li.appendChild(checkbox);

    li.appendChild(taskText);

    li.appendChild(editButton);

    li.appendChild(deleteButton);


    // Add list item to page
    taskList.appendChild(li);

}


// ========================================
// SHOW TASKS
// ========================================

function showTasks(filter) {

    // Clear current list
    taskList.innerHTML = "";


    // Start with all tasks
    let filteredTasks = allTasks;


    // ========================================
    // ACTIVE FILTER
    // ========================================

    if (filter === "active") {

        filteredTasks = allTasks.filter(
            task => task.completed === 0
        );

    }


    // ========================================
    // COMPLETED FILTER
    // ========================================

    if (filter === "completed") {

        filteredTasks = allTasks.filter(
            task => task.completed === 1
        );

    }


    // ========================================
    // EMPTY STATE
    // ========================================

    if (filteredTasks.length === 0) {

        const emptyMessage =
            document.createElement("p");


        if (filter === "all") {

            emptyMessage.textContent =
                "No tasks yet. Add your first task!";

        }

        else if (filter === "active") {

            emptyMessage.textContent =
                "No active tasks.";

        }

        else {

            emptyMessage.textContent =
                "No completed tasks.";

        }


        taskList.appendChild(emptyMessage);

        return;

    }


    // ========================================
    // DISPLAY FILTERED TASKS
    // ========================================

    filteredTasks.forEach(function(task) {

        displayTask(task);

    });

}


// ========================================
// UPDATE TASK COUNTER
// ========================================

function updateCounter() {

    const totalTasks =
        allTasks.length;


    const completedTasks =
        allTasks.filter(
            task => task.completed === 1
        ).length;


    const remainingTasks =
        totalTasks - completedTasks;


    taskCounter.textContent =
        `${totalTasks} tasks • ` +
        `${completedTasks} completed • ` +
        `${remainingTasks} remaining`;

}


// ========================================
// LOAD TASKS FROM SERVER
// ========================================

async function loadTasks() {

    try {

        const response =
            await fetch("/api/tasks");


        if (!response.ok) {

            throw new Error(
                "Failed to load tasks."
            );

        }


        allTasks =
            await response.json();


        updateCounter();

        showTasks(currentFilter);

    }

    catch (error) {

        console.error(
            "Could not load tasks:",
            error
        );

        statusMessage.textContent =
            "Could not load tasks.";

    }

}


// ========================================
// ADD NEW TASK
// ========================================

addButton.addEventListener(
    "click",
    async function() {

        const title =
            taskInput.value.trim();


        // Don't allow empty tasks
        if (title === "") {

            return;

        }


        try {

            const response =
                await fetch(
                    "/api/tasks",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            title: title
                        })
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Failed to add task."
                );

            }


            const newTask =
                await response.json();


            // Add new task to local array
            allTasks.push(newTask);


            updateCounter();

            showTasks(currentFilter);


            statusMessage.textContent =
                "Task added successfully!";


            // Clear input
            taskInput.value = "";

        }

        catch (error) {

            console.error(
                "Could not add task:",
                error
            );

            statusMessage.textContent =
                "Could not add task.";

        }

    }
);


// ========================================
// ENTER KEY → ADD TASK
// ========================================

taskInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            addButton.click();

        }

    }
);


// ========================================
// FILTER BUTTONS
// ========================================

allButton.addEventListener(
    "click",
    function() {

        currentFilter = "all";

        showTasks(currentFilter);

    }
);


activeButton.addEventListener(
    "click",
    function() {

        currentFilter = "active";

        showTasks(currentFilter);

    }
);


completedButton.addEventListener(
    "click",
    function() {

        currentFilter = "completed";

        showTasks(currentFilter);

    }
);


// ========================================
// HELLO API BUTTON
// ========================================

apiButton.addEventListener(
    "click",
    async function() {

        try {

            const response =
                await fetch("/api/hello");


            if (!response.ok) {

                console.error(
                    "Failed to call Hello API."
                );

                apiResult.textContent =
                    "Failed to call API.";

                return;

            }


            const data =
                await response.json();


            apiResult.textContent =
                data.message;

        }

        catch (error) {

            console.error(
                "Could not connect to the server:",
                error
            );

            apiResult.textContent =
                "Could not connect to the server.";

        }

    }
);


// ========================================
// START APPLICATION
// ========================================

// Load existing tasks when page opens
loadTasks();