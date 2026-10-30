import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Download, 
  ChevronRight, 
  Play, 
  X
} from 'lucide-react';
import { CourseModule } from '../types/dashboard';

interface CoursesSectionProps {
  courses: CourseModule[];
  onOpenChat: (prompt: string) => void;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: string;
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
    question: 'When flying from an area of High Pressure into an area of Low Pressure without resetting your altimeter subscale, your altimeter will:',
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
  }
];

export const CoursesSection: React.FC<CoursesSectionProps> = ({
  courses,
  onOpenChat,
}) => {
  const [selectedCourse, setSelectedCourse] = useState<CourseModule | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const startQuiz = () => {
    setCurrentQuizIdx(0);
    setSelectedAnswer(null);
    setQuizSubmitted(false);
    setScore(0);
    setQuizOpen(true);
  };

  const handleSelectOption = (idx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswer(idx);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    setQuizSubmitted(true);
    const q = mockQuizQuestions[currentQuizIdx];
    const isCorrect = selectedAnswer === q.correctAnswer;
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) {
      setScore(s => s + 1);
    }

    // Persist mock exam activity directly into the Main GCR Admin Database
    try {
      const studentCode = localStorage.getItem('airborne_student_id') || 'AA-CPL-2026-084';
      fetch('/api/v1/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentCode,
          subject: q.subject,
          score: newScore,
          max_score: mockQuizQuestions.length,
          answers: {
            question: q.question,
            selectedOption: q.options[selectedAnswer],
            correctOption: q.options[q.correctAnswer],
            isCorrect: isCorrect
          }
        })
      }).catch(err => console.warn('Quiz attempt sync queued', err));
    } catch (e) {
      console.warn('Quiz sync error', e);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuizIdx < mockQuizQuestions.length - 1) {
      setCurrentQuizIdx(idx => idx + 1);
      setSelectedAnswer(null);
      setQuizSubmitted(false);
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
            onClick={startQuiz}
            className="px-4 py-2.5 rounded-xl bg-[#DB241E] hover:bg-[#b81d18] text-white text-xs font-bold font-brand-primary transition-all shadow-md flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch DGCA Practice Drill</span>
          </button>
        </div>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((course) => {
          const isCleared = course.progress === 100;
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
                    <span className="text-[10px] text-slate-500 block">Lectures</span>
                    <span className="font-bold text-[#00274C] font-flight-mono">
                      {course.completedLectures} / {course.totalLectures}
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
                  <span>Next Mock: <strong className="text-slate-700">{course.nextMockExam}</strong></span>
                  <span className="text-[#D8A027] font-semibold">{course.handoutsCount} Handouts</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 bg-[#F5F6F8] border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedCourse(course)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#00274C] hover:bg-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#DB241E]" />
                  <span>Syllabus & Modules</span>
                </button>

                <button
                  onClick={() => onOpenChat(`Help me understand tricky concepts in ${course.name}`)}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-600 hover:text-[#DB241E] flex items-center gap-1 cursor-pointer"
                >
                  Ask Doubts
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Syllabus Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-[#00172E]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider font-flight-mono text-[#DB241E]">
                  {selectedCourse.code} • {selectedCourse.category}
                </span>
                <h3 className="text-lg font-black text-[#00274C] font-brand-primary mt-0.5">
                  {selectedCourse.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Instructor: {selectedCourse.instructor} • Passing Cutoff: 70%
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

            <div className="mt-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A9BB0] font-brand-primary">
                DGCA Syllabus Topics & Class Completion
              </h4>

              <div className="space-y-2">
                {selectedCourse.syllabusTopics.map((top, i) => (
                  <div 
                    key={i}
                    className={`
                      p-3 rounded-xl border flex items-center justify-between text-xs
                      ${top.completed ? 'bg-emerald-50/40 border-emerald-200' : 'bg-slate-50 border-slate-200'}
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      {top.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                      )}
                      <div>
                        <span className={`font-semibold ${top.completed ? 'text-slate-800 line-through opacity-70' : 'text-[#00274C]'}`}>
                          {top.title}
                        </span>
                        <span className="block text-[10px] text-slate-400">{top.duration}</span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${top.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-[#D8A027]/15 text-[#00274C] border border-[#D8A027]/30'}`}>
                      {top.completed ? 'Covered' : 'Upcoming'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  try {
                    const studentCode = localStorage.getItem('airborne_student_id') || 'AA-CPL-2026-084';
                    fetch('/api/v1/activity/log', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        student_id: studentCode,
                        verb: 'study_material_downloaded',
                        activity_type: 'NOTE',
                        title: `Question Bank Accessed: ${selectedCourse.name}`,
                        notes: `Cadet downloaded complete DGCA theory question bank & lecture slides for ${selectedCourse.name} (${selectedCourse.code}).`
                      })
                    }).catch(err => console.warn('Activity sync error', err));
                  } catch {}
                  alert(`Downloading complete syllabus book & handouts for ${selectedCourse.name}`);
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
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DGCA Practice Drill Quiz Modal */}
      {quizOpen && (
        <div className="fixed inset-0 z-50 bg-[#00172E]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="bg-[#DB241E] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase font-flight-mono">
                  Question {currentQuizIdx + 1} of {mockQuizQuestions.length}
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  {mockQuizQuestions[currentQuizIdx].subject}
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

            <div className="mt-4">
              <h3 className="text-sm md:text-base font-bold text-[#00274C] font-brand-primary leading-relaxed">
                {mockQuizQuestions[currentQuizIdx].question}
              </h3>

              {/* Options */}
              <div className="mt-4 space-y-2.5">
                {mockQuizQuestions[currentQuizIdx].options.map((option, optIdx) => {
                  const isSelected = selectedAnswer === optIdx;
                  const isCorrect = optIdx === mockQuizQuestions[currentQuizIdx].correctAnswer;
                  
                  let optionClass = 'bg-[#F5F6F8] border-slate-200 text-slate-800 hover:bg-slate-100';
                  if (isSelected && !quizSubmitted) {
                    optionClass = 'bg-[#00274C]/5 border-[#00274C] text-[#00274C] ring-2 ring-[#00274C]/20';
                  } else if (quizSubmitted) {
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
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center font-bold text-xs shrink-0 font-flight-mono">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation after submit */}
              {quizSubmitted && (
                <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                  <div className="font-bold text-[#00274C] flex items-center gap-1.5 font-brand-primary">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Concept Clarity Breakdown (Capt. Navrang's Notes):
                  </div>
                  <p className="leading-relaxed pl-5">
                    {mockQuizQuestions[currentQuizIdx].explanation}
                  </p>
                </div>
              )}
            </div>

            {/* Quiz Controls */}
            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Score: <strong className="text-emerald-600 font-flight-mono">{score}</strong> / {mockQuizQuestions.length}
              </span>

              <div className="flex gap-2">
                {!quizSubmitted ? (
                  <button
                    onClick={handleCheckAnswer}
                    disabled={selectedAnswer === null}
                    className="px-4 py-2 rounded-xl bg-[#00274C] disabled:opacity-40 text-white text-xs font-bold font-brand-primary transition-colors cursor-pointer"
                  >
                    Lock Answer
                  </button>
                ) : currentQuizIdx < mockQuizQuestions.length - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    className="px-4 py-2 rounded-xl bg-[#DB241E] text-white text-xs font-bold font-brand-primary hover:bg-[#b81d18] cursor-pointer"
                  >
                    Next Question →
                  </button>
                ) : (
                  <button
                    onClick={() => setQuizOpen(false)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                  >
                    Finish Drill ({score}/{mockQuizQuestions.length} Correct)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
