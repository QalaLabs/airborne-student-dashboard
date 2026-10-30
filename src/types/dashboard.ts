export type TabType = 
  | 'overview' 
  | 'timetable' 
  | 'batches' 
  | 'courses' 
  | 'chatbot' 
  | 'fees' 
  | 'other-courses' 
  | 'attendance'
  | 'admin-overview'
  | 'admin-cadets'
  | 'admin-timetable'
  | 'admin-fees'
  | 'admin-activity';

export type UserRole = 'student' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation?: string;
  phone?: string;
  avatarUrl?: string;
  studentCode?: string;
  rollNumber?: string;
  computerNumber?: string;
  batchName?: string;
  program?: string;
  attendanceRate?: number;
  pendingFee?: number;
  permissions?: string[];
  token?: string;
}

export interface AdminMetrics {
  totalCadets: number;
  activeCadets: number;
  averageAttendance: number;
  compliantCadets: number;
  warningCadets: number;
  totalBilled: number;
  totalCollected: number;
  totalPending: number;
  collectionRate: number;
  todaySessionsCount: number;
}

export interface AdminStudent {
  id: string;
  studentCode: string;
  name: string;
  email: string;
  phone: string;
  computerNumber: string;
  batchName: string;
  course: string;
  attendanceRate: number;
  attendedClasses: number;
  totalClasses: number;
  feeTotal: number;
  feePaid: number;
  feeBalance: number;
  status: string;
  avatar: string;
  targetSession: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  rollNumber: string;
  computerNumber: string; // DGCA Computer Number
  batchId: string;
  batchName: string;
  program: string;
  centre: string;
  avatarUrl: string;
  attendanceRate: number;
  totalClasses: number;
  attendedClasses: number;
  pendingFee: number;
  totalFee: number;
  paidFee: number;
  dgcaExamSession: string;
}

export interface TimetableSession {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  subjectCode: 'NAV' | 'MET' | 'REG' | 'TECH' | 'RTR' | 'SIM';
  subjectName: string;
  topic: string;
  instructorName: string;
  instructorRank: string;
  location: string;
  isToday: boolean;
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  attendanceMarked: boolean;
  attendanceTime?: string;
  onlineLink?: string;
  handoutAvailable?: boolean;
}

export interface Batchmate {
  id: string;
  name: string;
  callsign: string;
  attendance: number;
  dgcaStatus: string;
  avatar: string;
  role?: string;
}

export interface BatchInfo {
  id: string;
  name: string;
  course: string;
  campus: string;
  startDate: string;
  targetExamDate: string;
  maxStudents: number;
  currentStrength: number;
  mentorName: string;
  mentorTitle: string;
  mentorExperience: string;
  mentorPhone: string;
  batchTimings: string;
  roadmapPhases: {
    title: string;
    subject: string;
    progress: number;
    status: 'completed' | 'in-progress' | 'upcoming';
    classesDone: number;
    totalClasses: number;
  }[];
  batchmates: Batchmate[];
  notices: {
    id: string;
    title: string;
    date: string;
    author: string;
    badge: 'Urgent' | 'Academic' | 'DGCA Circular';
    content: string;
  }[];
}

export interface CourseModule {
  id: string;
  code: string;
  name: string;
  instructor: string;
  progress: number;
  completedLectures: number;
  totalLectures: number;
  nextMockExam: string;
  dgcaPassingMarks: number;
  averageScore: number;
  syllabusTopics: {
    title: string;
    duration: string;
    completed: boolean;
  }[];
  handoutsCount: number;
  category: 'Ground Subject' | 'Practical / Sim';
}

export interface FeeInstallment {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paidOn?: string;
  receiptNumber?: string;
  paymentMode?: string;
}

export interface FeeHeadBreakdown {
  title: string;
  allocatedAmount: number;
  paidAmount: number;
  status: 'Fully Paid' | 'Partially Paid' | 'Pending';
}

export interface OtherCourse {
  id: string;
  title: string;
  code: string;
  category: 'Airline Prep' | 'Advanced Rating' | 'Type Rating' | 'Specialized';
  duration: string;
  flightSimHours?: string;
  fee: number;
  prerequisite: string;
  badge?: string;
  description: string;
  keyHighlights: string[];
  intakeMonth: string;
  seatsAvailable: number;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  dayOfWeek: string;
  subject: string;
  instructor: string;
  status: 'Present' | 'Absent' | 'Excused' | 'Late';
  timestamp?: string;
  checkInMethod: 'Biometric QR' | 'Mentor Verified' | 'Portal Check-in' | 'Self';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
  actionType?: 'timetable' | 'fees' | 'attendance' | 'courses' | 'metar';
}
