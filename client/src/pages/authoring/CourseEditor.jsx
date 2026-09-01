import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, Save, Sparkles, MessageCircleQuestion, PencilLine, Compass, Users, ClipboardCheck, CheckCircle2, Eye } from 'lucide-react';
import api from '../../api';
import Layout from '../../components/Layout';

const inputClass = 'mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all';
const labelClass = 'block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400';
const addBtnClass = 'inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all';
const removeBtnClass = 'p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0';

function SectionCard({ icon: Icon, tag, tagColor, title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${tagColor}`}>
        <Icon size={12} />
        {tag}
      </span>
      <h3 className="mt-2 font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-0.5 mb-4 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      {children}
    </section>
  );
}

export default function CourseEditor() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessonId, setLessonId] = useState(null);
  const [draft, setDraft] = useState(null);          // editable copy of the selected lesson
  const [quizDraft, setQuizDraft] = useState([]);    // editable copy of that lesson's quiz questions
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  const load = () => api.get(`/authoring/courses/${courseId}`).then((r) => {
    setCourse(r.data);
    return r.data;
  });

  useEffect(() => {
    load().then((data) => {
      if (data.lessons.length) selectLesson(data, data.lessons[0]._id);
    });
  }, [courseId]);

  const selectLesson = (courseData, id) => {
    const lesson = courseData.lessons.find((l) => l._id === id);
    if (!lesson) { setLessonId(null); setDraft(null); return; }
    setLessonId(id);
    setDraft(JSON.parse(JSON.stringify(lesson)));
    const quiz = courseData.quizzes?.find((q) => String(q.lessonId) === id);
    setQuizDraft(JSON.parse(JSON.stringify(quiz?.questions || [])));
    setSavedAt(null);
  };

  const set = (patch) => setDraft({ ...draft, ...patch });
  const setList = (key, index, patch) => {
    const list = [...draft[key]];
    list[index] = { ...list[index], ...patch };
    set({ [key]: list });
  };
  const addTo = (key, item) => set({ [key]: [...(draft[key] || []), item] });
  const removeFrom = (key, index) => set({ [key]: draft[key].filter((_, i) => i !== index) });

  const saveCourseMeta = async (patch) => {
    const { data } = await api.put(`/authoring/courses/${courseId}`, patch);
    setCourse(data);
  };

  const saveLesson = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/authoring/courses/${courseId}/lessons/${lessonId}`, draft);
      const { data: withQuiz } = await api.put(`/authoring/courses/${courseId}/quizzes/${lessonId}`, { questions: quizDraft });
      setCourse(withQuiz || data);
      setSavedAt(new Date());
    } finally { setSaving(false); }
  };

  const addLesson = async () => {
    const title = window.prompt('New lesson title:');
    if (!title) return;
    const { data } = await api.post(`/authoring/courses/${courseId}/lessons`, { title, content: 'Write the lesson content here…' });
    setCourse(data);
    selectLesson(data, data.lessons[data.lessons.length - 1]._id);
  };

  const deleteLesson = async () => {
    if (!window.confirm(`Delete lesson "${draft.title}"?`)) return;
    const { data } = await api.delete(`/authoring/courses/${courseId}/lessons/${lessonId}`);
    setCourse(data);
    if (data.lessons.length) selectLesson(data, data.lessons[0]._id);
    else { setLessonId(null); setDraft(null); }
  };

  if (!course) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-slate-500 dark:text-slate-400 animate-pulse font-medium">Loading course editor…</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <Link to="/studio" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 transition-colors">
          <ChevronLeft size={16} />
          Back to Authoring Desk
        </Link>
        <div className="flex items-center gap-2">
          {course.status === 'published' && lessonId && (
            <Link
              to={`/courses/${courseId}/lessons/${lessonId}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <Eye size={13} />
              <span>Preview in LC interface</span>
            </Link>
          )}
          <button
            onClick={() => saveCourseMeta({ status: course.status === 'published' ? 'draft' : 'published' })}
            className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all active:scale-[0.98] ${
              course.status === 'published'
                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {course.status === 'published' ? 'Published — click to unpublish' : 'Publish to companions'}
          </button>
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
        Editing: {course.title}
      </h1>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Lesson list sidebar */}
        <aside className="lg:col-span-1 space-y-3">
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Lessons</h3>
            <div className="space-y-1.5">
              {course.lessons.map((lesson, index) => (
                <button
                  key={lesson._id}
                  onClick={() => selectLesson(course, lesson._id)}
                  className={`w-full text-left flex items-start gap-2.5 p-2.5 rounded-xl text-sm transition-all ${
                    lesson._id === lessonId
                      ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold">{index + 1}</span>
                  <span className="leading-snug">{lesson.title}</span>
                </button>
              ))}
            </div>
            <button onClick={addLesson} className={`${addBtnClass} w-full justify-center mt-3`}>
              <Plus size={13} />
              <span>Add lesson</span>
            </button>
          </div>
        </aside>

        {/* Lesson editor */}
        <div className="lg:col-span-3 space-y-5">
          {!draft ? (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400">
              No lessons yet. Add your first lesson to start configuring LCM components.
            </div>
          ) : (
            <>
              {/* Basics */}
              <SectionCard icon={PencilLine} tag="Lesson basics" tagColor="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                title="Courseware" subtitle="Title, summary, concept video and the main lesson text.">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Title</label>
                    <input className={inputClass} value={draft.title} onChange={(e) => set({ title: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass}>Duration (minutes)</label>
                    <input type="number" min="1" className={inputClass} value={draft.durationMinutes} onChange={(e) => set({ durationMinutes: Number(e.target.value) })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Summary</label>
                    <input className={inputClass} value={draft.summary || ''} onChange={(e) => set({ summary: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Video URL (YouTube embed or MP4) — the LeD concept segment</label>
                    <input className={inputClass} value={draft.videoUrl || ''} onChange={(e) => set({ videoUrl: e.target.value })} placeholder="https://www.youtube.com/embed/…" />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Lesson content</label>
                    <textarea rows={6} className={inputClass} value={draft.content} onChange={(e) => set({ content: e.target.value })} />
                  </div>
                </div>
              </SectionCard>

              {/* LeD reflection spots */}
              <SectionCard icon={Sparkles} tag="LeD · Learning Dialogue" tagColor="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                title="Reflection spots" subtitle="Strategic pause points where the companion writes down their thinking before the dialogue continues.">
                <div className="space-y-3">
                  {(draft.reflectionSpots || []).map((spot, i) => (
                    <div key={i} className="flex gap-2 items-start rounded-xl border border-slate-100 dark:border-slate-800 p-3">
                      <div className="flex-1 space-y-2">
                        <div>
                          <label className={labelClass}>Prompt</label>
                          <textarea rows={2} className={inputClass} value={spot.prompt} onChange={(e) => setList('reflectionSpots', i, { prompt: e.target.value })} />
                        </div>
                        <div>
                          <label className={labelClass}>Hint (optional)</label>
                          <input className={inputClass} value={spot.hint || ''} onChange={(e) => setList('reflectionSpots', i, { hint: e.target.value })} />
                        </div>
                      </div>
                      <button onClick={() => removeFrom('reflectionSpots', i)} className={removeBtnClass}><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <button onClick={() => addTo('reflectionSpots', { prompt: '', hint: '' })} className={addBtnClass}>
                    <Plus size={13} /><span>Add reflection spot</span>
                  </button>
                </div>
              </SectionCard>

              {/* LbD MCQs */}
              <SectionCard icon={MessageCircleQuestion} tag="LbD · Learning by Doing" tagColor="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                title="Practice questions with per-option feedback" subtitle="Ungraded MCQs. Write a custom feedback message for every option — right or wrong, each choice teaches.">
                <div className="space-y-4">
                  {(draft.lbdQuestions || []).map((question, qi) => (
                    <div key={qi} className="rounded-xl border border-slate-100 dark:border-slate-800 p-4">
                      <div className="flex gap-2 items-start">
                        <div className="flex-1">
                          <label className={labelClass}>Question {qi + 1}</label>
                          <textarea rows={2} className={inputClass} value={question.prompt} onChange={(e) => setList('lbdQuestions', qi, { prompt: e.target.value })} />
                        </div>
                        <button onClick={() => removeFrom('lbdQuestions', qi)} className={removeBtnClass}><Trash2 size={14} /></button>
                      </div>
                      <div className="mt-3 space-y-3">
                        {question.options.map((option, oi) => (
                          <div key={oi} className="rounded-lg bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 p-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`answer-${qi}`}
                                checked={question.answer === oi}
                                onChange={() => setList('lbdQuestions', qi, { answer: oi })}
                                title="Mark as correct answer"
                                className="h-3.5 w-3.5 text-emerald-600 cursor-pointer"
                              />
                              <span className="text-[11px] font-bold text-slate-400">{String.fromCharCode(65 + oi)}{question.answer === oi ? ' · correct' : ''}</span>
                              <input
                                className={`${inputClass} mt-0 flex-1`}
                                placeholder="Option text"
                                value={option.text}
                                onChange={(e) => {
                                  const options = question.options.map((o, n) => (n === oi ? { ...o, text: e.target.value } : o));
                                  setList('lbdQuestions', qi, { options });
                                }}
                              />
                              <button
                                onClick={() => {
                                  const options = question.options.filter((_, n) => n !== oi);
                                  setList('lbdQuestions', qi, { options, answer: Math.min(question.answer, Math.max(options.length - 1, 0)) });
                                }}
                                className={removeBtnClass}
                              ><Trash2 size={13} /></button>
                            </div>
                            <input
                              className={`${inputClass} mt-2`}
                              placeholder="Feedback shown when the companion picks this option…"
                              value={option.feedback || ''}
                              onChange={(e) => {
                                const options = question.options.map((o, n) => (n === oi ? { ...o, feedback: e.target.value } : o));
                                setList('lbdQuestions', qi, { options });
                              }}
                            />
                          </div>
                        ))}
                        <button
                          onClick={() => setList('lbdQuestions', qi, { options: [...question.options, { text: '', feedback: '' }] })}
                          className={addBtnClass}
                        ><Plus size={13} /><span>Add option</span></button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => addTo('lbdQuestions', { prompt: '', options: [{ text: '', feedback: '' }, { text: '', feedback: '' }], answer: 0 })} className={addBtnClass}>
                    <Plus size={13} /><span>Add practice question</span>
                  </button>
                </div>
              </SectionCard>

              {/* LbD subjective prompts */}
              <SectionCard icon={PencilLine} tag="LbD · Subjective" tagColor="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                title="Subjective prompts with exemplar feedback" subtitle="Open-ended prompts. The companion answers first, then sees your exemplar response to self-assess against.">
                <div className="space-y-3">
                  {(draft.subjectivePrompts || []).map((prompt, i) => (
                    <div key={i} className="flex gap-2 items-start rounded-xl border border-slate-100 dark:border-slate-800 p-3">
                      <div className="flex-1 space-y-2">
                        <div>
                          <label className={labelClass}>Prompt</label>
                          <textarea rows={2} className={inputClass} value={prompt.prompt} onChange={(e) => setList('subjectivePrompts', i, { prompt: e.target.value })} />
                        </div>
                        <div>
                          <label className={labelClass}>Exemplar response (revealed after submission)</label>
                          <textarea rows={3} className={inputClass} value={prompt.exemplar || ''} onChange={(e) => setList('subjectivePrompts', i, { exemplar: e.target.value })} />
                        </div>
                      </div>
                      <button onClick={() => removeFrom('subjectivePrompts', i)} className={removeBtnClass}><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <button onClick={() => addTo('subjectivePrompts', { prompt: '', exemplar: '' })} className={addBtnClass}>
                    <Plus size={13} /><span>Add subjective prompt</span>
                  </button>
                </div>
              </SectionCard>

              {/* LxT resources */}
              <SectionCard icon={Compass} tag="LxT · Extension Trajectories" tagColor="bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400"
                title="Resource pathways" subtitle="Optional worksheets, videos, articles and tools — the uploads companions see under 'Go further'.">
                <div className="space-y-3">
                  {(draft.resources || []).map((resource, i) => (
                    <div key={i} className="flex gap-2 items-start rounded-xl border border-slate-100 dark:border-slate-800 p-3">
                      <div className="flex-1 grid gap-2 md:grid-cols-2">
                        <div>
                          <label className={labelClass}>Title</label>
                          <input className={inputClass} value={resource.title} onChange={(e) => setList('resources', i, { title: e.target.value })} />
                        </div>
                        <div>
                          <label className={labelClass}>Type</label>
                          <select className={inputClass} value={resource.kind} onChange={(e) => setList('resources', i, { kind: e.target.value })}>
                            <option value="article">Article</option><option value="video">Video</option>
                            <option value="worksheet">Worksheet</option><option value="tool">Tool</option><option value="other">Other</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className={labelClass}>URL (link to the uploaded file or resource)</label>
                          <input className={inputClass} value={resource.url} onChange={(e) => setList('resources', i, { url: e.target.value })} placeholder="https://…" />
                        </div>
                        <div className="md:col-span-2">
                          <label className={labelClass}>Note for companions</label>
                          <input className={inputClass} value={resource.note || ''} onChange={(e) => setList('resources', i, { note: e.target.value })} />
                        </div>
                      </div>
                      <button onClick={() => removeFrom('resources', i)} className={removeBtnClass}><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <button onClick={() => addTo('resources', { title: '', url: '', kind: 'worksheet', note: '' })} className={addBtnClass}>
                    <Plus size={13} /><span>Add resource</span>
                  </button>
                </div>
              </SectionCard>

              {/* LxI discussion prompts */}
              <SectionCard icon={Users} tag="LxI · Experience Interaction" tagColor="bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400"
                title="Weekly focus prompts" subtitle="Questions that drive peer discussion in the companion cohort.">
                <div className="space-y-3">
                  {(draft.discussionPrompts || []).map((prompt, i) => (
                    <div key={i} className="flex gap-2 items-start rounded-xl border border-slate-100 dark:border-slate-800 p-3">
                      <div className="flex-1 space-y-2">
                        <div>
                          <label className={labelClass}>Label</label>
                          <input className={inputClass} value={prompt.title || ''} onChange={(e) => setList('discussionPrompts', i, { title: e.target.value })} placeholder="Weekly focus" />
                        </div>
                        <div>
                          <label className={labelClass}>Focus question</label>
                          <textarea rows={2} className={inputClass} value={prompt.prompt} onChange={(e) => setList('discussionPrompts', i, { prompt: e.target.value })} />
                        </div>
                      </div>
                      <button onClick={() => removeFrom('discussionPrompts', i)} className={removeBtnClass}><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <button onClick={() => addTo('discussionPrompts', { title: 'Weekly focus', prompt: '' })} className={addBtnClass}>
                    <Plus size={13} /><span>Add focus prompt</span>
                  </button>
                </div>
              </SectionCard>

              {/* Review quiz */}
              <SectionCard icon={ClipboardCheck} tag="Review quiz" tagColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                title="Graded review quiz" subtitle="The end-of-lesson quiz shown on the companion's quiz page.">
                <div className="space-y-4">
                  {quizDraft.map((question, qi) => (
                    <div key={qi} className="rounded-xl border border-slate-100 dark:border-slate-800 p-4">
                      <div className="flex gap-2 items-start">
                        <div className="flex-1">
                          <label className={labelClass}>Question {qi + 1}</label>
                          <textarea rows={2} className={inputClass} value={question.prompt}
                            onChange={(e) => setQuizDraft(quizDraft.map((q, n) => (n === qi ? { ...q, prompt: e.target.value } : q)))} />
                        </div>
                        <button onClick={() => setQuizDraft(quizDraft.filter((_, n) => n !== qi))} className={removeBtnClass}><Trash2 size={14} /></button>
                      </div>
                      <div className="mt-3 space-y-2">
                        {question.options.map((option, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <input type="radio" name={`quiz-answer-${qi}`} checked={question.answer === oi}
                              onChange={() => setQuizDraft(quizDraft.map((q, n) => (n === qi ? { ...q, answer: oi } : q)))}
                              title="Mark as correct answer" className="h-3.5 w-3.5 text-emerald-600 cursor-pointer" />
                            <input className={`${inputClass} mt-0 flex-1`} value={option}
                              onChange={(e) => setQuizDraft(quizDraft.map((q, n) => (n === qi ? { ...q, options: q.options.map((o, m) => (m === oi ? e.target.value : o)) } : q)))} />
                            <button
                              onClick={() => setQuizDraft(quizDraft.map((q, n) => (n === qi ? { ...q, options: q.options.filter((_, m) => m !== oi), answer: Math.min(q.answer, Math.max(q.options.length - 2, 0)) } : q)))}
                              className={removeBtnClass}
                            ><Trash2 size={13} /></button>
                          </div>
                        ))}
                        <button
                          onClick={() => setQuizDraft(quizDraft.map((q, n) => (n === qi ? { ...q, options: [...q.options, ''] } : q)))}
                          className={addBtnClass}
                        ><Plus size={13} /><span>Add option</span></button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setQuizDraft([...quizDraft, { prompt: '', options: ['', ''], answer: 0 }])} className={addBtnClass}>
                    <Plus size={13} /><span>Add quiz question</span>
                  </button>
                </div>
              </SectionCard>

              {/* Save bar */}
              <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur p-4 shadow-lg">
                <div className="flex items-center gap-3 text-sm">
                  <button onClick={deleteLesson} className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:underline">
                    <Trash2 size={13} />
                    <span>Delete lesson</span>
                  </button>
                  {savedAt && (
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                      <CheckCircle2 size={13} />
                      <span>Saved — live in the LC interface</span>
                    </span>
                  )}
                </div>
                <button
                  onClick={saveLesson}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 px-6 py-3 text-sm font-bold text-white shadow-md shadow-violet-600/20 transition-all disabled:opacity-50 active:scale-[0.98]"
                >
                  <Save size={15} />
                  <span>{saving ? 'Saving…' : 'Save lesson & sync to companions'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
