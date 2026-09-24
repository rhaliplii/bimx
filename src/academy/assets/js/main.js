// Page language: glossary and messages follow <html lang>.
const EN = document.documentElement.lang === 'en';

// Clock (EEST, like bimx.md top bar)
(function () {
  const el = document.getElementById('current-time');
  if (el) {
    const fmt = new Intl.DateTimeFormat('ro-RO', { timeZone: 'Europe/Chisinau', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const tick = () => { el.textContent = fmt.format(new Date()) + ' EEST'; };
    tick(); setInterval(tick, 1000);
  }
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

// Mobile menu
(function () {
  const btn = document.getElementById('menu-toggle');
  const nav = document.getElementById('mobile-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open'); btn.setAttribute('aria-expanded', false);
  }));
})();

// Course filters
(function () {
  const buttons = document.querySelectorAll('.filters button');
  const courses = document.querySelectorAll('.course');
  buttons.forEach(b => b.addEventListener('click', () => {
    buttons.forEach(x => { x.classList.remove('active'); x.setAttribute('aria-selected', false); });
    b.classList.add('active'); b.setAttribute('aria-selected', true);
    const f = b.dataset.filter;
    courses.forEach(c => c.classList.toggle('hidden', f !== 'all' && c.dataset.level !== f));
  }));
})();

// Glossary
(function () {
  const grid = document.getElementById('glossary');
  if (!grid) return;
  const termsEn = [
    ['Admission and Maintenance Undertaking', 'Listing', 'A document in which the issuer commits to meeting its obligations while trading on BIMx; part of the admission file.'],
    ['Admission to trading', 'Listing', 'The exchange decision that allows an issuer\'s instruments to trade on one of its markets: at BIMx, the Regulated Market or the MTF.'],
    ['Agreement in Principle (MTF)', 'Listing', 'The first stage of admission to the MTF: BIMx issues it within 5 working days of receiving the complete file from the issuer and the Intermediary Participant.'],
    ['ARENA Trading', 'Infrastructure', 'The BIMx electronic trading platform, developed by the Bucharest Stock Exchange and used as SaaS.'],
    ['Bond', 'Instrument', 'A debt security in which the issuer undertakes to repay the borrowed amount plus interest (the coupon).'],
    ['Broker', 'Participant', 'An investment firm licensed by the CNPF that executes clients\' orders. Only brokers admitted as exchange members can trade on BIMx.'],
    ['Dividend', 'Return', 'The part of a company\'s net profit distributed to shareholders, usually once a year.'],
    ['ESG', 'Sustainability', 'Environmental, social and governance criteria used to assess how sustainable a company is.'],
    ['Exchange member', 'Participant', 'An investment firm licensed by the CNPF and admitted by BIMx to trade. Admission of BIMx members began on 28 September 2026.'],
    ['Exchange trader', 'Participant', 'A person certified by BIMx who enters orders into the trading system on behalf of a member broker.'],
    ['Free float', 'Indicator', 'The part of the shares actually available to the public. On the BIMx Regulated Market it must, as a rule, be at least 10%.'],
    ['Government securities (VMS)', 'Instrument', 'Debt securities issued by the Ministry of Finance. Long-term government securities are admitted to BIMx by right; treasury bills (under one year) are not.'],
    ['Green bond', 'Sustainability', 'A bond whose proceeds are used exclusively to finance projects with a positive environmental impact.'],
    ['Initiating Participant', 'Participant', 'A member broker that helps an issuer prepare and submit its file for the Regulated Market; mandatory for municipal bonds.'],
    ['Intermediary Participant', 'Participant', 'A member broker with which an issuer must have a contract on the MTF for as long as its shares are traded.'],
    ['Issuer', 'Participant', 'An entity that issues securities to raise financing on the capital market.'],
    ['Limit order', 'Trading', 'A buy or sell order executed only at a specified price or better.'],
    ['Liquidity', 'Market', 'How easily an instrument can be bought or sold without significantly moving its price.'],
    ['Listing', 'Listing', 'Admission of a company\'s securities to trading on an exchange market. The first listing on BIMx is planned by the end of 2026.'],
    ['Market capitalization', 'Indicator', 'A company\'s market value: the number of shares issued multiplied by the current share price.'],
    ['Market operator', 'Infrastructure', 'The entity authorized by the CNPF to manage and operate a capital market. In the Republic of Moldova: BIMx, authorized on 21 August 2026.'],
    ['Multilateral Trading Facility (MTF)', 'Market', 'A market run by the exchange with tailored admission and reporting requirements set by its own rules; suited to smaller companies or first-time issuers.'],
    ['Municipal bond', 'Instrument', 'A debt security issued by a local public authority. At BIMx it is admitted to the Regulated Market through an Initiating Participant.'],
    ['Portfolio', 'Investing', 'All the financial instruments held by an investor.'],
    ['Prospectus', 'Listing', 'A disclosure document describing the issuer and the offer, required for a public offer or admission to trading.'],
    ['Regulated Market', 'Market', 'The exchange market with the most complete admission, transparency and reporting requirements for issuers.'],
    ['Return', 'Return', 'The gain from an investment, usually expressed as a percentage of the amount invested.'],
    ['Share', 'Instrument', 'A security representing ownership of part of a company\'s capital, with voting rights and the right to dividends.'],
    ['Single Central Securities Depository (DCU)', 'Infrastructure', 'The institution that keeps the register of securities in the Republic of Moldova and settles trades concluded on BIMx.'],
    ['Stock index', 'Indicator', 'An indicator that tracks the prices of a representative group of listed instruments.'],
    ['T+2 settlement', 'Infrastructure', 'The actual transfer of securities and cash on the second working day after the trade, on a delivery-versus-payment basis.'],
    ['Volatility', 'Risk', 'A measure of how widely an instrument\'s price moves over a given period.']
  ];
  const termsRo = [
    ['Acțiune', 'Instrument', 'Titlu de proprietate asupra unei părți din capitalul unei companii, care oferă drept de vot și dreptul la dividende.'],
    ['Admitere la tranzacționare', 'Listare', 'Decizia bursei prin care instrumentele unui emitent pot fi tranzacționate pe una dintre piețele sale: la BIMx, Piața Reglementată sau MTF.'],
    ['Acord de principiu (MTF)', 'Listare', 'Prima etapă a admiterii pe MTF: BIMx îl eliberează în maximum 5 zile lucrătoare de la documentația completă depusă de emitent și Participantul intermediar.'],
    ['Agent de bursă', 'Participant', 'Persoana fizică atestată de BIMx care introduce ordinele în sistemul de tranzacționare, în numele unui broker membru al bursei.'],
    ['ARENA Trading', 'Infrastructură', 'Platforma electronică de tranzacționare a BIMx, dezvoltată de Bursa de Valori București și folosită în regim SaaS.'],
    ['Angajament de admitere și menținere', 'Listare', 'Document prin care emitentul își asumă respectarea obligațiilor pe durata tranzacționării la BIMx; face parte din dosarul de admitere.'],
    ['Broker', 'Participant', 'Societate de investiții licențiată de CNPF care execută ordinele clienților. La BIMx tranzacționează doar brokerii admiși ca membri ai bursei.'],
    ['Capitalizare bursieră', 'Indicator', 'Valoarea de piață a unei companii: numărul de acțiuni emise înmulțit cu prețul curent al acțiunii.'],
    ['Decontare T+2', 'Infrastructură', 'Transferul efectiv al valorilor mobiliare și al banilor, în a doua zi lucrătoare după tranzacție, după principiul livrare contra plată.'],
    ['Depozitarul Central Unic (DCU)', 'Infrastructură', 'Instituția care ține evidența valorilor mobiliare din Republica Moldova și decontează tranzacțiile încheiate la BIMx.'],
    ['Dividend', 'Randament', 'Partea din profitul net al companiei distribuită acționarilor, de regulă anual.'],
    ['Emitent', 'Participant', 'Entitatea care emite valori mobiliare pentru a atrage finanțare de pe piața de capital.'],
    ['ESG', 'Sustenabilitate', 'Criterii de mediu, sociale și de guvernanță utilizate pentru evaluarea sustenabilității unei companii.'],
    ['Indice bursier', 'Indicator', 'Indicator care reflectă evoluția prețurilor unui grup reprezentativ de instrumente listate.'],
    ['Lichiditate', 'Piață', 'Ușurința cu care un instrument poate fi cumpărat sau vândut fără a-i influența semnificativ prețul.'],
    ['Listare', 'Listare', 'Admiterea la tranzacționare a valorilor mobiliare ale unei companii pe o piață a bursei. Prima listare la BIMx este planificată până la sfârșitul anului 2026.'],
    ['Membru al bursei', 'Participant', 'Societate de investiții licențiată de CNPF și admisă de BIMx să tranzacționeze. Admiterea membrilor BIMx a început la 28 septembrie 2026.'],
    ['Free float', 'Indicator', 'Partea din acțiuni aflată efectiv la dispoziția publicului. Pe Piața Reglementată BIMx trebuie să fie, ca regulă, de cel puțin 10%.'],
    ['Obligațiune', 'Instrument', 'Titlu de creanță prin care emitentul se obligă să ramburseze suma împrumutată plus dobânda (cupon).'],
    ['Obligațiune municipală', 'Instrument', 'Titlu de creanță emis de o autoritate publică locală. La BIMx se admite pe Piața Reglementată, prin Participant inițiator.'],
    ['Obligațiune verde', 'Sustenabilitate', 'Obligațiune ale cărei fonduri sunt utilizate exclusiv pentru finanțarea proiectelor cu impact pozitiv asupra mediului.'],
    ['Operator de piață', 'Infrastructură', 'Entitatea autorizată de CNPF să administreze și să exploateze o piață de capital. În Republica Moldova: BIMx, autorizată la 21 august 2026.'],
    ['Ordin limită', 'Tranzacționare', 'Ordin de cumpărare sau vânzare executat doar la un preț specificat sau mai bun.'],
    ['Participant inițiator', 'Participant', 'Broker membru care asistă emitentul la pregătirea și depunerea dosarului pe Piața Reglementată; obligatoriu pentru obligațiunile municipale.'],
    ['Participant intermediar', 'Participant', 'Broker membru cu care emitentul are obligatoriu contract pe MTF, pe toată durata tranzacționării.'],
    ['Piața Reglementată', 'Piață', 'Piața bursei cu cele mai complete cerințe de admitere, transparență și raportare pentru emitenți.'],
    ['Portofoliu', 'Investiții', 'Totalitatea instrumentelor financiare deținute de un investitor.'],
    ['Prospect', 'Listare', 'Document de informare care prezintă emitentul și oferta, necesar pentru o ofertă publică sau admitere la tranzacționare.'],
    ['Randament', 'Randament', 'Câștigul obținut dintr-o investiție, exprimat de regulă procentual față de suma investită.'],
    ['Sistem Multilateral de Tranzacționare (MTF)', 'Piață', 'Piață administrată de bursă, cu cerințe de admitere și raportare adaptate, stabilite prin reguli proprii; potrivită companiilor mai mici sau la prima emisiune.'],
    ['Valori mobiliare de stat (VMS)', 'Instrument', 'Titluri de datorie emise de Ministerul Finanțelor. La BIMx se admit de drept VMS pe termen lung; bonurile de trezorerie (sub un an) nu.'],
    ['Volatilitate', 'Risc', 'Măsura amplitudinii variațiilor de preț ale unui instrument într-o perioadă dată.']
  ];
  const terms = EN ? termsEn : termsRo;
  const empty = document.getElementById('gloss-empty');
  const input = document.getElementById('gloss-search');
  const lettersEl = document.getElementById('letters');
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  let letter = null;

  grid.innerHTML = terms.map(([t, c, d]) =>
    `<article class="term" data-t="${norm(t)}" data-d="${norm(d)}"><h4>${t}<small>${c}</small></h4><p>${d}</p></article>`
  ).join('');

  const letters = [...new Set(terms.map(t => norm(t[0])[0].toUpperCase()))];
  lettersEl.innerHTML = [EN ? 'All' : 'Toate', ...letters].map((l, i) =>
    `<button data-l="${i ? l : ''}" class="${i ? '' : 'active'}" style="${i ? '' : 'width:auto;padding:0 12px'}">${l}</button>`
  ).join('');

  function apply() {
    const q = norm(input.value.trim());
    let shown = 0;
    grid.querySelectorAll('.term').forEach(el => {
      const ok = (!q || el.dataset.t.includes(q) || el.dataset.d.includes(q)) &&
                 (!letter || el.dataset.t[0].toUpperCase() === letter);
      el.classList.toggle('hidden', !ok);
      if (ok) shown++;
    });
    empty.classList.toggle('show', shown === 0);
  }
  input.addEventListener('input', apply);
  lettersEl.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    lettersEl.querySelectorAll('button').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    letter = b.dataset.l || null;
    apply();
  });
})();

// Newsletter (demo)
(function () {
  const form = document.getElementById('newsletter-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input');
    const msg = document.getElementById('newsletter-msg');
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
    msg.style.display = 'block';
    msg.style.color = valid ? '#6ee0a8' : '#ff8a8a';
    msg.textContent = valid
      ? (EN ? 'Check your inbox or spam folder to confirm your subscription.' : 'Verifică-ți dosarul de intrări sau spam pentru a-ți confirma abonarea.')
      : (EN ? 'Please enter a valid email address.' : 'Te rugăm să introduci o adresă de email validă.');
    if (valid) input.value = '';
  });
})();

// Reveal on scroll + active section nav
(function () {
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  const nav = document.getElementById('section-nav');
  if (!nav) return;
  const links = nav.querySelectorAll('a');
  const map = new Map([...links].map(a => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) {
      links.forEach(l => l.classList.remove('active'));
      const a = map.get(en.target.id);
      if (a) { a.classList.add('active'); nav.scrollLeft = a.offsetLeft - nav.clientWidth / 2 + a.offsetWidth / 2; }
    }
  }), { rootMargin: '-45% 0px -50% 0px' });
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
})();
