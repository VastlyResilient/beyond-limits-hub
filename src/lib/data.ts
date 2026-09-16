/* ============================================================================
   Beyond Limits Hub — domain data
   INSTITUTIONAL facts are sourced from Beyond Limits' own published materials
   (peaceyouthct.org/beyondlimits + the FY26-27 Board of Reps presentation PDF).
   SAMPLE records (students, staff, sessions, threads) are synthetic demo data,
   labelled as such in the UI — never presented as real people's records.
   ========================================================================== */

export const SOURCES = [
  { label: "peaceyouthct.org/beyondlimits", url: "https://www.peaceyouthct.org/beyondlimits" },
  { label: "FY26-27 program presentation (Board of Reps)", url: "https://www.boardofreps.org/Data/Sites/43/userfiles/committees/fiscal/budget/budget_2026-2027/subs/stamford-peace-youth-fndtn-beyond-limits-academics-presentation-fy-26-27.pdf" },
  { label: "Stamford Peace Youth Foundation", url: "https://www.peaceyouthct.org/" },
];

export const ORG = {
  program: "Beyond Limits Academic Program",
  short: "Beyond Limits",
  parent: "Stamford Peace Youth Foundation, Inc.",
  founded: 2014,
  founders: ["Brian Kriftcher", "Andrew Sklover"],
  hq: "Long Ridge Road, Stamford, CT",
  grades: "Grades 4-10",
  tagline: "Affordable academic supports for every learner!",
  mission:
    "To level the academic playing field and eliminate opportunity gaps for learners in lower Fairfield County through high-quality, subsidized, non-school-based peer-to-peer tutoring, mentoring, academic advocacy, and enrichment.",
  vision:
    "An equitable academic ecosystem in lower Fairfield County and beyond — empowering every learner through tutoring, informal mentoring, advocacy, and collaboration with local partners.",
  values: [
    { k: "Equity through access", d: "Accessible, discounted, high-quality academic supports that bridge the opportunity gap." },
    { k: "Empowerment through support", d: "Personalized tutoring, enrichment and informal mentoring that build confidence." },
    { k: "Community through collaboration", d: "A support network across students, families, tutors and local partners." },
  ],
};

export const IMPACT = [
  { n: "250+", label: "Enrolled students", note: "200+ served annually since 2014" },
  { n: "90%", label: "Eligible for discounted services", note: "Sliding-scale access" },
  { n: "90%", label: "Sessions held on-site", note: "At the Long Ridge Rd. center" },
  { n: "81.6%", label: "Students report improved confidence", note: "Participant survey" },
  { n: "99%", label: "Parent satisfaction", note: "Post-program survey" },
];

export const PROGRAMS = [
  { id: "peer", name: "Peer Tutoring", blurb: "Highly subsidized one-on-one tutoring in math, science and writing.", detail: "Dedicated tutoring rooms, a family lounge and shared resources foster a supportive learning environment.", icon: "book", tone: "navy" },
  { id: "bffs", name: "Building Foundations for Success", blurb: "Academic support, enrichment and on-site advisory for Stamford High's Early College Studies cohort.", detail: "BFFS keeps ECS scholars on track through the transition into college-credit coursework.", icon: "compass", tone: "teal" },
  { id: "youth", name: "Youth Employment", blurb: "Paid peer tutors build a first job, responsibility and leadership.", detail: "Tutors earn while they make a difference — a flexible first job or volunteer role.", icon: "badge", tone: "solar" },
  { id: "msssp", name: "Middle School Summer Scholars", blurb: "The annual bridge program for rising 6th graders.", detail: "Increased confidence and preparation for numerous students prior to entering middle school.", icon: "sun", tone: "violet" },
  { id: "mentor", name: "Mentoring", blurb: "Upperclassmen mentors provide role modeling and steady guidance.", detail: "Trusted relationships that help mentees build confidence, set goals and navigate challenges.", icon: "users", tone: "pink" },
  { id: "enrich", name: "Enrichment Programming", blurb: "Leadership, networking, time management, study strategies, data & computer science.", detail: "Workshops that strengthen both academic and life skills.", icon: "spark", tone: "amber" },
];

export const ENRICHMENT = [
  { name: "Leadership & Public Speaking", seats: 18, filled: 18, when: "Sat · Nov 8 · 10:00 AM" },
  { name: "Networking 101", seats: 20, filled: 12, when: "Thu · Nov 13 · 5:30 PM" },
  { name: "Time Management & Study Strategies", seats: 25, filled: 21, when: "Sat · Nov 15 · 10:00 AM" },
  { name: "Data & Computer Science Lab", seats: 16, filled: 9, when: "Wed · Nov 19 · 4:30 PM" },
  { name: "Family Workshop: Paying for College", seats: 40, filled: 17, when: "Tue · Nov 25 · 6:30 PM" },
];

export const SCHOLARSHIPS = [
  { name: "Stamford Rotary Trust Scholarship", type: "Non-renewable · one year", who: "Financial need + academic achievement", awarded: ["Annabella — 5th grade, 2025", "Mia — 6th grade, Dolan Middle School, 2025"], amount: "Awarded annually" },
  { name: "Bill Susetka Memorial Scholarship", type: "Memorial award", who: "In honor of Bill Susetka — athletics, humility, leadership", awarded: ["Rotating annual award"], amount: "Awarded annually" },
];

export const SPONSORS = [
  { name: "New Canaan Community Foundation", note: "Recent grant recipient — local grantmaking and community leadership", logo: null },
  { name: "Near & Far Aid", note: "All-volunteer fund granting $1M+/yr across Fairfield County", logo: null },
  { name: "Stamford Rotary Trust", note: "Funds the annual Rotary Trust Scholarship", logo: "https://cdn2.sportngin.com/attachments/photo/9b5c-215451479/Stamford-Rotary-Trust-Fund-Logo_large.png" },
];

export const COMMUNITY_PARTNERS = ["Laureus", "Stamford Public Schools", "Sacred Heart University", "Charter", "G Foundation", "Boys & Girls Club", "P2P"];

export const CONTEXT_STAT = {
  n: "-39 points",
  text: "Connecticut students identified as economically disadvantaged scored an average of 39 points lower than their peers in Grade 8 mathematics (2024).",
  src: "NCES",
};

/* ---------------------------------------------------------------- people --- */
export type Role = "ops" | "tutor" | "family" | "student";

export interface Person { id: string; name: string; role: Role; grade?: string; school?: string; initials: string; tone: string; }

export const ME: Record<Role, Person> = {
  ops:    { id: "u-andy",   name: "Andy Sklover",  role: "ops",    initials: "AS", tone: "navy" },
  tutor:  { id: "u-marcus", name: "Marcus D.",     role: "tutor",  grade: "12", school: "Stamford High — ECS", initials: "MD", tone: "teal" },
  family: { id: "u-lena",   name: "Lena R.",       role: "family", initials: "LR", tone: "violet" },
  student:{ id: "u-amara",  name: "Amara R.",      role: "student", grade: "7", school: "Dolan Middle School", initials: "AR", tone: "solar" },
};

export const TUTORS = [
  { id: "t1", name: "Marcus D.", initials: "MD", grade: "12", school: "Stamford High — ECS", subjects: ["Algebra I", "Geometry"], paid: true, sessions: 34, rating: 4.9, tone: "teal", joined: "2024" },
  { id: "t2", name: "Sofia A.", initials: "SA", grade: "11", school: "Stamford High", subjects: ["Biology", "Chemistry"], paid: true, sessions: 28, rating: 4.8, tone: "violet", joined: "2024" },
  { id: "t3", name: "Priya N.", initials: "PN", grade: "College", school: "Sacred Heart University", subjects: ["Writing", "Pre-Calc"], paid: true, sessions: 41, rating: 5.0, tone: "solar", joined: "2023" },
  { id: "t4", name: "Diego M.", initials: "DM", grade: "12", school: "Westhill High", subjects: ["Physics", "Algebra II"], paid: true, sessions: 19, rating: 4.7, tone: "pink", joined: "2025" },
  { id: "t5", name: "Hana K.", initials: "HK", grade: "College", school: "Univ. of Toronto", subjects: ["Data & CS", "Statistics"], paid: false, sessions: 22, rating: 4.9, tone: "amber", joined: "2023" },
  { id: "t6", name: "Jerome T.", initials: "JT", grade: "11", school: "Stamford High — ECS", subjects: ["Algebra I", "Study Skills"], paid: true, sessions: 12, rating: 4.6, tone: "navy", joined: "2025" },
];

export const STUDENTS = [
  { id: "s1", name: "Amara R.", initials: "AR", grade: "7", school: "Dolan Middle School", subjects: ["Algebra I","Writing"], tutor: "Marcus D.", attendance: 96, confidence: 82, subsidy: "Discounted 90%", tone: "solar", guardian: "Lena R.", lastSession: "Nov 6" },
  { id: "s2", name: "Noah B.", initials: "NB", grade: "6", school: "Rippowam Middle School", subjects: ["Math","Science"], tutor: "Diego M.", attendance: 88, confidence: 71, subsidy: "Discounted 90%", tone: "teal", guardian: "Diane B.", lastSession: "Nov 4" },
  { id: "s3", name: "Elena V.", initials: "EV", grade: "10", school: "Stamford High — ECS", subjects: ["Chemistry","Pre-Calc"], tutor: "Sofia A.", attendance: 99, confidence: 90, subsidy: "Discounted 75%", tone: "violet", guardian: "Rosa V.", lastSession: "Nov 6" },
  { id: "s4", name: "Tariq H.", initials: "TH", grade: "8", school: "Cloonan Middle School", subjects: ["Physics","Algebra II"], tutor: "Diego M.", attendance: 74, confidence: 63, subsidy: "Discounted 90%", tone: "amber", guardian: "Yusuf H.", lastSession: "Oct 28" },
  { id: "s5", name: "Grace L.", initials: "GL", grade: "9", school: "Westhill High", subjects: ["Writing","Biology"], tutor: "Priya N.", attendance: 92, confidence: 78, subsidy: "Full fee", tone: "pink", guardian: "Wei L.", lastSession: "Nov 5" },
  { id: "s6", name: "Malik O.", initials: "MO", grade: "5", school: "Stillmeadow Elementary", subjects: ["Math"], tutor: "Jerome T.", attendance: 84, confidence: 68, subsidy: "Discounted 90%", tone: "navy", guardian: "Fatima O.", lastSession: "Nov 3" },
  { id: "s7", name: "Ruby S.", initials: "RS", grade: "7", school: "Dolan Middle School", subjects: ["Science","Data & CS"], tutor: "Hana K.", attendance: 97, confidence: 86, subsidy: "Discounted 90%", tone: "teal", guardian: "Paul S.", lastSession: "Nov 6" },
  { id: "s8", name: "Aiden P.", initials: "AP", grade: "11", school: "Stamford High — ECS", subjects: ["Pre-Calc","Physics"], tutor: "Priya N.", attendance: 91, confidence: 80, subsidy: "Discounted 50%", tone: "violet", guardian: "Kay P.", lastSession: "Nov 5" },
];

/* ------------------------------------------------------------- sessions --- */
export const SESSIONS = [
  { id: "se1", when: "Nov 6", time: "4:00 - 5:15 PM", room: "Room A", student: "Amara R.", tutor: "Marcus D.", subject: "Algebra I", status: "completed", focus: "Linear equations — modelling word problems", next: "Graphing slope-intercept form", minutes: 75, homework: "p.114 #1-12" },
  { id: "se2", when: "Nov 6", time: "4:00 - 5:15 PM", room: "Room B", student: "Ruby S.", tutor: "Hana K.", subject: "Data & CS", status: "completed", focus: "Loops + conditionals in Python", next: "Build a dice-roll simulator", minutes: 75, homework: "Finish loop worksheet" },
  { id: "se3", when: "Nov 6", time: "5:30 - 6:45 PM", room: "Room A", student: "Elena V.", tutor: "Sofia A.", subject: "Chemistry", status: "completed", focus: "Molarity and dilution problems", next: "Titration lab prep", minutes: 75, homework: "Pre-lab questions" },
  { id: "se4", when: "Nov 7", time: "4:00 - 5:15 PM", room: "Room C", student: "Tariq H.", tutor: "Diego M.", subject: "Physics", status: "missed", focus: "Newton's second law", next: "Free-body diagrams", minutes: 0, homework: "—" },
  { id: "se5", when: "Nov 7", time: "5:30 - 6:45 PM", room: "Room B", student: "Grace L.", tutor: "Priya N.", subject: "Writing", status: "scheduled", focus: "Thesis statements for the personal essay", next: "Draft body paragraph 1", minutes: 0, homework: "—" },
  { id: "se6", when: "Nov 8", time: "10:00 - 11:15 AM", room: "Room A", student: "Noah B.", tutor: "Diego M.", subject: "Math", status: "scheduled", focus: "Fraction operations", next: "Ratios and rates", minutes: 0, homework: "—" },
  { id: "se7", when: "Nov 8", time: "11:30 AM - 12:45 PM", room: "Room C", student: "Malik O.", tutor: "Jerome T.", subject: "Math", status: "scheduled", focus: "Multi-digit multiplication", next: "Intro to long division", minutes: 0, homework: "—" },
  { id: "se8", when: "Nov 8", time: "1:00 - 2:15 PM", room: "Room B", student: "Aiden P.", tutor: "Priya N.", subject: "Pre-Calc", status: "scheduled", focus: "Logarithmic functions", next: "Exponential growth models", minutes: 0, homework: "—" },
];

export const ATTENDANCE_TREND = [
  { wk: "Wk 1", onsite: 88, remote: 8, missed: 4 },
  { wk: "Wk 2", onsite: 91, remote: 6, missed: 3 },
  { wk: "Wk 3", onsite: 86, remote: 9, missed: 5 },
  { wk: "Wk 4", onsite: 93, remote: 5, missed: 2 },
  { wk: "Wk 5", onsite: 90, remote: 7, missed: 3 },
  { wk: "Wk 6", onsite: 94, remote: 4, missed: 2 },
];

export const ENGAGEMENT_TREND = [
  { m: "Jun", posts: 42, read: 71, replies: 22 },
  { m: "Jul", posts: 51, read: 76, replies: 28 },
  { m: "Aug", posts: 63, read: 81, replies: 34 },
  { m: "Sep", posts: 88, read: 87, replies: 46 },
  { m: "Oct", posts: 104, read: 91, replies: 58 },
  { m: "Nov", posts: 96, read: 93, replies: 61 },
];

/* --------------------------------------------------------------- comms --- */
export const POSTS = [
  { id: "p1", author: "Andy Sklover", role: "Program Director", initials: "AS", tone: "navy", when: "2h", scope: "All Families", title: "Session schedule for the week of Nov 10", body: "Rooms A-C are open Monday through Thursday, 4:00-6:45 PM, and Saturday 10:00 AM-2:15 PM. Saturday slots filled quickly last week — if your student needs a Saturday session, please RSVP in the Hub by Thursday evening so we can add a tutor if needed.", pinned: true, reactions: { "👍": 24, "🙌": 11 }, replies: 6, read: 187, of: 212, tag: "Schedule" },
  { id: "p2", author: "Priya N.", role: "Peer Tutor · College Corps", initials: "PN", tone: "solar", when: "5h", scope: "Writing Cohort", title: "Personal essay workshop — bring a draft", body: "We're workshopping thesis statements this Thursday. Bring whatever you have, even if it's three messy sentences. Messy drafts are the whole point.", pinned: false, reactions: { "✍️": 14, "💡": 9 }, replies: 12, read: 41, of: 48, tag: "Academics" },
  { id: "p3", author: "Lena R.", role: "Parent", initials: "LR", tone: "violet", when: "Yesterday", scope: "Family Lounge", title: "Thank you for the family workshop", body: "The 'Paying for College' workshop answered questions I didn't even know how to ask. Please run it again in the spring — I'll bring two other parents from Amara's class.", pinned: false, reactions: { "❤️": 31, "🙌": 8 }, replies: 9, read: 144, of: 212, tag: "Community" },
  { id: "p4", author: "Hana K.", role: "Peer Tutor", initials: "HK", tone: "amber", when: "2d", scope: "Data & CS Lab", title: "Dice-roll simulators are live", body: "Four students shipped working Python programs this week — first time most of them have written code that runs. Screenshots in the lab album.", pinned: false, reactions: { "🎉": 27, "🔥": 15 }, replies: 4, read: 88, of: 96, tag: "Enrichment" },
];

export const ALERT_TEMPLATES = [
  { id: "a1", name: "Weather closure", tone: "red", urgent: true, channels: ["SMS","Voice","App","Email"], body: "Beyond Limits is CLOSED this afternoon due to the winter weather advisory. All sessions are cancelled and will be rescheduled. The center reopens tomorrow at 4:00 PM." },
  { id: "a2", name: "Session reminder", tone: "green", urgent: false, channels: ["App","SMS"], body: "Reminder: your student has a tutoring session today at {time} in {room} with {tutor}. The family lounge is open — water and snacks are available." },
  { id: "a3", name: "Attendance follow-up", tone: "amber", urgent: false, channels: ["App","SMS"], body: "We missed {student} at tutoring twice this month. Can we find a time that works better? Reply to this message and we'll rebuild the schedule — no change to your sliding-scale rate." },
  { id: "a4", name: "Enrichment seats open", tone: "navy", urgent: false, channels: ["App","Email"], body: "{seats} seats just opened in {workshop} on {when}. Free for enrolled families. Reserve in the Hub under Enrichment." },
];

export const THREADS = [
  { id: "th1", with: "Lena R. (Amara's guardian)", tone: "violet", initials: "LR", topic: "Algebra I confidence", unread: 2, msgs: [
    { from: "them", text: "Hi Marcus — Amara came home really proud about the linear-equations worksheet. First time she's said math went well.", at: "3:12 PM" },
    { from: "me", text: "That's great to hear. She did the modelling problems almost unaided. I'm pushing her toward graphing next week — she's ready.", at: "3:41 PM" },
    { from: "them", text: "Could we add a Saturday session before the unit test on the 14th?", at: "6:02 PM" },
    { from: "them", text: "Also — thank you for the water and snacks in the lounge. It matters more than you'd think.", at: "6:03 PM" },
  ]},
  { id: "th2", with: "Diane B. (Noah's guardian)", tone: "teal", initials: "DB", topic: "Missed sessions", unread: 1, msgs: [
    { from: "them", text: "Noah missed Tuesday — my shift changed last minute. Is there any way to do Fridays instead?", at: "9:20 AM" },
    { from: "me", text: "Absolutely, Fridays at 5:30 has an opening in Room B. I'll move him and keep Diego as his tutor.", at: "9:44 AM" },
  ]},
  { id: "th3", with: "Marcus D. (Peer Tutor)", tone: "navy", initials: "MD", topic: "Saturday coverage", unread: 0, msgs: [
    { from: "me", text: "Marcus — can you take one more Saturday slot on the 15th if we get four more RSVPs?", at: "11:02 AM" },
    { from: "them", text: "Yes. I have basketball until 11 but I can be at the center by 12:30.", at: "11:31 AM" },
  ]},
];

/* --------------------------------------------------------------- forms --- */
export const FORMS = [
  { id: "f1", name: "Beyond Limits Participant Agreement", status: "signed", who: "Amara R.", due: "Signed Nov 2", pages: 3, required: true, note: "Program enrollment + tuition agreement" },
  { id: "f2", name: "Media Release — Family Lounge Album", status: "signed", who: "Amara R.", due: "Signed Nov 2", pages: 1, required: false, note: "Photos for enrichment albums" },
  { id: "f3", name: "Sliding-Scale Income Verification", status: "outstanding", who: "Amara R.", due: "Due Nov 14", pages: 2, required: true, note: "Required to hold the 90% discount" },
  { id: "f4", name: "Field Trip Permission — Sacred Heart Campus Visit", status: "outstanding", who: "Amara R.", due: "Due Nov 18", pages: 1, required: true, note: "Sat Nov 22 · 9:00 AM - 2:00 PM · transportation provided" },
  { id: "f5", name: "Chromebook Use Agreement", status: "signed", who: "Amara R.", due: "Signed Sep 30", pages: 1, required: true, note: "On-site device use" },
  { id: "f6", name: "Mentor Pairing Consent", status: "review", who: "Amara R.", due: "In review", pages: 2, required: false, note: "Upperclassmen mentoring program" },
];

export const VOLUNTEER_SHIFTS = [
  { id: "v1", role: "Saturday front desk", when: "Sat Nov 15 · 9:45 AM - 1:00 PM", needed: 2, filled: ["Grace L."], tone: "navy" },
  { id: "v2", role: "Snack & lounge restock", when: "Sun Nov 16 · 11:00 AM - 12:30 PM", needed: 3, filled: ["Lena R.","Diane B."], tone: "solar" },
  { id: "v3", role: "Sacred Heart campus chaperone", when: "Sat Nov 22 · 8:30 AM - 2:30 PM", needed: 4, filled: ["Rosa V."], tone: "violet" },
  { id: "v4", role: "Family workshop greeter", when: "Tue Nov 25 · 6:00 - 7:00 PM", needed: 2, filled: [], tone: "teal" },
  { id: "v5", role: "Tutor training co-lead (college corps)", when: "Thu Dec 4 · 5:00 - 7:00 PM", needed: 2, filled: ["Priya N."], tone: "pink" },
];

/* ------------------------------------------------------------ financial --- */
export const LEDGER = [
  { id: "in1", family: "Vasquez", student: "Elena V.", program: "Peer Tutoring · Nov", gross: 90, discount: 75, billed: 22.5, subsidy: "Discounted 75%", status: "paid", method: "Card", date: "Nov 3" },
  { id: "in2", family: "Okafor", student: "Malik O.", program: "Peer Tutoring · Nov", gross: 90, discount: 90, billed: 9, subsidy: "Discounted 90%", status: "paid", method: "Card", date: "Nov 3" },
  { id: "in3", family: "Reyes", student: "Amara R.", program: "Peer Tutoring · Nov", gross: 90, discount: 90, billed: 9, subsidy: "Discounted 90%", status: "paid", method: "Card", date: "Nov 2" },
  { id: "in4", family: "Bennett", student: "Noah B.", program: "Peer Tutoring · Nov", gross: 90, discount: 90, billed: 9, subsidy: "Discounted 90%", status: "due", method: "—", date: "Due Nov 12" },
  { id: "in5", family: "Haddad", student: "Tariq H.", program: "Peer Tutoring · Nov", gross: 90, discount: 90, billed: 9, subsidy: "Discounted 90%", status: "overdue", method: "—", date: "Due Oct 12" },
  { id: "in6", family: "Lin", student: "Grace L.", program: "Enrichment Add-on", gross: 40, discount: 0, billed: 40, subsidy: "Full fee", status: "paid", method: "Card", date: "Nov 5" },
  { id: "in7", family: "Owens", student: "Ruby S.", program: "Peer Tutoring · Nov", gross: 90, discount: 90, billed: 9, subsidy: "Discounted 90%", status: "paid", method: "Card", date: "Nov 2" },
  { id: "in8", family: "Patel", student: "Aiden P.", program: "Peer Tutoring · Nov", gross: 90, discount: 50, billed: 45, subsidy: "Discounted 50%", status: "due", method: "—", date: "Due Nov 14" },
];

export const REVENUE_MIX = [
  { label: "Grant-funded subsidy", pct: 62, tone: "navy" },
  { label: "Family fees (sliding scale)", pct: 21, tone: "solar" },
  { label: "Youth employment stipends", pct: 11, tone: "teal" },
  { label: "Enrichment add-ons", pct: 6, tone: "violet" },
];

/* ------------------------------------------------------------- progress --- */
export const SUBJECT_SKILLS = [
  { subject: "Algebra I", before: 41, now: 78, sessions: 22, trend: "up" },
  { subject: "Writing", before: 55, now: 74, sessions: 14, trend: "up" },
  { subject: "Science", before: 62, now: 71, sessions: 9, trend: "flat" },
  { subject: "Study Skills", before: 34, now: 66, sessions: 11, trend: "up" },
];

export const GOALS = [
  { id: "g1", text: "Solve two-step linear equations independently", student: "Amara R.", tutor: "Marcus D.", progress: 100, due: "Nov 6", state: "met" },
  { id: "g2", text: "Write a thesis statement with a clear claim + reason", student: "Amara R.", tutor: "Priya N.", progress: 60, due: "Nov 20", state: "active" },
  { id: "g3", text: "Graph slope-intercept form without a reference sheet", student: "Amara R.", tutor: "Marcus D.", progress: 35, due: "Dec 4", state: "active" },
  { id: "g4", text: "Finish the Python dice-roll simulator", student: "Ruby S.", tutor: "Hana K.", progress: 85, due: "Nov 12", state: "active" },
  { id: "g5", text: "Complete 10 sessions with 90%+ attendance", student: "Tariq H.", tutor: "Diego M.", progress: 40, due: "Dec 19", state: "at-risk" },
];

export const TUTOR_NOTES = [
  { at: "Nov 6", tone: "green", tutor: "Marcus D.", note: "Amara solved the two-step modelling problems unaided — real shift from three weeks ago. Ready for graphing." },
  { at: "Nov 3", tone: "amber", tutor: "Marcus D.", note: "Rushed near the end; started guessing instead of writing the steps. We slowed down and she corrected herself." },
  { at: "Oct 30", tone: "navy", tutor: "Priya N.", note: "Draft thesis was descriptive rather than argumentative. Gave her the claim-reason frame to take home." },
  { at: "Oct 23", tone: "green", tutor: "Marcus D.", note: "Signed up to present at the leadership workshop without being asked. Big confidence marker." },
];

/* ----------------------------------------------------------- translation --- */
export const TRANSLATION_PAIRS = [
  { src: "Urgent: Beyond Limits is closed this afternoon due to the winter weather advisory. All sessions are cancelled and will be rescheduled.", tgt: "Urgente: Beyond Limits está cerrado esta tarde debido al aviso de clima invernal. Todas las sesiones quedan canceladas y serán reprogramadas.", lang: "Spanish (ES)", status: "verified", by: "Auto · reviewed" },
  { src: "Your student has a tutoring session today at 4:00 PM in Room A with Marcus D.", tgt: "Su estudiante tiene una sesión de tutoría hoy a las 4:00 PM en el Salón A con Marcus D.", lang: "Spanish (ES)", status: "verified", by: "Auto" },
  { src: "Sliding-scale income verification is required to hold the 90% discount.", tgt: "Se requiere verificación de ingresos a escala móvil para mantener el descuento del 90%.", lang: "Spanish (ES)", status: "needs-review", by: "Auto · flagged" },
];

export const LANGUAGES = [
  { code: "en", label: "English", reach: 212, families: 118 },
  { code: "es", label: "Español", reach: 74, families: 41 },
  { code: "ht", label: "Kreyòl Ayisyen", reach: 18, families: 9 },
  { code: "pt", label: "Português", reach: 9, families: 5 },
  { code: "ar", label: "العربية", reach: 5, families: 3 },
];

export const CHANNEL_FIT = [
  { ch: "App push", reach: 96, best: "Day-to-day", tone: "navy" },
  { ch: "SMS", reach: 99, best: "Urgent + reminders", tone: "solar" },
  { ch: "Email", reach: 88, best: "Forms + long form", tone: "teal" },
  { ch: "Voice call", reach: 71, best: "Closures, attendance", tone: "violet" },
  { ch: "Web portal", reach: 64, best: "Archives, payments", tone: "pink" },
];

export const REACH_BY_GROUP = [
  { group: "Grades 4-6", families: 46, engaged: 44, pct: 96 },
  { group: "Grades 7-8", families: 38, engaged: 34, pct: 89 },
  { group: "Grades 9-10", families: 27, engaged: 22, pct: 81 },
  { group: "ECS (Stamford High)", families: 7, engaged: 7, pct: 100 },
];

export const WEEKLOAD = [
  { day: "Mon", slots: 12, used: 12 },
  { day: "Tue", slots: 12, used: 10 },
  { day: "Wed", slots: 12, used: 12 },
  { day: "Thu", slots: 12, used: 11 },
  { day: "Fri", slots: 8, used: 5 },
  { day: "Sat", slots: 16, used: 16 },
];

export const AUDIT = [
  { at: "Today 9:14 AM", who: "Andy Sklover", what: "Published post to All Families (212 recipients)", tone: "navy" },
  { at: "Today 8:02 AM", who: "System", what: "Auto-reminder sent for 14 sessions tomorrow", tone: "teal" },
  { at: "Yesterday 6:47 PM", who: "Marcus D.", what: "Logged session note for Amara R.", tone: "green" },
  { at: "Yesterday 4:30 PM", who: "Lena R.", what: "Signed Participant Agreement", tone: "violet" },
  { at: "Yesterday 11:05 AM", who: "Andy Sklover", what: "Approved 2 sliding-scale requests", tone: "solar" },
];

export const DEMO_NOTICE = "Demo workspace — institutional details are sourced from Beyond Limits' published materials; people, sessions and messages are sample data.";

export const TONE: Record<string, { bg: string; fg: string; ring: string; dot: string }> = {
  navy:   { bg: "bg-navy-50",   fg: "text-navy-700",   ring: "ring-navy-200",   dot: "var(--navy)" },
  solar:  { bg: "bg-solar-50",  fg: "text-solar-700",  ring: "ring-solar-100",  dot: "var(--solar-600)" },
  teal:   { bg: "bg-teal-50",   fg: "text-signal-teal",ring: "ring-teal-100",   dot: "#0E8C8C" },
  violet: { bg: "bg-violet-50", fg: "text-signal-violet", ring:"ring-violet-100", dot: "#6C4BD6" },
  pink:   { bg: "bg-pink-50",   fg: "text-signal-pink",ring: "ring-pink-100",   dot: "#C2418F" },
  amber:  { bg: "bg-amber-50",  fg: "text-signal-amber",ring:"ring-amber-100",  dot: "#DE8C00" },
  green:  { bg: "bg-emerald-50",fg: "text-signal-green",ring:"ring-emerald-100",dot: "#159A63" },
  red:    { bg: "bg-red-50",    fg: "text-signal-red", ring: "ring-red-100",    dot: "#D93A2B" },
};
