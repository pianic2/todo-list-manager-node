const state = {
  lists: [],
  listItemCounts: {},
  selectedListId: null,
  items: [],
  itemFilter: 'all',
  loading: false,
  error: null
};

(function () {
  const ui = {
    listForm: document.getElementById('list-form'),
    listInput: document.getElementById('list-input'),
    listsContainer: document.getElementById('lists-container'),
    mainContent: document.getElementById('main-content'),
    itemsContainer: document.getElementById('items-container'),
    items: document.getElementById('items'),
    listsOverview: document.getElementById('lists-overview'),
    listCards: document.getElementById('list-cards'),
    itemForm: document.getElementById('item-form'),
    itemInput: document.getElementById('item-input'),
    emptyState: document.getElementById('empty-state'),
    itemsListTitle: document.getElementById('items-list-title'),
    itemsListDescription: document.getElementById('items-list-description'),
    mainHeaderEyebrow: document.getElementById('main-header-eyebrow'),
    mainHeaderActions: document.getElementById('main-header-actions'),
    overviewButton: document.getElementById('overview-button'),
    newListButton: document.getElementById('new-list-button'),
    editListButton: document.getElementById('edit-list-button'),
    newItemButton: document.getElementById('new-item-button'),
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

  const listDescriptions = {
    'client work': 'Example operational list for a small freelance workflow.',
    'learning roadmap': 'Next steps for improving the Laravel project.',
    'portfolio launch': 'Tasks used to prepare the project for public sharing.'
  };

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

  function setHeader(eyebrow, title, description, showActions) {
    ui.mainHeaderEyebrow.textContent = eyebrow;
    ui.itemsListTitle.textContent = title;
    ui.itemsListDescription.textContent = description;
    ui.mainHeaderActions.hidden = !showActions;
    ui.overviewButton.classList.toggle('is-active', !state.selectedListId);
  }

  function formatDate(value) {
    if (!value) {
      return '';
    }

    const date = new Date(String(value).replace(' ', 'T'));
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  function toUiError(error, fallbackMessage) {
    const kind = error && error.kind ? error.kind : 'request';
    const backendMessage = error && error.message ? error.message : fallbackMessage;

    if (kind === 'validation') {
      return {
        kind,
        title: 'Check the details',
        heading: 'Validation failed',
        message: 'The request was not accepted. Review the entered values and try again.'
      };
    }

    if (kind === 'not_found') {
      return {
        kind,
        title: 'Nothing found',
        heading: 'Resource not found',
        message: 'This list or item is no longer available. Refresh the lists and try again.'
      };
    }

    if (kind === 'server') {
      return {
        kind,
        title: 'Server error',
        heading: 'Server unavailable',
        message: 'The server could not complete the request. Try again in a moment.'
      };
    }

    if (kind === 'network') {
      return {
        kind,
        title: 'Connection problem',
        heading: 'Unable to reach the API',
        message: 'Check that the backend is running and that the API base URL is correct.'
      };
    }

    return {
      kind,
      title: 'Request failed',
      heading: 'Unable to complete the action',
      message: backendMessage || fallbackMessage
    };
  }

  function renderLoading() {
    ui.mainContent.classList.toggle('is-loading', state.loading);
  }

  function renderError() {
    if (!state.error) {
      return;
    }

    const error = typeof state.error === 'string'
      ? toUiError(new Error(state.error), state.error)
      : state.error;

    setHeader('Errore', error.title, error.message, false);
    ui.emptyState.hidden = false;
    ui.itemsContainer.hidden = true;
    ui.listsOverview.hidden = true;
    ui.itemForm.hidden = true;
    ui.mainHeaderActions.hidden = true;
    ui.items.innerHTML = '';

    const content = ui.emptyState.querySelector('.empty-state__content');
    if (!content) {
      return;
    }

    const title = content.querySelector('h3');
    const description = content.querySelector('p');

    if (title) {
      title.textContent = error.heading;
    }

    if (description) {
      description.textContent = error.message;
    }
  }

  function renderEmpty() {
    setHeader(
      'Organizzazione',
      'Tutte le liste',
      'Ogni lista organizza le note. Una nota nasce sempre dentro una lista.',
      false
    );
    ui.emptyState.hidden = false;
    ui.itemsContainer.hidden = true;
    ui.listsOverview.hidden = true;
    ui.itemForm.hidden = true;
    ui.items.innerHTML = '';

    const content = ui.emptyState.querySelector('.empty-state__content');
    if (!content) {
      return;
    }

    const title = content.querySelector('h3');
    const description = content.querySelector('p');

    if (title) {
      title.textContent = 'Nessuna lista';
    }

    if (description) {
      description.textContent = 'Crea la prima lista per iniziare.';
    }
  }

  /**
   * Render the lists sidebar using the current state.
   * @returns {void}
   */
  function renderLists() {
    ui.overviewButton.classList.toggle('is-active', !state.selectedListId);

    if (state.lists.length === 0) {
      ui.listsContainer.innerHTML = '<li class="empty-copy">Nessuna lista. Crea la prima.</li>';
      return;
    }

    const markup = state.lists.map((list) => {
      const isActive = normalizeId(list.id) === state.selectedListId;
      const activeClass = isActive ? ' is-active' : '';
      const safeTitle = escapeHtml(list.title);
      const count = state.listItemCounts[normalizeId(list.id)] || 0;
      return (
        `<li class="list-row">` +
          `<button type="button" class="list-link${activeClass}" data-list-id="${list.id}" data-action="${LIST_ACTION_SELECT}">` +
            `<span class="u-truncate">${safeTitle}</span>` +
            `<span class="list-count">${count}</span>` +
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

  function getListDescription(list) {
    const key = String(list.title || '').trim().toLowerCase();
    return list.description || listDescriptions[key] || 'Ogni lista organizza le note. Una nota nasce sempre dentro una lista.';
  }

  function getItemDescription(item) {
    return item.description || '';
  }

  function renderListsOverview() {
    setHeader(
      'Organizzazione',
      'Tutte le liste',
      'Ogni lista organizza le note. Una nota nasce sempre dentro una lista.',
      false
    );
    ui.emptyState.hidden = true;
    ui.itemsContainer.hidden = true;
    ui.listsOverview.hidden = false;
    ui.itemForm.hidden = true;
    ui.items.innerHTML = '';

    if (state.lists.length === 0) {
      renderEmpty();
      return;
    }

    const markup = state.lists.map((list) => {
      const listId = normalizeId(list.id);
      const count = state.listItemCounts[listId] || 0;
      const safeTitle = escapeHtml(list.title);
      const safeDescription = escapeHtml(getListDescription(list));

      return (
        `<li class="list-card-row">` +
          `<article class="list-card">` +
            `<div class="list-card__meta">` +
              `<span class="list-card__label">Lista</span>` +
              `<span class="list-card__count">${count} note</span>` +
            `</div>` +
            `<div>` +
              `<h3 class="list-card__title">${safeTitle}</h3>` +
              `<p class="list-card__description">${safeDescription}</p>` +
            `</div>` +
            `<div class="list-card__actions">` +
              `<button type="button" class="text-action text-action--muted" data-list-id="${listId}" data-action="${LIST_ACTION_SELECT}">Apri</button>` +
              `<button type="button" class="text-action" data-list-id="${listId}" data-action="${LIST_ACTION_EDIT}">Modifica</button>` +
              `<button type="button" class="text-action text-action--danger" data-list-id="${listId}" data-action="${LIST_ACTION_DELETE}">Elimina</button>` +
            `</div>` +
          `</article>` +
        `</li>`
      );
    }).join('');

    ui.listCards.innerHTML = markup;
  }

  /**
   * Render items for the currently selected list.
   * @returns {void}
   */
  function renderItems() {
    const selectedList = getSelectedList();

    if (!state.selectedListId) {
      renderListsOverview();
      return;
    }

    if (!selectedList) {
      setHeader('Lista selezionata', 'Caricamento lista...', '', false);
      ui.emptyState.hidden = true;
      ui.itemsContainer.hidden = false;
      ui.listsOverview.hidden = true;
      ui.itemForm.hidden = true;
      ui.items.innerHTML = '<li class="empty-copy">Caricamento note...</li>';
      return;
    }

    setHeader('Lista selezionata', selectedList.title, getListDescription(selectedList), true);
    ui.emptyState.hidden = true;
    ui.itemsContainer.hidden = false;
    ui.listsOverview.hidden = true;
    ui.itemForm.hidden = true;

    renderFilters();

    const visibleItems = state.itemFilter === 'all'
      ? state.items
      : state.items.filter((item) => item.status === state.itemFilter);

    if (visibleItems.length === 0) {
      ui.items.innerHTML = '<li class="empty-copy">Nessuna nota in questa lista.</li>';
      return;
    }

    const markup = visibleItems.map((item) => {
      const itemId = normalizeId(item.id);
      const statusClass = item.status === 'done' ? 'status-pill status-pill--done' : 'status-pill status-pill--todo';
      const statusLabel = item.status === 'done' ? 'Completata' : 'Da fare';
      const textClass = item.status === 'done' ? 'item-card__text item-card__text--done' : 'item-card__text';
      const safeText = escapeHtml(item.text);
      const safeDescription = escapeHtml(getItemDescription(item));
      const itemDate = formatDate(item.updated_at || item.created_at);

      return (
        `<li class="item-row">` +
          `<article class="item-card">` +
            `<span class="${statusClass}">${statusLabel}</span>` +
            `<h3 class="${textClass}">${safeText}</h3>` +
            `${safeDescription ? `<p class="item-card__description">${safeDescription}</p>` : ''}` +
            `<div class="item-card__footer">` +
              `<span class="item-card__date">${escapeHtml(itemDate)}</span>` +
            `<div class="item-actions">` +
              `<button type="button" class="text-action text-action--muted" data-item-id="${itemId}" data-action="${ITEM_ACTION_TOGGLE}">${item.status === 'done' ? 'Riapri' : 'Completa'}</button>` +
              `<button type="button" class="text-action" data-item-id="${itemId}" data-action="${ITEM_ACTION_EDIT}">Modifica</button>` +
              `<button type="button" class="text-action text-action--danger" data-item-id="${itemId}" data-action="${ITEM_ACTION_DELETE}">Elimina</button>` +
            `</div>` +
            `</div>` +
          `</article>` +
        `</li>`
      );
    }).join('');

    ui.items.innerHTML = markup;
  }

  function renderFilters() {
    ui.itemsContainer.querySelectorAll('[data-filter]').forEach((button) => {
      const isActive = button.dataset.filter === state.itemFilter;
      button.classList.toggle('button--primary', isActive);
      button.classList.toggle('button--outline', !isActive);
      button.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
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
      setState({ loading: false, error: toUiError(error, 'Unable to create list') });
    }
  }

  async function handlePromptCreateList() {
    const nextTitle = window.prompt('Nome lista');
    if (!nextTitle || !nextTitle.trim()) {
      return;
    }

    ui.listInput.value = nextTitle.trim();
    await handleCreateList(new Event('submit'));
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
      const [items, counts] = await Promise.all([
        getItems(activeListId),
        getListCounts(state.lists)
      ]);
      setState({
        selectedListId: activeListId,
        items: items,
        listItemCounts: counts,
        loading: false,
        error: null
      });
    } catch (error) {
      setState({
        selectedListId: activeListId,
        loading: false,
        error: toUiError(error, 'Unable to add item')
      });
    }
  }

  async function handlePromptCreateItem() {
    const activeListId = state.selectedListId;
    if (!activeListId) {
      return;
    }

    const text = window.prompt('Nuova nota');
    if (!text || !text.trim()) {
      return;
    }

    ui.itemInput.value = text.trim();
    await handleCreateItem(new Event('submit'));
  }

  async function refreshSelectedItems(listId = state.selectedListId) {
    const activeListId = normalizeId(listId);

    if (!activeListId) {
      setState({ selectedListId: null, items: [] });
      return;
    }

    const [items, counts] = await Promise.all([
      getItems(activeListId),
      getListCounts(state.lists)
    ]);
    setState({
      selectedListId: activeListId,
      items: items,
      listItemCounts: counts,
      loading: false,
      error: null
    });
  }

  async function showListsOverview() {
    setState({ selectedListId: null, items: [], itemFilter: 'all', error: null });
    setSidebarOpen(false);
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

      const nextTitle = window.prompt('Modifica titolo lista', current.title);
      if (!nextTitle || !nextTitle.trim()) {
        return;
      }

      setState({ loading: true, error: null });
      try {
        await updateList(listId, nextTitle.trim());
        await loadListsAndMaybeItems(state.selectedListId);
      } catch (error) {
        setState({ loading: false, error: toUiError(error, 'Unable to update list') });
      }

      return;
    }

    if (action === LIST_ACTION_DELETE) {
      const confirmed = window.confirm('Eliminare questa lista e tutte le note?');
      if (!confirmed) {
        return;
      }

      setState({ loading: true, error: null });
      try {
        await deleteList(listId);
        const nextSelection = normalizeId(listId) === state.selectedListId ? null : state.selectedListId;
        await loadListsAndMaybeItems(nextSelection);
      } catch (error) {
        setState({ loading: false, error: toUiError(error, 'Unable to delete list') });
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
        setState({ selectedListId: activeListId, loading: false, error: toUiError(error, 'Unable to update item') });
      }

      return;
    }

    if (action === ITEM_ACTION_EDIT) {
      const nextText = window.prompt('Modifica nota', current.text);
      if (!nextText || !nextText.trim()) {
        return;
      }

      setState({ selectedListId: activeListId, loading: true, error: null });
      try {
        await updateItem(activeListId, itemId, { text: nextText.trim() });
        await refreshSelectedItems(activeListId);
      } catch (error) {
        setState({ selectedListId: activeListId, loading: false, error: toUiError(error, 'Unable to update item') });
      }

      return;
    }

    if (action === ITEM_ACTION_DELETE) {
      const confirmed = window.confirm('Eliminare questa nota?');
      if (!confirmed) {
        return;
      }

      setState({ selectedListId: activeListId, loading: true, error: null });
      try {
        await deleteItem(activeListId, itemId);
        await refreshSelectedItems(activeListId);
      } catch (error) {
        setState({ selectedListId: activeListId, loading: false, error: toUiError(error, 'Unable to delete item') });
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
    setState({ selectedListId: normalized, items: [], itemFilter: 'all', loading: true, error: null });

    try {
      const items = await getItems(normalized);
      setState({ selectedListId: normalized, items: items, itemFilter: 'all', loading: false, error: null });
      setSidebarOpen(false);
    } catch (error) {
      setState({ selectedListId: normalized, items: [], loading: false, error: toUiError(error, 'Unable to load items') });
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
    }

    let items = [];
    const itemEntries = await Promise.all(lists.map(async (list) => {
      const listId = normalizeId(list.id);
      const listItems = await getItems(listId);
      return [listId, listItems];
    }));
    const listItemCounts = {};
    itemEntries.forEach(([listId, listItems]) => {
      listItemCounts[listId] = listItems.length;
      if (listId === selected) {
        items = listItems;
      }
    });

    setState({
      lists: lists,
      selectedListId: selected,
      items: items,
      listItemCounts: listItemCounts,
      loading: false,
      error: null
    });
  }

  async function getListCounts(lists) {
    const entries = await Promise.all(lists.map(async (list) => {
      const listId = normalizeId(list.id);
      const listItems = await getItems(listId);
      return [listId, listItems.length];
    }));

    return entries.reduce((counts, [listId, count]) => {
      counts[listId] = count;
      return counts;
    }, {});
  }

  function getInitialListId() {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('list');
    if (fromQuery) {
      return fromQuery;
    }

    const hashMatch = window.location.hash.match(/^#list-(.+)$/);
    return hashMatch ? hashMatch[1] : null;
  }

  /**
   * Initialize event bindings and initial data load.
   * @returns {Promise<void>}
   */
  async function init() {
    ui.listForm.addEventListener('submit', handleCreateList);
    ui.itemForm.addEventListener('submit', handleCreateItem);
    ui.newListButton.addEventListener('click', handlePromptCreateList);
    ui.newItemButton.addEventListener('click', handlePromptCreateItem);
    ui.editListButton.addEventListener('click', async () => {
      if (state.selectedListId) {
        await handleListAction(LIST_ACTION_EDIT, state.selectedListId);
      }
    });
    ui.overviewButton.addEventListener('click', showListsOverview);

    ui.listsContainer.addEventListener('click', async (event) => {
      const trigger = event.target.closest('[data-list-id][data-action]');
      if (!trigger) {
        return;
      }

      await handleListAction(trigger.dataset.action, trigger.dataset.listId);
    });

    ui.listCards.addEventListener('click', async (event) => {
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

    ui.itemsContainer.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-filter]');
      if (!trigger) {
        return;
      }

      setState({ itemFilter: trigger.dataset.filter || 'all' });
    });

    ui.menuToggle.addEventListener('click', () => setSidebarOpen(true));
    ui.closeSidebar.addEventListener('click', () => setSidebarOpen(false));
    ui.sidebarBackdrop.addEventListener('click', () => setSidebarOpen(false));
    window.addEventListener('resize', () => setSidebarOpen(false));

    setState({ loading: true, error: null });

    try {
      await loadListsAndMaybeItems(getInitialListId());
    } catch (error) {
      setState({ loading: false, error: toUiError(error, 'Unable to load lists') });
    }
  }

  init();
})();
