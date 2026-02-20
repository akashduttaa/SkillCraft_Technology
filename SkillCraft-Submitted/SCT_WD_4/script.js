document.getElementById("currentYear").textContent = new Date().getFullYear();

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("taskForm");
  const taskInput = document.getElementById("taskInput");
  const taskDateTime = document.getElementById("taskDateTime");
  const taskList = document.getElementById("taskList");

  const toggle = document.getElementById("darkModeToggle");

  // Preserve toggle state between sessions
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    toggle.checked = true;
  }

  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    const dateTime = taskDateTime.value;
    const cleanedDateTime = dateTime.replace("T", " at ");

    if (!text) return;

    const taskItem = document.createElement("li");
    taskItem.classList.add("task-item");

    const taskContent = document.createElement("div");
    taskContent.innerHTML = `<strong>${text}</strong> ${dateTime ? `<br/><small>${cleanedDateTime}</small>` : ""}`;

    const actionBtns = document.createElement("div");
    actionBtns.innerHTML = `
      <button class="complete-btn">✅</button>
      <button class="edit-btn">✏️</button>
      <button class="delete-btn">🗑️</button>
    `;

    taskItem.appendChild(taskContent);
    taskItem.appendChild(actionBtns);
    taskList.appendChild(taskItem);

    taskInput.value = "";
    taskDateTime.value = "";

    // ✅ Complete Task
    actionBtns.querySelector(".complete-btn").onclick = () => {
      taskItem.classList.toggle("completed");
    };

    // ✏️ Edit Task
    actionBtns.querySelector(".edit-btn").onclick = () => {
      const newText = prompt("Edit task:", text);
      if (newText) {
        taskContent.innerHTML = `<strong>${newText}</strong> ${dateTime ? `<br/><small>${cleanedDateTime}</small>` : ""}`;
      }
    };

    // 🗑️ Delete Task
    actionBtns.querySelector(".delete-btn").onclick = () => {
      taskItem.remove();
    };
  });
});
