/* Automatic translation uses the locally vendored MIT-licensed translate.js. */
(() => {
  'use strict';
  const picker = document.getElementById('site-language');
  const status = document.getElementById('translation-status');
  const original = document.getElementById('original-language');
  const engine = window.translate;
  const searchIndex = new Map();
  window.chahdTranslation = {searchIndex, language: 'ar'};
  if (!engine) {
    status.textContent = 'الترجمة غير متاحة الآن · Translation unavailable';
    picker.disabled = true;
    return;
  }

  // Keep private form values and brand identifiers outside translation requests.
  engine.ignore.class.push('notranslate', () => true);
  engine.ignore.class.push('private-field', data => !['placeholder', 'aria-label'].includes(data.attribute));
  engine.element.tagAttribute.input = {attribute: ['placeholder', 'aria-label'], condition: () => true};
  engine.element.tagAttribute.textarea = {attribute: ['placeholder', 'aria-label'], condition: () => true};
  engine.element.tagAttribute.button = {attribute: ['aria-label'], condition: () => true};
  engine.element.tagAttribute.nav = {attribute: ['aria-label'], condition: () => true};
  engine.element.tagAttribute.select = {attribute: ['aria-label'], condition: () => true};
  engine.language.setLocal('arabic');
  engine.service.use('client.edge');
  engine.selectLanguageTag.show = false;
  engine.request.api.init = '';
  engine.request.api.connectTest = '';
  engine.request.api.language = engine.service.edge.language.json;

  // Translation still works in browsers which disable persistent storage.
  const memory = new Map();
  const storageGet = engine.storage.get.bind(engine.storage);
  const storageSet = engine.storage.set.bind(engine.storage);
  engine.storage.get = key => {try {return storageGet(key);} catch {return memory.get(key) ?? null;}};
  engine.storage.set = (key, value) => {memory.set(key, value); try {return storageSet(key, value);} catch {}};

  const codeFor = language => ({'zh-CHS':'zh-Hans', 'zh-CHT':'zh-Hant'}[language.serviceId] || language.serviceId);
  const languages = engine.service.edge.language.json.map(item => {
    const code = codeFor(item);
    let name = item.name;
    try {name = new Intl.DisplayNames([code], {type: 'language'}).of(code);} catch {}
    if (item.id === 'arabic') name = 'العربية';
    return {...item, code, name};
  });
  const byId = new Map(languages.map(item => [item.id, item]));
  const priority = ['arabic', 'french', 'english', 'spanish'];
  languages.sort((a, b) => {
    const aIndex = priority.indexOf(a.id), bIndex = priority.indexOf(b.id);
    if (aIndex >= 0 || bIndex >= 0) return (aIndex < 0 ? 99 : aIndex) - (bIndex < 0 ? 99 : bIndex);
    return a.name.localeCompare(b.name);
  });
  picker.replaceChildren(...languages.map(item => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.name;
    option.lang = item.code;
    option.dir = 'auto';
    return option;
  }));
  const rtl = new Set(['ar', 'he', 'fa', 'ur', 'ps', 'ku']);
  let selected = 'arabic', generation = 0, failed = false, settleTimer, watchdog;
  const requests = new Set();
  const readSaved = () => {try {return localStorage.getItem('chahd-language-v1');} catch {return null;}};
  const save = value => {try {localStorage.setItem('chahd-language-v1', value);} catch {}};

  function updateSearchIndex() {
    document.querySelectorAll('[data-product-id]').forEach(card => {
      searchIndex.set(card.dataset.productId, card.textContent);
    });
  }
  function setStatus(text, busy = false) {
    status.textContent = text;
    status.dataset.state = busy ? 'loading' : failed ? 'error' : 'ready';
    document.getElementById('language-controls').setAttribute('aria-busy', String(busy));
  }
  function finished() {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      if (requests.size || selected === 'arabic') return;
      clearTimeout(watchdog);
      updateSearchIndex();
      setStatus(failed ? 'تعذرت ترجمة بعض النصوص · Translation incomplete' : 'ترجمة آلية · Automatic translation');
    }, 350);
  }
  engine.listener.renderTaskFinish = () => {updateSearchIndex(); finished();};

  // Track network failures, ignore outdated responses after a language switch,
  // and only contact the translation endpoint selected above.
  const send = engine.request.send.bind(engine.request);
  engine.request.send = (url, data, extra, success, method, async, headers, failure) => {
    if (!url.startsWith('https://edge.microsoft.com/translate/translatetext?')) {
      if (failure) failure({status: 0, data: extra, requestURL: url});
      return null;
    }
    const current = generation;
    let xhr;
    function complete(callback, args, isFailure) {
      requests.delete(xhr);
      if (current !== generation) return;
      if (isFailure) failed = true;
      try {if (callback) callback(...args);} finally {finished();}
    }
    xhr = send(url, data, extra,
      (...args) => complete(success, args, false), method, async, headers,
      (...args) => complete(failure, args, true), false);
    if (xhr) {
      requests.add(xhr);
      xhr.timeout = 20000;
      xhr.addEventListener('timeout', () => complete(null, [], true));
      xhr.addEventListener('error', () => complete(null, [], true));
    }
    return xhr;
  };

  function choose(id, remember = true) {
    if (!byId.has(id)) id = 'arabic';
    generation++;
    for (const request of requests) request.abort();
    requests.clear();
    clearTimeout(settleTimer);
    clearTimeout(watchdog);
    failed = false;
    selected = id;
    searchIndex.clear();
    picker.value = id;
    const language = byId.get(id);
    window.chahdTranslation.language = language.code;
    document.documentElement.lang = language.code;
    document.documentElement.dir = rtl.has(language.code.split('-')[0]) ? 'rtl' : 'ltr';
    original.hidden = id === 'arabic';
    if (remember) save(id);
    setStatus(id === 'arabic' ? 'العربية — النسخة الأصلية · Original' : 'جاري الترجمة… · Translating…', id !== 'arabic');
    try {
      engine.changeLanguage(id);
      engine.listener.start();
      if (id !== 'arabic') {
        finished();
        watchdog = setTimeout(() => {
          failed = true;
          setStatus('الترجمة غير متاحة الآن. جرّبي مجدداً · Translation unavailable. Please retry.');
        }, 25000);
      }
    } catch (error) {
      console.error('Automatic translation could not start:', error);
      failed = true;
      setStatus('الترجمة غير متاحة الآن · Translation unavailable');
    }
  }
  picker.addEventListener('change', () => choose(picker.value));
  original.addEventListener('click', () => choose('arabic'));
  document.getElementById('translation-retry').addEventListener('click', () => choose(selected));
  engine.listener.start();
  choose(readSaved() || 'arabic', false);
})();
