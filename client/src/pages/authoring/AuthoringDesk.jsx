import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PenSquare, Plus, Trash2, Globe, FileEdit, BookOpen, Layers } from 'lucide-react';
import api from '../../api';
import Layout from '../../components/Layout';

const emptyCourse = { title: '', description: '', category: '', level: 'Beginner' };

export default function AuthoringDesk() {
  const [courses, setCourses] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyCourse);
  const [busy, setBusy] = useState(false);

  const load = () => api.get('/authoring/courses').then((r) => setCourses(r.data));
  useEffect(() => { load(); }, []);

  const createCourse = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/authoring/courses', { ...form, status: 'draft' });
      setForm(emptyCourse);
      setShowCreate(false);
      setCourses([data, ...(courses || [])]);
    } finally { setBusy(false); }
  };

  const toggleStatus = async (course) => {
    const status = course.status === 'published' ? 'draft' : 'published';
    const { data } = await api.put(`/authoring/courses/${course._id}`, { status });
    setCourses(courses.map((c) => (c._id === course._id ? data : c)));
  };

  const remove = async (course) => {
    if (!window.confirm(`Delete "${course.title}" and all its lessons? This cannot be undone.`)) return;
    await api.delete(`/authoring/courses/${course._id}`);
    setCourses(courses.filter((c) => c._id !== course._id));
  };

  const inputClass = 'mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 dark:focus:ring-indigo-500/30 transition-all';

  return (
    <Layout>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-brand dark:from-slate-900 dark:to-violet-950 p-6 md:p-10 text-white shadow-xl shadow-violet-600/10 dark:shadow-none mb-10">
        <div className="relative z-10 max-w-2xl">
          <p className="text-violet-100/90 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <PenSquare size={13} />
            Creator / Authoring Desk
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1">Course Studio</h1>
          <p className="mt-2.5 text-violet-100/80 leading-relaxed text-sm md:text-base">
            Configure LCM components — LeD reflection spots, LbD activities with custom feedback, LxT resources and LxI prompts.
            Published changes appear instantly in the Learning Companion interface.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Layers size={22} className="text-violet-600 dark:text-violet-400" />
          Your Courses
        </h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-600/10 transition-all active:scale-[0.98]"
        >
          <Plus size={16} />
          <span>New course</span>
        </button>
      </div>

      {showCreate && (
        <form onSubmit={createCourse} className="mb-8 rounded-2xl border border-violet-200 dark:border-violet-900/40 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white">Create a new course</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Title</label>
              <input required className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Mentoring Visual Learners" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Category</label>
              <input className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. LC Training" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Description</label>
              <textarea rows={2} className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What will companions learn?" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Level</label>
              <select className={inputClass} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button disabled={busy} className="rounded-xl bg-violet-600 hover:bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50 active:scale-[0.98]">
              Create draft course
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              Cancel
            </button>
          </div>
        </form>
      )}

      {!courses ? (
        <p className="text-slate-500 dark:text-slate-400 animate-pulse font-medium py-12 text-center">Loading courses…</p>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <article key={course._id} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex flex-wrap items-center gap-4 justify-between hover:border-slate-200 dark:hover:border-slate-700 transition-all">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-bold text-slate-900 dark:text-white truncate">{course.title}</h3>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    course.status === 'published'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                  }`}>
                    {course.status === 'published' ? <Globe size={10} /> : <FileEdit size={10} />}
                    {course.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{course.description}</p>
                <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <BookOpen size={12} />
                  <span>{course.lessons?.length || 0} lessons · {course.category || 'Uncategorised'} · {course.level}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleStatus(course)}
                  className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all active:scale-[0.98] ${
                    course.status === 'published'
                      ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-950/60'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {course.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                <Link
                  to={`/studio/courses/${course._id}`}
                  className="rounded-lg bg-violet-600 hover:bg-violet-700 px-3.5 py-2 text-xs font-bold text-white transition-all active:scale-[0.98]"
                >
                  Open editor
                </Link>
                <button
                  onClick={() => remove(course)}
                  title="Delete course"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          ))}
          {courses.length === 0 && (
            <p className="text-center py-12 text-slate-500 dark:text-slate-400">No courses yet — create your first one.</p>
          )}
        </div>
      )}
    </Layout>
  );
}
