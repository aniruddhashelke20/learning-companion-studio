import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, BookOpen } from 'lucide-react';
import api, { track } from '../api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    // Fetch courses
    api.get('/courses').then((r) => setCourses(r.data));

    // Track page view
    track('DASHBOARD_VIEWED', {
      component: 'Dashboard',
      eventContext: 'Learner dashboard',
      resourceType: 'page',
      metadata: { referrer: document.referrer }
    });
  }, []);

  const handleCourseClick = (courseId, courseTitle) => {
    track('COURSE_CARD_CLICKED', {
      component: 'Dashboard',
      eventContext: courseTitle,
      resourceType: 'course',
      resourceId: courseId
    });
  };

  return (
    <Layout>
      {/* Header section with gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand to-indigo-600 dark:from-slate-900 dark:to-indigo-950 p-6 md:p-10 text-white shadow-xl shadow-brand/10 dark:shadow-none mb-10">
        <div className="relative z-10 max-w-2xl">
          <p className="text-indigo-100/90 text-xs font-bold uppercase tracking-wider">Your Learning Workspace</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1">
            Welcome back, {user.name.split(' ')[0]}!
          </h1>
          <p className="mt-2.5 text-indigo-100/80 leading-relaxed text-sm md:text-base">
            Choose a course from your dashboard below, watch the videos, and complete the lesson quizzes to assess your knowledge.
          </p>
        </div>
        {/* Abstract background decorative elements */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-gradient from-white/10 to-transparent pointer-events-none" />
      </div>

      {/* Courses Grid */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen size={22} className="text-brand dark:text-indigo-400" />
          Available Courses
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const startLessonId = course.lessons?.[0]?._id;
            return (
              <article
                key={course._id}
                className="group rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-lg dark:hover:shadow-black/35 hover:border-slate-200/80 dark:hover:border-slate-700/60 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <span className="inline-flex rounded-full bg-brand/5 dark:bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-brand dark:text-indigo-400 uppercase tracking-wider">
                    {course.level}
                  </span>
                  <h3 className="mt-4 text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-brand dark:group-hover:text-indigo-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {course.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between font-medium">
                  <p className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-550">
                    <Clock size={14} className="text-slate-400" />
                    <span>{course.lessons?.length || 0} lessons</span>
                  </p>
                  
                  {startLessonId ? (
                    <Link
                      className="inline-flex items-center gap-1 text-sm font-semibold text-brand dark:text-indigo-400 group-hover:gap-2 transition-all"
                      to={`/courses/${course._id}/lessons/${startLessonId}`}
                      onClick={() => handleCourseClick(course._id, course.title)}
                    >
                      <span>Start course</span>
                      <ArrowRight size={14} />
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-400">No lessons</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </Layout>
  );
}
