const DEBUG = true;

const state = {
  lists: [],
  selectedListId: null,
  items: [],
  loading: false,
  error: null
};

(function () {
  function traceFunction(functionName, fn) {
    return function tracedFunction(...args) {
      if (DEBUG) {
        console.log(`[DEBUG] -> ${functionName}`, { args: args, state: { ...state } });
      }

      try {
        const result = fn.apply(this, args);

        if (result && typeof result.then === 'function') {
          return result
            .then((value) => {
              if (DEBUG) {
                console.log(`[DEBUG] <- ${functionName}`, { result: value, state: { ...state } });
              }
              return value;
            })
            .catch((error) => {
              if (DEBUG) {
                console.log(`[DEBUG] <- ${functionName} (error)`, { error: error, state: { ...state } });
              }
              throw error;
            });
        }

        if (DEBUG) {
          console.log(`[DEBUG] <- ${functionName}`, { result: result, state: { ...state } });
        }

        return result;
      } catch (error) {
        if (DEBUG) {
          console.log(`[DEBUG] <- ${functionName} (error)`, { error: error, state: { ...state } });
        }
        throw error;
      }
    };
  }

  const ui = {
    listForm: document.getElementById('list-form'),
    listInput: document.getElementById('list-input'),
    listsContainer: document.getElementById('lists-container'),
    mainContent: document.getElementById('main-content'),
    itemsContainer: document.getElementById('items-container'),
    items: document.getElementById('items'),
    itemForm: document.getElementById('item-form'),
    itemInput: document.getElementById('item-input'),
    emptyState: document.getElementById('empty-state'),
    itemsListTitle: document.getElementById('items-list-title'),
    sidebar: document.getElementById('sidebar'),
    menuToggle: document.getElementById('menu-toggle'),
    closeSidebar: document.getElementById('close-sidebar'),
    sidebarBackdrop: document.getElementById('sidebar-backdrop')
  };

  const LIST_ACTION_SELECT = 'select';
  const LIST_ACTION_EDIT = 'edit';
  const LIST_ACTION_DELETE = 'delete';

  const ITEM_ACTION_TOGGLE = 'toggle';
  const ITEM_ACTION_EDIT = 'edit';
  const ITEM_ACTION_DELETE = 'delete';

  function normalizeId(value) {
    if (value === null || value === undefined) {
      return null;
    }

    return String(value);
  }

  function isDesktop() {
    return window.matchMedia('(min-width: 900px)').matches;
  }

  function setSidebarOpen(isOpen) {
    if (isDesktop()) {
      ui.sidebar.classList.remove('is-open');
      ui.sidebarBackdrop.hidden = true;
      return;
    }

    ui.sidebar.classList.toggle('is-open', isOpen);
    ui.sidebarBackdrop.hidden = !isOpen;
  }

  function setState(patch) {
    Object.assign(state, patch);
    render();
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getSelectedList() {
    return state.lists.find((list) => normalizeId(list.id) === state.selectedListId) || null;
  }

  function renderLoading() {
    ui.mainContent.classList.toggle('is-loading', state.loading);
  }

  function renderError() {
    if (!state.error) {
      return;
    }

    ui.itemsListTitle.textContent = 'Something went wrong';
    ui.emptyState.hidden = false;
    ui.itemsContainer.hidden = true;
    ui.itemForm.hidden = true;
    ui.items.innerHTML = '';

    const content = ui.emptyState.querySelector('.empty-state__content');
    if (!content) {
      return;
    }

    const title = content.querySelector('h3');
    const description = content.querySelector('p');

    if (title) {
      title.textContent = 'Unable to load data';
    }

    if (description) {
      description.textContent = state.error;
    }
  }

  function renderEmpty() {
    ui.itemsListTitle.textContent = 'Select a list';
    ui.emptyState.hidden = false;
    ui.itemsContainer.hidden = true;
    ui.itemForm.hidden = true;
    ui.items.innerHTML = '';

    const content = ui.emptyState.querySelector('.empty-state__content');
    if (!content) {
      return;
    }

    const title = content.querySelector('h3');
    const description = content.querySelector('p');

    if (title) {
      title.textContent = 'No list selected';
    }

    if (description) {
      description.textContent = 'Pick a list from the sidebar or create a new one to start managing tasks.';
    }
  }

  /**
   * Render the lists sidebar using the current state.
   * @returns {void}
   */
  function renderLists() {
    if (state.lists.length === 0) {
      ui.listsContainer.innerHTML = '<li class="u-text-sm u-text-muted">No lists yet. Create your first list.</li>';
      return;
    }

    const markup = state.lists.map((list) => {
      const isActive = normalizeId(list.id) === state.selectedListId;
      const activeClass = isActive ? ' is-active' : '';
      const safeTitle = escapeHtml(list.title);
      return (
        `<li class="list-row">` +
          `<button type="button" class="list-link${activeClass}" data-list-id="${list.id}" data-action="${LIST_ACTION_SELECT}">` +
            `<span class="u-truncate">${safeTitle}</span>` +
          `</button>` +
          `<div class="list-actions">` +
            `<button type="button" class="icon-action" data-list-id="${list.id}" data-action="${LIST_ACTION_EDIT}" aria-label="Edit list">` +
              `<i class="fa-solid fa-pen"></i>` +
            `</button>` +
            `<button type="button" class="icon-action icon-action--danger" data-list-id="${list.id}" data-action="${LIST_ACTION_DELETE}" aria-label="Delete list">` +
              `<i class="fa-solid fa-trash"></i>` +
            `</button>` +
          `</div>` +
        `</li>`
      );
    }).join('');

    ui.listsContainer.innerHTML = markup;
  }

  /**
   * Render items for the currently selected list.
   * @returns {void}
   */
  function renderItems() {
    const selectedList = getSelectedList();

    if (!state.selectedListId) {
      renderEmpty();
      return;
    }

    if (!selectedList) {
      ui.itemsListTitle.textContent = 'Loading list...';
      ui.emptyState.hidden = true;
      ui.itemsContainer.hidden = false;
      ui.itemForm.hidden = false;
      ui.items.innerHTML = '<li class="u-text-sm u-text-muted">Loading items...</li>';
      return;
    }

    ui.itemsListTitle.textContent = selectedList.title;
    ui.emptyState.hidden = true;
    ui.itemsContainer.hidden = false;
    ui.itemForm.hidden = false;

    if (state.items.length === 0) {
      ui.items.innerHTML = '<li class="u-text-sm u-text-muted">No items in this list.</li>';
      return;
    }

    const markup = state.items.map((item) => {
      const itemId = normalizeId(item.id);
      const statusClass = item.status === 'done' ? 'badge badge--success' : 'badge badge--secondary';
      const statusLabel = item.status === 'done' ? 'Done' : 'Todo';
      const textClass = item.status === 'done' ? 'item-card__text item-card__text--done' : 'item-card__text';
      const safeText = escapeHtml(item.text);

      return (
        `<li class="item-row">` +
          `<article class="card card--compact item-card">` +
            `<span class="${statusClass}">${statusLabel}</span>` +
            `<p class="${textClass}">${safeText}</p>` +
            `<div class="item-actions">` +
              `<button type="button" class="icon-action" data-item-id="${itemId}" data-action="${ITEM_ACTION_TOGGLE}" aria-label="Toggle item status">` +
                `<i class="fa-solid fa-check"></i>` +
              `</button>` +
              `<button type="button" class="icon-action" data-item-id="${itemId}" data-action="${ITEM_ACTION_EDIT}" aria-label="Edit item">` +
                `<i class="fa-solid fa-pen"></i>` +
              `</button>` +
              `<button type="button" class="icon-action icon-action--danger" data-item-id="${itemId}" data-action="${ITEM_ACTION_DELETE}" aria-label="Delete item">` +
                `<i class="fa-solid fa-trash"></i>` +
              `</button>` +
            `</div>` +
          `</article>` +
        `</li>`
      );
    }).join('');

    ui.items.innerHTML = markup;
  }

  function render() {
    renderLoading();
    renderLists();

    if (state.error) {
      renderError();
      return;
    }

    renderItems();
  }

  /**
   * Create a new list from the sidebar form.
   * @param {SubmitEvent} event
   * @returns {Promise<void>}
   */
  async function handleCreateList(event) {
    event.preventDefault();

    const name = ui.listInput.value.trim();
    if (!name) {
      return;
    }

    setState({ loading: true, error: null });

    try {
      const created = await createList(name);
      ui.listInput.value = '';
      await loadListsAndMaybeItems(created ? created.id : null);
      setSidebarOpen(false);
    } catch (error) {
      setState({ loading: false, error: error.message || 'Unable to create list' });
    }
  }

  async function handleCreateItem(event) {
    event.preventDefault();

    const activeListId = state.selectedListId;
    if (!activeListId) {
      return;
    }

    const text = ui.itemInput.value.trim();
    if (!text) {
      return;
    }

    setState({ selectedListId: activeListId, loading: true, error: null });

    try {
      await createItem(activeListId, text);
      ui.itemInput.value = '';
      const items = await getItems(activeListId);
      setState({
        selectedListId: activeListId,
        items: items,
        loading: false,
        error: null
      });
    } catch (error) {
      setState({
        selectedListId: activeListId,
        loading: false,
        error: error.message || 'Unable to add item'
      });
    }
  }

  async function refreshSelectedItems(listId = state.selectedListId) {
    const activeListId = normalizeId(listId);

    if (!activeListId) {
      setState({ selectedListId: null, items: [] });
      return;
    }

    const items = await getItems(activeListId);
    setState({
      selectedListId: activeListId,
      items: items,
      loading: false,
      error: null
    });
  }

  async function handleListAction(action, listId) {
    if (!listId) {
      return;
    }

    if (action === LIST_ACTION_SELECT) {
      await handleSelectList(listId);
      return;
    }

    if (action === LIST_ACTION_EDIT) {
      const current = state.lists.find((list) => normalizeId(list.id) === normalizeId(listId));
      if (!current) {
        return;
      }

      const nextTitle = window.prompt('Edit list title', current.title);
      if (!nextTitle || !nextTitle.trim()) {
        return;
      }

      setState({ loading: true, error: null });
      try {
        await updateList(listId, nextTitle.trim());
        await loadListsAndMaybeItems(state.selectedListId);
      } catch (error) {
        setState({ loading: false, error: error.message || 'Unable to update list' });
      }

      return;
    }

    if (action === LIST_ACTION_DELETE) {
      const confirmed = window.confirm('Delete this list and all its items?');
      if (!confirmed) {
        return;
      }

      setState({ loading: true, error: null });
      try {
        await deleteList(listId);
        const nextSelection = normalizeId(listId) === state.selectedListId ? null : state.selectedListId;
        await loadListsAndMaybeItems(nextSelection);
      } catch (error) {
        setState({ loading: false, error: error.message || 'Unable to delete list' });
      }
    }
  }

  async function handleItemAction(action, itemId) {
    const activeListId = state.selectedListId;

    if (!activeListId || !itemId) {
      return;
    }

    const current = state.items.find((item) => normalizeId(item.id) === normalizeId(itemId));
    if (!current) {
      return;
    }

    if (action === ITEM_ACTION_TOGGLE) {
      const nextStatus = current.status === 'done' ? 'todo' : 'done';
      setState({ selectedListId: activeListId, loading: true, error: null });
      try {
        await changeItemStatus(activeListId, itemId, nextStatus);
        await refreshSelectedItems(activeListId);
      } catch (error) {
        setState({ selectedListId: activeListId, loading: false, error: error.message || 'Unable to update item' });
      }

      return;
    }

    if (action === ITEM_ACTION_EDIT) {
      const nextText = window.prompt('Edit item text', current.text);
      if (!nextText || !nextText.trim()) {
        return;
      }

      setState({ selectedListId: activeListId, loading: true, error: null });
      try {
        await updateItem(activeListId, itemId, { text: nextText.trim() });
        await refreshSelectedItems(activeListId);
      } catch (error) {
        setState({ selectedListId: activeListId, loading: false, error: error.message || 'Unable to update item' });
      }

      return;
    }

    if (action === ITEM_ACTION_DELETE) {
      const confirmed = window.confirm('Delete this item?');
      if (!confirmed) {
        return;
      }

      setState({ selectedListId: activeListId, loading: true, error: null });
      try {
        await deleteItem(activeListId, itemId);
        await refreshSelectedItems(activeListId);
      } catch (error) {
        setState({ selectedListId: activeListId, loading: false, error: error.message || 'Unable to delete item' });
      }
    }
  }

  /**
   * Select a list and load its items.
   * @param {string|number} listId
   * @returns {Promise<void>}
   */
  async function handleSelectList(listId) {
    const normalized = normalizeId(listId);
    setState({ selectedListId: normalized, items: [], loading: true, error: null });

    try {
      const items = await getItems(normalized);
      setState({ selectedListId: normalized, items: items, loading: false, error: null });
      setSidebarOpen(false);
    } catch (error) {
      setState({ selectedListId: normalized, items: [], loading: false, error: error.message || 'Unable to load items' });
    }
  }

  async function loadListsAndMaybeItems(preferredListId) {
    const lists = await getLists();
    const preferred = normalizeId(preferredListId);
    const current = state.selectedListId;

    let selected = null;

    if (preferred && lists.some((list) => normalizeId(list.id) === preferred)) {
      selected = preferred;
    } else if (current && lists.some((list) => normalizeId(list.id) === current)) {
      selected = current;
    } else if (lists.length > 0) {
      selected = normalizeId(lists[0].id);
    }

    let items = [];
    if (selected) {
      items = await getItems(selected);
    }

    setState({
      lists: lists,
      selectedListId: selected,
      items: items,
      loading: false,
      error: null
    });
  }

  /**
   * Initialize event bindings and initial data load.
   * @returns {Promise<void>}
   */
  async function init() {
    ui.listForm.addEventListener('submit', handleCreateList);
    ui.itemForm.addEventListener('submit', handleCreateItem);

    ui.listsContainer.addEventListener('click', async (event) => {
      const trigger = event.target.closest('[data-list-id][data-action]');
      if (!trigger) {
        return;
      }

      await handleListAction(trigger.dataset.action, trigger.dataset.listId);
    });

    ui.items.addEventListener('click', async (event) => {
      const trigger = event.target.closest('[data-item-id][data-action]');
      if (!trigger) {
        return;
      }

      await handleItemAction(trigger.dataset.action, trigger.dataset.itemId);
    });

    ui.menuToggle.addEventListener('click', () => setSidebarOpen(true));
    ui.closeSidebar.addEventListener('click', () => setSidebarOpen(false));
    ui.sidebarBackdrop.addEventListener('click', () => setSidebarOpen(false));
    window.addEventListener('resize', () => setSidebarOpen(false));

    setState({ loading: true, error: null });

    try {
      await loadListsAndMaybeItems(null);
    } catch (error) {
      setState({ loading: false, error: error.message || 'Unable to load lists' });
    }
  }

  normalizeId = traceFunction('normalizeId', normalizeId);
  isDesktop = traceFunction('isDesktop', isDesktop);
  setSidebarOpen = traceFunction('setSidebarOpen', setSidebarOpen);
  setState = traceFunction('setState', setState);
  escapeHtml = traceFunction('escapeHtml', escapeHtml);
  getSelectedList = traceFunction('getSelectedList', getSelectedList);
  renderLoading = traceFunction('renderLoading', renderLoading);
  renderError = traceFunction('renderError', renderError);
  renderEmpty = traceFunction('renderEmpty', renderEmpty);
  renderLists = traceFunction('renderLists', renderLists);
  renderItems = traceFunction('renderItems', renderItems);
  render = traceFunction('render', render);
  handleCreateList = traceFunction('handleCreateList', handleCreateList);
  handleCreateItem = traceFunction('handleCreateItem', handleCreateItem);
  refreshSelectedItems = traceFunction('refreshSelectedItems', refreshSelectedItems);
  handleListAction = traceFunction('handleListAction', handleListAction);
  handleItemAction = traceFunction('handleItemAction', handleItemAction);
  handleSelectList = traceFunction('handleSelectList', handleSelectList);
  loadListsAndMaybeItems = traceFunction('loadListsAndMaybeItems', loadListsAndMaybeItems);
  init = traceFunction('init', init);

  init();
})();

