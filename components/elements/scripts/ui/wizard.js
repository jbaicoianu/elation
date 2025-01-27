elation.require(["elements.elements"], function() {
  /** 
   * Wizard UI element
   *
   * @class wizard
   * @augments elation.ui.base
   * @memberof elation.ui
   *
   * @param {object} args
   * @param {int} args.step
   * @param {string} args.type
   * @param {callback} args.oncomplete
   */
  elation.elements.define('ui-wizard', class extends elation.elements.base {
    constructor() {
      super();
      this.defineAttributes({
        'step': {type: 'int', default: 1},
        'type': {type: 'string', default: 'paginate'}, // "paginate" or "scroll"
        'oncomplete': {type: 'callback'}
      });
    }
    create() {
      this.steps = this.getSteps();
      this.step = 1;
      //elation.events.add(this, 'wizard_advance', (ev) => { console.log('wizard advance', ev); this.advance(); ev.stopPropagation(); });
      elation.events.add(this, 'wizard_complete', (ev) => { this.advance(); });
      //this.addEventListener('wizard_advance', (ev) => { this.advance(); ev.stopPropagation(); });
      //this.addEventListener('wizard_complete', (ev) => { this.advance(); });
      //this.setAttribute('role', 'tablist');
      this.steps[0].start();
    }
    getSteps() {
      let steps = [];
      this.childNodes.forEach(n => {
        if (n.tagName == 'UI-WIZARD-STEP' && !steps.skip) {
          steps.push(n);
        }
      });
      return steps;
    }
    advance(id) {
      let laststepel = this.steps[this.step - 1];
      if (id) {
        if (elation.utils.isString(id)) {
          // If we passed in a string, we're advancing TO the element that matches the specified id
          //console.log('advance wizard to id', this, id);
          for (let i = 0; i < this.steps.length; i++) {
            if (this.steps[i].id == id) {
              this.step = i + 1;
              break;
            }
          }
        } else {
          // If we passed in a <wizard-step> element, advance to the NEXT step after the specified one
          //console.log('check the step', id, this.steps);
          for (let i = 0; i < this.steps.length; i++) {
            if (this.steps[i] === id) {
              this.step = i + 2;
              //console.log('found the step', this.step);
              break;
            }
          }
        }
      } else {
        //console.log('advance wizard', this.step, this.steps.length);
        this.step = this.step + 1;
        if (this.step >= this.steps.length) {
          this.step = this.steps.length;
          this.finish();
        }
      }
      let stepel = this.steps[this.step - 1];
      if (laststepel) {
        laststepel.finish();
      }
      if (stepel) {
        stepel.start();
        if (this.type == 'scroll') {
          //console.log('scroll into view!', stepel);
          stepel.scrollIntoView({ behavior: 'smooth' });
        }
      }
      this.dispatchEvent({type: 'step', detail: this.step });
    }
    goback() {
      this.step = Math.max(1, this.step - 1);
    }
    finish() {
      if (this.oncomplete) {
        //this.dispatchEvent({type: 'wizard_complete'});
      }
    }
  });
  /** 
   * Wizard Back button UI element
   *
   * @class wizard-backbutton
   * @augments elation.ui.base
   * @memberof elation.ui
   */
  elation.elements.define('ui-wizard-backbutton', class extends elation.elements.ui.button {
    create() {
      super.create();
      this.addEventListener('click', (ev) => this.parentNode.goback());
    }
  });
  /** 
   * Wizard Step UI element
   *
   * @class wizard-step
   * @augments elation.ui.base
   * @memberof elation.ui
   *
   * @param {object} args
   * @param {int} args.step
   * @param {string} args.type
   * @param {callback} args.oncomplete
   */
  elation.elements.define('ui-wizard-step', class extends elation.elements.base {
    constructor() {
      super();
      this.defineAttributes({
        'skip': {type: 'boolean', default: false },
        'finished': {type: 'boolean', default: false },
        'onstart': {type: 'callback' },
        'onfinish': {type: 'callback'},
        'pending': {type: 'attribute', default: true},
      });
    }
    create() {
      //this.setAttribute('aria-live', 'off');
      //this.setAttribute('role', 'tab');
      //this.setAttribute('aria-selected', 'false');
      //this.setAttribute('role', 'dialog');
      //this.setAttribute('aria-hidden', 'true');
      this.setAttribute('pending', 'pending');
      let wizard = this.closest('ui-wizard');
      elation.events.add(this, 'wizard_advance', (ev) => { console.log('wizard advance', ev, wizard); wizard.advance(this); ev.stopPropagation(); });
    }
    start() {
      this.focus();
      this.dispatchEvent({type: 'start'});
      //this.setAttribute('aria-selected', 'true');
      this.setAttribute('role', 'dialog');
      //this.setAttribute('aria-hidden', 'false');
      setTimeout(() => {
        this.removeAttribute('pending');
      }, 0);
    }
    finish() {
      this.finished = true;
      //console.log('step finished', this);
      this.dispatchEvent({type: 'finish'});
      //this.setAttribute('aria-selected', 'false');
      this.removeAttribute('role');
      //this.setAttribute('aria-hidden', 'true');
    }
  });
  elation.elements.define('ui-wizard-pagination', class extends elation.elements.base {
    create() {
      let wizard = this.queryParentSelector('ui-wizard'),
          step = this.queryParentSelector('ui-wizard-step');;
      if (wizard.type == 'paginate') {
        if (step !== wizard.steps[0]) {
          this.backbutton = elation.elements.create('ui-button', {
            label: 'Back',
            disabled: false,
            append: this,
            'class': 'back',
          });
          elation.events.add(this.backbutton, 'click', ev => wizard.goback());
        }
        if (step !== wizard.steps[wizard.steps.length - 1]) {
          this.nextbutton = elation.elements.create('ui-button', {
            label: 'Next',
            disabled: true,
            append: this,
            'class': 'next',
          });
          elation.events.add(this.nextbutton, 'click', ev => {
            if (!this.nextbutton.disabled) wizard.advance()
          });
          elation.events.add(step, 'finish', ev => {
            this.nextbutton.disabled = false
          });
        }
      } else if (wizard.type == 'scroll') {
        elation.elements.create('ui-scrollindicator', { append: this });
      }
    }
  });
  elation.elements.define('ui-wizard-navigation', class extends elation.elements.base {
    create() {
      let wizard = this.queryParentSelector('ui-wizard');
      console.log('nav!', wizard);
      let buttonbar = elation.elements.create('ui-buttonbar', {
        append: this
      });
      this.buttons = [];
      wizard.steps.forEach(step => {
        console.log(' - ', step);
        let button = elation.elements.create('ui-button', {
          label: step.id,
          disabled: !step.finished,
          append: buttonbar
        });
        button.addEventListener('click', ev => {
          if (!button.disabled) {
            wizard.advance(step.id);
          }
        });
        elation.events.add(step, 'finish', ev => {
          button.disabled = false;
        });
        this.buttons.push(button);
      });
      elation.events.add(wizard, 'step', ev => {
        for (let i = 0; i < this.buttons.length; i++) {
          this.buttons[i].setActive((i == ev.detail - 1));
          this.buttons[i].disabled = (i > ev.detail - 1) && !wizard.steps[i].finished;
        }
        this.buttons[0].disabled = false;
      });
      this.buttons[0].disabled = false;
      this.buttons[0].setActive(true);
    }
  });
});

