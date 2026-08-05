import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Award, AlertTriangle, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import api, { track } from '../api';
import Layout from '../components/Layout';

export default function Quiz() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get(`/quizzes/${courseId}/${lessonId}`)
      .then((r) => setQuiz(r.data))
      .catch(() => setQuiz({ error: 'This lesson does not have a quiz yet.' }));
  }, [courseId, lessonId]);

  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
    
    // Track clickstream event when learner clicks a quiz option
    track('QUIZ_OPTION_SELECTED', {
      component: 'QuizQuestion',
      eventContext: quiz?.courseTitle || 'Course Quiz',
      resourceType: 'quiz',
      resourceId: quiz?.id || lessonId,
      metadata: { questionId, optionIndex }
    });
  };

  const submit = async () => {
    const { data } = await api.post(`/quizzes/${courseId}/${lessonId}/submit`, { answers });
    setResult(data);
    
    // Track quiz review start
    track('QUIZ_REVIEWED', {
      component: 'QuizResult',
      eventContext: quiz?.courseTitle || 'Course Quiz',
      resourceType: 'quiz_attempt',
      resourceId: data.attemptId,
      metadata: { score: data.score }
    });
  };

  if (!quiz) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-slate-500 dark:text-slate-400 animate-pulse font-medium">Loading quiz…</p>
        </div>
      </Layout>
    );
  }

  if (quiz.error) {
    return (
      <Layout>
        <div className="max-w-md mx-auto text-center py-12 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
          <AlertTriangle className="mx-auto text-amber-500 mb-4" size={40} />
          <h2 className="text-lg font-bold text-slate-850 dark:text-white">Quiz Unavailable</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">{quiz.error}</p>
          <Link to="/" className="mt-5 inline-block text-sm font-semibold text-brand dark:text-indigo-400 hover:underline">
            Back to dashboard
          </Link>
        </div>
      </Layout>
    );
  }

  // Quiz Results / Review Screen
  if (result) {
    const isPassed = result.score >= 70;
    
    return (
      <Layout>
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Summary Score Card */}
          <section className="rounded-3xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-8 text-center shadow-lg shadow-slate-100/50 dark:shadow-none relative overflow-hidden">
            <div className="relative z-10 max-w-md mx-auto flex flex-col items-center">
              <span className={`p-4 rounded-2xl ${
                isPassed 
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
              }`}>
                <Award size={36} />
              </span>
              
              <h1 className="mt-4 text-6xl font-black tracking-tight text-slate-900 dark:text-white">
                {result.score}%
              </h1>
              
              <p className="mt-3 text-lg font-bold text-slate-850 dark:text-white">
                {isPassed ? 'Congratulations, you passed!' : 'Keep practicing to improve!'}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                You answered {result.correct} of {result.total} questions correctly.
              </p>
              
              <Link 
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand dark:bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-hover dark:hover:bg-indigo-700 transition-all shadow-md shadow-brand/10 hover:shadow-brand/20 dark:shadow-none active:scale-[0.98]"
                to="/"
              >
                <span>Back to Dashboard</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </section>

          {/* Detailed Question Review List */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Detailed Question Review
            </h2>
            
            <div className="space-y-4">
              {quiz.questions.map((q, i) => {
                const userAttempt = result.answers.find((a) => a.questionId === q.id);
                const isCorrect = userAttempt?.correct;
                const correctAnsIndex = result.correctAnswers.find((ca) => ca.questionId === q.id)?.answer;

                return (
                  <div 
                    key={q.id}
                    className={`rounded-2xl border p-6 bg-white dark:bg-slate-900 shadow-sm transition-all ${
                      isCorrect 
                        ? 'border-emerald-100 dark:border-emerald-950/30' 
                        : 'border-rose-100 dark:border-rose-950/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                        {i + 1}. {q.prompt}
                      </h3>
                      <span className={`shrink-0 flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        isCorrect 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                      }`}>
                        {isCorrect ? (
                          <>
                            <CheckCircle2 size={13} />
                            <span>Correct</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={13} />
                            <span>Incorrect</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2.5">
                      {q.options.map((option, n) => {
                        const isUserSelected = userAttempt?.selected === n;
                        const isThisCorrect = correctAnsIndex === n;

                        let optionStyle = 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 bg-slate-50/50 dark:bg-slate-950/40';
                        let badge = null;

                        if (isThisCorrect) {
                          optionStyle = 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 font-medium';
                          badge = <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/80 px-2 py-0.5 rounded ml-auto">Correct Answer</span>;
                        } else if (isUserSelected && !isCorrect) {
                          optionStyle = 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 font-medium';
                          badge = <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600 dark:text-rose-400 bg-rose-100/50 dark:bg-rose-950/80 px-2 py-0.5 rounded ml-auto">Your Answer</span>;
                        }

                        return (
                          <div 
                            key={option}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm transition-all ${optionStyle}`}
                          >
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                              isThisCorrect 
                                ? 'bg-emerald-500 text-white' 
                                : isUserSelected && !isCorrect 
                                ? 'bg-rose-500 text-white' 
                                : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {String.fromCharCode(65 + n)}
                            </span>
                            <span>{option}</span>
                            {badge}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </Layout>
    );
  }

  // Quiz Taking Screen
  const answeredCount = Object.keys(answers).length;
  const isFormComplete = answeredCount === quiz.questions.length;
  const progressPercent = Math.round((answeredCount / quiz.questions.length) * 100);

  return (
    <Layout>
      <section className="mx-auto max-w-2xl">
        <Link 
          to={`/courses/${courseId}/lessons/${lessonId}`}
          className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Lesson
        </Link>

        {/* Progress Bar & Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {quiz.courseTitle} Quiz
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Read each question carefully and select the best answer.
          </p>

          <div className="mt-5 flex items-center justify-between gap-4 text-xs font-semibold text-slate-400 dark:text-slate-500">
            <span>Progress</span>
            <span>{answeredCount} of {quiz.questions.length} answered ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5 border border-slate-200/20">
            <div 
              className="bg-brand dark:bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Questions list */}
        <div className="space-y-6">
          {quiz.questions.map((q, i) => {
            const selectedAns = answers[q.id];

            return (
              <fieldset 
                className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm"
                key={q.id}
              >
                <legend className="font-bold text-slate-900 dark:text-white text-base md:text-lg mb-2">
                  Question {i + 1}
                </legend>
                <p className="text-slate-700 dark:text-slate-350 text-sm font-medium mb-4">{q.prompt}</p>

                <div className="space-y-2.5">
                  {q.options.map((option, n) => {
                    const isSelected = selectedAns === n;

                    return (
                      <label 
                        key={option} 
                        className={`flex items-center gap-3.5 cursor-pointer rounded-xl border p-4 text-sm transition-all duration-200 active:scale-[0.99] ${
                          isSelected
                            ? 'border-brand dark:border-indigo-500 bg-brand/[0.03] dark:bg-indigo-500/[0.03] text-brand dark:text-indigo-400 font-semibold'
                            : 'border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-950/20 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-850/50'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name={q.id} 
                          checked={isSelected}
                          onChange={() => handleSelectOption(q.id, n)}
                          className="h-4 w-4 border-slate-300 text-brand dark:text-indigo-500 focus:ring-brand dark:focus:ring-indigo-500 cursor-pointer"
                        />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}
        </div>

        <button 
          disabled={!isFormComplete} 
          onClick={submit} 
          className="mt-8 w-full rounded-xl bg-brand dark:bg-indigo-600 hover:bg-brand-hover dark:hover:bg-indigo-700 py-3.5 font-semibold text-white shadow-lg shadow-brand/10 hover:shadow-brand/20 dark:shadow-none disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-[0.98]"
        >
          Submit Quiz Attempt
        </button>
      </section>
    </Layout>
  );
}
