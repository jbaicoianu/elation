/*
 * Demo glue.
 *
 * Wires up theme switching, source-toggling, step navigation, and the
 * interactive content of each step. No component definitions live here —
 * everything <ui-*> is registered by elation.js. This file is just
 * vanilla DOM event handlers and a few small custom-element setups.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    // Custom-element create() callbacks run on a setTimeout(0) queued during
    // connectedCallback; defer init one tick so children that get briefly
    // detached during their parent's create() (e.g. <ui-tab> inside <ui-tabs>)
    // are back in the DOM before we query them by id.
    setTimeout(init, 0);
  });

  function init() {
    setupTheme();
    setupSourceToggle();
    setupStepNav();
    setupButtons();
    setupForms();
    setupContainers();
    setupData();
    setupConsole();
    // step 5 (themes) is pure markup; no JS.
  }

  // ----- theme picker ------------------------------------------------
  function setupTheme() {
    const linkEl = document.getElementById('theme-link');
    const picker = document.getElementById('theme-picker');
    const stored = localStorage.getItem('elation-demo-theme') || 'default';

    setTheme(stored);
    picker.value = stored;
    picker.addEventListener('change', function () { setTheme(picker.value); });

    function setTheme(name) {
      if (name === 'none') {
        linkEl.removeAttribute('href');
      } else {
        linkEl.setAttribute('href', '../build/themes/' + name + '.css');
      }
      localStorage.setItem('elation-demo-theme', name);
    }
  }

  // ----- source-view toggle ------------------------------------------
  function setupSourceToggle() {
    const toggle = document.getElementById('source-toggle');
    const stored = localStorage.getItem('elation-demo-source') === '1';
    toggle.checked = stored;
    document.body.classList.toggle('show-source', stored);
    toggle.addEventListener('change', function () {
      document.body.classList.toggle('show-source', toggle.checked);
      localStorage.setItem('elation-demo-source', toggle.checked ? '1' : '0');
    });
  }

  // ----- wizard step navigation --------------------------------------
  function setupStepNav() {
    const wizard = document.getElementById('tour');
    const navButtons = Array.from(document.querySelectorAll('#step-nav ui-togglebutton'));

    navButtons.forEach(function (btn) {
      btn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        const step = parseInt(btn.getAttribute('data-step'), 10);
        wizard.step = step;
        updateActive();
      });
    });

    function updateActive() {
      const current = parseInt(wizard.step, 10);
      navButtons.forEach(function (btn) {
        const step = parseInt(btn.getAttribute('data-step'), 10);
        btn.active = (step === current);
      });
    }
    updateActive();
    elation.events.add(wizard, 'step', updateActive);

    // <ui-wizard-pagination> auto-creates its own back / next buttons. The
    // next button starts disabled and only enables when the step fires
    // 'finish' — for this tour we want it always available, so flip them on.
    document.querySelectorAll('ui-wizard-pagination ui-button.next').forEach(function (btn) {
      btn.disabled = false;
    });
  }

  // ----- step 1: buttons ---------------------------------------------
  function setupButtons() {
    const step = document.getElementById('buttons');
    if (!step) return;
    const log = step.querySelector('#bar-log');
    const sel = 'ui-button, ui-togglebutton, ui-notificationbutton, ui-tabcountbutton, ui-dropdownbutton, ui-popupbutton';
    step.querySelectorAll(sel).forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!log) return;
        const tag = btn.tagName.toLowerCase().replace(/^ui-/, '');
        const label = btn.label || btn.textContent.trim() || '(unnamed)';
        log.textContent = tag + ' · ' + label;
      });
    });
  }

  // ----- step 2: form state ------------------------------------------
  function setupForms() {
    const out = document.getElementById('form-state');
    const fields = ['name', 'email', 'notes', 'active', 'news', 'vol', 'role'];

    function snapshot() {
      const state = {};
      fields.forEach(function (key) {
        const el = document.getElementById('f-' + key);
        if (!el) return;
        const tag = el.tagName;
        if (tag === 'UI-TOGGLE' || tag === 'UI-CHECKBOX') state[key] = !!el.checked;
        else if (tag === 'UI-SLIDER') state[key] = el.value;
        else if (tag === 'UI-SELECT') {
          const sel = el.querySelector('select');
          state[key] = sel ? sel.value : null;
        }
        else state[key] = el.value;
      });
      out.textContent = JSON.stringify(state, null, 2);
    }

    fields.forEach(function (key) {
      const el = document.getElementById('f-' + key);
      if (!el) return;
      // Native events bubble out of the underlying <input>, <textarea>, <select>
      ['change', 'input'].forEach(function (ev) {
        el.addEventListener(ev, snapshot);
      });
      // Elation-side events (toggle, slider change) are dispatched via
      // elation.events.fire and won't surface through addEventListener.
      elation.events.add(el, 'toggle,change', snapshot);
    });
    setTimeout(snapshot, 50);  // allow attributes to settle
  }

  // ----- step 3: containers ------------------------------------------
  function setupContainers() {
    // <ui-tabs> detaches inactive tab children from the DOM, so reach
    // into tabsEl.items to query elements that may not be attached.
    const tabsEl = document.getElementById('containers-tabs');
    const tabs = (tabsEl && tabsEl.items) || [];
    const treeTab    = tabs[1] || tabsEl;
    const spinnerTab = tabs[2] || tabsEl;

    // Treeview content
    const tree = treeTab.querySelector('#containers-tree');
    if (tree && tree.setItems) {
      tree.setItems([
        { name: 'src', items: [
          { name: 'components', items: [
            { name: 'elements' },
            { name: 'utils' }
          ]},
          { name: 'demos', items: [
            { name: 'index.html' },
            { name: 'app.js' }
          ]}
        ]},
        { name: 'docs' },
        { name: 'README.md' }
      ]);
    }

    // Spinner
    const spinnerBtn = spinnerTab.querySelector('#spinner-go');
    const spinnerHost = spinnerTab.querySelector('#spinner-host');
    if (spinnerBtn && spinnerHost) {
      spinnerBtn.addEventListener('click', function () {
        spinnerHost.innerHTML = '';
        elation.elements.create('ui-spinner', {
          label: 'processing',
          append: spinnerHost
        });
        setTimeout(function () {
          spinnerHost.innerHTML = '<span class="hint">task complete</span>';
        }, 2000);
      });
    }

    // Floating window
    const openBtn = document.getElementById('open-window');
    if (openBtn) {
      openBtn.addEventListener('click', function () {
        const win = elation.elements.create('ui-window', {
          windowtitle: 'Hello',
          movable: true,
          resizable: true,
          controls: true,
          closable: true,
          append: document.body
        });
        win.style.left = '40px';
        win.style.top = '120px';
        win.style.width = '320px';
        win.style.height = '180px';
        win.innerHTML += '<div style="padding: 1em;">Drag the title bar to move me. Grab the bottom-right corner to resize.</div>';
      });
    }

    // Tooltip — created on first hover, follows the mouse, hides on leave.
    const tooltipHost = document.getElementById('tooltip-host');
    if (tooltipHost) {
      let tooltip = null;
      tooltipHost.addEventListener('mouseenter', function () {
        if (!tooltip) {
          tooltip = elation.elements.create('ui-tooltip', { append: document.body });
          tooltip.innerHTML = 'A floating ui-tooltip — hides on mouseout.';
        }
        tooltip.show();
      });
      tooltipHost.addEventListener('mouseleave', function () {
        if (tooltip) tooltip.hide();
      });
      tooltipHost.addEventListener('mousemove', function (ev) {
        if (tooltip && !tooltip.hidden) {
          tooltip.setposition([ev.clientX + 14, ev.clientY + 14]);
        }
      });
    }
  }

  // ----- step 5: data collections (in-memory + live + derived) -------
  // The data step has three internal <ui-tab>s; ui-tabs detaches inactive
  // ones, so reach for elements through tabsEl.items[i].
  function setupData() {
    const tabsEl = document.getElementById('data-tabs');
    const tabs = (tabsEl && tabsEl.items) || [];
    const memTab     = tabs[0] || tabsEl;
    const apiTab     = tabs[1] || tabsEl;
    const derivedTab = tabs[2] || tabsEl;

    // Live API collection — shared between the API tab and the Derived tab,
    // so the same data drives multiple bound views.
    const apiCollection = elation.elements.create('collection-jsonapi', {
      append: document.body,
      host: 'https://jsonplaceholder.typicode.com',
      endpoint: '/users'
    });
    apiCollection.style.display = 'none';

    setupDataMemoryTab(memTab);
    setupDataLiveTab(apiTab, apiCollection);
    setupDataDerivedTab(derivedTab, apiCollection);

    apiCollection.load();
  }

  function setupDataMemoryTab(tab) {
    const collection = elation.elements.create('collection-simple', {
      append: document.body,
      items: [
        { name: 'Alpha',   value: 1 },
        { name: 'Bravo',   value: 2 },
        { name: 'Charlie', value: 3 }
      ]
    });
    collection.style.display = 'none';

    const list = tab.querySelector('#data-list');
    const grid = tab.querySelector('#data-grid');
    if (list) list.setItemCollection(collection);
    if (grid) grid.setItemCollection(collection);

    const log = tab.querySelector('#data-log');
    const lines = [];
    function record(name, info) {
      const time = new Date().toLocaleTimeString();
      lines.unshift('[' + time + '] ' + name + (info ? ' ' + info : ''));
      if (lines.length > 14) lines.pop();
      if (log) log.textContent = lines.join('\n');
    }
    ['collection_add', 'collection_remove', 'collection_move', 'collection_clear'].forEach(function (ev) {
      elation.events.add(collection, ev, function (e) {
        const item = e.data && e.data.item;
        record(ev, item ? '· ' + (item.name || JSON.stringify(item)) : '');
      });
    });
    record('initial', '· 3 items seeded');

    let next = 4;
    const names = ['Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel', 'India', 'Juliet',
                   'Kilo', 'Lima', 'Mike', 'November', 'Oscar', 'Papa', 'Quebec', 'Romeo'];
    const addBtn     = tab.querySelector('#data-add');
    const removeBtn  = tab.querySelector('#data-remove');
    const shuffleBtn = tab.querySelector('#data-shuffle');
    const clearBtn   = tab.querySelector('#data-clear');

    if (addBtn) addBtn.addEventListener('click', function () {
      const i = (next - 4) % names.length;
      collection.add({ name: names[i], value: next++ });
    });
    if (removeBtn) removeBtn.addEventListener('click', function () {
      if (collection.items.length > 0) {
        collection.remove(collection.items[collection.items.length - 1]);
      }
    });
    if (shuffleBtn) shuffleBtn.addEventListener('click', function () {
      const items = collection.items.slice();
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = items[i]; items[i] = items[j]; items[j] = t;
      }
      collection.clear();
      items.forEach(function (it) { collection.add(it); });
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { collection.clear(); });
  }

  function setupDataLiveTab(tab, apiCollection) {
    const list = tab.querySelector('#live-list');
    if (list) list.setItemCollection(apiCollection);

    const log = tab.querySelector('#live-log');
    const lines = [];
    function record(name) {
      lines.unshift('[' + new Date().toLocaleTimeString() + '] ' + name);
      if (lines.length > 10) lines.pop();
      if (log) log.textContent = lines.join('\n');
    }
    ['collection_load_begin', 'collection_load', 'collection_clear'].forEach(function (ev) {
      elation.events.add(apiCollection, ev, function () { record(ev); });
    });

    const reload = tab.querySelector('#live-reload');
    if (reload) reload.addEventListener('click', function () {
      apiCollection.clear();
      apiCollection.load();
    });
  }

  function setupDataDerivedTab(tab, source) {
    const filter = elation.elements.create('collection-filter', {
      append: source,  // filter reads from this.parentNode.items
      filterfunc: function (item) {
        const inp = document.getElementById('filter-input')
                 || tab.querySelector('#filter-input');
        const term = ((inp && inp.value) || '').toLowerCase().trim();
        if (!term) return true;
        return item && item.name && item.name.toLowerCase().indexOf(term) !== -1;
      }
    });
    filter.style.display = 'none';

    const sourceList   = tab.querySelector('#derived-source');
    const filteredList = tab.querySelector('#derived-filtered');
    if (sourceList)   sourceList.setItemCollection(source);
    if (filteredList) filteredList.setItemCollection(filter);

    const totalEl = tab.querySelector('#filter-total');
    const countEl = tab.querySelector('#filter-count');
    function updateCounts() {
      if (totalEl) totalEl.textContent = source.items ? source.items.length : 0;
      if (countEl) countEl.textContent = filter.items ? filter.items.length : 0;
    }
    elation.events.add(source, 'collection_load', updateCounts);

    const input = tab.querySelector('#filter-input');
    if (input) input.addEventListener('input', function () {
      filter.update();
      updateCounts();
    });
  }

  // ----- step 8: operations console ----------------------------------
  //
  // The console is driven by a single simulation object. A tick loop advances
  // a shared world state (contacts, ship status, time); each subsystem binds
  // to whichever piece of that state it cares about. Player controls feed
  // changes back into the simulation, which fires them as cause-effect
  // sensor events that propagate to every view bound to that data.

  let consoleSim = null;

  function setupConsole() {
    const resetBtn = document.getElementById('console-reset');
    if (resetBtn) resetBtn.addEventListener('click', resetConsoleLayout);

    consoleSim = makeSimulation();

    bindConsolePause(consoleSim);
    bindConsoleStatus(consoleSim);
    bindConsoleTactical(consoleSim);
    bindConsoleSensors(consoleSim);
    bindConsoleSubsystems(consoleSim);
    bindConsoleComms(consoleSim);
    bindConsoleScope(consoleSim);
    bindConsoleControls(consoleSim);

    consoleSim.start();
  }

  function makeSimulation() {
    // Collections are the surface other elements bind to.
    const contacts = elation.elements.create('collection-simple', { append: document.body });
    const sensors  = elation.elements.create('collection-simple', { append: document.body });
    contacts.style.display = 'none';
    sensors.style.display = 'none';

    const ship = {
      shields: 92,
      hull: 88,
      fuel: 34,
      power: 78,
      alloc:    { engines: 25, weapons: 15, shields: 35, life: 25 },
      engaged:  true,
      weapons:  'safed',     // 'safed' | 'armed'
      targetId: null,
    };

    const startTime = Date.now();
    let paused = false;
    let tickInterval = null;

    function timestamp() {
      const elapsed = (Date.now() - startTime) / 1000;
      const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
      const s = Math.floor(elapsed % 60).toString().padStart(2, '0');
      return 'T+' + m + ':' + s;
    }
    function push(text, type) {
      sensors.add({ text: timestamp() + '  ' + text, type: type || 'info' }, 0);
      while (sensors.items.length > 50) {
        sensors.remove(sensors.items[sensors.items.length - 1]);
      }
    }

    fetch('data/contacts.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        data.forEach(function (c) { contacts.add(Object.assign({}, c)); });
        push('Sensor net online — ' + contacts.items.length + ' contacts in range');
      })
      .catch(function () {
        contacts.add({ id: 'TEST', name: 'Sample-1', type: 'vessel', distance_km: 5, threat: 1, vector: 'fixture' });
      });

    function tick() {
      if (paused || !ship.engaged) return;

      // Power output is driven by allocation.
      const totalAlloc = ship.alloc.engines + ship.alloc.weapons + ship.alloc.shields + ship.alloc.life;
      ship.power = Math.min(100, totalAlloc);

      // Move contacts: hostiles close in (modulated by their vector speed),
      // others drift mildly.
      contacts.items.forEach(function (c) {
        if (c.threat >= 2 && /km\/s/.test(c.vector || '')) {
          const speed = parseFloat(c.vector.split('/')[1]) || 1;
          c.distance_km = Math.max(0.4, c.distance_km - speed * 0.04);
        } else if (c.vector === 'drifting') {
          c.distance_km = Math.max(0.4, c.distance_km + (Math.random() - 0.5) * 0.4);
        } else if (/km\/s/.test(c.vector || '')) {
          c.distance_km = Math.max(0.4, c.distance_km + (Math.random() - 0.5) * 0.6);
        }
      });

      // Occasional contact-driven sensor reading.
      if (Math.random() < 0.45 && contacts.items.length > 0) {
        const c = contacts.items[Math.floor(Math.random() * contacts.items.length)];
        const variants = [
          c.name + ' bearing reads ' + (c.vector || 'unknown'),
          c.name + ' range ' + c.distance_km.toFixed(1) + ' km',
          'Doppler shift on ' + c.name + ' Δ=' + ((Math.random() * 0.2) + 0.1).toFixed(3),
          'Mass profile ' + c.name + ': ' + c.type + ' signature confirmed'
        ];
        push(variants[Math.floor(Math.random() * variants.length)]);
      }

      // Hostile pressure: close hostiles drain shields; below threshold, hull damage.
      const closestHostile = contacts.items
        .filter(function (c) { return c.threat >= 2 && c.distance_km < 6; })
        .sort(function (a, b) { return a.distance_km - b.distance_km; })[0];
      if (closestHostile) {
        const drain = Math.max(0, (6 - closestHostile.distance_km) * 0.6);
        ship.shields = Math.max(0, ship.shields - drain * 0.4);
        if (ship.shields < 30 && Math.random() < 0.4) {
          ship.hull = Math.max(0, ship.hull - 0.4);
          push('!! HULL BREACH — ' + closestHostile.name + ' in striking range', 'critical');
        }
      } else {
        // Recharge to player's commanded shield level if no immediate threat.
        const target = ship.alloc.shields * 2.5;
        if (ship.shields < target) ship.shields = Math.min(100, ship.shields + 0.6);
      }

      // Fuel decreases while engaged.
      ship.fuel = Math.max(0, ship.fuel - 0.05 * (ship.alloc.engines / 25));
    }

    return {
      contacts: contacts,
      sensors:  sensors,
      ship:     ship,
      push:     push,
      isPaused: function () { return paused; },
      setPaused: function (v) { paused = v; },
      setEngaged: function (v) {
        if (ship.engaged === v) return;
        ship.engaged = v;
        push(v ? 'Engaged — all systems active' : 'Standby — drives idle', v ? 'info' : 'info');
      },
      setShields: function (v) {
        const old = ship.shields;
        ship.shields = v;
        if (Math.abs(old - v) > 4) {
          push('Shields ' + (v > old ? 'raised' : 'lowered') + ' to ' + Math.round(v) + '%');
        }
      },
      setAlloc: function (key, v) {
        ship.alloc[key] = v;
        push('Power → ' + key.toUpperCase() + ' set to ' + v + '%');
      },
      setWeapons: function (state) {
        if (ship.weapons === state) return;
        ship.weapons = state;
        push(state === 'armed' ? 'Weapons ARMED' : 'Weapons safed', state === 'armed' ? 'critical' : 'info');
      },
      setTarget: function (id) {
        ship.targetId = id;
        const c = contacts.items.find(function (x) { return x.id === id; });
        if (c) push('Target lock acquired: ' + c.name);
      },
      fire: function () {
        if (ship.weapons !== 'armed' || !ship.targetId) return false;
        const c = contacts.items.find(function (x) { return x.id === ship.targetId; });
        if (!c) return false;
        ship.fuel = Math.max(0, ship.fuel - 4);
        push('!! FIRING on ' + c.name, 'critical');
        if (c.threat > 1) {
          c.threat -= 1;
          push(c.name + ' shields degraded — threat downgraded to ' + c.threat);
        } else {
          contacts.remove(c);
          push(c.name + ' eliminated');
          ship.targetId = null;
        }
        return true;
      },
      start: function () {
        tickInterval = setInterval(tick, 600);
      },
    };
  }

  function resetConsoleLayout() {
    const layout = {
      tactical:         { left: '0px',   top: '0px',   width: '360px', height: '280px' },
      sensors:          { left: '380px', top: '0px',   width: '360px', height: '280px' },
      subsystems:       { left: '0px',   top: '300px', width: '280px', height: '240px' },
      comms:            { left: '300px', top: '300px', width: '440px', height: '240px' },
      scope:            { left: '760px', top: '0px',   width: '280px', height: '280px' },
      'contact-detail': { left: '760px', top: '300px', width: '280px', height: '240px' },
      controls:         { left: '0px',   top: '560px', width: '1040px', height: '200px' }
    };
    document.querySelectorAll('#console-desktop > ui-window').forEach(function (w) {
      const k = w.getAttribute('data-key');
      const cfg = layout[k];
      if (!cfg) return;
      Object.keys(cfg).forEach(function (prop) { w.style[prop] = cfg[prop]; });
    });
  }

  // The pause toggle is a debug aid — pauses the simulation tick.
  function bindConsolePause(sim) {
    const pauseBtn = document.getElementById('console-feed-toggle');
    if (!pauseBtn) return;
    pauseBtn.addEventListener('click', function () {
      sim.setPaused(!!pauseBtn.active);
      pauseBtn.label = sim.isPaused() ? '▶ resume sim' : '⏸ pause sim';
    });
  }

  // Status bar values come straight from sim.ship — driven by the tick,
  // not random jitter.
  function bindConsoleStatus(sim) {
    const els = {
      power:   document.getElementById('status-power'),
      shields: document.getElementById('status-shields'),
      hull:    document.getElementById('status-hull'),
      fuel:    document.getElementById('status-fuel'),
    };
    setInterval(function () {
      els.power.value   = Math.round(sim.ship.power);
      els.shields.value = Math.round(sim.ship.shields);
      els.hull.value    = Math.round(sim.ship.hull);
      els.fuel.value    = Math.round(sim.ship.fuel);
    }, 250);
  }

  // Tactical: list bound to a filter over sim.contacts. Selecting a row
  // sets the simulation's target lock, which the scope and detail panel
  // read from.
  function bindConsoleTactical(sim) {
    function which() {
      const active = document.querySelector('#tactical-filter ui-togglebutton[active]');
      return active ? (active.getAttribute('data-filter') || 'all') : 'all';
    }

    const filter = elation.elements.create('collection-filter', {
      append: sim.contacts,
      filterfunc: function (item) {
        const w = which();
        if (w === 'all')     return true;
        if (w === 'hostile') return item.threat >= 2;
        if (w === 'debris')  return item.type === 'debris';
        if (w === 'anomaly') return item.type === 'anomaly';
        return true;
      }
    });
    filter.style.display = 'none';

    const list = document.getElementById('tactical-list');
    list.setItemCollection(filter);

    document.querySelectorAll('#tactical-filter ui-togglebutton').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('#tactical-filter ui-togglebutton').forEach(function (b) {
          b.active = (b === btn);
        });
        filter.update();
      });
    });

    // ui.list fires a 'select' event (via elation.events) when a child
    // ui-item is selected. ev.target is the selected ui-item; its `.value`
    // is the underlying data object.
    elation.events.add(list, 'select', function (ev) {
      const li = ev.target;
      if (li && li.value) {
        sim.setTarget(li.value.id);
        renderContactDetail(li.value);
      }
    });

    // When sim.contacts changes (a contact removed by firing, or a hostile
    // closing further), the bound list refreshes via collection events.
    // We also need to refresh the detail panel if the selected target's
    // distance changes.
    setInterval(function () {
      if (!sim.ship.targetId) return;
      const c = sim.contacts.items.find(function (x) { return x.id === sim.ship.targetId; });
      if (c) renderContactDetail(c);
      else { sim.ship.targetId = null; renderContactDetail(null); }
    }, 600);

    function renderContactDetail(c) {
      const detail = document.getElementById('contact-detail');
      const readout = document.getElementById('scope-readout');
      if (!c) {
        if (detail)  detail.textContent  = 'select a contact';
        if (readout) readout.textContent = 'no target lock';
        return;
      }
      if (detail) {
        detail.textContent =
          'id        ' + c.id + '\n' +
          'name      ' + c.name + '\n' +
          'type      ' + c.type + '\n' +
          'range     ' + c.distance_km.toFixed(2) + ' km\n' +
          'threat    ' + (c.threat || 0) + '\n' +
          'vector    ' + (c.vector || '—');
      }
      if (readout) {
        readout.textContent = c.name + ' · ' + c.distance_km.toFixed(1) + ' km · threat ' + (c.threat || 0);
      }
    }
  }

  // Sensor feed list bound to sim.sensors.
  function bindConsoleSensors(sim) {
    document.getElementById('sensor-list').setItemCollection(sim.sensors);
  }

  // Subsystems treeview: static tree from JSON. Could later be driven by
  // simulation events too.
  function bindConsoleSubsystems(sim) {
    const tree = document.getElementById('subsystem-tree');
    fetch('data/subsystems.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (tree && tree.setItems) tree.setItems(data);
      })
      .catch(function () {});
  }

  // Comms: priority filter + alert badge from a separate filter on the
  // same source — two views of one collection.
  function bindConsoleComms(sim) {
    const all = elation.elements.create('collection-simple', { append: document.body });
    all.style.display = 'none';

    fetch('data/comms.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        data.forEach(function (m) { all.add(m); });
      })
      .catch(function () {});

    function which() {
      const active = document.querySelector('#comms-priority ui-togglebutton[active]');
      return active ? (active.getAttribute('data-priority') || 'all') : 'all';
    }
    const visible = elation.elements.create('collection-filter', {
      append: all,
      filterfunc: function (item) {
        const w = which();
        return w === 'all' ? true : String(item.priority) === w;
      }
    });
    visible.style.display = 'none';

    document.getElementById('comms-list').setItemCollection(visible);

    document.querySelectorAll('#comms-priority ui-togglebutton').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('#comms-priority ui-togglebutton').forEach(function (b) {
          b.active = (b === btn);
        });
        visible.update();
      });
    });

    const alerts = elation.elements.create('collection-filter', {
      append: all,
      filterfunc: function (item) { return item.priority === 1; }
    });
    alerts.style.display = 'none';

    function updateAlertBadge() {
      const btn = document.getElementById('comms-alert');
      if (btn && alerts.items) btn.count = alerts.items.length;
    }
    elation.events.add(all, 'collection_add', updateAlertBadge);
    elation.events.add(all, 'collection_remove', updateAlertBadge);
    setTimeout(updateAlertBadge, 200);
  }

  // Scope: concentric-ring radar drawn on a canvas, reading directly from
  // sim.contacts and sim.ship.targetId on every frame.
  function bindConsoleScope(sim) {
    const canvas = document.getElementById('scope-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      const r = canvas.getBoundingClientRect();
      canvas.width = r.width;
      canvas.height = r.height;
    }
    resize();
    window.addEventListener('resize', resize);

    let angle = 0;
    function draw() {
      if (canvas.width === 0 || canvas.height === 0) resize();
      const w = canvas.width, h = canvas.height;
      const cx = w / 2, cy = h / 2;
      const maxR = Math.min(cx, cy) - 6;
      if (maxR <= 0) { requestAnimationFrame(draw); return; }

      ctx.clearRect(0, 0, w, h);

      // starfield
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      for (let i = 0; i < 24; i++) {
        const x = (i * 73) % w, y = (i * 41) % h;
        ctx.fillRect(x, y, 1, 1);
      }

      // rings
      ctx.strokeStyle = 'rgba(77,208,225,0.4)';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (maxR / 3) * i, 0, Math.PI * 2);
        ctx.stroke();
      }
      // crosshair
      ctx.beginPath();
      ctx.moveTo(cx - maxR, cy); ctx.lineTo(cx + maxR, cy);
      ctx.moveTo(cx, cy - maxR); ctx.lineTo(cx, cy + maxR);
      ctx.stroke();

      // sweep
      const sx = cx + Math.cos(angle) * maxR;
      const sy = cy + Math.sin(angle) * maxR;
      const grad = ctx.createLinearGradient(cx, cy, sx, sy);
      grad.addColorStop(0, 'rgba(77,208,225,0.7)');
      grad.addColorStop(1, 'rgba(77,208,225,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy); ctx.lineTo(sx, sy);
      ctx.stroke();

      // contact dots
      const targetId = sim.ship.targetId;
      (sim.contacts.items || []).forEach(function (c) {
        const r = Math.min(1, (c.distance_km || 0) / 50) * maxR;
        const a = (c.id || '').split('').reduce(function (s, ch) { return s + ch.charCodeAt(0); }, 0);
        const cAngle = (a * 0.7) % (Math.PI * 2);
        const x = cx + Math.cos(cAngle) * r;
        const y = cy + Math.sin(cAngle) * r;

        const isSelected = c.id === targetId;
        const isHostile  = (c.threat || 0) >= 2;
        ctx.fillStyle = isSelected ? '#f48fb1'
                       : isHostile ? '#ef5350'
                       : (c.type === 'debris') ? '#ffb74d'
                       : '#4dd0e1';
        ctx.beginPath();
        ctx.arc(x, y, isSelected ? 5 : 3, 0, Math.PI * 2);
        ctx.fill();

        if (isSelected) {
          ctx.strokeStyle = '#f48fb1';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, 9, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      angle += 0.012;
      if (!sim.isPaused()) requestAnimationFrame(draw);
      else setTimeout(function () { requestAnimationFrame(draw); }, 200);
    }
    requestAnimationFrame(draw);
  }

  // Helm controls — wires player inputs back into the simulation.
  function bindConsoleControls(sim) {
    const engageBtn  = document.getElementById('ctl-engage');
    const weaponsBtn = document.getElementById('ctl-weapons');
    const fireBtn    = document.getElementById('ctl-fire');
    const shields    = document.getElementById('ctl-shields');
    const shieldsOut = document.getElementById('ctl-shields-out');
    const allocs = {
      engines: document.getElementById('ctl-pwr-engines'),
      weapons: document.getElementById('ctl-pwr-weapons'),
      shields: document.getElementById('ctl-pwr-shields'),
      life:    document.getElementById('ctl-pwr-life'),
    };

    if (engageBtn) {
      engageBtn.active = sim.ship.engaged;
      engageBtn.label  = sim.ship.engaged ? 'engaged' : 'standby';
      engageBtn.addEventListener('click', function () {
        sim.setEngaged(!!engageBtn.active);
        engageBtn.label = sim.ship.engaged ? 'engaged' : 'standby';
      });
    }
    if (weaponsBtn) {
      weaponsBtn.addEventListener('click', function () {
        const next = weaponsBtn.active ? 'armed' : 'safed';
        sim.setWeapons(next);
        weaponsBtn.label = next === 'armed' ? 'weapons armed' : 'weapons safed';
        updateFireEnabled();
      });
    }
    if (fireBtn) {
      fireBtn.addEventListener('click', function () { sim.fire(); });
    }

    if (shields) {
      const apply = function () {
        sim.setShields(+shields.value);
        if (shieldsOut) shieldsOut.textContent = Math.round(shields.value) + '%';
      };
      elation.events.add(shields, 'change', apply);
      apply();
    }

    Object.keys(allocs).forEach(function (k) {
      const sl = allocs[k];
      if (!sl) return;
      elation.events.add(sl, 'change', function () { sim.setAlloc(k, +sl.value); });
    });

    function updateFireEnabled() {
      if (!fireBtn) return;
      fireBtn.disabled = !(sim.ship.weapons === 'armed' && sim.ship.targetId);
    }
    setInterval(updateFireEnabled, 400);
  }

})();
