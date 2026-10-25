/* Itsak Workspace. Plain JavaScript, no build step.
   The page keeps a copy of data/workspace.json in `state.data`; every change goes to api.php,
   which answers with the saved file, and the page re-renders from that. */
(() => {
  'use strict';

  /* ---------- Text, English and Arabic ---------- */

  const I18N = {
    en: {
      today: 'Today', desks: 'Desks', tasks: 'Tasks', calendar: 'Calendar', notes: 'Notes & info',
      newTask: 'New task', editTask: 'Edit task', newDesk: 'New desk', editDesk: 'Edit desk', newNote: 'New note', editNote: 'Edit note',
      morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening',
      overdue: 'Overdue', dueToday: 'Due today', next7: 'Next 7 days', done7: 'Done, last 7 days',
      deadlines: 'Your tasks', comingUp: 'Coming up', later: 'Later', allClear: 'No open tasks. Tap + to add one.',
      inProgress: 'In progress', pinned: 'Pinned', noPinned: 'Pin a note to keep it on this page.',
      todo: 'To do', doing: 'Doing', done: 'Done',
      low: 'Low', normal: 'Normal', high: 'High',
      title: 'Title', desk: 'Desk', status: 'Status', priority: 'Priority', due: 'Deadline', details: 'Details',
      name: 'Name', color: 'Colour', description: 'Description', body: 'Text', pin: 'Pin to Today',
      save: 'Save', cancel: 'Cancel', close: 'Close', delete: 'Delete', edit: 'Edit',
      noDesk: 'No desk', allDesks: 'All desks', search: 'Search',
      notesShort: 'Notes', moreMenu: 'More', mainNav: 'Main', dueCount: '{n} due',
      open: 'Open', all: 'All', sortDue: 'By deadline', sortNew: 'Newest first', sortMine: 'My order',
      dragToMove: 'Drag to change the order (or use the arrow keys)', sortHint: 'Drag ⋮⋮ to change the order',
      markDone: 'Mark as done', markOpen: 'Mark as not done',
      confirmTask: 'Delete this task?', confirmNote: 'Delete this note?',
      confirmDesk: 'Delete the desk "{name}" together with its {tasks} tasks and {notes} notes?',
      saved: 'Saved', deleted: 'Deleted', serverDown: 'Could not reach the server. Is PHP running?',
      exportData: 'Export backup', importData: 'Import backup', signOut: 'Sign out', switchLang: 'العربية',
      importAsk: 'Replace everything in the workspace with "{file}"? A copy of the current data is kept in data/backups.',
      imported: 'Backup imported', badFile: 'This file is not a workspace backup.',
      dueTodayShort: 'Today', tomorrow: 'Tomorrow', yesterday: '1 day late', inDays: 'In {n} days', late: '{n} days late',
      openCount: '{n} open', doneOf: '{done} of {total} done', nextDue: 'Next deadline: {d}', noDue: 'No deadline set',
      noDesks: 'No desks yet. A desk holds the tasks and notes for one client, project or area of your work.',
      noNotes: 'No notes yet. Keep links, contacts, ideas and meeting notes here.',
      noTasks: 'No tasks match.', dropHere: 'Nothing here', deskNotes: 'Notes for this desk', addNote: 'Add note',
      monthDeadlines: 'Deadlines this month', noMonthDeadlines: 'No deadlines this month.',
      prevMonth: 'Previous month', nextMonth: 'Next month', thisMonth: 'This month', more: '+{n} more',
      addOn: 'New task on {d}', updated: 'Updated {d}', backToDesks: 'All desks', taskCount: '{n} tasks',
      shortcut: 'Press N for a new task', noteWord: 'notes', openWord: 'open',
      noDeadline: 'No deadline', showAll: 'Show all {n}', checklist: 'Steps', addStep: 'Add a step and press Enter',
      removeStep: 'Remove step', undo: 'Undo', markedDone: 'Marked as done', taskDeleted: 'Task deleted', noteDeleted: 'Note deleted',
      noDate: 'No date', nextWeek: 'Next week', pickDate: 'Pick a date',
    },
    ar: {
      today: 'اليوم', desks: 'المكاتب', tasks: 'المهام', calendar: 'التقويم', notes: 'ملاحظات ومعلومات',
      newTask: 'مهمة جديدة', editTask: 'تعديل المهمة', newDesk: 'مكتب جديد', editDesk: 'تعديل المكتب', newNote: 'ملاحظة جديدة', editNote: 'تعديل الملاحظة',
      morning: 'صباح الخير', afternoon: 'مساء الخير', evening: 'مساء الخير',
      overdue: 'متأخرة', dueToday: 'موعدها اليوم', next7: 'خلال 7 أيام', done7: 'أُنجزت آخر 7 أيام',
      deadlines: 'مهامك', comingUp: 'القادمة', later: 'لاحقًا', allClear: 'لا توجد مهام مفتوحة. اضغط + لإضافة مهمة.',
      inProgress: 'قيد العمل', pinned: 'مثبتة', noPinned: 'ثبّت ملاحظة لتظهر في هذه الصفحة.',
      todo: 'للعمل', doing: 'قيد العمل', done: 'منجزة',
      low: 'منخفضة', normal: 'عادية', high: 'عالية',
      title: 'العنوان', desk: 'المكتب', status: 'الحالة', priority: 'الأولوية', due: 'الموعد النهائي', details: 'التفاصيل',
      name: 'الاسم', color: 'اللون', description: 'الوصف', body: 'النص', pin: 'تثبيت في صفحة اليوم',
      save: 'حفظ', cancel: 'إلغاء', close: 'إغلاق', delete: 'حذف', edit: 'تعديل',
      noDesk: 'بدون مكتب', allDesks: 'كل المكاتب', search: 'بحث',
      notesShort: 'الملاحظات', moreMenu: 'المزيد', mainNav: 'القائمة الرئيسية', dueCount: '{n} مستحقة',
      open: 'المفتوحة', all: 'الكل', sortDue: 'حسب الموعد', sortNew: 'الأحدث أولًا', sortMine: 'ترتيبي',
      dragToMove: 'اسحب لتغيير الترتيب (أو استخدم الأسهم)', sortHint: 'اسحب ⋮⋮ لتغيير الترتيب',
      markDone: 'تحديد كمنجزة', markOpen: 'إلغاء الإنجاز',
      confirmTask: 'حذف هذه المهمة؟', confirmNote: 'حذف هذه الملاحظة؟',
      confirmDesk: 'حذف المكتب "{name}" مع {tasks} مهام و{notes} ملاحظات؟',
      saved: 'تم الحفظ', deleted: 'تم الحذف', serverDown: 'تعذّر الاتصال بالخادم. هل PHP يعمل؟',
      exportData: 'تصدير نسخة احتياطية', importData: 'استيراد نسخة احتياطية', signOut: 'تسجيل الخروج', switchLang: 'English',
      importAsk: 'استبدال كل محتوى مساحة العمل بالملف "{file}"؟ تُحفظ نسخة من البيانات الحالية في data/backups.',
      imported: 'تم الاستيراد', badFile: 'هذا الملف ليس نسخة احتياطية لمساحة العمل.',
      dueTodayShort: 'اليوم', tomorrow: 'غدًا', yesterday: 'متأخرة يومًا', inDays: 'بعد {n} أيام', late: 'متأخرة {n} أيام',
      openCount: '{n} مفتوحة', doneOf: '{done} من {total} منجزة', nextDue: 'أقرب موعد: {d}', noDue: 'لا يوجد موعد',
      noDesks: 'لا توجد مكاتب بعد. المكتب يجمع مهام وملاحظات عميل أو مشروع أو جانب من عملك.',
      noNotes: 'لا توجد ملاحظات بعد. احفظ هنا الروابط وجهات الاتصال والأفكار وملاحظات الاجتماعات.',
      noTasks: 'لا توجد مهام مطابقة.', dropHere: 'لا شيء هنا', deskNotes: 'ملاحظات هذا المكتب', addNote: 'إضافة ملاحظة',
      monthDeadlines: 'مواعيد هذا الشهر', noMonthDeadlines: 'لا مواعيد هذا الشهر.',
      prevMonth: 'الشهر السابق', nextMonth: 'الشهر التالي', thisMonth: 'هذا الشهر', more: '+{n} أخرى',
      addOn: 'مهمة جديدة يوم {d}', updated: 'آخر تعديل {d}', backToDesks: 'كل المكاتب', taskCount: '{n} مهام',
      shortcut: 'اضغط N لمهمة جديدة', noteWord: 'ملاحظات', openWord: 'مفتوحة',
      noDeadline: 'بدون موعد', showAll: 'عرض الكل ({n})', checklist: 'الخطوات', addStep: 'أضف خطوة واضغط Enter',
      removeStep: 'حذف الخطوة', undo: 'تراجع', markedDone: 'تم الإنجاز', taskDeleted: 'تم حذف المهمة', noteDeleted: 'تم حذف الملاحظة',
      noDate: 'بدون موعد', nextWeek: 'الأسبوع القادم', pickDate: 'اختر تاريخًا',
    },
  };

  const DESK_COLORS = ['purple', 'lilac', 'orange', 'amber', 'red', 'zinc', 'white'];
  const STATUSES = ['todo', 'doing', 'done'];
  const PRIORITIES = ['low', 'normal', 'high'];
  const PRIORITY_RANK = { high: 0, normal: 1, low: 2 };

  const store = {
    get(key) { try { return localStorage.getItem('itsak-ws-' + key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem('itsak-ws-' + key, value); } catch { /* private window */ } },
  };

  const now = new Date();
  const state = {
    data: { desks: [], tasks: [], notes: [] },
    lang: (store.get('lang') || (navigator.language || '').slice(0, 2)) === 'ar' ? 'ar' : 'en',
    route: { view: 'today', id: null },
    filters: { q: '', desk: '', status: 'open', sort: 'mine', noteQ: '', noteDesk: '' },
    month: [now.getFullYear(), now.getMonth()],
  };

  const tr = (key, vars = {}) =>
    (I18N[state.lang][key] ?? I18N.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');

  /* ---------- Small helpers ---------- */

  const $ = (sel) => document.querySelector(sel);
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const linkify = (html) => html.replace(/https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"]/g,
    (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);

  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const todayYmd = () => ymd(new Date());
  const parseYmd = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (s, n) => { const d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); };
  const daysFrom = (a, b) => Math.round((parseYmd(b) - parseYmd(a)) / 86400000);
  const locale = () => (state.lang === 'ar' ? 'ar-u-ca-gregory-nu-latn' : 'en-GB');
  const fmt = (date, opts) => new Intl.DateTimeFormat(locale(), opts).format(typeof date === 'string' ? parseYmd(date) : date);
  const fmtShort = (s) => fmt(s, { day: 'numeric', month: 'short' });
  const fmtLong = (s) => fmt(s, { weekday: 'long', day: 'numeric', month: 'long' });

  const deskById = (id) => state.data.desks.find((d) => d.id === id) || null;
  const taskById = (id) => state.data.tasks.find((t) => t.id === id) || null;
  const noteById = (id) => state.data.notes.find((n) => n.id === id) || null;
  const isOpen = (t) => t.status !== 'done';

  // Which group a task falls into on the Today page.
  function bucket(t, today = todayYmd()) {
    if (!isOpen(t)) return 'done';
    if (!t.due) return 'nodate';
    if (t.due < today) return 'overdue';
    if (t.due === today) return 'today';
    return t.due <= addDays(today, 7) ? 'week' : 'later';
  }

  // "My order": the order you set by dragging. Tasks from before ordering existed come last, newest first.
  const byOrder = (a, b) =>
    (a.order ?? Infinity) - (b.order ?? Infinity) || (b.created || '').localeCompare(a.created || '');

  const byDeadline = (a, b) =>
    (a.due || '9999').localeCompare(b.due || '9999') ||
    PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
    byOrder(a, b);

  function deskStats(id) {
    const tasks = state.data.tasks.filter((t) => t.deskId === id);
    const open = tasks.filter(isOpen);
    const today = todayYmd();
    return {
      total: tasks.length,
      open: open.length,
      done: tasks.length - open.length,
      overdue: open.filter((t) => t.due && t.due < today).length,
      next: open.filter((t) => t.due).sort(byDeadline)[0] || null,
      notes: state.data.notes.filter((n) => n.deskId === id).length,
    };
  }

  /* ---------- Icons (24px stroke) ---------- */

  const ICON_PATHS = {
    today: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    desks: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    tasks: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3 6 1.5 1.5L7 5M3 12l1.5 1.5L7 11M3 18l1.5 1.5L7 17"/>',
    calendar: '<rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
    notes: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    upload: '<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z"/>',
    logout: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>',
    pin: '<path d="M9 4h6l-1 6 3 3H7l3-3zM12 13v7"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    grip: '<circle cx="9" cy="6" r=".9"/><circle cx="15" cy="6" r=".9"/><circle cx="9" cy="12" r=".9"/><circle cx="15" cy="12" r=".9"/><circle cx="9" cy="18" r=".9"/><circle cx="15" cy="18" r=".9"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    more: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
  };
  const icon = (name, cls = '') =>
    `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name]}</svg>`;

  /* ---------- Talking to api.php ---------- */

  async function api(body) {
    let res;
    try {
      res = await fetch('api.php', {
        method: body ? 'POST' : 'GET',
        headers: { 'X-Requested-With': 'itsak', ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'same-origin',
        cache: 'no-store',
      });
    } catch {
      throw new Error(tr('serverDown'));
    }
    if (res.status === 401) { location.reload(); throw new Error(''); }
    let json = null;
    try { json = await res.json(); } catch { /* not JSON, handled below */ }
    if (!res.ok || !json || !json.ok) throw new Error((json && json.error) || tr('serverDown'));
    return json;
  }

  async function change(body, message) {
    try {
      const json = await api(body);
      state.data = json.data;
      render();
      if (message) toast(message);
      return json;
    } catch (err) {
      if (err.message) toast(err.message, true);
      throw err;
    }
  }

  const saveItem = (type, item, message = tr('saved')) => change({ action: 'save', type, item }, message);

  /* ---------- Shared pieces ---------- */

  function deskChip(desk) {
    if (!desk) return '';
    return `<span class="chip c-${esc(desk.color)}"><i class="dot"></i><bdi>${esc(desk.name)}</bdi></span>`;
  }

  function dueBadge(t) {
    if (!t.due) return '';
    const n = daysFrom(todayYmd(), t.due);
    let text = fmtShort(t.due);
    let cls = '';
    if (isOpen(t)) {
      if (n < 0) { text = n === -1 ? tr('yesterday') : tr('late', { n: -n }); cls = 'is-late'; }
      else if (n === 0) { text = tr('dueTodayShort'); cls = 'is-today'; }
      else if (n === 1) { text = tr('tomorrow'); cls = 'is-soon'; }
      else if (n <= 7) { text = tr('inDays', { n }); cls = 'is-soon'; }
    }
    return `<time class="due ${cls}" datetime="${esc(t.due)}" title="${esc(fmtLong(t.due))}">${esc(text)}</time>`;
  }

  function checkButton(t) {
    const done = !isOpen(t);
    return `<button class="check" data-act="toggle" data-id="${esc(t.id)}" aria-pressed="${done}" aria-label="${esc(done ? tr('markOpen') : tr('markDone'))}">${done ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 12.5 4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}</button>`;
  }

  function stepsPill(t) {
    const steps = t.checklist || [];
    if (!steps.length) return '';
    const done = steps.filter((x) => x.done).length;
    return `<span class="pill steps ${done === steps.length ? 'is-full' : ''}">${icon('tasks')}${done}/${steps.length}</span>`;
  }

  // One-tap deadline buttons that fill the date field with id `forId`.
  function dueChips(current, forId) {
    const today = todayYmd();
    const choices = [['', tr('noDate')], [today, tr('dueTodayShort')], [addDays(today, 1), tr('tomorrow')], [addDays(today, 7), tr('nextWeek')]];
    return `<div class="chips" data-for="${forId}" role="group" aria-label="${esc(tr('due'))}">${choices.map(([value, label]) =>
      `<button type="button" class="chip-btn ${value === (current || '') ? 'is-on' : ''}" data-act="set-due" data-value="${value}">${label}</button>`).join('')}
      <input type="date" id="${forId}" name="due" value="${esc(current || '')}" class="date-mini" aria-label="${esc(tr('pickDate'))}" title="${esc(tr('pickDate'))}"></div>`;
  }

  function syncChips(input) {
    const group = input.closest('.chips');
    if (group) group.querySelectorAll('.chip-btn').forEach((b) => b.classList.toggle('is-on', b.dataset.value === input.value));
  }

  const segmented = (name, values, current) =>
    `<div class="seg-radio" role="radiogroup">${values.map((v) => `<label class="seg-opt v-${v}"><input type="radio" name="${name}" value="${v}" ${v === current ? 'checked' : ''}><span>${tr(v)}</span></label>`).join('')}</div>`;

  const stepRow = (step) => `<li class="step">
    <input type="checkbox" class="step-done" ${step.done ? 'checked' : ''} aria-label="${esc(tr('markDone'))}">
    <input class="step-text" value="${esc(step.text)}" maxlength="200" dir="auto" aria-label="${esc(tr('checklist'))}">
    <button type="button" class="icon-btn" data-act="step-remove" aria-label="${esc(tr('removeStep'))}">${icon('close')}</button>
  </li>`;

  const dragHandle = (t) =>
    `<button type="button" class="handle" id="h-${esc(t.id)}" data-handle aria-label="${esc(tr('dragToMove'))}" title="${esc(tr('dragToMove'))}">${icon('grip')}</button>`;

  function taskRow(t, { showDesk = true, sortable = false } = {}) {
    const high = t.priority === 'high' && isOpen(t);
    const meta = [
      dueBadge(t),
      showDesk ? deskChip(deskById(t.deskId)) : '',
      t.status === 'doing' ? `<span class="pill doing">${tr('doing')}</span>` : '',
      high ? `<span class="pill high">${tr('high')}</span>` : '',
      stepsPill(t),
    ].join('');
    return `<li class="task ${isOpen(t) ? '' : 'is-done'} ${high ? 'is-high' : ''}" data-sort-id="${esc(t.id)}">
      ${sortable ? dragHandle(t) : ''}${checkButton(t)}
      <button class="task-open" data-act="edit-task" data-id="${esc(t.id)}">
        <span class="task-title" dir="auto">${esc(t.title)}</span>
        ${meta ? `<span class="task-meta">${meta}</span>` : ''}
      </button>
    </li>`;
  }

  // With opts.sortKey the list can be reordered by dragging; lists sharing a key exchange tasks.
  const taskList = (tasks, opts = {}) =>
    `<ul class="tasks" ${opts.sortKey ? `data-sort-list="${opts.sortKey}"` : ''}>${tasks.map((t) => taskRow(t, { ...opts, sortable: !!opts.sortKey })).join('')}</ul>`;

  function pageHead(eyebrow, title, actions = '') {
    return `<header class="page-head">
      <div>${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}<h1 dir="auto">${title}</h1></div>
      ${actions ? `<div class="actions">${actions}</div>` : ''}
    </header>`;
  }

  // Phones use the + in the tab bar instead.
  const newTaskButton = (attrs = '') =>
    `<button class="btn primary hide-phone" data-act="new-task" ${attrs}>${icon('plus')}<span>${tr('newTask')}</span></button>`;

  const deskOptions = (selected, { any = false } = {}) =>
    (any ? `<option value="">${tr('allDesks')}</option>` : '') +
    `<option value="${any ? 'none' : ''}" ${(any ? selected === 'none' : !selected) ? 'selected' : ''}>${tr('noDesk')}</option>` +
    state.data.desks.map((d) => `<option value="${esc(d.id)}" ${d.id === selected ? 'selected' : ''}>${esc(d.name)}</option>`).join('');

  const options = (values, selected) =>
    values.map((v) => `<option value="${v}" ${v === selected ? 'selected' : ''}>${tr(v)}</option>`).join('');

  function noteCard(n) {
    const desk = deskById(n.deskId);
    const body = n.body.length > 400 ? n.body.slice(0, 400) + '…' : n.body;
    return `<article class="note ${n.pinned ? 'is-pinned' : ''}">
      <header class="note-head">
        <button class="note-title" data-act="edit-note" data-id="${esc(n.id)}" dir="auto">${esc(n.title || n.body.split('\n')[0])}</button>
        <button class="icon-btn ${n.pinned ? 'is-on' : ''}" data-act="pin" data-id="${esc(n.id)}" aria-pressed="${n.pinned}" aria-label="${esc(tr('pin'))}" title="${esc(tr('pin'))}">${icon('pin')}</button>
      </header>
      ${n.title && body ? `<p class="note-body" dir="auto">${linkify(esc(body))}</p>` : ''}
      <footer class="note-foot">${deskChip(desk)}<span class="muted">${esc(tr('updated', { d: fmtShort(n.updated.slice(0, 10)) }))}</span></footer>
    </article>`;
  }

  /* ---------- Sidebar ---------- */

  function renderSide() {
    const today = todayYmd();
    const open = state.data.tasks.filter(isOpen);
    const urgent = open.filter((t) => t.due && t.due <= today).length;
    const nav = [
      ['today', urgent],
      ['desks', state.data.desks.length],
      ['tasks', open.length],
      ['calendar', 0],
      ['notes', state.data.notes.length],
    ];
    const current = state.route.view === 'desk' ? 'desks' : state.route.view;
    $('#side').innerHTML = `
      <a class="brand" href="#today" aria-label="Itsak.tech Workspace">
        <img src="assets/img/logo-full-white.svg" alt="" width="148" height="40">
        <span class="brand-tag">Workspace</span>
      </a>
      <nav class="nav" aria-label="Main">
        ${nav.map(([view, count]) => `<a href="#${view}" class="nav-link ${current === view ? 'is-active' : ''}" ${current === view ? 'aria-current="page"' : ''}>
          ${icon(view)}<span>${tr(view)}</span>${count ? `<span class="count ${view === 'today' ? 'is-hot' : ''}">${count}</span>` : ''}</a>`).join('')}
      </nav>
      <div class="side-desks">
        <p class="side-label">${tr('desks')}</p>
        ${state.data.desks.map((d) => {
          const s = deskStats(d.id);
          const active = state.route.view === 'desk' && state.route.id === d.id;
          return `<a href="#desk/${esc(d.id)}" class="side-desk c-${esc(d.color)} ${active ? 'is-active' : ''}" ${active ? 'aria-current="page"' : ''}>
            <i class="dot"></i><bdi>${esc(d.name)}</bdi>${s.overdue ? `<span class="count is-hot">${s.overdue}</span>` : s.open ? `<span class="count">${s.open}</span>` : ''}</a>`;
        }).join('')}
        <button class="side-desk side-add" data-act="new-desk">${icon('plus')}<span>${tr('newDesk')}</span></button>
      </div>
      <div class="side-foot">
        <button class="foot-btn" data-act="lang" lang="${state.lang === 'ar' ? 'en' : 'ar'}">${icon('globe')}<span>${tr('switchLang')}</span></button>
        <button class="foot-btn" data-act="export">${icon('download')}<span>${tr('exportData')}</span></button>
        <button class="foot-btn" data-act="import">${icon('upload')}<span>${tr('importData')}</span></button>
        ${document.body.dataset.auth === '1' ? `<button class="foot-btn" data-act="logout">${icon('logout')}<span>${tr('signOut')}</span></button>` : ''}
      </div>
      <div class="phone-actions">
        <a href="#calendar" class="top-btn ${current === 'calendar' ? 'is-active' : ''}" ${current === 'calendar' ? 'aria-current="page"' : ''} aria-label="${esc(tr('calendar'))}">${icon('calendar')}</a>
        <button class="top-btn" data-act="more" aria-haspopup="dialog" aria-label="${esc(tr('moreMenu'))}">${icon('more')}</button>
      </div>`;
    renderTabbar(current, urgent);
  }

  // Phone navigation: four places and a big + in the middle, like an app.
  function renderTabbar(current, urgent) {
    const tab = (view, label, badge = 0) => `<a href="#${view}" class="tab ${current === view ? 'is-active' : ''}" ${current === view ? 'aria-current="page"' : ''}
        aria-label="${esc(label + (badge ? ', ' + tr('dueCount', { n: badge }) : ''))}">
        <span class="tab-icon">${icon(view)}${badge ? `<span class="tab-badge" aria-hidden="true">${badge > 99 ? '99+' : badge}</span>` : ''}</span>
        <span class="tab-label" aria-hidden="true">${esc(label)}</span></a>`;
    const bar = $('#tabbar');
    bar.setAttribute('aria-label', tr('mainNav'));
    bar.innerHTML = `
      ${tab('today', tr('today'), urgent)}
      ${tab('desks', tr('desks'))}
      <button class="tab tab-add" data-act="new-task" aria-label="${esc(tr('newTask'))}"><span class="tab-add-circle">${icon('plus')}</span></button>
      ${tab('tasks', tr('tasks'))}
      ${tab('notes', tr('notesShort'))}`;
  }

  function moreSheet() {
    const item = (act, name, label, attrs = '') =>
      `<button type="button" class="sheet-item" data-act="${act}" ${attrs}>${icon(name)}<span>${label}</span></button>`;
    openModal(`<div class="sheet">
      <header class="modal-head"><h2>${tr('moreMenu')}</h2>
        <button type="button" class="icon-btn" data-act="close" aria-label="${esc(tr('close'))}">${icon('close')}</button></header>
      <div class="sheet-list">
        ${item('lang', 'globe', tr('switchLang'), `lang="${state.lang === 'ar' ? 'en' : 'ar'}"`)}
        ${item('export', 'download', tr('exportData'))}
        ${item('import', 'upload', tr('importData'))}
        ${document.body.dataset.auth === '1' ? item('logout', 'logout', tr('signOut')) : ''}
      </div>
    </div>`);
  }

  /* ---------- Views ---------- */

  function viewToday() {
    const today = todayYmd();
    const hour = new Date().getHours();
    const greeting = tr(hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening');
    const open = state.data.tasks.filter(isOpen).sort(byDeadline);
    const groups = { overdue: [], today: [], week: [] };
    open.forEach((t) => { const b = bucket(t, today); if (groups[b]) groups[b].push(t); });
    groups.today.sort(byOrder);
    const doing = open.filter((t) => t.status === 'doing' && !['overdue', 'today', 'week'].includes(bucket(t, today))).sort(byOrder);
    const noDate = open.filter((t) => !t.due && t.status !== 'doing').sort(byOrder);
    const later = open.filter((t) => bucket(t, today) === 'later' && t.status !== 'doing');
    const weekAgo = Date.now() - 7 * 86400000;
    const doneWeek = state.data.tasks.filter((t) => !isOpen(t) && t.doneAt && Date.parse(t.doneAt) >= weekAgo).length;
    const pinned = state.data.notes.filter((n) => n.pinned).sort((a, b) => b.updated.localeCompare(a.updated));

    const stat = (cls, label, value) => `<div class="stat ${cls} ${value ? '' : 'is-zero'}"><span class="stat-value">${value}</span><span class="stat-label">${label}</span></div>`;
    const section = (title, cls, tasks, limit = 0, sortKey = '') => tasks.length
      ? `<section class="group ${cls}"><h3>${title}<span class="group-count">${tasks.length}</span></h3>${taskList(limit ? tasks.slice(0, limit) : tasks, { sortKey: tasks.length > 1 ? sortKey : '' })}
        ${limit && tasks.length > limit ? `<a class="show-all" href="#tasks">${tr('showAll', { n: tasks.length })}</a>` : ''}</section>` : '';

    return `
      ${pageHead(esc(fmtLong(today)), esc(greeting), newTaskButton(`data-due="${today}"`))}
      <div class="stats">
        ${stat('is-late', tr('overdue'), groups.overdue.length)}
        ${stat('is-today', tr('dueToday'), groups.today.length)}
        ${stat('is-soon', tr('next7'), groups.week.length)}
        ${stat('is-done', tr('done7'), doneWeek)}
      </div>
      <div class="today-grid">
        <div class="today-tasks">
          <h2 class="section-title">${tr('deadlines')}</h2>
          ${section(tr('overdue'), 'is-late', groups.overdue)}
          ${section(tr('dueToday'), 'is-today', groups.today, 0, 'today')}
          ${section(tr('comingUp'), 'is-soon', groups.week)}
          ${section(tr('inProgress'), 'is-doing', doing, 0, 'doing')}
          ${section(tr('noDeadline'), 'is-nodate', noDate, 8, 'nodate')}
          ${section(tr('later'), 'is-later', later, 5)}
          ${open.length ? '' : `<p class="empty">${tr('allClear')}</p>`}
        </div>
        <div class="today-side">
          <div class="panel">
            <h2>${tr('desks')}</h2>
            ${state.data.desks.length ? `<ul class="mini-desks">${state.data.desks.map((d) => {
              const s = deskStats(d.id);
              const pct = s.total ? Math.round((s.done / s.total) * 100) : 0;
              return `<li><a href="#desk/${esc(d.id)}" class="mini-desk c-${esc(d.color)}">
                <span class="mini-desk-top">${deskChip(d)}<span class="muted">${tr('doneOf', { done: s.done, total: s.total })}</span></span>
                <span class="bar"><i style="width:${pct}%"></i></span>
                ${s.overdue ? `<span class="mini-alert">${tr('overdue')}: ${s.overdue}</span>` : ''}
              </a></li>`;
            }).join('')}</ul>` : `<p class="empty">${tr('noDesks')}</p>`}
          </div>
          <div class="panel">
            <h2>${tr('pinned')}</h2>
            ${pinned.length ? `<div class="notes-stack">${pinned.map(noteCard).join('')}</div>` : `<p class="empty">${tr('noPinned')}</p>`}
          </div>
        </div>
      </div>
      <p class="hint">${tr('shortcut')}</p>`;
  }

  function viewDesks() {
    const cards = state.data.desks.map((d) => {
      const s = deskStats(d.id);
      const pct = s.total ? Math.round((s.done / s.total) * 100) : 0;
      return `<a class="desk-card c-${esc(d.color)}" href="#desk/${esc(d.id)}">
        <span class="desk-card-name"><i class="dot"></i><bdi>${esc(d.name)}</bdi></span>
        ${d.description ? `<span class="desk-card-desc" dir="auto">${esc(d.description)}</span>` : ''}
        <span class="desk-card-nums">
          <span><b>${s.open}</b> ${tr('openWord')}</span>
          ${s.overdue ? `<span class="is-late"><b>${s.overdue}</b> ${tr('overdue')}</span>` : ''}
          <span><b>${s.notes}</b> ${tr('noteWord')}</span>
        </span>
        <span class="bar"><i style="width:${pct}%"></i></span>
        <span class="desk-card-foot muted">${s.next ? esc(tr('nextDue', { d: fmtShort(s.next.due) })) : tr('noDue')}</span>
      </a>`;
    }).join('');
    return `
      ${pageHead('', tr('desks'), `<button class="btn primary" data-act="new-desk">${icon('plus')}<span>${tr('newDesk')}</span></button>`)}
      ${state.data.desks.length ? '' : `<p class="empty big">${tr('noDesks')}</p>`}
      <div class="desk-grid">${cards}
        <button class="desk-card desk-card-add" data-act="new-desk">${icon('plus')}<span>${tr('newDesk')}</span></button>
      </div>`;
  }

  function viewDesk(id) {
    const desk = deskById(id);
    if (!desk) { location.hash = '#desks'; return ''; }
    const tasks = state.data.tasks.filter((t) => t.deskId === id);
    const notes = state.data.notes.filter((n) => n.deskId === id).sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updated.localeCompare(a.updated));
    const columns = STATUSES.map((status) => {
      const list = tasks.filter((t) => t.status === status).sort(byOrder);
      return `<section class="column" aria-label="${esc(tr(status))}">
        <h3 class="column-head s-${status}">${tr(status)}<span class="group-count">${list.length}</span>
          ${status !== 'done' ? `<button class="icon-btn" data-act="new-task" data-desk="${esc(id)}" data-status="${status}" aria-label="${esc(tr('newTask'))}">${icon('plus')}</button>` : ''}
        </h3>
        <ul class="cards" data-sort-list="board" data-status="${status}">${list.map((t) => `<li class="card ${isOpen(t) ? '' : 'is-done'} ${t.priority === 'high' && isOpen(t) ? 'is-high' : ''}" data-sort-id="${esc(t.id)}">
          ${dragHandle(t)}${checkButton(t)}
          <button class="task-open" data-act="edit-task" data-id="${esc(t.id)}"><span class="task-title" dir="auto">${esc(t.title)}</span>
          ${t.notes ? `<span class="card-notes" dir="auto">${esc(t.notes.slice(0, 120))}</span>` : ''}${stepsPill(t)}</button>
          ${dueBadge(t)}
        </li>`).join('') || `<li class="column-empty">${tr('dropHere')}</li>`}</ul>
      </section>`;
    }).join('');

    return `
      <a class="back" href="#desks">${icon('chevron', 'chev flip')}<span>${tr('backToDesks')}</span></a>
      ${pageHead(`<span class="chip c-${esc(desk.color)}"><i class="dot"></i>${tr('taskCount', { n: tasks.length })}</span>`, esc(desk.name),
        `<button class="btn ghost" data-act="edit-desk" data-id="${esc(id)}">${icon('edit')}<span>${tr('editDesk')}</span></button>${newTaskButton(`data-desk="${esc(id)}"`)}`)}
      ${desk.description ? `<p class="lead" dir="auto">${linkify(esc(desk.description))}</p>` : ''}
      <div class="board">${columns}</div>
      <section class="panel">
        <h2 class="panel-head">${tr('deskNotes')}<button class="btn ghost small" data-act="new-note" data-desk="${esc(id)}">${icon('plus')}<span>${tr('addNote')}</span></button></h2>
        ${notes.length ? `<div class="note-grid">${notes.map(noteCard).join('')}</div>` : `<p class="empty">${tr('noNotes')}</p>`}
      </section>`;
  }

  function viewTasks() {
    const f = state.filters;
    const q = f.q.trim().toLowerCase();
    const list = state.data.tasks.filter((t) =>
      (f.status === 'all' || (f.status === 'open' ? isOpen(t) : t.status === f.status)) &&
      (!f.desk || (f.desk === 'none' ? !t.deskId : t.deskId === f.desk)) &&
      (!q || (t.title + ' ' + t.notes).toLowerCase().includes(q)),
    ).sort(f.sort === 'new' ? (a, b) => b.created.localeCompare(a.created)
      : (a, b) => Number(!isOpen(a)) - Number(!isOpen(b)) || (f.sort === 'mine' ? byOrder(a, b) : byDeadline(a, b)));
    const sortable = f.sort === 'mine' && list.length > 1;

    return `
      ${pageHead('', tr('tasks'), newTaskButton())}
      <div class="filters">
        <input type="search" id="f-q" data-filter="q" value="${esc(f.q)}" placeholder="${esc(tr('search'))}" aria-label="${esc(tr('search'))}" dir="auto">
        <select id="f-desk" data-filter="desk" aria-label="${esc(tr('desk'))}">${deskOptions(f.desk, { any: true })}</select>
        <select id="f-status" data-filter="status" aria-label="${esc(tr('status'))}">
          <option value="open" ${f.status === 'open' ? 'selected' : ''}>${tr('open')}</option>
          ${options(STATUSES, f.status)}
          <option value="all" ${f.status === 'all' ? 'selected' : ''}>${tr('all')}</option>
        </select>
        <select id="f-sort" data-filter="sort" aria-label="Sort">
          <option value="mine" ${f.sort === 'mine' ? 'selected' : ''}>${tr('sortMine')}</option>
          <option value="due" ${f.sort === 'due' ? 'selected' : ''}>${tr('sortDue')}</option>
          <option value="new" ${f.sort === 'new' ? 'selected' : ''}>${tr('sortNew')}</option>
        </select>
      </div>
      ${sortable ? `<p class="hint sort-hint">${tr('sortHint')}</p>` : ''}
      ${list.length ? taskList(list, { sortKey: sortable ? 'all' : '' }) : `<p class="empty big">${tr('noTasks')}</p>`}`;
  }

  function viewCalendar() {
    const [year, month] = state.month;
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = first.getDay(); // weeks start on Sunday
    const weeks = Math.ceil((offset + daysInMonth) / 7);
    const start = new Date(year, month, 1 - offset);
    const today = todayYmd();
    const byDay = {};
    state.data.tasks.filter((t) => t.due).sort(byDeadline).forEach((t) => { (byDay[t.due] ||= []).push(t); });

    const weekdays = Array.from({ length: 7 }, (_, i) => fmt(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i), { weekday: 'short' }));
    const cells = Array.from({ length: weeks * 7 }, (_, i) => {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const key = ymd(d);
      const list = byDay[key] || [];
      const shown = list.slice(0, 3);
      return `<div class="cal-cell ${d.getMonth() !== month ? 'is-out' : ''} ${key === today ? 'is-today' : ''} ${key < today ? 'is-past' : ''}">
        <button class="cal-day" data-act="new-task" data-due="${key}" aria-label="${esc(tr('addOn', { d: fmtLong(key) }))}">${d.getDate()}</button>
        <ul>${shown.map((t) => {
          const desk = deskById(t.deskId);
          return `<li><button class="cal-task c-${esc(desk ? desk.color : 'zinc')} ${isOpen(t) ? '' : 'is-done'} ${isOpen(t) && key < today ? 'is-late' : ''}" data-act="edit-task" data-id="${esc(t.id)}" dir="auto">${esc(t.title)}</button></li>`;
        }).join('')}${list.length > 3 ? `<li class="cal-more">${tr('more', { n: list.length - 3 })}</li>` : ''}</ul>
      </div>`;
    }).join('');

    const monthStart = ymd(first);
    const monthEnd = ymd(new Date(year, month, daysInMonth));
    const inMonth = state.data.tasks.filter((t) => t.due && t.due >= monthStart && t.due <= monthEnd).sort(byDeadline);
    const isThisMonth = year === new Date().getFullYear() && month === new Date().getMonth();

    return `
      ${pageHead('', esc(fmt(first, { month: 'long', year: 'numeric' })), `
        <div class="seg">
          <button class="btn ghost" data-act="month" data-step="-1" aria-label="${esc(tr('prevMonth'))}">${icon('chevron', 'chev flip')}</button>
          <button class="btn ghost" data-act="month" data-step="0" ${isThisMonth ? 'disabled' : ''}>${tr('thisMonth')}</button>
          <button class="btn ghost" data-act="month" data-step="1" aria-label="${esc(tr('nextMonth'))}">${icon('chevron', 'chev')}</button>
        </div>${newTaskButton()}`)}
      <div class="cal">
        ${weekdays.map((w) => `<div class="cal-wd">${esc(w)}</div>`).join('')}
        ${cells}
      </div>
      <section class="month-list">
        <h2 class="section-title">${tr('monthDeadlines')}</h2>
        ${inMonth.length ? taskList(inMonth) : `<p class="empty">${tr('noMonthDeadlines')}</p>`}
      </section>`;
  }

  function viewNotes() {
    const f = state.filters;
    const q = f.noteQ.trim().toLowerCase();
    const list = state.data.notes.filter((n) =>
      (!f.noteDesk || (f.noteDesk === 'none' ? !n.deskId : n.deskId === f.noteDesk)) &&
      (!q || (n.title + ' ' + n.body).toLowerCase().includes(q)),
    ).sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updated.localeCompare(a.updated));

    return `
      ${pageHead('', tr('notes'), `<button class="btn primary" data-act="new-note">${icon('plus')}<span>${tr('newNote')}</span></button>`)}
      <div class="filters">
        <input type="search" id="f-nq" data-filter="noteQ" value="${esc(f.noteQ)}" placeholder="${esc(tr('search'))}" aria-label="${esc(tr('search'))}" dir="auto">
        <select id="f-ndesk" data-filter="noteDesk" aria-label="${esc(tr('desk'))}">${deskOptions(f.noteDesk, { any: true })}</select>
      </div>
      ${list.length ? `<div class="note-grid">${list.map(noteCard).join('')}</div>` : `<p class="empty big">${tr('noNotes')}</p>`}`;
  }

  const VIEWS = { today: viewToday, desks: viewDesks, desk: () => viewDesk(state.route.id), tasks: viewTasks, calendar: viewCalendar, notes: viewNotes };

  function render() {
    // Re-rendering replaces the page, so remember which field had focus and put the cursor back.
    const active = document.activeElement;
    const focusId = active && active.id && !$('#modal').contains(active) ? active.id : null;
    let caret = null;
    try { if (focusId && active.selectionStart != null) caret = [active.selectionStart, active.selectionEnd]; } catch { /* not a text field */ }

    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
    renderSide();
    const view = VIEWS[state.route.view] || viewToday;
    $('#view').innerHTML = view();
    document.title = `${state.route.view === 'desk' && deskById(state.route.id) ? deskById(state.route.id).name : tr(state.route.view)} · Itsak Workspace`;

    if (focusId) {
      const el = document.getElementById(focusId);
      if (el) {
        el.focus();
        if (caret) try { el.setSelectionRange(...caret); } catch { /* not a text field */ }
      }
    }
  }

  /* ---------- Edit dialogs ---------- */

  const modal = $('#modal');

  function openModal(html) {
    modal.innerHTML = html;
    if (!modal.open) modal.showModal();
    const first = modal.querySelector('[autofocus]');
    if (first) first.focus();
  }

  function modalFrame(type, title, fields, id) {
    return `<form class="form" data-form="${type}" novalidate>
      <header class="modal-head"><h2>${title}</h2>
        <button type="button" class="icon-btn" data-act="close" aria-label="${esc(tr('close'))}">${icon('close')}</button></header>
      <input type="hidden" name="id" value="${esc(id || '')}">
      <div class="modal-body">${fields}</div>
      <footer class="modal-foot">
        ${id ? `<button type="button" class="btn danger" data-act="delete" data-type="${type}" data-id="${esc(id)}">${tr('delete')}</button>` : ''}
        <span class="grow"></span>
        <button type="button" class="btn ghost" data-act="close">${tr('cancel')}</button>
        <button class="btn primary">${tr('save')}</button>
      </footer>
    </form>`;
  }

  function taskModal(t) {
    openModal(modalFrame('tasks', tr(t.id ? 'editTask' : 'newTask'), `
      <label class="field"><span>${tr('title')}</span><input name="title" maxlength="200" value="${esc(t.title || '')}" dir="auto" required autofocus></label>
      <label class="field"><span>${tr('desk')}</span><select name="deskId">${deskOptions(t.deskId || '')}</select></label>
      <div class="field"><span>${tr('due')}</span>${dueChips(t.due, 'task-due')}</div>
      <div class="row">
        <div class="field"><span>${tr('status')}</span>${segmented('status', STATUSES, t.status || 'todo')}</div>
        <div class="field"><span>${tr('priority')}</span>${segmented('priority', PRIORITIES, t.priority || 'normal')}</div>
      </div>
      <div class="field"><span>${tr('checklist')}</span>
        <ul class="step-list" id="steps">${(t.checklist || []).map(stepRow).join('')}</ul>
        <input id="step-new" class="step-new" placeholder="${esc(tr('addStep'))}" maxlength="200" dir="auto" aria-label="${esc(tr('addStep'))}">
      </div>
      <label class="field"><span>${tr('details')}</span><textarea name="notes" rows="4" maxlength="5000" dir="auto">${esc(t.notes || '')}</textarea></label>`, t.id));
  }

  function deskModal(d) {
    openModal(modalFrame('desks', tr(d.id ? 'editDesk' : 'newDesk'), `
      <label class="field"><span>${tr('name')}</span><input name="name" maxlength="80" value="${esc(d.name || '')}" dir="auto" required autofocus></label>
      <fieldset class="field"><legend>${tr('color')}</legend><div class="swatches">
        ${DESK_COLORS.map((c) => `<label class="swatch c-${c}"><input type="radio" name="color" value="${c}" ${c === (d.color || 'purple') ? 'checked' : ''} aria-label="${c}"><i class="dot"></i></label>`).join('')}
      </div></fieldset>
      <label class="field"><span>${tr('description')}</span><textarea name="description" rows="3" maxlength="500" dir="auto">${esc(d.description || '')}</textarea></label>`, d.id));
  }

  function noteModal(n) {
    openModal(modalFrame('notes', tr(n.id ? 'editNote' : 'newNote'), `
      <label class="field"><span>${tr('title')}</span><input name="title" maxlength="200" value="${esc(n.title || '')}" dir="auto" autofocus></label>
      <label class="field"><span>${tr('desk')}</span><select name="deskId">${deskOptions(n.deskId || '')}</select></label>
      <label class="field"><span>${tr('body')}</span><textarea name="body" rows="10" maxlength="20000" dir="auto">${esc(n.body || '')}</textarea></label>
      <label class="check-field"><input type="checkbox" name="pinned" ${n.pinned ? 'checked' : ''}><span>${tr('pin')}</span></label>`, n.id));
  }

  /* ---------- Events ---------- */

  function route() {
    const [view, id] = location.hash.replace(/^#/, '').split('/');
    state.route = { view: VIEWS[view] ? view : 'today', id: id ? decodeURIComponent(id) : null };
    render();
    if (document.activeElement === document.body) $('#view').focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  document.addEventListener('click', async (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const { act, id } = el.dataset;
    switch (act) {
      case 'new-task':
        taskModal({ deskId: el.dataset.desk || (state.route.view === 'desk' ? state.route.id : ''), due: el.dataset.due || '', status: el.dataset.status || 'todo' });
        break;
      case 'edit-task': { const t = taskById(id); if (t) taskModal(t); break; }
      case 'toggle': {
        const t = taskById(id);
        if (!t) break;
        const before = { ...t };
        try {
          await saveItem('tasks', { ...t, status: isOpen(t) ? 'done' : 'todo' }, '');
          if (isOpen(before)) toast(tr('markedDone'), false, () => saveItem('tasks', before, ''));
        } catch { /* toast already shown */ }
        break;
      }
      case 'set-due': {
        const input = document.getElementById(el.closest('.chips').dataset.for);
        input.value = el.dataset.value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        break;
      }
      case 'step-remove': el.closest('.step').remove(); break;
      case 'new-desk': deskModal({}); break;
      case 'edit-desk': { const d = deskById(id); if (d) deskModal(d); break; }
      case 'new-note': noteModal({ deskId: el.dataset.desk || '' }); break;
      case 'edit-note': { const n = noteById(id); if (n) noteModal(n); break; }
      case 'pin': { const n = noteById(id); if (n) await saveItem('notes', { ...n, pinned: !n.pinned }, '').catch(() => {}); break; }
      case 'close': modal.close(); break;
      case 'delete': {
        const type = el.dataset.type;
        // Tasks and notes go straight away with an Undo; a desk takes its tasks with it, so ask first.
        if (type === 'desks') {
          const s = deskStats(id);
          if (!confirm(tr('confirmDesk', { name: deskById(id)?.name, tasks: s.total, notes: s.notes }))) break;
        }
        const copy = type === 'tasks' ? taskById(id) : type === 'notes' ? noteById(id) : null;
        try {
          await change({ action: 'delete', type, id }, copy ? '' : tr('deleted'));
          modal.close();
          if (copy) toast(tr(type === 'tasks' ? 'taskDeleted' : 'noteDeleted'), false, () => saveItem(type, { ...copy, id: '' }, ''));
          if (type === 'desks' && state.route.id === id) location.hash = '#desks';
        } catch { /* toast already shown */ }
        break;
      }
      case 'month': {
        const step = Number(el.dataset.step);
        const d = step === 0 ? new Date() : new Date(state.month[0], state.month[1] + step, 1);
        state.month = [d.getFullYear(), d.getMonth()];
        render();
        break;
      }
      case 'more': moreSheet(); break;
      case 'lang':
        if (modal.open) modal.close();
        state.lang = state.lang === 'ar' ? 'en' : 'ar';
        store.set('lang', state.lang);
        render();
        break;
      case 'export': if (modal.open) modal.close(); exportData(); break;
      case 'import': if (modal.open) modal.close(); $('#import-file').click(); break;
      case 'logout': $('#logout-form').submit(); break;
    }
  });

  document.addEventListener('submit', async (e) => {
    const form = e.target;
    if (!form.dataset.form) return;
    e.preventDefault();
    const type = form.dataset.form;
    const item = Object.fromEntries(new FormData(form));
    if (type === 'notes') item.pinned = form.elements.pinned.checked;
    if (type === 'tasks') {
      const pending = form.querySelector('#step-new').value.trim();
      item.checklist = [...form.querySelectorAll('.step')]
        .map((li) => ({ text: li.querySelector('.step-text').value.trim(), done: li.querySelector('.step-done').checked }))
        .concat(pending ? [{ text: pending, done: false }] : [])
        .filter((step) => step.text);
    }
    const required = form.querySelector('[required]');
    if (required && !required.value.trim()) { required.focus(); required.reportValidity(); return; }
    try {
      const json = await saveItem(type, item);
      modal.close();
      if (type === 'desks' && !item.id && json.id) location.hash = '#desk/' + json.id;
    } catch { /* toast already shown, keep the dialog open */ }
  });

  document.addEventListener('input', (e) => {
    const el = e.target;
    if (el.type === 'date') syncChips(el);
    if (el.dataset.filter) { state.filters[el.dataset.filter] = el.value; render(); }
  });

  // Enter in the steps list adds a step instead of saving the task.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.isComposing) return;
    if (e.target.id === 'step-new') {
      e.preventDefault();
      const text = e.target.value.trim();
      if (!text) return;
      $('#steps').insertAdjacentHTML('beforeend', stepRow({ text, done: false }));
      e.target.value = '';
    } else if (e.target.classList.contains('step-text')) {
      e.preventDefault();
      $('#step-new').focus();
    }
  });

  // Dialog closes when clicking the dark backdrop around it.
  modal.addEventListener('mousedown', (e) => { if (e.target === modal) modal.close(); });

  // N opens a new task, unless you are typing somewhere.
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() !== 'n' || e.ctrlKey || e.metaKey || e.altKey || modal.open) return;
    if (e.target.closest('input, textarea, select, button, [contenteditable]')) return;
    e.preventDefault();
    taskModal({ deskId: state.route.view === 'desk' ? state.route.id : '', due: '', status: 'todo' });
  });

  /* ---------- Reordering ----------
     Press the ⋮⋮ handle and move (mouse or finger); the task moves live and its place is saved on release.
     Lists with the same data-sort-list exchange tasks (the board columns), and data-status on the
     list it lands in becomes the task's status. On a focused handle, the arrow keys move it one step. */

  let drag = null;
  const sortItems = (list) => [...list.children].filter((el) => el.dataset.sortId);

  async function saveOrder(item, list) {
    const body = { action: 'reorder', ids: sortItems(list).map((el) => el.dataset.sortId), id: item.dataset.sortId };
    if (list.dataset.status) body.status = list.dataset.status;
    try { await change(body, ''); } catch { render(); }
  }

  document.addEventListener('pointerdown', (e) => {
    const handle = e.target.closest('[data-handle]');
    if (!handle || e.button > 0) return;
    e.preventDefault();
    const item = handle.closest('[data-sort-id]');
    handle.setPointerCapture(e.pointerId);
    drag = { item, from: item.parentElement, next: item.nextElementSibling, x: e.clientX, y: e.clientY, moved: false };
  });

  document.addEventListener('pointermove', (e) => {
    if (!drag) return;
    if (!drag.moved) {
      if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 5) return;
      drag.moved = true;
      drag.item.classList.add('is-lifted');
      document.body.classList.add('is-sorting');
    }
    const under = document.elementFromPoint(e.clientX, e.clientY);
    const list = under && under.closest('[data-sort-list]');
    if (list && list.dataset.sortList === drag.from.dataset.sortList) {
      const target = under.closest('[data-sort-id]');
      if (target && target !== drag.item && target.parentElement === list) {
        const box = target.getBoundingClientRect();
        list.insertBefore(drag.item, e.clientY < box.top + box.height / 2 ? target : target.nextElementSibling);
      } else if (!target) {
        const items = sortItems(list);
        const last = items[items.length - 1];
        if (!last) list.prepend(drag.item);
        else if (last !== drag.item && e.clientY > last.getBoundingClientRect().bottom) last.after(drag.item);
      }
    }
    // Keep the page moving when dragging near the top or bottom edge (above the phone tab bar).
    const bar = $('#tabbar').getBoundingClientRect();
    const bottom = bar.height ? bar.top : window.innerHeight;
    if (e.clientY < 90) window.scrollBy(0, -12);
    else if (e.clientY > bottom - 60) window.scrollBy(0, 12);
  });

  function endDrag() {
    if (!drag) return;
    const { item, from, next, moved } = drag;
    drag = null;
    item.classList.remove('is-lifted');
    document.body.classList.remove('is-sorting');
    if (moved && (item.parentElement !== from || item.nextElementSibling !== next)) saveOrder(item, item.parentElement);
  }
  document.addEventListener('pointerup', endDrag);
  document.addEventListener('pointercancel', endDrag);

  document.addEventListener('keydown', (e) => {
    const handle = e.target.closest && e.target.closest('[data-handle]');
    if (!handle || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
    const item = handle.closest('[data-sort-id]');
    const other = e.key === 'ArrowUp' ? item.previousElementSibling : item.nextElementSibling;
    if (!other || !other.dataset.sortId) return;
    e.preventDefault();
    if (e.key === 'ArrowUp') other.before(item); else other.after(item);
    handle.focus();
    saveOrder(item, item.parentElement);
  });

  /* ---------- Backup ---------- */

  function exportData() {
    const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `itsak-workspace-${todayYmd()}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  $('#import-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    let data;
    try { data = JSON.parse(await file.text()); } catch { toast(tr('badFile'), true); return; }
    if (!data || typeof data !== 'object' || !['desks', 'tasks', 'notes'].some((k) => Array.isArray(data[k]))) { toast(tr('badFile'), true); return; }
    if (!confirm(tr('importAsk', { file: file.name }))) return;
    await change({ action: 'import', data }, tr('imported')).catch(() => {});
  });

  /* ---------- Toast ---------- */

  let toastTimer;
  function toast(message, isError = false, undo = null) {
    const el = $('#toast');
    el.innerHTML = `<span>${esc(message)}</span>${undo ? `<button type="button" class="toast-undo">${tr('undo')}</button>` : ''}`;
    el.className = `toast is-shown ${isError ? 'is-error' : ''} ${undo ? 'has-action' : ''}`;
    const hide = () => { el.className = 'toast'; };
    if (undo) el.querySelector('.toast-undo').addEventListener('click', () => { hide(); undo().catch(() => {}); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hide, isError ? 6000 : undo ? 6000 : 2200);
  }

  /* ---------- Start ---------- */

  window.addEventListener('hashchange', route);
  // Come back to a tab after midnight and "Today" should mean today.
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !modal.open) render(); });

  api().then((json) => { state.data = json.data; route(); })
    .catch((err) => { $('#view').innerHTML = `<p class="empty big">${esc(err.message)}</p>`; });
})();
