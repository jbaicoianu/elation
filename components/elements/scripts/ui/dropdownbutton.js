elation.require(['elements.ui.list'], function() {
  elation.requireCSS('ui.dropdownbutton');

  /**
   * Native-select-style dropdown. The trigger displays the currently
   * selected option's label. On mousedown, the popup opens with the
   * selected option centred on the cursor; mousemove highlights the
   * option underneath; release on an option commits the selection.
   * A mousedown / mouseup with no movement leaves the popup open in
   * "lazy" mode so the user can browse and click an option in their
   * own time. A second click on the trigger closes the popup; clicks
   * outside also close.
   *
   * @class dropdownbutton
   * @hideconstructor
   * @category UI
   * @augments elation.elements.ui.list
   * @memberof elation.elements.ui
   * @example
   * <ui-dropdownbutton label="Choose…">
   *   <ui-button label="Edit"></ui-button>
   *   <ui-button label="Duplicate"></ui-button>
   *   <ui-button label="Delete"></ui-button>
   * </ui-dropdownbutton>
   *
   * @param {object} args
   * @param {string} args.label fallback trigger label until the user picks an option
   * @param {boolean} args.open
   */
  elation.elements.define('ui.dropdownbutton', class extends elation.elements.ui.list {
    init() {
      super.init();
      this.defineAttributes({
        label: { type: 'string' },
        value: { type: 'string' },
        open:  { type: 'boolean', default: false }
      });
    }
    create() {
      // Create the popup container before super.create() so getListElement
      // routes ui-list's render output into the popup, not the dropdown root.
      this.optionsHost = elation.html.create({
        tag: 'div',
        classname: 'ui_dropdown_options',
        append: this
      });

      super.create();

      this.trigger = elation.html.create({
        tag: 'span',
        classname: 'ui_dropdown_trigger',
        append: this
      });
      this.insertBefore(this.trigger, this.optionsHost);

      this._dragging = false;
      this._dragStartX = 0;
      this._dragStartY = 0;
      this._hover = null;
      this.selected = null;

      this._initSelection();
      this._buildTriggerLabels();

      // The dropdown is a single tab stop; the options inside it are
      // navigated via keyboard within the dropdown itself, not via Tab.
      this.setAttribute('tabindex', '0');
      // Strip child options out of the tab order. ui-button.create() sets
      // tabindex=0 on each, and that runs after our create() (queued
      // separately via the connect-time setTimeout), so defer this one tick.
      setTimeout(() => {
        this._options().forEach((opt) => opt.setAttribute('tabindex', '-1'));
      }, 0);

      // Bound handlers we need to add and remove from the window.
      this._onMouseMove   = (ev) => this._handleMouseMove(ev);
      this._onMouseUp     = (ev) => this._handleMouseUp(ev);
      this._onOutsideClick = (ev) => {
        if (!this.contains(ev.target)) this.setOpen(false);
      };

      this.addEventListener('mousedown', (ev) => this._handleMouseDown(ev));
      this.addEventListener('click',     (ev) => this._handleClick(ev));
      this.addEventListener('keydown',   (ev) => this._handleKeydown(ev));
    }
    /**
     * @function getListElement
     * @memberof elation.elements.ui.dropdownbutton#
     * @override
     */
    getListElement() {
      return this.optionsHost || this;
    }
    _options() {
      return this.optionsHost ? Array.from(this.optionsHost.children) : [];
    }
    _initSelection() {
      const opts = this._options();
      if (!opts.length) return;
      // Pick the first option marked `selected` or `active`, otherwise the first.
      const initial = opts.find(o => o.hasAttribute('selected') || o.hasAttribute('active'));
      this.selected = initial || opts[0];
      this.selected.classList.add('state_selected');
      this.value = this.selected.label || (this.selected.textContent || '').trim();
    }
    _buildTriggerLabels() {
      // Stack a hidden span for every option inside the trigger; only the
      // active one is visible. Browser sizes the trigger to the widest
      // span, so picking a different option doesn't change the dropdown
      // width.
      if (!this.trigger) return;
      this.trigger.innerHTML = '';
      this._optionLabels = this._options().map((opt) => {
        const text = (opt.label !== undefined && opt.label !== null)
          ? opt.label
          : ((opt.textContent || '').trim());
        const span = document.createElement('span');
        span.className = 'ui_dropdown_label';
        span.textContent = text;
        this.trigger.appendChild(span);
        return { opt, span };
      });
      this._updateTriggerLabel();
    }
    _updateTriggerLabel() {
      if (!this.trigger) return;
      if (!this._optionLabels || !this._optionLabels.length) {
        this.trigger.innerHTML = this.label || '';
        return;
      }
      this._optionLabels.forEach(({ opt, span }) => {
        if (opt === this.selected) span.setAttribute('data-active', '');
        else span.removeAttribute('data-active');
      });
    }
    _optionAt(ev) {
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      if (!el) return null;
      const opt = el.closest && el.closest('ui-button');
      if (opt && this.optionsHost && this.optionsHost.contains(opt)) return opt;
      return null;
    }
    _highlight(opt) {
      if (this._hover === opt) return;
      // Use the framework's existing [hover] attribute so themes that
      // style ui-button[hover] pick this up automatically.
      if (this._hover) this._hover.hover = false;
      this._hover = opt;
      if (opt) opt.hover = true;
    }
    _alignSelectedToCursor(ev) {
      if (!this.selected || !this.optionsHost) return;
      // Reset any leftover transform before measuring.
      this.optionsHost.style.transform = '';
      const rect = this.selected.getBoundingClientRect();
      const optionMid = rect.top + rect.height / 2;
      const shift = ev.clientY - optionMid;
      this.optionsHost.style.transform = 'translateY(' + Math.round(shift) + 'px)';
    }
    _select(opt) {
      if (!opt) return;
      if (this.selected) this.selected.classList.remove('state_selected');
      this.selected = opt;
      opt.classList.add('state_selected');
      this.value = opt.label || (opt.textContent || '').trim();
      this._updateTriggerLabel();
      this._highlight(null);
      this.dispatchEvent({type: 'select', data: { item: opt, label: opt.label, value: this.value }});
      this.setOpen(false);
    }
    _handleMouseDown(ev) {
      if (ev.button !== 0) return;
      // mousedown inside the popup itself (lazy-mode click on an option)
      // is handled in _handleClick — fall through here.
      if (this.open && this.optionsHost && this.optionsHost.contains(ev.target)) return;

      if (this.open) {
        // Second click on the trigger while open → close.
        this.setOpen(false);
        return;
      }

      this._dragStartX = ev.clientX;
      this._dragStartY = ev.clientY;
      this._dragStartTime = Date.now();
      this._dragging = true;

      this.setOpen(true);
      this._alignSelectedToCursor(ev);
      this._highlight(this._optionAt(ev));

      window.addEventListener('mousemove', this._onMouseMove);
      window.addEventListener('mouseup',   this._onMouseUp);

      ev.preventDefault();   // suppress text selection during drag
    }
    _handleMouseMove(ev) {
      if (!this._dragging) return;
      this._highlight(this._optionAt(ev));
    }
    _handleMouseUp(ev) {
      if (!this._dragging) return;
      this._dragging = false;
      window.removeEventListener('mousemove', this._onMouseMove);
      window.removeEventListener('mouseup',   this._onMouseUp);

      const moved = Math.abs(ev.clientY - this._dragStartY) > 4 ||
                    Math.abs(ev.clientX - this._dragStartX) > 4;
      const heldMs = Date.now() - this._dragStartTime;
      const opt = this._optionAt(ev);

      if (moved && opt) {
        // Route through opt.click() so the option's own click listeners
        // fire and the click bubbles into our _handleClick (which then
        // calls _select). The browser may also synthesize a click on
        // the lowest common ancestor of the mousedown/mouseup targets
        // (the dropdown itself) once mouseup returns — set the
        // suppression flag *after* the synthetic click so that one
        // gets stopped instead.
        opt.click();
        this._suppressNextClick = true;
      } else if (moved && !opt) {
        this._suppressNextClick = true;
        this.setOpen(false);
      } else if (heldMs > 250) {
        this._suppressNextClick = true;
        this.setOpen(false);
      }
      // else: quick click — let the click event flow naturally (the
      // user just toggled the popup open in lazy mode; that's a real
      // dropdown-click consumers may want to know about).
    }
    _handleClick(ev) {
      // Suppress the post-drag synthesized click so it doesn't reach
      // consumer click-listeners as a spurious dropdown-click.
      if (this._suppressNextClick) {
        this._suppressNextClick = false;
        ev.stopImmediatePropagation();
        return;
      }
      // Lazy-mode option click. The drag path handles its own selection
      // in _handleMouseUp; this only fires when the popup is already open
      // and the user separately clicks an option.
      if (this._dragging) return;
      if (!this.open) return;
      const opt = ev.target.closest && ev.target.closest('ui-button');
      if (opt && this.optionsHost && this.optionsHost.contains(opt)) {
        // The click should be treated as an option-selection, not a
        // generic dropdown-click. Stop further propagation and any
        // sibling click-listeners on the dropdown itself.
        ev.stopImmediatePropagation();
        this._select(opt);
      }
    }
    /**
     * Keyboard interactions:
     * - Enter / Space: open the popup (or commit highlighted option if open)
     * - ArrowDown / ArrowUp: cycle the highlighted option (opens if closed)
     * - Escape: close without changing
     * @function _handleKeydown
     * @memberof elation.elements.ui.dropdownbutton#
     * @param {KeyboardEvent} ev
     */
    _handleKeydown(ev) {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        if (this.open) {
          if (this._hover) {
            // Route through the option's native click so click-listeners
            // (including the framework's bubble path into _handleClick)
            // fire alongside our own 'select' event.
            this._hover.click();
          } else {
            this.setOpen(false);
          }
        } else {
          this.setOpen(true);
          if (this.selected) this._highlight(this.selected);
        }
      } else if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
        ev.preventDefault();
        if (!this.open) {
          this.setOpen(true);
          this._highlight(this.selected || this._options()[0]);
        } else {
          this._navigateHighlight(ev.key === 'ArrowDown' ? 1 : -1);
        }
      } else if (ev.key === 'Escape' && this.open) {
        ev.preventDefault();
        this.setOpen(false);
      }
    }
    _navigateHighlight(dir) {
      const opts = this._options();
      if (!opts.length) return;
      let idx = this._hover ? opts.indexOf(this._hover)
              : (this.selected ? opts.indexOf(this.selected) : -1);
      if (idx === -1) idx = (dir > 0) ? -1 : opts.length;
      idx = (idx + dir + opts.length) % opts.length;
      this._highlight(opts[idx]);
    }
    /**
     * @function setOpen
     * @memberof elation.elements.ui.dropdownbutton#
     * @param {boolean} open
     */
    setOpen(open) {
      if (!!this.open === !!open) return;
      this.open = !!open;
      if (this.open) {
        this.addclass('state_open');
        // Defer outside-click attachment so the click that opened us
        // doesn't immediately re-close us when it bubbles to window.
        setTimeout(() => {
          window.addEventListener('click', this._onOutsideClick, true);
        }, 0);
      } else {
        this.removeclass('state_open');
        window.removeEventListener('click', this._onOutsideClick, true);
        if (this.optionsHost) this.optionsHost.style.transform = '';
        this._highlight(null);
      }
    }
  });
});
