/**
 * JSDoc plugin that auto-documents events fired by elation custom elements.
 *
 * Scans source for `elation.elements.define('ns.name', class ... { ... })` blocks,
 * finds every `dispatchEvent({type: 'x'})` / `elation.events.fire({type: 'x'})` call
 * inside the class body, and injects synthetic `@event` doclets so they show up in
 * the generated docs.
 *
 * An event that already has a hand-written `@event` block for the same class/name
 * is skipped, so prose descriptions take precedence.
 */

'use strict';

const DEFINE_RE = /elation\.elements\.define\(\s*['"]([^'"]+)['"]\s*,\s*class\b/g;
const EVENT_CALL_RE = /(?:dispatchEvent|elation\.events\.fire)\s*\(\s*\{\s*type\s*:\s*['"]([a-zA-Z_][\w]*)['"]/g;

function findClassBodyEnd(src, openBraceIdx) {
  let depth = 1;
  let i = openBraceIdx + 1;
  while (i < src.length && depth > 0) {
    const ch = src[i];
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      i++;
      while (i < src.length && src[i] !== quote) {
        if (src[i] === '\\') i++;
        i++;
      }
      i++;
    } else if (ch === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') i++;
    } else if (ch === '/' && src[i + 1] === '*') {
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i += 2;
    } else {
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
      i++;
    }
  }
  return i;
}

exports.handlers = {
  beforeParse(e) {
    const src = e.source;
    if (src.indexOf('elation.elements.define') === -1) return;

    const injected = [];
    let match;
    DEFINE_RE.lastIndex = 0;

    while ((match = DEFINE_RE.exec(src)) !== null) {
      const rawName = match[1];
      const longname = 'elation.elements.' + rawName.replace(/-/g, '.');
      const classOpen = src.indexOf('{', match.index + match[0].length);
      if (classOpen === -1) continue;
      const classClose = findClassBodyEnd(src, classOpen);
      const body = src.substring(classOpen, classClose);

      const events = new Set();
      let em;
      EVENT_CALL_RE.lastIndex = 0;
      while ((em = EVENT_CALL_RE.exec(body)) !== null) {
        events.add(em[1]);
      }

      for (const ev of events) {
        const declared = new RegExp(
          '@event\\s+' + longname.replace(/\./g, '\\.') + '#' + ev + '\\b'
        );
        if (!declared.test(src)) {
          injected.push(`/**\n * @event ${longname}#${ev}\n */`);
        }
      }
    }

    if (injected.length > 0) {
      e.source = src + '\n\n' + injected.join('\n') + '\n';
    }
  }
};
