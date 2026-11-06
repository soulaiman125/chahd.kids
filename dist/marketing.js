(() => {
  'use strict';
  const meta = name => document.querySelector('meta[name="' + name + '"]')?.content;
  const pixelId = meta('chahd-meta-pixel');
  const choiceKey = 'chahd-marketing-choice-v1';
  const campaignKey = 'chahd-campaign-v1';
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const safeCode = /^[a-z0-9][a-z0-9_.-]{0,79}$/i;
  const safeId = /^[a-z0-9][a-z0-9-]{0,95}$/;
  const params = new URLSearchParams(location.search);
  const landingCampaign = Object.fromEntries(utmKeys.flatMap(key => {
    const value = params.get(key);
    return safeCode.test(value || '') ? [[key, value]] : [];
  }));
  // Meta receives the current page URL. Leave pages with arbitrary input, such
  // as catalogue search queries, outside the Pixel integration.
  const safePage = [...params].every(([key, value]) => {
    if (utmKeys.includes(key)) return safeCode.test(value);
    if (key === 'fbclid') return /^[a-z0-9_-]{1,512}$/i.test(value);
    return ['product', 'category', 'v'].includes(key) && safeId.test(value);
  }) && (!location.hash || ['#catalog', '#categories', '#main', '#help', '#story'].includes(location.hash));

  const read = (storage, key) => {
    try { return JSON.parse(window[storage].getItem(key)); }
    catch { return null; }
  };
  const write = (storage, key, value) => {
    try {
      if (value === null) window[storage].removeItem(key);
      else window[storage].setItem(key, JSON.stringify(value));
    } catch { /* Shopping works with storage blocked. */ }
  };
  const readChoice = () => {
    const saved = read('localStorage', choiceKey);
    return saved?.expires > Date.now() ? saved.value : null;
  };

  let choice = readChoice();
  let campaign = null;
  let initialized = false;
  let pageTracked = false;
  const startedDrafts = new Set();
  const orderLinks = [...document.querySelectorAll('a[data-ad-order]')].map(link => [link, link.href]);

  function rememberCampaign() {
    if (Object.keys(landingCampaign).length) {
      campaign = { values: landingCampaign, expires: Date.now() + 24 * 60 * 60 * 1000 };
      write('sessionStorage', campaignKey, campaign);
    } else {
      campaign = read('sessionStorage', campaignKey);
    }
  }

  function canTrack() {
    return choice === 'allow' && /^\d{5,30}$/.test(pixelId || '') && safePage;
  }

  function track(name, data = {}) {
    if (!initialized || !canTrack()) return;
    try { window.fbq('trackSingle', pixelId, name, data); }
    catch { /* A tracking error must not interrupt shopping. */ }
  }

  function productData(items) {
    const contents = items.filter(item => typeof item.id === 'string' && safeId.test(item.id) && Number.isInteger(item.quantity) && item.quantity > 0)
      .map(({ id, quantity, price }) => ({ id, quantity, ...(Number.isFinite(price) && price > 0 ? { item_price: price } : {}) }));
    const data = {
      content_ids: [...new Set(contents.map(item => item.id))],
      content_type: 'product',
      contents,
      num_items: contents.reduce((sum, item) => sum + item.quantity, 0)
    };
    if (contents.length && contents.every(item => item.item_price !== undefined)) {
      data.value = Math.round(contents.reduce((sum, item) => sum + item.quantity * item.item_price, 0) * 100) / 100;
      data.currency = 'MAD';
    }
    return data;
  }

  function enablePixel() {
    if (!canTrack()) return;
    if (!initialized) {
      if (!window.fbq) {
        const fbq = function () {
          if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
          else fbq.queue.push(arguments);
        };
        fbq.push = fbq;
        fbq.loaded = true;
        fbq.version = '2.0';
        fbq.queue = [];
        window.fbq = fbq;
        window._fbq = fbq;

        const script = document.createElement('script');
        script.async = true;
        script.referrerPolicy = 'origin';
        script.src = 'https://connect.facebook.net/en_US/fbevents.js';
        document.head.append(script);
      }
      window.fbq('consent', 'grant');
      window.fbq('set', 'autoConfig', false, pixelId);
      window.fbq('init', pixelId);
      initialized = true;
    } else {
      window.fbq('consent', 'grant');
    }

    if (pageTracked) return;
    pageTracked = true;
    track('PageView');
    const id = meta('chahd-product-id');
    if (safeId.test(id || '')) {
      track('ViewContent', productData([{ id, quantity: 1, price: Number(meta('chahd-product-price')) }]));
    }
  }

  function applyChoice(value) {
    choice = value;
    if (choice === 'allow') {
      rememberCampaign();
      enablePixel();
    } else {
      campaign = null;
      write('sessionStorage', campaignKey, null);
      for (const [link, href] of orderLinks) link.href = href;
      if (initialized) window.fbq('consent', 'revoke');
    }
  }

  function campaignLine() {
    if (choice !== 'allow' || !(campaign?.expires > Date.now())) return '';
    const codes = utmKeys.flatMap(key => {
      const value = campaign.values?.[key];
      return safeCode.test(value || '') ? [key + '=' + value] : [];
    });
    return codes.length ? 'Campaign: ' + codes.join(' | ') : '';
  }

  window.chahdAds = {
    added(item) {
      const data = productData([item]);
      if (data.contents.length) track('AddToCart', data);
    },
    checkout(items, draftKey) {
      const data = productData(items);
      if (data.contents.length && canTrack() && !startedDrafts.has(draftKey)) {
        startedDrafts.add(draftKey);
        track('InitiateCheckout', data);
      }
      return campaignLine();
    }
  };

  const panel = document.querySelector('#marketing-preferences');
  const settings = document.querySelector('[data-marketing-settings]');
  const buttons = panel?.querySelectorAll('[data-marketing-choice]');
  for (const button of buttons || []) {
    button.addEventListener('click', () => {
      write('localStorage', choiceKey, {
        value: button.dataset.marketingChoice,
        expires: Date.now() + 180 * 24 * 60 * 60 * 1000
      });
      applyChoice(button.dataset.marketingChoice);
      panel.hidden = true;
      if (panel.contains(document.activeElement)) settings?.focus({ preventScroll: true });
    });
  }
  settings?.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) panel.querySelector('button').focus({ preventScroll: true });
  });

  for (const [link, initial] of orderLinks) {
    link.addEventListener('click', () => {
      const id = link.dataset.adOrder;
      const line = window.chahdAds.checkout(
        [{ id, quantity: 1, price: Number(link.dataset.adPrice) }], 'product:' + id
      );
      const url = new URL(initial);
      if (line) url.searchParams.set('text', (url.searchParams.get('text') || '') + '\n\n' + line);
      link.href = url.href;
    });
  }

  window.addEventListener('storage', event => {
    if (event.key !== choiceKey && event.key !== null) return;
    applyChoice(readChoice());
    if (panel) panel.hidden = true;
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) applyChoice(readChoice());
  });
  applyChoice(choice);
  if (panel && !choice && (pixelId || Object.keys(landingCampaign).length)) panel.hidden = false;
})();

