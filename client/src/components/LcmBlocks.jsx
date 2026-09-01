import { useState } from 'react';
import { MessageCircleQuestion, PencilLine, Compass, Users, CheckCircle2, XCircle, ExternalLink, Sparkles, FileText, Video, Wrench, BookMarked } from 'lucide-react';
import { track } from '../api';

const sectionBadge = (color) => `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${color}`;

export function LcmSectionHeader({ icon: Icon, tag, tagColor, title, subtitle }) {
  return (
    <header className="mb-5">
      <span className={sectionBadge(tagColor)}>
        <Icon size={12} />
        {tag}
      </span>
      <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </header>
  );
}

// --- LeD: Reflection Spot -------------------------------------------------
export function ReflectionSpot({ spot, index, lesson, lessonId }) {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

  const submit = () => {
    if (!text.trim()) return;
    setSaved(true);
    track('LED_REFLECTION_SUBMITTED', {
      component: 'ReflectionSpot',
      eventContext: lesson.title,
      resourceType: 'reflection_spot',
      resourceId: spot._id || `${lessonId}-rs-${index}`,
      metadata: { prompt: spot.prompt, response: text }
    });
  };

  return (
    <div className="rounded-2xl border border-amber-200/70 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20 p-5">
      <p className="flex items-start gap-2.5 font-semibold text-amber-900 dark:text-amber-200 text-sm leading-relaxed">
        <Sparkles size={16} className="mt-0.5 shrink-0 text-amber-500" />
        {spot.prompt}
      </p>
      {spot.hint && (
        <p className="mt-2 ml-6 text-xs text-amber-700/80 dark:text-amber-300/70 italic">Hint: {spot.hint}</p>
      )}
      {saved ? (
        <div className="mt-4 ml-6 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 size={15} />
          <span>Reflection captured — the dialogue continues below.</span>
        </div>
      ) : (
        <div className="mt-4 ml-6">
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Pause the video and note your thinking here before you continue…"
            className="w-full rounded-xl border border-amber-200 dark:border-amber-900/50 bg-white/80 dark:bg-slate-950/40 px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder-amber-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition-all"
          />
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="mt-2 rounded-lg bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-bold text-white transition-all disabled:opacity-40 active:scale-[0.98]"
          >
            Capture reflection
          </button>
        </div>
      )}
    </div>
  );
}

// --- LbD: MCQ with per-option authored feedback ---------------------------
export function LbdQuestion({ question, index, lesson, lessonId }) {
  const [selected, setSelected] = useState(null);

  const choose = (n) => {
    setSelected(n);
    track('LBD_OPTION_SELECTED', {
      component: 'LbdQuestion',
      eventContext: lesson.title,
      resourceType: 'lbd_question',
      resourceId: question._id || `${lessonId}-lbd-${index}`,
      metadata: { prompt: question.prompt, optionIndex: n, correct: n === question.answer }
    });
  };

  return (
    <fieldset className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5">
      <p className="font-semibold text-slate-900 dark:text-white text-sm mb-1">Activity {index + 1}</p>
      <p className="text-slate-700 dark:text-slate-300 text-sm mb-4">{question.prompt}</p>
      <div className="space-y-2.5">
        {question.options.map((option, n) => {
          const isSelected = selected === n;
          const isCorrect = n === question.answer;
          let style = 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700';
          if (isSelected) {
            style = isCorrect
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 font-medium'
              : 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 font-medium';
          }
          return (
            <div key={n}>
              <button
                onClick={() => choose(n)}
                className={`w-full text-left flex items-center gap-3 rounded-xl border p-3.5 text-sm transition-all active:scale-[0.99] ${style}`}
              >
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  isSelected
                    ? isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {String.fromCharCode(65 + n)}
                </span>
                <span>{option.text}</span>
              </button>
              {isSelected && option.feedback && (
                <div className={`mt-1.5 ml-8 flex items-start gap-2 rounded-lg p-3 text-xs leading-relaxed ${
                  isCorrect
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300'
                }`}>
                  {isCorrect ? <CheckCircle2 size={14} className="mt-0.5 shrink-0" /> : <XCircle size={14} className="mt-0.5 shrink-0" />}
                  <span>{option.feedback}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500">Ungraded practice — try options freely; every choice has feedback from the course author.</p>
    </fieldset>
  );
}

// --- LbD: Subjective prompt with exemplar ---------------------------------
export function SubjectivePrompt({ prompt, index, lesson, lessonId }) {
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (!text.trim()) return;
    setSubmitted(true);
    track('LBD_SUBJECTIVE_SUBMITTED', {
      component: 'SubjectivePrompt',
      eventContext: lesson.title,
      resourceType: 'subjective_prompt',
      resourceId: prompt._id || `${lessonId}-sub-${index}`,
      metadata: { prompt: prompt.prompt, response: text }
    });
  };

  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5">
      <p className="flex items-start gap-2.5 font-semibold text-slate-900 dark:text-white text-sm leading-relaxed">
        <PencilLine size={16} className="mt-0.5 shrink-0 text-indigo-500" />
        {prompt.prompt}
      </p>
      <textarea
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={submitted}
        placeholder="Write your response in your own words…"
        className="mt-3 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 dark:focus:ring-indigo-500/30 disabled:opacity-70 transition-all"
      />
      {!submitted ? (
        <button
          onClick={submit}
          disabled={!text.trim()}
          className="mt-2 rounded-lg bg-brand dark:bg-indigo-600 hover:bg-brand-hover dark:hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white transition-all disabled:opacity-40 active:scale-[0.98]"
        >
          Submit &amp; compare with exemplar
        </button>
      ) : (
        prompt.exemplar && (
          <div className="mt-3 rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/60 dark:bg-indigo-950/20 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mb-1.5">Author&rsquo;s exemplar response</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{prompt.exemplar}</p>
            <p className="mt-2 text-[11px] text-indigo-400 dark:text-indigo-500">Compare your answer against the exemplar — what did you cover, and what would you add?</p>
          </div>
        )
      )}
    </div>
  );
}

// --- LxT: Resource pathways ----------------------------------------------
const kindIcon = { article: BookMarked, video: Video, worksheet: FileText, tool: Wrench, other: Compass };

export function LxtResources({ resources, lesson, lessonId }) {
  const open = (resource) => {
    track('LXT_RESOURCE_OPENED', {
      component: 'LxtResources',
      eventContext: lesson.title,
      resourceType: 'lxt_resource',
      resourceId: resource._id || lessonId,
      metadata: { title: resource.title, url: resource.url, kind: resource.kind }
    });
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {resources.map((resource, i) => {
        const Icon = kindIcon[resource.kind] || Compass;
        return (
          <a
            key={resource._id || i}
            href={resource.url}
            target="_blank"
            rel="noreferrer"
            onClick={() => open(resource)}
            className="group flex items-start gap-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4 hover:border-teal-300 dark:hover:border-teal-800 hover:shadow-md transition-all"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
              <Icon size={16} />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                <span className="truncate">{resource.title}</span>
                <ExternalLink size={12} className="shrink-0 opacity-50" />
              </span>
              <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{resource.note}</span>
              <span className="mt-1.5 inline-block rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{resource.kind}</span>
            </span>
          </a>
        );
      })}
    </div>
  );
}

// --- LxI: Discussion focus prompt ----------------------------------------
export function LxiPrompt({ prompt, index, lesson, lessonId }) {
  const [text, setText] = useState('');
  const [posted, setPosted] = useState(false);

  const post = () => {
    if (!text.trim()) return;
    setPosted(true);
    track('LXI_PROMPT_RESPONDED', {
      component: 'LxiPrompt',
      eventContext: lesson.title,
      resourceType: 'lxi_prompt',
      resourceId: prompt._id || `${lessonId}-lxi-${index}`,
      metadata: { prompt: prompt.prompt, response: text }
    });
  };

  return (
    <div className="rounded-2xl border border-violet-200/70 dark:border-violet-900/40 bg-violet-50/50 dark:bg-violet-950/20 p-5">
      <p className="text-[11px] font-bold uppercase tracking-wider text-violet-500 dark:text-violet-400">{prompt.title || 'Discussion focus'}</p>
      <p className="mt-1.5 flex items-start gap-2.5 font-semibold text-violet-950 dark:text-violet-200 text-sm leading-relaxed">
        <Users size={16} className="mt-0.5 shrink-0 text-violet-500" />
        {prompt.prompt}
      </p>
      {posted ? (
        <div className="mt-3 ml-6 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 size={15} />
          <span>Shared with your cohort — your mentor can see this in the discussion log.</span>
        </div>
      ) : (
        <div className="mt-3 ml-6">
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your experience with fellow Learning Companions…"
            className="w-full rounded-xl border border-violet-200 dark:border-violet-900/50 bg-white/80 dark:bg-slate-950/40 px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder-violet-400/60 focus:outline-none focus:ring-2 focus:ring-violet-400/40 transition-all"
          />
          <button
            onClick={post}
            disabled={!text.trim()}
            className="mt-2 rounded-lg bg-violet-500 hover:bg-violet-600 px-4 py-2 text-xs font-bold text-white transition-all disabled:opacity-40 active:scale-[0.98]"
          >
            Post to cohort
          </button>
        </div>
      )}
    </div>
  );
}

export const lcmIcons = { MessageCircleQuestion, PencilLine, Compass, Users };
