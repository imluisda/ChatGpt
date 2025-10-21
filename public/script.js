document.addEventListener('DOMContentLoaded', () => {
  fetchTasks();

  document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
    if (res.ok) {
      document.getElementById('title').value = '';
      fetchTasks();
    }
  });
});

async function fetchTasks() {
  const res = await fetch('/api/tasks');
  const tasks = await res.json();
  ['todo', 'doing', 'done'].forEach(status => {
    const ul = document.getElementById(status);
    ul.innerHTML = '';
    tasks.filter(t => t.status === status).forEach(t => {
      const li = document.createElement('li');
      li.textContent = t.title;
      li.addEventListener('click', () => moveTask(t.id));
      ul.appendChild(li);
    });
  });
}

async function moveTask(id) {
  const res = await fetch('/api/tasks');
  const tasks = await res.json();
  const task = tasks.find(t => t.id === id);
  const statuses = ['todo', 'doing', 'done'];
  const nextStatus = statuses[(statuses.indexOf(task.status) + 1) % statuses.length];
  await fetch(`/api/tasks/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: nextStatus })
  });
  fetchTasks();
}
