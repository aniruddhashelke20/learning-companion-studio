import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, AlertCircle, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import api, { track } from '../api';
import Layout from '../components/Layout';

export default function Lesson() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const scrolled = useRef(false);
  const lesson = data?.lesson;

  // Fetch current lesson data
  useEffect(() => {
    api.get(`/courses/${courseId}/lessons/${lessonId}`)
      .then((r) => setData(r.data))
      .catch(() => setData({ error: true }));
  }, [courseId, lessonId]);

  // Fetch course details for syllabus outline sidebar
  useEffect(() => {
    api.get(`/courses/${courseId}`)
      .then((r) => setCourseDetails(r.data));
  }, [courseId]);

  // Handle scroll tracking with reset on lessonId change
  useEffect(() => {
    scrolled.current = false; // Fix: Reset scrolled state for new lesson
    
    if (!lesson) return;

    const onScroll = () => {
      if (!scrolled.current && window.scrollY > 150) {
        scrolled.current = true;
        track('LESSON_SCROLLED', {
          component: 'Lesson',
          eventContext: lesson.title,
          resourceType: 'lesson',
          resourceId: lessonId,
          metadata: { depth: '150px' }
        });
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [lesson, lessonId]);

  // Track video interactions
  const handleVideoPlay = () => {
    if (!lesson) return;
    track('VIDEO_PLAYED', {
      component: 'VideoPlayer',
      eventContext: lesson.title,
      resourceType: 'video',
      resourceId: lessonId,
      metadata: { videoUrl: lesson.videoUrl, title: lesson.title }
    });
  };

  const handleVideoPause = () => {
    if (!lesson) return;
    track('VIDEO_PAUSED', {
      component: 'VideoPlayer',
      eventContext: lesson.title,
      resourceType: 'video',
      resourceId: lessonId,
      metadata: { videoUrl: lesson.videoUrl, title: lesson.title }
    });
  };

  const handleVideoEnded = () => {
    if (!lesson) return;
    track('VIDEO_COMPLETED', {
      component: 'VideoPlayer',
      eventContext: lesson.title,
      resourceType: 'video',
      resourceId: lessonId,
      metadata: { videoUrl: lesson.videoUrl, title: lesson.title }
    });
  };

  const handleVideoSeek = (e) => {
    if (!lesson) return;
    track('VIDEO_SEEKED', {
      component: 'VideoPlayer',
      eventContext: lesson.title,
      resourceType: 'video',
      resourceId: lessonId,
      metadata: { currentTime: Math.round(e.target.currentTime), videoUrl: lesson.videoUrl, title: lesson.title }
    });
  };

  // Handle YouTube Iframe Player API tracking
  useEffect(() => {
    if (!lesson?.videoUrl) return;
    const isYouTube = lesson.videoUrl.includes('youtube.com') || lesson.videoUrl.includes('youtu.be');
    if (!isYouTube) return;

    // Load the IFrame Player API code asynchronously.
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    let player;
    const initPlayer = () => {
      try {
        player = new window.YT.Player('youtube-player');
        player.addEventListener('onStateChange', (event) => {
          // event.data states: PLAYING (1), PAUSED (2), ENDED (0)
          if (event.data === window.YT.PlayerState.PLAYING) {
            handleVideoPlay();
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            handleVideoPause();
          } else if (event.data === window.YT.PlayerState.ENDED) {
            handleVideoEnded();
          }
        });
      } catch (e) {
        console.error('YouTube player binding failed:', e);
      }
    };

    // If API ready, initialize directly
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      // Set the global callback
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      // Do not call player.destroy() because it physically deletes the <iframe> DOM node,
      // which breaks React's virtual DOM reconciliation when navigating between lessons.
    };
  }, [lesson, lessonId]);

  if (data?.error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto text-rose-500 mb-4" size={40} />
          <h2 className="text-xl font-bold">Lesson not found</h2>
          <Link to="/" className="text-brand dark:text-indigo-400 mt-4 inline-block hover:underline">
            Go back to dashboard
          </Link>
        </div>
      </Layout>
    );
  }

  if (!data || !courseDetails) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-slate-500 dark:text-slate-400 animate-pulse font-medium">Loading lesson…</p>
        </div>
      </Layout>
    );
  }

  const lessonsList = courseDetails.lessons || [];
  
  // Find current index and navigation options
  const currentIndex = lessonsList.findIndex((l) => l._id === lessonId);
  const prevLesson = currentIndex > 0 ? lessonsList[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessonsList.length - 1 ? lessonsList[currentIndex + 1] : null;

  return (
    <Layout>
      {/* Back button link */}
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
      >
        <ChevronLeft size={16} />
        Back to Dashboard
      </Link>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Syllabus / Lessons Outline Sidebar */}
        <aside className="lg:col-span-1 space-y-4 order-2 lg:order-1">
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
              Course syllabus
            </h3>
            
            <div className="space-y-1.5">
              {lessonsList.map((l, index) => {
                const isCurrent = l._id === lessonId;
                return (
                  <Link
                    key={l._id}
                    to={`/courses/${courseId}/lessons/${l._id}`}
                    className={`flex items-start gap-3 p-3 rounded-xl text-sm transition-all duration-200 ${
                      isCurrent
                        ? 'bg-brand/5 dark:bg-indigo-500/10 text-brand dark:text-indigo-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isCurrent
                        ? 'bg-brand text-white dark:bg-indigo-600'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <p className="leading-snug">{l.title}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{l.durationMinutes} mins</p>
                    </div>
                  </Link>
                );
              })}
              
              {/* Quiz Link in Outline */}
              <Link
                to={`/courses/${courseId}/quiz/${lessonId}`}
                className="flex items-center gap-3 p-3 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border border-dashed border-slate-200 dark:border-slate-800 mt-2"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                  Q
                </span>
                <span className="font-medium">Course Review Quiz</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Lesson Content Area */}
        <section className="lg:col-span-3 order-1 lg:order-2 space-y-6">
          <article className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm">
            <header className="mb-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand dark:text-indigo-400 uppercase tracking-wider">
                <span>{courseDetails.title}</span>
                <span>•</span>
                <span>Lesson {lesson.order} of {lessonsList.length}</span>
              </div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
                {lesson.title}
              </h1>
              <p className="mt-3 text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {lesson.summary}
              </p>
            </header>

            {/* Video container */}
            {lesson.videoUrl && (
              <div className="my-8 overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-900 shadow-md">
                {lesson.videoUrl.includes('youtube.com') || lesson.videoUrl.includes('youtu.be') ? (
                  <iframe
                    id="youtube-player"
                    className="w-full aspect-video focus:outline-none"
                    src={`${lesson.videoUrl.includes('embed') ? lesson.videoUrl : lesson.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}?enablejsapi=1`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video
                    controls
                    className="w-full aspect-video focus:outline-none"
                    onPlay={handleVideoPlay}
                    onPause={handleVideoPause}
                    onEnded={handleVideoEnded}
                    onSeeked={handleVideoSeek}
                    preload="metadata"
                  >
                    <source src={lesson.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
                <div className="p-3.5 bg-slate-950 text-[11px] text-slate-400 flex items-center gap-2">
                  <Play size={12} className="text-brand dark:text-indigo-400 animate-pulse" />
                  <span>Click play to view media. Your video interactions (Play, Pause, Seek, End) are tracked.</span>
                </div>
              </div>
            )}

            <hr className="my-8 border-slate-100 dark:border-slate-800" />

            {/* Text Lesson Content */}
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-line text-slate-700 dark:text-slate-300 text-lg leading-8">
                {lesson.content}
              </p>
            </div>

            {/* Navigation buttons at bottom of lesson */}
            <footer className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
              {prevLesson ? (
                <button
                  onClick={() => navigate(`/courses/${courseId}/lessons/${prevLesson._id}`)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300 active:scale-98"
                >
                  <ArrowLeft size={16} />
                  <span>Previous Lesson</span>
                </button>
              ) : (
                <div />
              )}

              {nextLesson ? (
                <button
                  onClick={() => navigate(`/courses/${courseId}/lessons/${nextLesson._id}`)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand dark:bg-indigo-600 text-sm font-semibold text-white hover:bg-brand-hover dark:hover:bg-indigo-700 transition-all shadow-md shadow-brand/10 dark:shadow-none active:scale-98"
                >
                  <span>Next Lesson</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <Link
                  to={`/courses/${courseId}/quiz/${lessonId}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 dark:bg-indigo-700 text-sm font-semibold text-white hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-all shadow-md shadow-indigo-600/10 active:scale-98"
                >
                  <CheckCircle size={16} />
                  <span>Take Course Quiz</span>
                </Link>
              )}
            </footer>
          </article>
        </section>
      </div>
    </Layout>
  );
}
