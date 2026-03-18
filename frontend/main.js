
// Determina l'host backend in modo portabile
let host = "";
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
  host = "http://localhost:3000";
} else {
  // Per Codespace, GitHub Codespaces, o ambienti cloud
  host = window.location.origin.replace(/3100$/, "3000");
}

// Elements
const listsSection = document.getElementById('lists-section');
const itemsSection = document.getElementById('items-section');
const listsUl = document.getElementById('lists');
const refreshListsBtn = document.getElementById('refresh-lists');
const addListBtn = document.getElementById('add-list');
const newListTitle = document.getElementById('new-list-title');
const itemsUl = document.getElementById('items');
const itemsListTitle = document.getElementById('items-list-title');
const backToListsBtn = document.getElementById('back-to-lists');
const addItemBtn = document.getElementById('add-item');
const newItemText = document.getElementById('new-item-text');

let currentList = null;

function showLists() {
  itemsSection.style.display = 'none';
  listsSection.style.display = '';
}

function showItems(list) {
  currentList = list;
  listsSection.style.display = 'none';
  itemsSection.style.display = '';
  itemsListTitle.textContent = list.title;
  loadItems(list.id);
}

async function loadLists() {
  listsUl.innerHTML = '';
  try {
    const res = await apiRequest(host + '/lists');
    (res.data || []).forEach(list => {
      const li = document.createElement('li');
      li.textContent = list.title;
      li.style.cursor = 'pointer';
      li.onclick = () => showItems(list);
      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.onclick = async e => {
        e.stopPropagation();
        await apiRequest(host + '/lists/' + list.id, 'DELETE');
        loadLists();
      };
      li.appendChild(delBtn);
      listsUl.appendChild(li);
    });
  } catch (e) {
    listsUl.innerHTML = '<li>Error loading lists</li>';
  }
}

async function loadItems(listId) {
  itemsUl.innerHTML = '';
  try {
    const res = await apiRequest(host + '/lists/' + listId + '/items');
    (res.data || []).forEach(item => {
      const li = document.createElement('li');
      li.textContent = item.text + (item.status === 'done' ? ' ✔️' : '');
      li.style.cursor = 'pointer';
      li.onclick = async () => {
        await apiRequest(host + '/lists/' + listId + '/items/' + item.id, 'PUT', { status: item.status === 'done' ? 'todo' : 'done' });
        loadItems(listId);
      };
      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.onclick = async e => {
        e.stopPropagation();
        await apiRequest(host + '/lists/' + listId + '/items/' + item.id, 'DELETE');
        loadItems(listId);
      };
      li.appendChild(delBtn);
      itemsUl.appendChild(li);
    });
  } catch (e) {
    itemsUl.innerHTML = '<li>Error loading items</li>';
  }
}

refreshListsBtn.onclick = loadLists;
addListBtn.onclick = async () => {
  if (!newListTitle.value.trim()) return;
  await apiRequest(host + '/lists', 'POST', { title: newListTitle.value });
  newListTitle.value = '';
  loadLists();
};

backToListsBtn.onclick = () => {
  showLists();
  loadLists();
};

addItemBtn.onclick = async () => {
  if (!newItemText.value.trim() || !currentList) return;
  await apiRequest(host + `/lists/${currentList.id}/items`, 'POST', { text: newItemText.value });
  newItemText.value = '';
  loadItems(currentList.id);
};

// Initial load
showLists();
loadLists();

