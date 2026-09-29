import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowDown, ArrowUp, ArrowUpRight, Check, CheckCheck, Circle,
  Download, Ellipsis, Equal, Leaf, Minus, Moon, Pencil, Plus,
  Search, ShieldCheck, Sprout, Sun, Sunrise, Trash2, Upload, X,
} from 'lucide-react';
import { emptyScorecard, moveHabit, PERIODS, starterHabits, STORAGE_KEY, summarize, validateScorecard } from './scorecard.js';
import { CueWantingPage, JOURNAL_PAGES, WorksheetPage } from './journal-pages.jsx';
import './styles.css';

const ratingInfo = {
  positive: { label: 'Positive', Icon: Plus },
  negative: { label: 'Negative', Icon: Minus },
  neutral: { label: 'Neutral', Icon: Equal },
};
const periodIcons = { Morning: Sunrise, Afternoon: Sun, Evening: Moon };

function currentPage() {
  const key = window.location.hash.slice(1);
  return Object.hasOwn(JOURNAL_PAGES, key) ? key : 'scorecard';
}

function readSaved() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return { card: saved ? validateScorecard(JSON.parse(saved)) : emptyScorecard(), error: '' };
  } catch {
    return { card: emptyScorecard(), error: 'Saved data could not be opened. It has not been overwritten. Export the existing data before saving a new scorecard.' };
  }
}

function IconButton({ label, children, ...props }) {
  return <button type="button" className="icon-button" aria-label={label} title={label} {...props}>{children}</button>;
}

function Modal({ title, children, onClose, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return <dialog ref={ref} className={wide ? 'modal wide' : 'modal'} aria-labelledby="modal-title"
    onCancel={onClose} onKeyDown={(event) => { if (event.key === 'Escape') { event.preventDefault(); onClose(); } }}
    onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="modal-heading"><h2 id="modal-title">{title}</h2><IconButton label="Close dialog" onClick={onClose}><X size={20} /></IconButton></div>
    {children}
  </dialog>;
}

function HabitEditor({ habit, onSave, onDelete, onClose }) {
  const [draft, setDraft] = useState(habit);
  const update = (field, value) => setDraft((previous) => ({ ...previous, [field]: value }));
  return <Modal title={habit.id ? 'A closer look' : 'Add a habit'} onClose={onClose}>
    <form onSubmit={(event) => { event.preventDefault(); if (draft.name.trim()) onSave({ ...draft, name: draft.name.trim() }); }}>
      <label className="field-label" htmlFor="habit-name">Habit</label>
      <input id="habit-name" autoFocus required maxLength={160} value={draft.name} placeholder="e.g. Reach for my phone" onChange={(event) => update('name', event.target.value)} />
      <label className="field-label" htmlFor="habit-period">Time of day</label>
      <select id="habit-period" value={draft.period} onChange={(event) => update('period', event.target.value)}>{PERIODS.map((period) => <option key={period}>{period}</option>)}</select>
      <fieldset className="rating-field"><legend className="field-label">Impact on my identity</legend>
        <div className="editor-ratings">{[...Object.entries(ratingInfo), ['unrated', { label: 'Not rated', Icon: Circle }]].map(([key, { label, Icon }]) => {
          const value = key === 'unrated' ? null : key;
          return <button type="button" key={key} className={`editor-rating ${key} ${draft.rating === value ? 'selected' : ''}`} aria-pressed={draft.rating === value} onClick={() => update('rating', value)}><Icon size={16} />{label}</button>;
        })}</div>
      </fieldset>
      <label className="field-label" htmlFor="habit-note">What do I notice? <span>optional</span></label>
      <textarea id="habit-note" rows={3} maxLength={2000} value={draft.note} placeholder="The cue, the context, how it feels..." onChange={(event) => update('note', event.target.value)} />
      <div className="modal-actions">
        {habit.id && <IconButton label="Delete habit" onClick={() => onDelete(habit)}><Trash2 size={19} /></IconButton>}
        <button type="button" className="button secondary cancel" onClick={onClose}>Cancel</button>
        <button type="submit" className="button primary"><Check size={17} />{habit.id ? 'Save changes' : 'Add habit'}</button>
      </div>
    </form>
  </Modal>;
}

function App() {
  const [initial] = useState(readSaved);
  const [card, setCard] = useState(initial.card);
  const [page, setPage] = useState(currentPage);
  const [storageBlocked, setStorageBlocked] = useState(Boolean(initial.error));
  const [storageError, setStorageError] = useState(initial.error);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [notice, setNotice] = useState('');
  const importRef = useRef(null);
  const menuRef = useRef(null);
  const headingRef = useRef(null);
  const previousPage = useRef(page);
  const summary = summarize(card.habits);
  const pageInfo = JOURNAL_PAGES[page];

  useEffect(() => {
    const onHashChange = () => setPage(currentPage());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    document.title = `Everyday | ${pageInfo.title}`;
    if (previousPage.current !== page) {
      previousPage.current = page;
      headingRef.current?.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
  }, [page, pageInfo.title]);

  useEffect(() => {
    if (storageBlocked) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(card));
      setStorageError('');
    } catch {
      setStorageError('Your browser could not save these changes. Export a backup before closing this page.');
    }
  }, [card, storageBlocked]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 4500);
    return () => clearTimeout(timer);
  }, [notice]);

  const updateHabit = (id, changes) => setCard((previous) => ({ ...previous, habits: previous.habits.map((habit) => habit.id === id ? { ...habit, ...changes } : habit) }));
  const newHabit = (period = 'Morning') => setEditor({ name: '', period, rating: null, note: '' });
  const closeMenu = () => { if (menuRef.current) menuRef.current.open = false; };

  function updateStatement(kind, index, field, value) {
    setCard((previous) => ({ ...previous, [kind]: previous[kind].map((entry, position) => position === index ? { ...entry, [field]: value } : entry) }));
  }

  function clearStatement(kind, index, singular) {
    setConfirmation({ title: `Clear ${singular.toLowerCase()} ${index + 1}?`, detail: 'Only this statement will be cleared. Your other journal entries will stay unchanged.', label: 'Clear statement', destructive: true,
      action: () => setCard((previous) => ({ ...previous, [kind]: previous[kind].map((entry, position) => position === index ? emptyScorecard()[kind][index] : entry) })) });
  }

  function saveHabit(habit) {
    if (!habit.id && card.habits.length >= 1000) { setNotice('This scorecard has reached its 1,000-habit limit.'); return; }
    setCard((previous) => ({ ...previous, habits: habit.id ? previous.habits.map((existing) => existing.id === habit.id ? habit : existing) : [...previous.habits, { ...habit, id: crypto.randomUUID() }] }));
    setEditor(null);
    setNotice(habit.id ? 'Habit updated.' : 'Habit added.');
  }

  function deleteHabit(habit) {
    setEditor(null);
    setConfirmation({ title: 'Delete this habit?', detail: `"${habit.name}" and its note will be removed.`, label: 'Delete habit', destructive: true,
      action: () => { setCard((previous) => ({ ...previous, habits: previous.habits.filter((existing) => existing.id !== habit.id) })); setNotice('Habit deleted.'); } });
  }

  function downloadBackup() {
    closeMenu();
    try {
      const content = storageBlocked ? localStorage.getItem(STORAGE_KEY) : JSON.stringify(card, null, 2);
      if (!content) throw new Error('No saved data is available to export.');
      const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `everyday-scorecard-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice('Backup exported.');
    } catch { setNotice('The backup could not be exported. Browser storage may be unavailable.'); }
  }

  async function importBackup(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      if (file.size > 5_000_000) throw new Error('That file is too large. Choose an Everyday JSON backup under 5 MB.');
      const restored = validateScorecard(JSON.parse(await file.text()));
      setConfirmation({ title: 'Restore this backup?', detail: `Replace the entire journal with ${restored.habits.length} habits and the intention and stack worksheets from "${file.name}"? Older scorecard-only backups restore blank worksheets. Export your current journal first to keep it.`, label: 'Restore backup',
        action: () => { setStorageBlocked(false); setCard(restored); setFilter('all'); setQuery(''); setNotice('Backup restored.'); } });
    } catch (error) { setNotice(error instanceof SyntaxError ? 'This file is not valid JSON. Your scorecard has not been changed.' : error.message); }
  }

  const visibleHabits = card.habits.filter((habit) => (filter === 'all' || (filter === 'unrated' ? habit.rating === null : habit.rating === filter)) && `${habit.name} ${habit.note}`.toLowerCase().includes(query.toLowerCase()));
  let habitNumber = 0;
  const numbers = Object.fromEntries(PERIODS.flatMap((period) => card.habits.filter((habit) => habit.period === period).map((habit) => [habit.id, ++habitNumber])));

  return <>
    <header className="site-header"><div className="header-inner">
      <a className="brand" href="#scorecard" aria-label="Everyday home"><span className="brand-mark"><Sprout size={23} strokeWidth={1.7} /></span>everyday<span className="brand-dot">.</span></a>
      <span className="header-divider" /><span className="header-caption">A personal practice</span>
      <div className="header-actions"><span className={`save-status ${storageError ? 'has-error' : ''}`}><span className="status-dot" />{storageError ? 'Not saved' : 'Saved on this device'}</span>
        <details className="settings-menu" ref={menuRef}><summary className="icon-button" aria-label="Journal options" title="Journal options"><Ellipsis size={22} /></summary>
          <div className="menu-panel"><button onClick={downloadBackup}><Download size={17} />Export backup</button><button onClick={() => { closeMenu(); importRef.current.click(); }}><Upload size={17} />Import backup</button>
            <a href="https://jamesclear.com/habits-scorecard" target="_blank" rel="noreferrer"><ArrowUpRight size={17} />The original method</a>
            <div className="menu-divider" /><button className="danger-text" onClick={() => { closeMenu(); setConfirmation({ title: 'Clear your journal?', detail: 'All habits, ratings, identity, reflections, intentions, and routine stacks will be removed from this browser. Export a backup first to keep a copy.', label: 'Clear journal', destructive: true, action: () => { setStorageBlocked(false); setCard(emptyScorecard()); setFilter('all'); setQuery(''); setNotice('Journal cleared.'); } }); }}><Trash2 size={17} />Clear journal</button>
          </div>
        </details>
      </div>
      <input ref={importRef} type="file" accept=".json,application/json" onChange={importBackup} hidden aria-label="Import scorecard backup" />
    </div></header>

    <main className="page-shell">
      <nav className="journal-nav" aria-label="Journal pages">{Object.entries(JOURNAL_PAGES).map(([key, { label, Icon }]) => <a key={key} href={`#${key}`} aria-current={page === key ? 'page' : undefined}><Icon size={17} /><span>{label}</span></a>)}</nav>
      {storageError && <div className="storage-warning" role="alert"><span>{storageError}</span><button className="text-button" onClick={downloadBackup}>Export backup</button>{storageBlocked && <button className="text-button" onClick={() => setConfirmation({ title: 'Replace unreadable saved data?', detail: 'This will overwrite the previous saved data with the scorecard currently on screen. Export the existing data first to keep a copy.', label: 'Save this scorecard', action: () => setStorageBlocked(false) })}>Save new scorecard</button>}</div>}
      <div className="page-heading"><div><p className="eyebrow">THE EVERYDAY JOURNAL <span>/</span> {String(Object.keys(JOURNAL_PAGES).indexOf(page) + 1).padStart(2, '0')}</p><h1 ref={headingRef} tabIndex={-1}>{pageInfo.title}<span>.</span></h1><p className="page-subtitle">{pageInfo.subtitle}</p></div>{page === 'scorecard' && <button className="button primary add-main" onClick={() => newHabit()}><Plus size={18} />Add habit</button>}</div>

      {page === 'scorecard' && <div className="workspace">
        <aside className="sidebar">
          <section className="identity-section"><div className="section-eyebrow"><Sprout size={17} /><h2>THE PERSON I'M BECOMING</h2></div>
            <label className="identity-prompt" htmlFor="identity">I want to be someone who...</label>
            <textarea id="identity" className="identity-input" rows={3} maxLength={500} placeholder="is present, curious, and takes care of themselves." value={card.identity} onChange={(event) => setCard((previous) => ({ ...previous, identity: event.target.value }))} />
          </section>
          <section className="overview-section"><div className="section-top"><h2>Your overview</h2><span className="small-label">{summary.total} habits</span></div>
            <div className="overview-bar" aria-label={`${summary.positive} positive, ${summary.negative} negative, ${summary.neutral} neutral, ${summary.unrated} not rated`}>
              {['positive', 'negative', 'neutral', 'unrated'].map((key) => <span key={key} className={key} style={{ flexGrow: summary[key] }} />)}
            </div>
            <div className="stat-list">{Object.entries(ratingInfo).map(([key, { label, Icon }]) => <button key={key} className={`stat-row ${filter === key ? 'active' : ''}`} onClick={() => setFilter(filter === key ? 'all' : key)} aria-pressed={filter === key}><span className={`stat-symbol ${key}`}><Icon size={16} /></span><span>{label}</span><strong>{summary[key]}</strong></button>)}
              <button className={`stat-row ${filter === 'unrated' ? 'active' : ''}`} onClick={() => setFilter(filter === 'unrated' ? 'all' : 'unrated')} aria-pressed={filter === 'unrated'}><span className="stat-symbol unrated"><Circle size={13} /></span><span>Not yet rated</span><strong>{summary.unrated}</strong></button>
            </div>
            <div className="review-total"><CheckCheck size={15} /><span>{summary.rated} of {summary.total} habits reviewed</span></div>
          </section>
          <figure className="journal-photo"><img src={`${import.meta.env.BASE_URL}journal.jpg`} alt="A fountain pen resting on handwritten notebook pages" /><figcaption>Small moments.<br /><em>Greater awareness.</em></figcaption></figure>
          <a className="method-link" href="https://jamesclear.com/habits-scorecard" target="_blank" rel="noreferrer"><span>Inspired by <em>Atomic Habits</em><small>The Habits Scorecard by James Clear</small></span><ArrowUpRight size={17} /></a>
        </aside>

        <div className="routine-area">
          <section className="routine-section" aria-labelledby="routine-title">
            <div className="routine-heading"><div className="section-top"><h2 id="routine-title">My daily routine</h2><span className="routine-count">{card.habits.length}</span></div><span className="routine-caption">From waking up to winding down</span></div>
            <div className="routine-toolbar"><div className="view-tabs" aria-label="Filter habits"><button className={filter === 'all' ? 'active' : ''} aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>All habits</button><button className={filter === 'unrated' ? 'active' : ''} aria-pressed={filter === 'unrated'} onClick={() => setFilter('unrated')}>To review <span>{summary.unrated}</span></button>{['positive', 'negative', 'neutral'].includes(filter) && <button className="active" onClick={() => setFilter('all')}>{ratingInfo[filter].label}<X size={13} /></button>}</div>
              <label className="search-field"><Search size={16} /><input type="search" aria-label="Search habits" placeholder="Find a habit" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
            </div>

            {card.habits.length === 0 ? <div className="empty-state"><span className="empty-icon"><Leaf size={34} strokeWidth={1.3} /></span><p className="eyebrow">A FRESH PAGE</p><h3>Your routine, as it is.</h3><div className="empty-actions"><button className="button primary" onClick={() => newHabit()}><Plus size={17} />Add my first habit</button><button className="text-button" onClick={() => { setCard((previous) => ({ ...previous, habits: starterHabits() })); setFilter('all'); setQuery(''); }}>Use a starter routine <ArrowUpRight size={15} /></button></div></div>
              : visibleHabits.length === 0 ? <div className="no-results"><CheckCheck size={28} /><h3>{filter === 'unrated' && !query ? 'All habits reviewed.' : 'No matching habits.'}</h3><button className="text-button" onClick={() => { setFilter('all'); setQuery(''); }}>Back to all habits</button></div>
              : <div className="periods">{PERIODS.map((period) => {
                const habits = visibleHabits.filter((habit) => habit.period === period);
                const allInPeriod = card.habits.filter((habit) => habit.period === period);
                const PeriodIcon = periodIcons[period];
                if (!habits.length && (filter !== 'all' || query)) return null;
                return <section className="period" key={period} aria-label={`${period} habits`}><div className="period-heading"><PeriodIcon size={18} strokeWidth={1.6} /><h3>{period}</h3><span>{allInPeriod.length}</span><div className="period-line" /><IconButton label={`Add ${period.toLowerCase()} habit`} onClick={() => newHabit(period)}><Plus size={17} /></IconButton></div>
                  <ol className="habit-list">{habits.map((habit) => <li className="habit-row" key={habit.id}>
                    <span className="habit-number">{String(numbers[habit.id]).padStart(2, '0')}</span>
                    <button className="habit-content" onClick={() => setEditor(habit)} aria-label={`Edit ${habit.name}`}><span className="habit-name">{habit.name}</span>{habit.note && <span className="habit-note">{habit.note}</span>}</button>
                    <div className="row-actions"><IconButton label={`Move ${habit.name} up`} disabled={allInPeriod[0]?.id === habit.id} onClick={() => setCard((previous) => ({ ...previous, habits: moveHabit(previous.habits, habit.id, -1) }))}><ArrowUp size={14} /></IconButton><IconButton label={`Move ${habit.name} down`} disabled={allInPeriod.at(-1)?.id === habit.id} onClick={() => setCard((previous) => ({ ...previous, habits: moveHabit(previous.habits, habit.id, 1) }))}><ArrowDown size={14} /></IconButton></div>
                    <div className="rating-buttons" role="group" aria-label={`Rate ${habit.name}`}>{Object.entries(ratingInfo).map(([key, { label, Icon }]) => <button key={key} className={`rating-button ${key} ${habit.rating === key ? 'selected' : ''}`} aria-label={`${label}: ${habit.name}`} aria-pressed={habit.rating === key} title={`${label} (select again to clear)`} onClick={() => updateHabit(habit.id, { rating: habit.rating === key ? null : key })}><Icon size={18} strokeWidth={1.7} /></button>)}</div>
                    <IconButton label={`Edit details for ${habit.name}`} onClick={() => setEditor(habit)}><Pencil size={15} /></IconButton>
                  </li>)}</ol>
                  {!habits.length && <button className="add-period-empty text-button" onClick={() => newHabit(period)}><Plus size={15} />Add a habit</button>}
                </section>;
              })}</div>}
            {card.habits.length > 0 && <div className="routine-bottom"><button className="text-button" onClick={() => newHabit()}><Plus size={16} />Add another habit</button><div className="rating-legend">{Object.entries(ratingInfo).map(([key, { label, Icon }]) => <span key={key}><Icon size={13} />{label}</span>)}</div></div>}
          </section>

          <section className="reflection-section"><div className="section-top"><h2>A moment of reflection</h2><Pencil size={16} /></div><label htmlFor="reflection">What patterns am I noticing?</label><textarea id="reflection" rows={3} maxLength={5000} placeholder="Today, I noticed..." value={card.reflection} onChange={(event) => setCard((previous) => ({ ...previous, reflection: event.target.value }))} /></section>
        </div>
      </div>}
      {(page === 'intentions' || page === 'routine-stack') && <WorksheetPage
        key={page} kind={page === 'intentions' ? 'intentions' : 'stacks'}
        entries={page === 'intentions' ? card.intentions : card.stacks}
        onChange={(index, field, value) => updateStatement(page === 'intentions' ? 'intentions' : 'stacks', index, field, value)}
        onClear={(index, singular) => clearStatement(page === 'intentions' ? 'intentions' : 'stacks', index, singular)}
      />}
      {page === 'cue-induced-wanting' && <CueWantingPage />}
      <footer className="site-footer"><span><ShieldCheck size={15} />On this browser. For you.</span><span>Awareness before change.</span><span className="footer-wordmark">everyday.</span></footer>
    </main>
    {notice && <div className="toast" role="status"><span>{notice}</span><IconButton label="Dismiss notification" onClick={() => setNotice('')}><X size={16} /></IconButton></div>}
    {editor && <HabitEditor habit={editor} onSave={saveHabit} onDelete={deleteHabit} onClose={() => setEditor(null)} />}
    {confirmation && <Modal title={confirmation.title} onClose={() => setConfirmation(null)}><p className="confirmation-detail">{confirmation.detail}</p><div className="modal-actions"><button className="button secondary cancel" onClick={() => setConfirmation(null)}>Cancel</button><button className={`button ${confirmation.destructive ? 'danger' : 'primary'}`} onClick={() => { confirmation.action(); setConfirmation(null); }}>{confirmation.label}</button></div></Modal>}
  </>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);