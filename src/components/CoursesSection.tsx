import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Download, 
  ChevronRight, 
  Play, 
  X,
  HelpCircle,
  Award,
  AlertCircle,
  FileQuestion,
  RefreshCw,
  ZoomIn
} from 'lucide-react';
import { CourseModule } from '../types/dashboard';
import { apiFetch } from '../lib/api';

interface CoursesSectionProps {
  courses: CourseModule[];
  studentCode?: string;
  onOpenChat: (prompt: string) => void;
}

interface OptionDetail {
  id: string;
  text: string;
  imageUrl?: string | null;
}

interface QuizQuestion {
  id?: string;
  moduleId?: string;
  chapterId?: string;
  question: string;
  imageUrl?: string | null;
  options: string[];
  optionsDetail?: OptionDetail[];
  correctAnswer: number;
  correctOptionId?: string;
  explanation: string;
  subject: string;
}

interface LmsChapterData {
  id: string;
  title: string;
  order: number;
  questionCount: number;
}

interface LmsModuleData {
  id: string;
  title: string;
  order: number;
  passPercent: number;
  maxAttempts: number;
  questionCount: number;
  chapters: LmsChapterData[];
}

interface LmsStageData {
  id: string;
  title: string;
  modules: LmsModuleData[];
}

interface LiveLmsCourse {
  id: string;
  title: string;
  slug: string;
  totalQuestions: number;
  stages: LmsStageData[];
}

const mockQuizQuestions: QuizQuestion[] = [
  {
    subject: 'Air Navigation',
    question: 'An aircraft is flying from Waypoint A to B (distance 120 NM). After flying 40 NM, the pilot finds the aircraft is 4 NM right of track. What is the Track Error Angle (1 in 60 rule)?',
    options: [
      '3° Left',
      '6° Right',
      '4° Left',
      '8° Right'
    ],
    correctAnswer: 1, // 6° Right (4 * 60 / 40 = 6°)
    explanation: 'Using the 1-in-60 rule: Track Error = (Distance Off Track × 60) / Distance Flown = (4 × 60) / 40 = 240 / 40 = 6° Right.',
  },
  {
    subject: 'Aviation Meteorology',
    question: 'When flying from an area of High Pressure into an area of Low Pressure without resetting your altimeter subscale, your altimeter will:\n\n1. Register lower pressure as higher altitude\n2. True altitude becomes lower than indicated',
    options: [
      'Read lower than true altitude (Under-read)',
      'Read higher than true altitude (Over-read) - Danger!',
      'Read correctly as pressure does not affect aneroid capsule',
      'Fluctuate randomly with temperature'
    ],
    correctAnswer: 1,
    explanation: 'Aviation rule: "High to Low, Look out below!" The altimeter will register the lower pressure as an increase in height and therefore OVER-READ, leaving the aircraft dangerously lower than indicated.',
  },
  {
    subject: 'Air Regulations',
    question: 'According to DGCA CAR and ICAO Annex 2, Visual Flight Rules (VFR) flight is prohibited in which airspace classification in India?',
    options: [
      'Class G Airspace',
      'Class D Airspace',
      'Class A Airspace',
      'Class E Airspace'
    ],
    correctAnswer: 2,
    explanation: 'Class A airspace is strictly reserved for Instrument Flight Rules (IFR) traffic only; VFR flights are not permitted under any circumstances.',
  },
  {
    subject: 'Technical General',
    question: 'During cruise flight at 7,500 ft in a normally aspirated piston engine aircraft (e.g. Lycoming IO-360), leaning the mixture properly towards lean-of-peak (LOP) results in:',
    options: [
      'Increased cylinder head temperature (CHT) beyond redline',
      'Lower fuel consumption and reduced cylinder head temperatures (CHT)',
      'Immediate engine stoppage due to vapor lock',
      'Rapid spark plug fouling and backfire'
    ],
    correctAnswer: 1,
    explanation: 'Operating properly lean-of-peak (LOP) results in cooler cylinder head temperatures (CHT) and optimal fuel economy because peak internal cylinder pressure occurs later after top dead center.',
  },
  {
    subject: 'Radio Telephony RTR(A)',
    question: 'Under ITU and DGCA WPC radiotelephony regulations, what is the exact order of priority for aeronautical radio transmissions?',
    options: [
      'Direction finding, Distress (MAYDAY), Meteorological, Flight Safety',
      'Distress (MAYDAY), Urgency (PAN-PAN), Direction Finding, Flight Safety',
      'Urgency (PAN-PAN), Distress (MAYDAY), Flight Regularity, State aircraft',
      'Flight Safety, Distress (MAYDAY), Meteorological, Commercial traffic'
    ],
    correctAnswer: 1,
    explanation: 'Official ICAO Annex 10 & WPC precedence order: 1. Distress calls (MAYDAY), 2. Urgency messages (PAN-PAN), 3. Direction Finding, 4. Flight Safety, 5. Meteorological, 6. Flight Regularity messages.',
  }
];

export const CoursesSection: React.FC<CoursesSectionProps> = ({
  courses,
  studentCode,
  onOpenChat,
}) => {
  const [liveLmsCourses, setLiveLmsCourses] = useState<LiveLmsCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseModule | null>(null);
  const [selectedLiveCourse, setSelectedLiveCourse] = useState<LiveLmsCourse | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [drillCompleted, setDrillCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const [activeQuizQuestions, setActiveQuizQuestions] = useState<QuizQuestion[]>(mockQuizQuestions);
  const [activeQuizTitle, setActiveQuizTitle] = useState('DGCA Ground School Practice Drill');
  const [activeModuleId, setActiveModuleId] = useState<string | undefined>(undefined);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Fetch live LMS courses with modules and question counts from Cloud SQL
  useEffect(() => {
    let isMounted = true;
    apiFetch<LiveLmsCourse[]>('/api/v1/lms/courses')
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setLiveLmsCourses(data);
        }
      })
      .catch((err) => {
        console.warn('Live LMS course sync notice:', err);
      });
    return () => { isMounted = false; };
  }, []);

  // Helper to match a CourseModule with a live LMS course
  const findMatchingLiveCourse = (course: CourseModule): LiveLmsCourse | undefined => {
    const code = course.code.toLowerCase();
    const name = course.name.toLowerCase();
    return liveLmsCourses.find((lc) => {
      const slug = lc.slug.toLowerCase();
      const title = lc.title.toLowerCase();
      return (
        (code.includes('rtr') && (slug.includes('rtr') || title.includes('rtr'))) ||
        (code.includes('nav') && (slug.includes('nav') || title.includes('navigation'))) ||
        (code.includes('met') && (slug.includes('met') || title.includes('meteorology'))) ||
        (code.includes('reg') && (slug.includes('reg') || title.includes('regulation'))) ||
        (code.includes('tech') && (slug.includes('tech') || title.includes('technical'))) ||
        name.includes(title) ||
        title.includes(name)
      );
    });
  };

  const handleOpenSyllabus = (course: CourseModule) => {
    setSelectedCourse(course);
    const matched = findMatchingLiveCourse(course);
    setSelectedLiveCourse(matched || null);
  };

  const startQuiz = async (opts?: {
    course?: CourseModule;
    module?: LmsModuleData;
    title?: string;
  }) => {
    const course = opts?.course || selectedCourse;
    const moduleData = opts?.module;
    const customTitle = opts?.title;

    setCurrentQuizIdx(0);
    setSelectedAnswer(null);
    setUserAnswers({});
    setShowExplanation(false);
    setDrillCompleted(false);
    setScore(0);
    setLoadingQuestions(true);
    setQuizOpen(true);
    setActiveModuleId(moduleData?.id);

    const title = customTitle || (moduleData ? `${course?.name || 'DGCA'} · ${moduleData.title}` : (course ? `${course.name} Practice Exam` : 'DGCA CPL Practice Drill'));
    setActiveQuizTitle(title);

    try {
      let queryParams = '';
      if (moduleData) {
        queryParams = `module_id=${encodeURIComponent(moduleData.id)}&limit=30`;
      } else if (course) {
        const matched = findMatchingLiveCourse(course);
        if (matched) {
          queryParams = `course_id=${encodeURIComponent(matched.id)}&limit=30`;
        } else {
          queryParams = `subject=${encodeURIComponent(course.name)}&limit=30`;
        }
      }

      const endpoint = `/api/v1/lms/questions/practice${queryParams ? `?${queryParams}` : ''}`;
      const res = await apiFetch<QuizQuestion[]>(endpoint);
      if (res && Array.isArray(res) && res.length > 0) {
        setActiveQuizQuestions(res);
      } else {
        setActiveQuizQuestions(mockQuizQuestions);
      }
    } catch {
      setActiveQuizQuestions(mockQuizQuestions);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSelectOption = (idx: number) => {
    if (drillCompleted) return;
    setSelectedAnswer(idx);
    setUserAnswers(prev => ({ ...prev, [currentQuizIdx]: idx }));
  };

  const handleNextOrFinish = () => {
    if (selectedAnswer === null) return;

    // Check correctness for current question
    const q = activeQuizQuestions[currentQuizIdx];
    const isCorrect = selectedAnswer === q.correctAnswer;
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) {
      setScore(newScore);
    }

    if (currentQuizIdx < activeQuizQuestions.length - 1) {
      setCurrentQuizIdx(idx => idx + 1);
      const nextAns = userAnswers[currentQuizIdx + 1];
      setSelectedAnswer(nextAns !== undefined ? nextAns : null);
      setShowExplanation(false);
    } else {
      // Completed drill!
      setDrillCompleted(true);
      setShowExplanation(true);

      // Persist results to GCR Admin Cloud SQL Database
      try {
        const code = studentCode || localStorage.getItem('airborne_student_id') || 'STU-APP-2026-00026';
        const total = activeQuizQuestions.length;
        const pct = Math.round((newScore / total) * 100);
        const passed = pct >= 70;

        // Build question breakdown
        const breakdown = activeQuizQuestions.map((question, i) => {
          const userChosen = i === currentQuizIdx ? selectedAnswer : userAnswers[i];
          return {
            question: question.question,
            selectedOption: userChosen !== undefined ? question.options[userChosen] : 'Not answered',
            correctOption: question.options[question.correctAnswer],
            isCorrect: userChosen === question.correctAnswer
          };
        });

        apiFetch('/api/v1/lms/quiz/submit', {
          method: 'POST',
          body: JSON.stringify({
            student_id: code,
            subject: activeQuizTitle,
            module_id: activeModuleId,
            score: newScore,
            max_score: total,
            answers: {
              percentage: `${pct}%`,
              passed,
              breakdown
            }
          })
        }).catch(err => console.warn('Quiz submission sync queued:', err));
      } catch (e) {
        console.warn('Quiz sync error:', e);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#00274C] text-[#D8A027] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-flight-mono">
              DGCA Ground School 2026
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Commercial Pilot License Theory Modules
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-[#00274C] font-brand-primary mt-1">
            My Enrolled Ground Subjects
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Structured syllabus designed to clear all 5 DGCA exams in the very first attempt. 70% passing cutoff required.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => startQuiz({ title: 'DGCA Comprehensive Practice Drill' })}
            className="px-4 py-2.5 rounded-xl bg-[#DB241E] hover:bg-[#b81d18] text-white text-xs font-bold font-brand-primary transition-all shadow-md flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch DGCA Practice Drill</span>
          </button>
        </div>
      </div>

      {/* Courses Cards Grid */}
      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold font-brand-primary text-[#00274C] text-base">Ground School Syllabus Pending Allocation</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Your DGCA curriculum subjects (Air Navigation, Aviation Meteorology, Air Regulations, Technical General, and RTR) will appear here upon cohort batch commencement.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => {
          const isCleared = course.progress === 100;
          const matchedLive = findMatchingLiveCourse(course);
          const liveQCount = matchedLive?.totalQuestions ?? 0;
          const liveModCount = matchedLive ? matchedLive.stages.reduce((acc, st) => acc + st.modules.length, 0) : 0;

          return (
            <div 
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-[#00274C]/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5 md:p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider font-flight-mono px-2 py-0.5 rounded bg-[#F5F6F8] text-[#00274C] border border-slate-200">
                    {course.code}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${isCleared ? 'bg-emerald-100 text-emerald-800' : 'bg-[#00274C] text-white'}`}>
                    {isCleared ? 'Cleared 100%' : 'In Progress'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#00274C] font-brand-primary group-hover:text-[#DB241E] transition-colors leading-snug">
                  {course.name}
                </h3>

                <p className="text-xs text-slate-500 font-medium">
                  Lead Instructor: <span className="text-slate-800 font-semibold">{course.instructor}</span>
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">Syllabus Completion</span>
                    <span className="text-[#00274C] font-flight-mono">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${isCleared ? 'bg-emerald-500' : 'bg-[#DB241E]'}`}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="bg-[#F5F6F8] p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Question Bank</span>
                    <span className="font-bold text-[#00274C] font-flight-mono">
                      {liveQCount > 0 ? `${liveQCount} Qs` : `${course.totalLectures * 10}+ Qs`}
                    </span>
                  </div>
                  <div className="bg-[#F5F6F8] p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Mock Avg</span>
                    <span className="font-bold text-emerald-600 font-flight-mono">
                      {course.averageScore}% <span className="text-[9px] text-slate-400 font-normal">(Min 70%)</span>
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                  <span>Modules: <strong className="text-slate-700">{liveModCount > 0 ? `${liveModCount} Topics` : `${course.completedLectures}/${course.totalLectures} Done`}</strong></span>
                  <span className="text-[#D8A027] font-semibold">{course.handoutsCount} Handouts</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 bg-[#F5F6F8] border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenSyllabus(course)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#00274C] hover:bg-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#DB241E]" />
                  <span>Syllabus &amp; Quizzes</span>
                </button>

                <button
                  onClick={() => startQuiz({ course })}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#DB241E] hover:bg-[#b81d18] text-white transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Practice Test</span>
                </button>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Syllabus & Chapter Quizzes Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-[#00172E]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider font-flight-mono text-[#DB241E]">
                  {selectedCourse.code} • DGCA Theory Syllabus
                </span>
                <h3 className="text-lg font-black text-[#00274C] font-brand-primary mt-0.5">
                  {selectedCourse.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Lead Instructor: {selectedCourse.instructor} • Passing Cutoff: 70%
                </p>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close syllabus modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A9BB0] font-brand-primary">
                  Syllabus Modules &amp; Chapter Practice Questionnaires
                </h4>
                <button
                  onClick={() => {
                    const c = selectedCourse;
                    setSelectedCourse(null);
                    startQuiz({ course: c });
                  }}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-[#DB241E] hover:bg-[#b81d18] text-white flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Start Full Subject Test (25 Qs)</span>
                </button>
              </div>

              {/* Real Modules from Database */}
              {selectedLiveCourse && selectedLiveCourse.stages.length > 0 ? (
                <div className="space-y-3">
                  {selectedLiveCourse.stages.map((stage) => (
                    <div key={stage.id} className="space-y-2">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                        {stage.title}
                      </div>
                      <div className="space-y-2">
                        {stage.modules.map((mod) => (
                          <div 
                            key={mod.id}
                            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-[#00274C]/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#00274C] text-sm">
                                  {mod.title}
                                </span>
                                {mod.questionCount > 0 && (
                                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full font-flight-mono">
                                    {mod.questionCount} Questions
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Pass cutoff: {mod.passPercent}% • Max attempts: {mod.maxAttempts}
                                {mod.chapters.length > 0 && ` • ${mod.chapters.length} Chapters`}
                              </p>
                            </div>

                            <button
                              onClick={() => {
                                const c = selectedCourse;
                                setSelectedCourse(null);
                                startQuiz({
                                  course: c,
                                  module: mod,
                                  title: `${c.name} · ${mod.title}`
                                });
                              }}
                              className="px-3.5 py-2 rounded-xl bg-[#00274C] hover:bg-[#DB241E] text-white text-xs font-bold font-brand-primary transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Attempt {mod.questionCount > 0 ? `Questions (${mod.questionCount})` : 'Test'}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Fallback to static syllabus topics */
                <div className="space-y-2">
                  {selectedCourse.syllabusTopics.map((top, i) => (
                    <div 
                      key={i}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <span className="font-semibold text-[#00274C]">{top.title}</span>
                          <span className="block text-[10px] text-slate-400">{top.duration}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const c = selectedCourse;
                          setSelectedCourse(null);
                          startQuiz({
                            course: c,
                            title: `${c.name} · ${top.title}`
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#00274C] text-white text-xs font-semibold hover:bg-[#DB241E] cursor-pointer"
                      >
                        Practice
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  try {
                    const code = studentCode || localStorage.getItem('airborne_student_id') || 'STU-APP-2026-00026';
                    apiFetch('/api/v1/activity/log', {
                      method: 'POST',
                      body: JSON.stringify({
                        student_id: code,
                        verb: 'study_material_downloaded',
                        activity_type: 'NOTE',
                        title: `Question Bank Accessed: ${selectedCourse.name}`,
                        notes: `Cadet downloaded complete DGCA theory question bank & lecture slides for ${selectedCourse.name} (${selectedCourse.code}).`
                      })
                    }).catch(err => console.warn('Activity sync error', err));
                  } catch {}
                  alert(`Downloading complete DGCA Question Bank & Handbook for ${selectedCourse.name}`);
                }}
                className="px-4 py-2 rounded-xl bg-[#F5F6F8] hover:bg-slate-200 text-[#00274C] text-xs font-bold font-brand-primary transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#DB241E]" />
                <span>Download Question Bank (PDF)</span>
              </button>

              <button
                onClick={() => setSelectedCourse(null)}
                className="px-4 py-2 rounded-xl bg-[#00274C] text-white text-xs font-bold hover:bg-[#00172E] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Size Diagram Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl p-4 shadow-2xl">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewImage} alt="Diagram Full View" className="max-h-[80vh] w-auto mx-auto object-contain rounded-lg" />
          </div>
        </div>
      )}

      {/* DGCA Practice Drill / Quiz Modal */}
      {quizOpen && (
        <div className="fixed inset-0 z-50 bg-[#00172E]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="bg-[#DB241E] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase font-flight-mono">
                  {drillCompleted ? 'Drill Completed' : `Question ${currentQuizIdx + 1} of ${activeQuizQuestions.length}`}
                </span>
                <span className="text-xs text-slate-700 font-bold truncate max-w-[280px]">
                  {activeQuizTitle}
                </span>
              </div>
              <button
                onClick={() => setQuizOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close practice drill modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingQuestions ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-[#DB241E] animate-spin mx-auto" />
                <p className="text-sm font-bold text-[#00274C]">Streaming DGCA Questions from Cloud SQL…</p>
                <p className="text-xs text-slate-500">Loading verified ground school questions and annex diagrams</p>
              </div>
            ) : drillCompleted ? (
              /* Drill Completed Result Screen */
              <div className="mt-6 space-y-6">
                <div className="p-6 rounded-2xl bg-[#F5F6F8] border border-slate-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#00274C] font-brand-primary">
                      {Math.round((score / activeQuizQuestions.length) * 100) >= 70 ? 'Test Passed (DGCA Standard Cleared)' : 'Test Needs Revision'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      70% passing cutoff required for DGCA Commercial Pilot License ground theory.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-6 pt-2">
                    <div>
                      <span className="text-xs text-slate-500 block">Total Score</span>
                      <span className="text-2xl font-black text-[#00274C] font-flight-mono">
                        {score} / {activeQuizQuestions.length}
                      </span>
                    </div>
                    <div className="w-px h-8 bg-slate-300" />
                    <div>
                      <span className="text-xs text-slate-500 block">Percentage</span>
                      <span className={`text-2xl font-black font-flight-mono ${Math.round((score / activeQuizQuestions.length) * 100) >= 70 ? 'text-emerald-600' : 'text-[#DB241E]'}`}>
                        {Math.round((score / activeQuizQuestions.length) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      Math.round((score / activeQuizQuestions.length) * 100) >= 70
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {Math.round((score / activeQuizQuestions.length) * 100) >= 70 ? '✓ Ready for DGCA Examination' : '⚠ Review Suggested Chapters'}
                    </span>
                  </div>
                </div>

                {/* Question Breakdown List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A9BB0] font-brand-primary">
                    Detailed Question-by-Question Review
                  </h4>
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {activeQuizQuestions.map((q, idx) => {
                      const ans = userAnswers[idx];
                      const isCorrect = ans === q.correctAnswer;
                      return (
                        <div 
                          key={idx}
                          className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                            isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
                          }`}
                        >
                          <div className="space-y-1">
                            <span className="font-bold text-[#00274C] block">
                              Q{idx + 1}: {q.question.slice(0, 100)}{q.question.length > 100 ? '…' : ''}
                            </span>
                            <p className="text-[11px] text-slate-600">
                              Your answer: <strong className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                                {ans !== undefined ? q.options[ans] : 'None'}
                              </strong>
                              {!isCorrect && (
                                <span className="block text-emerald-700 mt-0.5">
                                  Correct answer: <strong>{q.options[q.correctAnswer]}</strong>
                                </span>
                              )}
                            </p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-flight-mono shrink-0 ${
                            isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setDrillCompleted(false);
                      setCurrentQuizIdx(0);
                      setSelectedAnswer(null);
                      setUserAnswers({});
                      setScore(0);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#00274C] text-xs font-bold cursor-pointer"
                  >
                    Retake Drill
                  </button>
                  <button
                    onClick={() => setQuizOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-[#00274C] hover:bg-[#00172E] text-white text-xs font-bold cursor-pointer"
                  >
                    Done &amp; Close
                  </button>
                </div>
              </div>
            ) : (
              /* Active Question Screen */
              <div className="mt-4">
                {/* Formatted Question Stem */}
                <div className="text-sm md:text-base font-bold text-[#00274C] font-brand-primary leading-relaxed whitespace-pre-wrap">
                  {activeQuizQuestions[currentQuizIdx].question}
                </div>

                {/* Optional Question Diagram with click-to-zoom */}
                {activeQuizQuestions[currentQuizIdx].imageUrl && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2 text-center group relative">
                    <img
                      src={activeQuizQuestions[currentQuizIdx].imageUrl || ''}
                      alt="Question Diagram / Annex"
                      onClick={() => setPreviewImage(activeQuizQuestions[currentQuizIdx].imageUrl || null)}
                      className="mx-auto max-h-56 max-w-full rounded-lg object-contain cursor-zoom-in hover:opacity-95 transition-opacity"
                    />
                    <div 
                      onClick={() => setPreviewImage(activeQuizQuestions[currentQuizIdx].imageUrl || null)}
                      className="mt-1 flex items-center justify-center gap-1 text-[11px] text-slate-500 italic cursor-pointer hover:text-[#DB241E]"
                    >
                      <ZoomIn className="w-3 h-3" />
                      <span>Click image to inspect full-size diagram / annex</span>
                    </div>
                  </div>
                )}

                {/* Options List */}
                <div className="mt-4 space-y-2.5">
                  {activeQuizQuestions[currentQuizIdx].options.map((option, optIdx) => {
                    const isSelected = selectedAnswer === optIdx;
                    const isCorrect = optIdx === activeQuizQuestions[currentQuizIdx].correctAnswer;
                    const optDetail = activeQuizQuestions[currentQuizIdx].optionsDetail?.[optIdx];

                    let optionClass = 'bg-[#F5F6F8] border-slate-200 text-slate-800 hover:bg-slate-100';
                    if (isSelected && !showExplanation) {
                      optionClass = 'bg-[#00274C]/5 border-[#00274C] text-[#00274C] ring-2 ring-[#00274C]/20';
                    } else if (showExplanation) {
                      if (isCorrect) {
                        optionClass = 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20';
                      } else if (isSelected && !isCorrect) {
                        optionClass = 'bg-red-50 border-[#DB241E] text-red-900';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs md:text-sm font-medium transition-all cursor-pointer ${optionClass}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center font-bold text-xs shrink-0 font-flight-mono mt-0.5">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="leading-snug block">{option}</span>
                            {optDetail?.imageUrl && (
                              <img 
                                src={optDetail.imageUrl} 
                                alt={`Option ${String.fromCharCode(65 + optIdx)}`} 
                                className="mt-2 max-h-24 rounded border border-slate-200"
                              />
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {showExplanation && (
                  <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1 animate-in fade-in duration-150">
                    <div className="font-bold text-[#00274C] flex items-center gap-1.5 font-brand-primary">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Concept Clarity Breakdown:
                    </div>
                    <p className="leading-relaxed pl-5">
                      {activeQuizQuestions[currentQuizIdx].explanation}
                    </p>
                  </div>
                )}

                {/* Quiz Bottom Controls */}
                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">
                      Score: <strong className="text-emerald-600 font-flight-mono">{score}</strong> / {currentQuizIdx + (selectedAnswer !== null ? 1 : 0)}
                    </span>
                    {selectedAnswer !== null && !showExplanation && (
                      <button
                        onClick={() => setShowExplanation(true)}
                        className="text-[11px] text-[#00274C] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                      >
                        <HelpCircle className="w-3 h-3" />
                        <span>Show Concept Notes</span>
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleNextOrFinish}
                      disabled={selectedAnswer === null}
                      className="px-5 py-2.5 rounded-xl bg-[#DB241E] hover:bg-[#b81d18] disabled:opacity-40 text-white text-xs font-bold font-brand-primary transition-all cursor-pointer shadow-sm"
                    >
                      {currentQuizIdx < activeQuizQuestions.length - 1 ? 'Next Question →' : 'Finish & Save Score'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
