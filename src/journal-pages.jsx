import { ArrowRight, ArrowUpRight, Bell, Check, Heart, Layers, ListChecks, Pointer, Sparkles, Target, Trash2 } from 'lucide-react';

export const JOURNAL_PAGES = {
  scorecard: { label: 'Scorecard', title: 'My habit scorecard', subtitle: 'A moment to notice. A little room to grow.', Icon: ListChecks },
  intentions: { label: 'Intentions', title: 'My intentions', subtitle: 'A clear action. A time. A place.', Icon: Target },
  'routine-stack': { label: 'Routine stack', title: 'My routine stack', subtitle: 'Let one familiar action lead to the next.', Icon: Layers },
  'cue-induced-wanting': { label: 'Cue-induced wanting', title: 'Cue-induced wanting', subtitle: 'How a familiar cue can spark a new urge.', Icon: Sparkles },
};

const worksheetInfo = {
  intentions: {
    singular: 'Intention', title: 'Five intentions', principle: 'TIME + PLACE',
    formula: 'I will [behavior] at [time] in [location].',
    description: 'An implementation intention gives a planned action a specific time and place, instead of leaving it to a vague intention to do it later.',
    heading: 'Make the moment specific',
    guidance: 'Choose a small, observable action and a time and place that fit your day. A recurring time can include the days you intend to act.',
    example: 'I will write three sentences at 8:15 pm on weekdays in my study.',
    source: 'https://jamesclear.com/implementation-intentions',
    template: 'https://s3.amazonaws.com/jamesclear/Atomic+Habits/Implementation+Intentions.pdf',
    fields: [
      { key: 'behavior', label: 'I will', hint: 'Behavior', placeholder: 'write three sentences' },
      { key: 'time', label: 'at', hint: 'Time', placeholder: '8:15 pm on weekdays' },
      { key: 'location', label: 'in', hint: 'Location', placeholder: 'my study' },
    ],
  },
  stacks: {
    singular: 'Stack', title: 'Five habit stacks', principle: 'CURRENT HABIT + NEW HABIT',
    formula: 'After [current habit], I will [new habit].',
    description: 'Habit stacking uses a behavior you already do as the cue for a new one. The existing action supplies the moment to begin.',
    heading: 'Choose a dependable anchor',
    guidance: 'Use a precise action with a clear ending, and match its frequency to your new habit. Start small. A later link can follow the new action in an earlier link.',
    example: 'After I put my breakfast plate away, I will fill my water bottle.',
    source: 'https://jamesclear.com/habit-stacking',
    template: 'https://s3.amazonaws.com/jamesclear/Atomic+Habits/Habit+Stack.pdf',
    fields: [
      { key: 'cue', label: 'After', hint: 'Current habit', placeholder: 'I put my breakfast plate away' },
      { key: 'behavior', label: 'I will', hint: 'New habit', placeholder: 'fill my water bottle' },
    ],
  },
};

export function WorksheetPage({ kind, entries, onChange, onClear }) {
  const info = worksheetInfo[kind];
  const ready = entries.filter((entry) => info.fields.every(({ key }) => entry[key].trim())).length;

  return <div className="worksheet-layout">
    <aside className="worksheet-context">
      <p className="eyebrow">{info.principle}</p>
      <h2>The formula</h2>
      <p className="worksheet-formula">{info.formula}</p>
      <p>{info.description}</p>
      <div className="worksheet-advice"><h3>{info.heading}</h3><p>{info.guidance}</p></div>
      <figure className="worksheet-example"><figcaption>ONE EXAMPLE</figcaption><blockquote>{info.example}</blockquote></figure>
      <a className="source-link" href={info.template} target="_blank" rel="noreferrer">James Clear's worksheet <ArrowUpRight size={15} /></a>
      <a className="source-link" href={info.source} target="_blank" rel="noreferrer">Read the original method <ArrowUpRight size={15} /></a>
    </aside>
    <section className="statement-sheet" aria-label={info.title}>
      <div className="statement-sheet-heading"><h2>{info.title}</h2><span>{ready} of 5 defined</span></div>
      {entries.map((entry, index) => {
        const complete = info.fields.every(({ key }) => entry[key].trim());
        const started = info.fields.some(({ key }) => entry[key].trim());
        return <fieldset className="statement-row" key={index}>
          <legend><span className="statement-number">{String(index + 1).padStart(2, '0')}</span>{info.singular} {index + 1}</legend>
          <div className="statement-status"><span className={complete ? 'defined' : ''}>{complete ? <><Check size={13} />Defined</> : started ? 'In progress' : 'Not yet defined'}</span>
            <button type="button" className="icon-button" title={`Clear ${info.singular.toLowerCase()} ${index + 1}`} aria-label={`Clear ${info.singular.toLowerCase()} ${index + 1}`} disabled={!info.fields.some(({ key }) => entry[key])} onClick={() => onClear(index, info.singular)}><Trash2 size={15} /></button>
          </div>
          <div className={`statement-fields ${kind}`}>
            {info.fields.map(({ key, label, hint, placeholder }) => <label key={key} className="statement-field">
              <span className="statement-word">{label} <small>{hint}</small></span>
              <textarea rows={2} maxLength={300} aria-label={`${info.singular} ${index + 1} ${hint.toLowerCase()}`} placeholder={placeholder} value={entry[key]} onChange={(event) => onChange(index, key, event.target.value)} />
            </label>)}
          </div>
        </fieldset>;
      })}
    </section>
  </div>;
}

const habitLoop = [
  { title: 'Cue', detail: 'A streaming app appears on your TV.', Icon: Bell },
  { title: 'Craving', detail: 'You anticipate an easy escape from a tiring day.', Icon: Heart },
  { title: 'Response', detail: 'You open the app and choose an episode.', Icon: Pointer },
  { title: 'Reward', detail: 'You feel entertained or relieved for a while.', Icon: Sparkles },
];

export function CueWantingPage() {
  return <article className="cue-article">
    <div className="cue-introduction">
      <div><p className="eyebrow">NOTICE THE SIGNAL</p><h2>The urge can begin before the action.</h2>
        <p>Cue-induced wanting is the desire that can arise when you encounter something you have learned to associate with a reward. A place, a sound, an object, or a familiar situation can bring a habit to mind even when you were not thinking about it a moment earlier.</p>
        <p>In the habit model described in <em>Atomic Habits</em>, the cue signals a possible reward. The craving is the change you anticipate: relief, stimulation, comfort, connection, or something else you value. You may want that feeling before you take any action.</p>
      </div>
      <figure className="cue-photo"><img src={`${import.meta.env.BASE_URL}journal.jpg`} alt="A fountain pen on handwritten pages, an everyday visual cue for writing" /><figcaption>A familiar object can become a reminder of an anticipated experience.</figcaption></figure>
    </div>

    <section className="cue-example" aria-labelledby="cue-example-title"><div className="section-top"><h2 id="cue-example-title">An everyday example</h2><span className="small-label">THE HABIT LOOP</span></div>
      <ol className="habit-loop">{habitLoop.map(({ title, detail, Icon }, index) => <li key={title}><div className="loop-step-heading"><Icon size={20} /><span>{String(index + 1).padStart(2, '0')}</span>{index < habitLoop.length - 1 && <ArrowRight className="loop-arrow" size={17} />}</div><h3>{title}</h3><p>{detail}</p></li>)}</ol>
      <p className="cue-example-note">The wanting begins with the anticipated break, before an episode has played. Repeated experiences can strengthen the association between seeing the app and expecting relief.</p>
    </section>

    <div className="cue-lessons">
      <section><h2>Wanting is not the same as liking</h2><p>Feeling pulled toward an action does not guarantee that you will enjoy it, or that it supports the person you want to become. An urge is useful information about a learned association, not an instruction you must follow.</p></section>
      <section><h2>The same cue is not the same for everyone</h2><p>A signal gets its meaning from experience and context. An app icon might promise entertainment to one person and mean very little to another. Your response can also vary with your mood, surroundings, and current needs.</p></section>
    </div>

    <section className="cue-practice"><p className="eyebrow">WORK WITH YOUR ENVIRONMENT</p><h2>Change what meets your attention.</h2>
      <div className="cue-lessons"><div><h3>For a habit you want</h3><p>Put its cue where the action can happen: an open notebook on the desk, or a filled water bottle beside your work. Pair it with a realistic time and place or an existing routine.</p></div><div><h3>For a habit you want less of</h3><p>Reduce unnecessary exposure to its cues. Turn off nonessential alerts or keep a distracting device out of your immediate workspace. This reduces prompts; it does not erase learning or guarantee that an urge will disappear.</p></div></div>
      <p className="cue-question">When an urge appears, ask: what did I just notice, and what feeling am I expecting?</p>
      <div className="cue-page-links"><a className="text-button" href="#intentions">My intentions <ArrowRight size={16} /></a><a className="text-button" href="#routine-stack">My routine stack <ArrowRight size={16} /></a></div>
    </section>
    <footer className="article-sources"><p>Original summary of concepts discussed in James Clear's <em>Atomic Habits</em>.</p><a className="source-link" href="https://jamesclear.com/three-steps-habit-change" target="_blank" rel="noreferrer">James Clear: the habit loop <ArrowUpRight size={14} /></a><a className="source-link" href="https://jamesclear.com/how-to-break-a-bad-habit" target="_blank" rel="noreferrer">James Clear: changing cues and habits <ArrowUpRight size={14} /></a></footer>
  </article>;
}