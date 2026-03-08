
import { useState } from "react";

// ─── DEPED OFFENSE CLASSIFICATION (DO 40 s.2012, DO 55 s.2013) ───────────────

const MINOR_OFFENSES = [
  "Failure to wear proper uniform",
  "Not wearing school ID",
  "Cutting classes",
  "Absenteeism / Frequent absences",
  "Tardiness / Coming late to class",
  "Climbing over the school fence",
  "Public Display of Affection (PDA)",
  "Unauthorized use of cellphone/electronic device",
  "Other minor offense",
];
const MAJOR_OFFENSES = [
  "Repeated undesirable behavior",
  "Disrespect toward teachers / school personnel",
  "Cheating and dishonesty",
  "Theft",
  "Threatening / Intimidating / Provoking fights",
  "Smoking or selling cigarettes/vape products",
  "Vandalism of school property",
  "Gambling",
  "Drinking alcohol / Intoxication",
  "Bringing weapons or sharp objects",
  "Extortion / Soliciting money from students",
  "Fighting",
  "Inciting protests that suspend classes",
  "Falsifying school documents / signatures",
  "Distribution of obscene/pornographic materials",
  "Indecent exposure / Exhibitionism",
  "Other major offense",
];
const SPECIAL_CASES = [
  "Use or sale of prohibited drugs (RA 9165)",
  "Sexual harassment / Immorality (DO 40 s.2012)",
  "Bullying / Peer abuse — physical (RA 10627)",
  "Bullying / Peer abuse — verbal (RA 10627)",
  "Cyberbullying (RA 10627)",
  "Social bullying",
  "Gender-based bullying",
  "Hazing / Gang membership (RA 8049)",
  "Other special case",
];
const OFFENSE_MAP = { Minor: MINOR_OFFENSES, Major: MAJOR_OFFENSES, Special: SPECIAL_CASES };

// Max offense counts per type (Minor=3, Major=4, Special=3)
const OFFENSE_MAX = { Minor: 3, Major: 4, Special: 3 };

const DISCIPLINARY = {
  Minor: {
    1: "Referral to Class Adviser — Oral Reprimand from Class Adviser.",
    2: "Verbal warning + parent notification by Grade Level Guidance Advocate; Oral & Written Reprimand with parent/guardian; Written agreement.",
    3: "⚠️ THIRD OFFENSE (MAXIMUM): Disciplinary Probation by Guidance Advocate; Mandatory counseling with Guidance Coordinator & School Head; Life coaching; Community service within school under supervision of Class Adviser and Guidance Coordinator. Student who continues to commit violations shall be classified as Child-at-Risk (CAR) per DO 18, s.2015.",
  },
  Major: {
    1: "Verbal warning + parent notification by Grade Level Guidance Advocate; Oral & Written Reprimand to student with parent/guardian; Written agreement.",
    2: "Disciplinary Probation by Guidance Advocate; Mandatory counseling with Guidance Coordinator & School Head; Life coaching; Community service within school.",
    3: "Referral to School Committee on Students' Discipline; Oral & Written Reprimand; Counseling and community service within school under supervision of Class Adviser and Guidance Counselor.",
    4: "⚠️ FOURTH OFFENSE (MAXIMUM): Referral to School Committee on Students' Discipline with School Head; Subject to transfer to other school. Student who continues to commit violations shall be classified as Child-at-Risk (CAR) per DO 18, s.2015.",
  },
  Special: {
    1: "Referral to higher authorities: Social Worker, Barangay, Police (PNP), Legal Unit of Division Office. Student brought to Guidance Office or Principal's Office. CICL Intake Form (DO 18 Appendix B) must be filed immediately.",
    2: "Referral to higher authorities: Social Worker, Barangay, Police (PNP), Legal Unit of Division Office. Student brought to Guidance Office or Principal's Office. CICL Intake Form (DO 18 Appendix B) must be filed. CAR Profiling & Risk Assessment (Appendix A) must be conducted.",
    3: "⚠️ THIRD OFFENSE (MAXIMUM): Referral to higher authorities: Social Worker, Barangay, Police (PNP), Legal Unit of Division Office. CICL Intake Form filed. Student is classified as Child-at-Risk (CAR) per DO 18, s.2015. CAR Profiling & Initial Risk Assessment (Appendix A) is mandatory. Intervention plan must be developed and monitored.",
  },
};

// CAR Classification categories from DO 18, s.2015 Appendix D
const CAR_CLASSIFICATIONS = [
  "Victim of abuse (sexual, physical, psychological, mental, economic)",
  "Victim of neglect",
  "Coming from a dysfunctional family or without parent or guardian",
  "Being member of a gang",
  "Living in a community with a high level of criminality",
  "Living in a situation of armed conflict",
  "Committed a status offense under Section 57 of RA 9344, as amended",
  "Prostituted children",
  "Mendicant under PD 1563",
  "Solvent / Rugby user",
  "Others",
];

const GRADES = ["Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"];
const SECTIONS = ["Mabini","Rizal","Luna","Bonifacio","Laurel","Aquino","Silang","Del Pilar"];
// RM-2025-134: MHPSS Referral System - Risk Tiers
const RISK_TIERS = [
  { id:"no-risk",   label:"No Risk",       tier:"Tier 1", color:"#16a34a", bg:"#dcfce7" },
  { id:"low-risk",  label:"Low Risk",      tier:"Tier 1", color:"#16a34a", bg:"#dcfce7" },
  { id:"moderate",  label:"Moderate Risk", tier:"Tier 2", color:"#d97706", bg:"#fef3c7" },
  { id:"high-risk", label:"High Risk",     tier:"Tier 3", color:"#dc2626", bg:"#fee2e2" },
  { id:"non-emerg", label:"Non-Emergency", tier:"Tier 3", color:"#dc2626", bg:"#fee2e2" },
  { id:"emergency", label:"Emergency",     tier:"Tier 3", color:"#7f1d1d", bg:"#fecaca" },
];
const MHPSS_CONCERN_TYPES = ["Academic","Behavioral/Emotional","Personal-Social","Career","Adolescent Reproductive Health (ARH)","Mental Health","Substance Use","Family/Home","Suicide/Self-Harm","Trauma/Abuse"];
const INTERNAL_REFERRAL_TYPES = ["Guidance Counselor/Designate","School Head","School Nurse","Class Adviser","Subject Teacher"];
const EXTERNAL_REFERRAL_TYPES = ["Mental Health Specialist (Psychiatrist)","Mental Health Specialist (Psychologist)","mhGap-Trained Doctor","Hospital / Medical Facility","Law Enforcement Personnel (PNP)","LSWDO / DSWD","LRPO (DO 40 s.2012)","NGO / Partner Organization"];
const IRF_BEHAVIORS = [
  "Talks aloud and distracts others in class","Is often late or absent",
  "Performs very poorly in oral and written exams","Shows lack of interest and motivation in studies",
  "Isolates himself/herself from the group","Seems perpetually tired, anxious, depressed, irritable, or angry",
  "Fails to submit work on time","Manifests deterioration in grooming or hygiene",
  "Shows signs of dramatic weight loss or gain","Talks about SUICIDE",
];

// ── MHPSS Seed Data (replaces old counseling sessions) ──
const INIT_COUNSELING = [
  { id:"M001", studentId:"S001", date:"2026-01-10", referralType:"Internal", referredBy:"Ms. Santos", referredByDesignation:"Class Adviser",
    riskLevel:"low-risk", tier:"Tier 1", concernType:"Academic", presentingConcern:"Failing grades in Math and Science",
    initialActionsTaken:"Conducted intake interview. Referred to subject teachers for academic support.",
    studentAgreed:true, parentName:"Ana Reyes", parentContact:"09171234567",
    status:"Resolved", acknowledgedDate:"2026-01-11", sessionStarted:"2026-01-12", followUpCount:2,
    statusChecks:{ closedIntake:false, forCounseling:true, sessionOngoing:false, parentConference:true, terminated:true, noShow:false, monitoring:false },
    referredToExternal:"", conductedBy:"Jovie B. Malapad — Guidance Designate / CPABC Vice Chairperson", notes:"Case resolved. Student enrolled in remediation." },
  { id:"M002", studentId:"S002", date:"2026-01-15", referralType:"Internal", referredBy:"Mr. Cruz", referredByDesignation:"Class Adviser",
    riskLevel:"low-risk", tier:"Tier 1", concernType:"Behavioral/Emotional", presentingConcern:"Repeated tardiness and absenteeism — student also part-time working",
    initialActionsTaken:"Parents notified. Intake interview conducted. Stress management resources shared.",
    studentAgreed:true, parentName:"Lorna Santos", parentContact:"09181234567",
    status:"Ongoing", acknowledgedDate:"2026-01-16", sessionStarted:"2026-01-17", followUpCount:1,
    statusChecks:{ closedIntake:false, forCounseling:true, sessionOngoing:true, parentConference:true, terminated:false, noShow:false, monitoring:true },
    referredToExternal:"", conductedBy:"Jovie B. Malapad — Guidance Designate / CPABC Vice Chairperson", notes:"Under monitoring." },
  { id:"M003", studentId:"S003", date:"2026-01-20", referralType:"Internal", referredBy:"Ms. Flores", referredByDesignation:"Class Adviser",
    riskLevel:"no-risk", tier:"Tier 1", concernType:"Personal-Social", presentingConcern:"Conflict with classmates",
    initialActionsTaken:"Mediation session conducted. Students agreed to resolve conflict.",
    studentAgreed:true, parentName:"Rosa Dela Cruz", parentContact:"09191234567",
    status:"Resolved", acknowledgedDate:"2026-01-21", sessionStarted:"2026-01-22", followUpCount:1,
    statusChecks:{ closedIntake:false, forCounseling:false, sessionOngoing:false, parentConference:false, terminated:true, noShow:false, monitoring:false },
    referredToExternal:"", conductedBy:"Jovie B. Malapad — Guidance Designate / CPABC Vice Chairperson", notes:"" },
  { id:"M004", studentId:"S004", date:"2026-02-01", referralType:"Internal", referredBy:"Mr. Ramos", referredByDesignation:"Class Adviser",
    riskLevel:"low-risk", tier:"Tier 1", concernType:"Career", presentingConcern:"Confusion about strand/course choice for Senior High",
    initialActionsTaken:"Career assessment administered. Intake interview done.",
    studentAgreed:true, parentName:"Maria Bautista", parentContact:"09201234567",
    status:"Ongoing", acknowledgedDate:"2026-02-02", sessionStarted:"2026-02-03", followUpCount:0,
    statusChecks:{ closedIntake:false, forCounseling:true, sessionOngoing:true, parentConference:false, terminated:false, noShow:false, monitoring:false },
    referredToExternal:"", conductedBy:"Jovie B. Malapad — Guidance Designate / CPABC Vice Chairperson", notes:"Student leaning toward STEM strand." },
  { id:"M005", studentId:"S005", date:"2026-02-05", referralType:"Internal", referredBy:"Teacher", referredByDesignation:"Subject Teacher",
    riskLevel:"moderate", tier:"Tier 2", concernType:"Behavioral/Emotional", presentingConcern:"Bullying complaint filed — verbal and social bullying. Possible emotional distress.",
    initialActionsTaken:"Referred to Guidance Designate. Case elevated to CPABC. Intake Sheet filed.",
    studentAgreed:true, parentName:"Elena Garcia", parentContact:"09211234567",
    status:"Pending", acknowledgedDate:"2026-02-06", sessionStarted:"", followUpCount:0,
    statusChecks:{ closedIntake:false, forCounseling:true, sessionOngoing:false, parentConference:true, terminated:false, noShow:false, monitoring:true },
    referredToExternal:"Mental Health Specialist (Psychologist)", conductedBy:"Jovie B. Malapad — Guidance Designate / CPABC Vice Chairperson", notes:"External referral initiated per Tier 2 protocol." },
  { id:"M006", studentId:"S008", date:"2026-02-08", referralType:"Internal", referredBy:"Ms. Flores", referredByDesignation:"Class Adviser",
    riskLevel:"low-risk", tier:"Tier 1", concernType:"Academic", presentingConcern:"Risk of failing current grading period; signs of withdrawal",
    initialActionsTaken:"Intake interview. Academic risk indicator triggered. Referred for remediation.",
    studentAgreed:true, parentName:"Luz Mendoza", parentContact:"09241234567",
    status:"Ongoing", acknowledgedDate:"2026-02-09", sessionStarted:"2026-02-10", followUpCount:1,
    statusChecks:{ closedIntake:false, forCounseling:true, sessionOngoing:true, parentConference:false, terminated:false, noShow:false, monitoring:true },
    referredToExternal:"", conductedBy:"Jovie B. Malapad — Guidance Designate / CPABC Vice Chairperson", notes:"" },
];

// ─── SEED DATA ────────────────────────────────────────────────────────────────

const INIT_STUDENTS = [
  { id:"S001", lrn:"100200300001", lastName:"Reyes", firstName:"Maria Cristina", grade:"Grade 7", section:"Mabini", sex:"Female", dob:"2012-05-14", age:13, adviser:"Ms. Santos",
    mother:{ name:"Ana Reyes", age:40, occupation:"Vendor", address:"Blk 3 Lot 5 Southville 1", contact:"09171234567" },
    father:{ name:"Roberto Reyes", age:43, occupation:"Driver", address:"Blk 3 Lot 5 Southville 1", contact:"09172345678" } },
  { id:"S002", lrn:"100200300002", lastName:"Santos", firstName:"Juan Carlos", grade:"Grade 8", section:"Rizal", sex:"Male", dob:"2011-08-22", age:14, adviser:"Mr. Cruz",
    mother:{ name:"Lorna Santos", age:38, occupation:"Housewife", address:"Blk 7 Lot 2 Southville 1", contact:"09181234567" },
    father:{ name:"Pedro Santos", age:42, occupation:"Carpenter", address:"Blk 7 Lot 2 Southville 1", contact:"09182345678" } },
  { id:"S003", lrn:"100200300003", lastName:"Dela Cruz", firstName:"Angela", grade:"Grade 9", section:"Luna", sex:"Female", dob:"2010-03-11", age:15, adviser:"Ms. Flores",
    mother:{ name:"Rosa Dela Cruz", age:45, occupation:"Teacher", address:"Blk 1 Lot 9 Southville 1", contact:"09191234567" },
    father:{ name:"Carlo Dela Cruz", age:48, occupation:"Engineer", address:"Blk 1 Lot 9 Southville 1", contact:"09192345678" } },
  { id:"S004", lrn:"100200300004", lastName:"Bautista", firstName:"Liam", grade:"Grade 10", section:"Bonifacio", sex:"Male", dob:"2009-11-30", age:16, adviser:"Mr. Ramos",
    mother:{ name:"Maria Bautista", age:42, occupation:"Nurse", address:"Blk 5 Lot 1 Southville 1", contact:"09201234567" },
    father:{ name:"Jose Bautista", age:45, occupation:"Security Guard", address:"Blk 5 Lot 1 Southville 1", contact:"09202345678" } },
  { id:"S005", lrn:"100200300005", lastName:"Garcia", firstName:"Sofia", grade:"Grade 11", section:"Laurel", sex:"Female", dob:"2008-07-05", age:17, adviser:"Ms. Mendoza",
    mother:{ name:"Elena Garcia", age:44, occupation:"Entrepreneur", address:"Blk 9 Lot 4 Southville 1", contact:"09211234567" },
    father:{ name:"Ramon Garcia", age:47, occupation:"OFW", address:"Blk 9 Lot 4 Southville 1", contact:"09212345678" } },
  { id:"S006", lrn:"100200300006", lastName:"Torres", firstName:"Miguel", grade:"Grade 12", section:"Aquino", sex:"Male", dob:"2007-01-18", age:18, adviser:"Mr. Villanueva",
    mother:{ name:"Carla Torres", age:46, occupation:"Accountant", address:"Blk 2 Lot 6 Southville 1", contact:"09221234567" },
    father:{ name:"Dante Torres", age:49, occupation:"Police Officer", address:"Blk 2 Lot 6 Southville 1", contact:"09222345678" } },
  { id:"S007", lrn:"100200300007", lastName:"Flores", firstName:"Hannah", grade:"Grade 7", section:"Mabini", sex:"Female", dob:"2012-09-02", age:13, adviser:"Ms. Santos",
    mother:{ name:"Liza Flores", age:36, occupation:"Seamstress", address:"Blk 6 Lot 3 Southville 1", contact:"09231234567" },
    father:{ name:"Mario Flores", age:39, occupation:"Construction Worker", address:"Blk 6 Lot 3 Southville 1", contact:"09232345678" } },
  { id:"S008", lrn:"100200300008", lastName:"Mendoza", firstName:"Ryan", grade:"Grade 9", section:"Luna", sex:"Male", dob:"2010-06-25", age:15, adviser:"Ms. Flores",
    mother:{ name:"Luz Mendoza", age:40, occupation:"Market Vendor", address:"Blk 8 Lot 7 Southville 1", contact:"09241234567" },
    father:{ name:"Ernesto Mendoza", age:44, occupation:"Tricycle Driver", address:"Blk 8 Lot 7 Southville 1", contact:"09242345678" } },
];

const REFERRAL_TYPES = ["Academic","Behavioral/Protective","Psychosocial","Health-Related","Developmental","Career"];

const INIT_INCIDENTS = [
  { id:"I001", studentId:"S002", date:"2026-01-08", offenseType:"Minor", offense:"Tardiness / Coming late to class", description:"Student arrived 45 minutes late without excuse slip.", offenseCount:1, actionTaken:"Referral to Class Adviser — Oral Reprimand.", reportedBy:"Class Adviser", intakeFiled:false, carFlag:false },
  { id:"I002", studentId:"S005", date:"2026-01-28", offenseType:"Special", offense:"Bullying / Peer abuse — verbal (RA 10627)", description:"Student allegedly bullied a classmate using offensive language and deliberate social exclusion.", offenseCount:1, actionTaken:"Referral to CPABC; Intake Sheet filed; Parents of both parties notified; Investigation ongoing.", reportedBy:"Teacher", intakeFiled:true, carFlag:false },
  { id:"I003", studentId:"S002", date:"2026-02-03", offenseType:"Minor", offense:"Tardiness / Coming late to class", description:"Third tardiness incident this grading period.", offenseCount:3, actionTaken:"Disciplinary Probation; Mandatory counseling; Community service within school.", reportedBy:"Class Adviser", intakeFiled:false, carFlag:false },
  { id:"I004", studentId:"S008", date:"2026-02-06", offenseType:"Major", offense:"Repeated undesirable behavior", description:"Student has not submitted 3 consecutive major outputs and has been disruptive in class.", offenseCount:1, actionTaken:"Verbal warning + parent notification; Oral & Written Reprimand with parent/guardian.", reportedBy:"Subject Teacher", intakeFiled:false, carFlag:false },
];

const INIT_REFERRALS = [
  { id:"R001", studentId:"S001", date:"2026-01-12", type:"Academic", direction:"Internal", referredTo:"Math Department Head", reason:"Failing grades in Mathematics", status:"Completed", outcome:"Enrolled in remediation classes" },
  { id:"R002", studentId:"S005", date:"2026-02-05", type:"Behavioral/Protective", direction:"Internal", referredTo:"CPABC Chairperson (School Head)", reason:"Bullying complaint — verbal and social bullying (RA 10627)", status:"In Progress", outcome:"Under investigation; Intake Sheet IS001 filed" },
  { id:"R003", studentId:"S003", date:"2026-01-22", type:"Psychosocial", direction:"External", referredTo:"Local Social Welfare and Development Office (LSWDO)", reason:"Family situation requiring psychosocial support", status:"Completed", outcome:"Family counseling sessions arranged" },
];

const INIT_INTAKES = [
  {
    id:"IS001", date:"2026-01-28", status:"Under Review",
    victim:{ studentId:"S003", name:"Dela Cruz, Angela", dob:"2010-03-11", age:15, sex:"Female", grade:"Grade 9", section:"Luna", adviser:"Ms. Flores",
      mother:{ name:"Rosa Dela Cruz", age:45, occupation:"Teacher", address:"Blk 1 Lot 9 Southville 1", contact:"09191234567" },
      father:{ name:"Carlo Dela Cruz", age:48, occupation:"Engineer", address:"Blk 1 Lot 9 Southville 1", contact:"09192345678" } },
    complainant:{ name:"Dela Cruz, Angela", relationship:"Self / Victim-Student", address:"Blk 1 Lot 9 Southville 1", contact:"09191234567" },
    respondentType:"Student",
    respondentStudent:{ studentId:"S005", name:"Garcia, Sofia", dob:"2008-07-05", age:17, sex:"Female", grade:"Grade 11", section:"Laurel", adviser:"Ms. Mendoza",
      mother:{ name:"Elena Garcia", age:44, occupation:"Entrepreneur", address:"Blk 9 Lot 4 Southville 1", contact:"09211234567" },
      father:{ name:"Ramon Garcia", age:47, occupation:"OFW", address:"Blk 9 Lot 4 Southville 1", contact:"09212345678" } },
    respondentPersonnel:null,
    caseDetails:"On January 28, 2026, the victim reported that the respondent has been repeatedly using offensive language against her during lunch breaks and deliberately excluding her from group activities, causing emotional distress and humiliation in front of peers. This conduct constitutes verbal and social bullying as defined under DO 40, s. 2012 and the Anti-Bullying Act of 2013 (RA 10627).",
    actionsText:"1. Victim and respondent were summoned to the Guidance Office separately.\n2. Intake Sheet (Annex B) prepared by the Guidance Counselor.\n3. Parents of both parties were notified via phone and in writing.\n4. Case elevated to the CPABC for formal investigation.\n5. Written statements taken from both parties and two witnesses.",
    recommendationsText:"1. Mandatory individual counseling sessions for respondent (minimum 3 sessions).\n2. Written apology from respondent to victim, signed before the Guidance Counselor.\n3. Close monitoring of respondent's behavior for the remainder of the grading period.\n4. Follow-up conference with both sets of parents within two (2) weeks.",
    preparedBy:{ name:"Jovie B. Malapad", designation:"Guidance Designate / CPABC Vice Chairperson", date:"2026-01-28" },
  }
];

// ─── RISK ENGINE ──────────────────────────────────────────────────────────────

function computeRisk(studentId, counseling, incidents) {
  let score = 0;
  const cs = counseling.filter(c => c.studentId === studentId);
  const il = incidents.filter(i => i.studentId === studentId);
  score += cs.length * 8;
  il.forEach(i => {
    if (i.offenseType === "Special") score += 35;
    else if (i.offenseType === "Major") score += 20;
    else score += 5;
    if (i.offenseCount >= 3) score += 15;
    if (i.offenseCount >= 4) score += 20;
    if (i.intakeFiled) score += 10;
  });
  score += cs.filter(c => c.status === "Ongoing" || c.status === "Pending").length * 8;
  return Math.min(score, 100);
}

function getRisk(score) {
  if (score >= 60) return { label:"High Risk", c:"#dc2626", bg:"#fef2f2", b:"#fee2e2" };
  if (score >= 30) return { label:"Moderate Risk", c:"#d97706", bg:"#fffbeb", b:"#fef3c7" };
  return { label:"Low Risk", c:"#16a34a", bg:"#f0fdf4", b:"#dcfce7" };
}

function isCAR(studentId, incidents) {
  const il = incidents.filter(i => i.studentId === studentId);
  return il.filter(i => i.offenseType === "Special").length >= 2 || il.length >= 4 || il.some(i => i.carFlag);
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];
const fmt = d => d ? new Date(d+"T00:00:00").toLocaleDateString("en-PH",{year:"numeric",month:"short",day:"numeric"}) : "—";
const fn = s => s ? `${s.lastName}, ${s.firstName}` : "—";
let counters = {};
const gid = (pfx, arr) => { if (!counters[pfx]) counters[pfx]=arr.length; return `${pfx}${String(++counters[pfx]).padStart(3,"0")}`; };

// ─── COLORS ───────────────────────────────────────────────────────────────────
const C = {
  navy:"#0f172a", slate:"#1e293b", muted:"#64748b", faint:"#94a3b8",
  line:"#e2e8f0", bg:"#f8fafc", white:"#ffffff",
  blue:"#2563eb", blueBg:"#dbeafe",
  purple:"#7c3aed", purpleBg:"#ede9fe",
  red:"#dc2626", redBg:"#fee2e2",
  amber:"#d97706", amberBg:"#fef3c7",
  green:"#16a34a", greenBg:"#dcfce7",
  orange:"#ea580c", orangeBg:"#ffedd5",
};

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Ic = ({ n, s=18 }) => ({ 
  dashboard:<svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  students:<svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  counseling:<svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  incidents:<svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  intake:<svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  referrals:<svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  analytics:<svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  risk:<svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  plus:<svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  close:<svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  search:<svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  eye:<svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  check:<svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  warn:<svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
}[n] || null);

// ─── UI COMPONENTS ────────────────────────────────────────────────────────────
const Badge = ({ label, color=C.muted, bg="#f1f5f9", style={} }) => (
  <span style={{ background:bg, color, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99, letterSpacing:0.4, textTransform:"uppercase", whiteSpace:"nowrap", ...style }}>{label}</span>
);
const OBadge = ({ type }) => ({ Minor:<Badge label="Minor" color={C.amber} bg={C.amberBg}/>, Major:<Badge label="Major" color={C.red} bg={C.redBg}/>, Special:<Badge label="Special" color={C.orange} bg={C.orangeBg}/> }[type]||null);
const SBadge = ({ s }) => {
  const m={ "Resolved":{c:C.green,bg:C.greenBg},"Ongoing":{c:C.blue,bg:C.blueBg},"Pending":{c:C.amber,bg:C.amberBg},"Completed":{c:C.green,bg:C.greenBg},"In Progress":{c:C.blue,bg:C.blueBg},"Under Review":{c:C.purple,bg:C.purpleBg},"Closed":{c:C.muted,bg:"#f1f5f9"},"Internal":{c:C.purple,bg:C.purpleBg},"External":{c:"#db2777",bg:"#fce7f3"} };
  const x=m[s]||{c:C.muted,bg:"#f1f5f9"}; return <Badge label={s} color={x.c} bg={x.bg}/>;
};
const CARTag = () => <span style={{ background:C.red, color:"#fff", fontSize:9, fontWeight:900, padding:"2px 7px", borderRadius:99, letterSpacing:1, textTransform:"uppercase" }}>CAR</span>;

const Overlay = ({ title, onClose, children, wide }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,.65)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
    <div style={{ background:C.white, borderRadius:16, boxShadow:"0 30px 70px rgba(0,0,0,.3)", width:"100%", maxWidth:wide?840:560, maxHeight:"92vh", display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 22px", borderBottom:`1px solid ${C.line}`, flexShrink:0 }}>
        <span style={{ fontWeight:800, fontSize:15, color:C.navy }}>{title}</span>
        <button onClick={onClose} style={{ background:C.bg, border:"none", borderRadius:8, padding:5, cursor:"pointer", color:C.muted, display:"flex" }}><Ic n="close" s={15}/></button>
      </div>
      <div style={{ padding:22, overflowY:"auto", flex:1 }}>{children}</div>
    </div>
  </div>
);

const F = ({ label, required, ch }) => (
  <div style={{ marginBottom:12 }}>
    <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:.4, marginBottom:5 }}>{label}{required&&<span style={{color:C.red}}> *</span>}</label>
    {ch}
  </div>
);
const iSt = { width:"100%", padding:"8px 11px", border:`1.5px solid ${C.line}`, borderRadius:7, fontSize:13, color:C.navy, background:C.white, boxSizing:"border-box", outline:"none", fontFamily:"inherit" };
const In = p => <input {...p} style={{...iSt,...(p.style||{})}}/>;
const Se = ({ children, ...p }) => <select {...p} style={{...iSt,...(p.style||{})}}>{children}</select>;
const Tx = p => <textarea {...p} rows={p.rows||3} style={{...iSt, resize:"vertical",...(p.style||{})}}/>;

const PBtn = ({ children, color=C.blue, onClick, full }) => (
  <button onClick={onClick} style={{ display:"flex", alignItems:"center", gap:7, background:color, color:"#fff", border:"none", borderRadius:9, padding:"9px 17px", fontWeight:700, fontSize:13, cursor:"pointer", width:full?"100%":undefined, justifyContent:full?"center":undefined }}>
    {children}
  </button>
);

const SC = ({ label, value, icon, color, sub }) => (
  <div style={{ background:C.white, borderRadius:12, padding:"16px 18px", boxShadow:"0 1px 3px rgba(0,0,0,.06)", display:"flex", alignItems:"center", gap:12, borderLeft:`4px solid ${color}` }}>
    <div style={{ width:42, height:42, borderRadius:10, background:color+"18", display:"flex", alignItems:"center", justifyContent:"center", color, flexShrink:0 }}><Ic n={icon} s={20}/></div>
    <div>
      <div style={{ fontSize:24, fontWeight:900, color:C.navy, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:12, color:C.muted, marginTop:2, fontWeight:600 }}>{label}</div>
      {sub&&<div style={{ fontSize:11, color, marginTop:1, fontWeight:600 }}>{sub}</div>}
    </div>
  </div>
);

const MBar = ({ data, color }) => {
  const max = Math.max(...data.map(d=>d.v), 1);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:5, height:72 }}>
      {data.map((d,i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
          <span style={{ fontSize:10, fontWeight:700, color:C.navy }}>{d.v||""}</span>
          <div style={{ width:"100%", background:color, borderRadius:"3px 3px 0 0", opacity:.85, height:Math.max((d.v/max)*50, d.v?3:0) }}/>
          <span style={{ fontSize:9, color:C.faint, textAlign:"center", lineHeight:1.2 }}>{d.l}</span>
        </div>
      ))}
    </div>
  );
};

const SH = ({ title, sub }) => (
  <div style={{ marginBottom:18 }}>
    <h2 style={{ fontSize:20, fontWeight:900, color:C.navy, margin:0 }}>{title}</h2>
    {sub&&<p style={{ color:C.muted, margin:"3px 0 0", fontSize:12 }}>{sub}</p>}
  </div>
);

const SBar = ({ value, onChange, ph }) => (
  <div style={{ position:"relative", marginBottom:12 }}>
    <div style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:C.faint }}><Ic n="search" s={14}/></div>
    <input value={value} onChange={onChange} placeholder={ph||"Search..."} style={{...iSt, paddingLeft:32}}/>
  </div>
);

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function GuidanceOMS() {
  const [page, setPage] = useState("dashboard");
  const [students, setStudents] = useState(INIT_STUDENTS);
  const [counseling, setCounseling] = useState(INIT_COUNSELING);
  const [incidents, setIncidents] = useState(INIT_INCIDENTS);
  const [referrals, setReferrals] = useState(INIT_REFERRALS);
  const [intakes, setIntakes] = useState(INIT_INTAKES);
  const [modal, setModal] = useState(null);
  const [sel, setSel] = useState(null);
  const [q, setQ] = useState("");
  const close = () => { setModal(null); setSel(null); };
  const st = id => students.find(s => s.id === id);

  // ── DASHBOARD ───────────────────────────────────────────────────────────────
  const Dashboard = () => {
    const highRisk = students.filter(s => computeRisk(s.id, counseling, incidents) >= 60);
    const carStudents = students.filter(s => isCAR(s.id, incidents));
    const cByM = ["Sep","Oct","Nov","Dec","Jan","Feb"].map((l,i) => ({ l, v: counseling.filter(c => new Date(c.date).getMonth() === (8+i)%12).length }));
    const byOT = ["Minor","Major","Special"].map(t => ({ l:t, v:incidents.filter(i=>i.offenseType===t).length }));
    const recent = [
      ...counseling.map(c => ({ date:c.date, txt:`MHPSS Referral: ${fn(st(c.studentId))} — ${c.concernType||c.type||""}`, dot:C.purple })),
      ...incidents.map(i => ({ date:i.date, txt:`Incident (${i.offenseType}): ${fn(st(i.studentId))} — ${i.offense.split("/")[0].split("—")[0].trim()}`, dot:C.red })),
      ...intakes.map(x => ({ date:x.date, txt:`Intake Sheet ${x.id}: ${x.victim.name} (${x.victim.grade})`, dot:C.orange })),
    ].sort((a,b) => new Date(b.date)-new Date(a.date)).slice(0,7);

    return (
      <div>
        <SH title="Dashboard" sub="Southville 1 Integrated National High School — Guidance Office · S.Y. 2025–2026"/>
        {carStudents.length > 0 && (
          <div style={{ background:"#fff1f2", border:`1.5px solid #fecaca`, borderRadius:10, padding:"11px 16px", marginBottom:16, display:"flex", gap:10, alignItems:"flex-start" }}>
            <span style={{ color:C.red, flexShrink:0, marginTop:1 }}><Ic n="warn" s={18}/></span>
            <div><strong style={{ fontSize:13, color:C.red }}>Child-at-Risk (CAR) Alert — </strong>
              <span style={{ fontSize:13, color:"#7f1d1d" }}>{carStudents.map(s=>fn(s)).join(", ")} {carStudents.length===1?"has":"have"} been flagged as Child-at-Risk per DepEd Order No. 18, s. 2015. Initiate appropriate intervention procedures.</span>
            </div>
          </div>
        )}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(165px,1fr))", gap:11, marginBottom:18 }}>
          <SC label="Enrolled Students" value={students.length} icon="students" color={C.blue}/>
          <SC label="MHPSS Referrals" value={counseling.length} icon="counseling" color={C.purple} sub={`${counseling.filter(c=>c.status==="Ongoing").length} ongoing`}/>
          <SC label="Incidents Recorded" value={incidents.length} icon="incidents" color={C.red} sub={`${incidents.filter(i=>i.offenseType==="Special").length} special cases`}/>
          <SC label="Intake Sheets" value={intakes.length} icon="intake" color={C.orange} sub={`${intakes.filter(x=>x.status==="Under Review").length} under review`}/>
          <SC label="Referrals Filed" value={referrals.length} icon="referrals" color={C.amber} sub={`${referrals.filter(r=>r.status==="In Progress").length} active`}/>
          <SC label="High-Risk Students" value={highRisk.length} icon="risk" color={C.red} sub="Score ≥ 60"/>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
          <div style={{ background:C.white, borderRadius:12, padding:16, boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}>
            <div style={{ fontWeight:800, fontSize:13, color:C.navy, marginBottom:11 }}>MHPSS Referrals by Month</div>
            <MBar data={cByM} color={C.purple}/>
          </div>
          <div style={{ background:C.white, borderRadius:12, padding:16, boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}>
            <div style={{ fontWeight:800, fontSize:13, color:C.navy, marginBottom:11 }}>Incidents by Offense Classification</div>
            <MBar data={byOT} color={C.red}/>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div style={{ background:C.white, borderRadius:12, padding:16, boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}>
            <div style={{ fontWeight:800, fontSize:13, color:C.navy, marginBottom:11 }}>⚠️ At-Risk Monitor</div>
            {students.map(s => ({ s, score:computeRisk(s.id,counseling,incidents), car:isCAR(s.id,incidents) }))
              .filter(x => x.score >= 30).sort((a,b) => b.score-a.score).slice(0,6).map(({s,score,car}) => {
              const r = getRisk(score);
              return (
                <div key={s.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.bg}` }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontWeight:700, fontSize:13, color:C.navy }}>{fn(s)}</span>
                      {car&&<CARTag/>}
                    </div>
                    <div style={{ fontSize:11, color:C.faint }}>{s.grade} — {s.section}</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <span style={{ fontWeight:900, fontSize:17, color:r.c }}>{score}</span>
                    <Badge label={r.label} color={r.c} bg={r.b}/>
                  </div>
                </div>
              );
            })}
            {!students.some(s => computeRisk(s.id,counseling,incidents)>=30) && <p style={{ color:C.faint, fontSize:13 }}>No at-risk students currently flagged.</p>}
          </div>
          <div style={{ background:C.white, borderRadius:12, padding:16, boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}>
            <div style={{ fontWeight:800, fontSize:13, color:C.navy, marginBottom:11 }}>🕒 Recent Activity</div>
            {recent.map((a,i) => (
              <div key={i} style={{ display:"flex", gap:9, padding:"7px 0", borderBottom:`1px solid ${C.bg}`, alignItems:"flex-start" }}>
                <div style={{ width:7, height:7, borderRadius:"50%", background:a.dot, flexShrink:0, marginTop:4 }}/>
                <div><div style={{ fontSize:12, color:C.navy, fontWeight:600 }}>{a.txt}</div>
                <div style={{ fontSize:11, color:C.faint }}>{fmt(a.date)}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ── STUDENTS ────────────────────────────────────────────────────────────────
  const blankS = () => ({ lastName:"",firstName:"",lrn:"",grade:"Grade 7",section:"Mabini",sex:"Female",dob:"",age:"",adviser:"",mother:{name:"",age:"",occupation:"",address:"",contact:""},father:{name:"",age:"",occupation:"",address:"",contact:""} });
  const [sF, setSF] = useState(blankS());

  const Students = () => {
    const fil = students.filter(s => !q || fn(s).toLowerCase().includes(q.toLowerCase()) || s.lrn.includes(q) || s.grade.toLowerCase().includes(q.toLowerCase()));
    return (
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
          <SH title="Student Records" sub={`${students.length} students enrolled`}/>
          <PBtn color={C.blue} onClick={()=>setModal("addStu")}><Ic n="plus" s={15}/>Add Student</PBtn>
        </div>
        <SBar value={q} onChange={e=>setQ(e.target.value)} ph="Search by name, LRN, grade..."/>
        <div style={{ background:C.white, borderRadius:12, boxShadow:"0 1px 3px rgba(0,0,0,.06)", overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr style={{ background:C.bg }}>
              {["Name","LRN","Grade & Section","Age / Sex","Adviser","Risk Score",""].map(h=>(
                <th key={h} style={{ padding:"10px 13px", textAlign:"left", fontSize:10, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:.4, borderBottom:`1px solid ${C.line}` }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{fil.map(s => {
              const score=computeRisk(s.id,counseling,incidents), r=getRisk(score), car=isCAR(s.id,incidents);
              return (
                <tr key={s.id} style={{ borderBottom:`1px solid ${C.bg}` }}>
                  <td style={{ padding:"10px 13px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontWeight:700, fontSize:13, color:C.navy }}>{fn(s)}</span>
                      {car&&<CARTag/>}
                    </div>
                    <div style={{ fontSize:11, color:C.faint }}>{s.mother?.name||"—"}</div>
                  </td>
                  <td style={{ padding:"10px 13px", fontSize:12, color:C.muted, fontFamily:"monospace" }}>{s.lrn}</td>
                  <td style={{ padding:"10px 13px", fontSize:13, color:C.navy }}>{s.grade} — {s.section}</td>
                  <td style={{ padding:"10px 13px", fontSize:13, color:C.navy }}>{s.age} / {s.sex}</td>
                  <td style={{ padding:"10px 13px", fontSize:12, color:C.muted }}>{s.adviser}</td>
                  <td style={{ padding:"10px 13px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                      <span style={{ fontWeight:900, fontSize:15, color:r.c }}>{score}</span>
                      <Badge label={r.label} color={r.c} bg={r.b}/>
                    </div>
                  </td>
                  <td style={{ padding:"10px 13px" }}>
                    <button onClick={()=>{setSel(s);setModal("viewStu");}} style={{ background:C.blueBg, border:"none", borderRadius:7, padding:"5px 9px", cursor:"pointer", color:C.blue, display:"flex" }}><Ic n="eye" s={14}/></button>
                  </td>
                </tr>
              );
            })}</tbody>
          </table>
          {fil.length===0&&<div style={{ padding:36, textAlign:"center", color:C.faint, fontSize:14 }}>No students found.</div>}
        </div>

        {modal==="addStu"&&(
          <Overlay title="Enroll New Student" onClose={close}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:11 }}>
              <F label="Last Name" required ch={<In value={sF.lastName} onChange={e=>setSF(p=>({...p,lastName:e.target.value}))}/>}/>
              <F label="First Name" required ch={<In value={sF.firstName} onChange={e=>setSF(p=>({...p,firstName:e.target.value}))}/>}/>
              <F label="LRN (12-digit)" required ch={<In value={sF.lrn} onChange={e=>setSF(p=>({...p,lrn:e.target.value}))}/>}/>
              <F label="Date of Birth" ch={<In type="date" value={sF.dob} onChange={e=>setSF(p=>({...p,dob:e.target.value}))}/>}/>
              <F label="Grade Level" required ch={<Se value={sF.grade} onChange={e=>setSF(p=>({...p,grade:e.target.value}))}>{GRADES.map(g=><option key={g}>{g}</option>)}</Se>}/>
              <F label="Section" required ch={<Se value={sF.section} onChange={e=>setSF(p=>({...p,section:e.target.value}))}>{SECTIONS.map(s=><option key={s}>{s}</option>)}</Se>}/>
              <F label="Age" required ch={<In type="number" value={sF.age} onChange={e=>setSF(p=>({...p,age:e.target.value}))}/>}/>
              <F label="Sex" ch={<Se value={sF.sex} onChange={e=>setSF(p=>({...p,sex:e.target.value}))}><option>Female</option><option>Male</option></Se>}/>
            </div>
            <F label="Class Adviser" ch={<In value={sF.adviser} onChange={e=>setSF(p=>({...p,adviser:e.target.value}))}/>}/>
            <div style={{ fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:.4, margin:"10px 0 8px" }}>Mother's Information</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr", gap:8 }}>
              {[["Name","name"],["Age","age"],["Occupation","occupation"],["Address","address"],["Contact","contact"]].map(([l,k])=>(
                <F key={l} label={l} ch={<In value={sF.mother[k]} onChange={e=>setSF(p=>({...p,mother:{...p.mother,[k]:e.target.value}}))}/>}/>
              ))}
            </div>
            <div style={{ fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:.4, margin:"10px 0 8px" }}>Father's Information</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr", gap:8 }}>
              {[["Name","name"],["Age","age"],["Occupation","occupation"],["Address","address"],["Contact","contact"]].map(([l,k])=>(
                <F key={l+"f"} label={l} ch={<In value={sF.father[k]} onChange={e=>setSF(p=>({...p,father:{...p.father,[k]:e.target.value}}))}/>}/>
              ))}
            </div>
            <PBtn full color={C.blue} onClick={()=>{ if(!sF.lastName||!sF.lrn) return; setStudents(p=>[...p,{...sF,id:gid("S",p)}]); setSF(blankS()); close(); }} style={{marginTop:12}}>Save Student Record</PBtn>
          </Overlay>
        )}

        {modal==="viewStu"&&sel&&(()=>{
          const s=sel, score=computeRisk(s.id,counseling,incidents), r=getRisk(score), car=isCAR(s.id,incidents);
          const si=incidents.filter(i=>i.studentId===s.id), sc=counseling.filter(c=>c.studentId===s.id);
          return (
            <Overlay title={`Student Profile — ${fn(s)}`} onClose={close} wide>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:16 }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:800, color:C.faint, textTransform:"uppercase", letterSpacing:.4, marginBottom:8 }}>Personal & Academic</div>
                  {[["LRN",s.lrn],["Grade & Section",`${s.grade} — ${s.section}`],["Age / Sex",`${s.age} / ${s.sex}`],["Date of Birth",fmt(s.dob)],["Class Adviser",s.adviser]].map(([k,v])=>(
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:`1px solid ${C.bg}`, fontSize:13 }}>
                      <span style={{ color:C.muted, fontWeight:600 }}>{k}</span>
                      <span style={{ color:C.navy, fontWeight:700 }}>{v||"—"}</span>
                    </div>
                  ))}
                  <div style={{ marginTop:10, fontSize:11, fontWeight:800, color:C.faint, textTransform:"uppercase", letterSpacing:.4, marginBottom:8 }}>Parents / Guardian</div>
                  {[["Mother",s.mother],["Father",s.father]].map(([role,p])=>(
                    <div key={role} style={{ background:C.bg, borderRadius:7, padding:"8px 10px", marginBottom:7 }}>
                      <div style={{ fontSize:11, fontWeight:800, color:C.muted }}>{role}</div>
                      <div style={{ fontSize:12, color:C.navy, marginTop:2 }}>{p?.name||"—"} (Age {p?.age||"—"}) · {p?.occupation||"—"}</div>
                      <div style={{ fontSize:11, color:C.faint }}>{p?.contact||"—"} · {p?.address||"—"}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ background:r.bg, borderRadius:10, padding:14, textAlign:"center", marginBottom:10 }}>
                    <div style={{ fontSize:44, fontWeight:900, color:r.c, lineHeight:1 }}>{score}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:r.c, marginTop:2 }}>{r.label}</div>
                    {car&&<div style={{ marginTop:7, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}><CARTag/><span style={{ fontSize:12, color:"#7f1d1d" }}>Child-at-Risk — DO 18 s.2015</span></div>}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                    {[[sc.length,"MHPSS Refs",C.purple],[si.length,"Incidents",C.red],[referrals.filter(r=>r.studentId===s.id).length,"Referrals",C.amber]].map(([v,l,c])=>(
                      <div key={l} style={{ background:C.bg, borderRadius:7, padding:"8px 10px", textAlign:"center" }}>
                        <div style={{ fontWeight:900, fontSize:18, color:c }}>{v}</div>
                        <div style={{ fontSize:9, color:C.faint, fontWeight:700 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  {si.length>0&&(
                    <div style={{ marginTop:12 }}>
                      <div style={{ fontSize:11, fontWeight:800, color:C.faint, textTransform:"uppercase", letterSpacing:.4, marginBottom:7 }}>Incident History</div>
                      {si.map(i=>(
                        <div key={i.id} style={{ background:C.bg, borderRadius:7, padding:"8px 10px", marginBottom:6 }}>
                          <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:3 }}><OBadge type={i.offenseType}/><span style={{ fontSize:11, color:C.muted }}>#{i.offenseCount} · {fmt(i.date)}</span>{i.intakeFiled&&<Badge label="Intake Filed" color={C.orange} bg={C.orangeBg}/>}</div>
                          <div style={{ fontSize:12, fontWeight:700, color:C.navy }}>{i.offense}</div>
                          <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{i.actionTaken}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Overlay>
          );
        })()}
      </div>
    );
  };

  // ── INCIDENTS ───────────────────────────────────────────────────────────────
  const blankI = () => ({ studentId:"",date:today(),offenseType:"Minor",offense:MINOR_OFFENSES[0],description:"",offenseCount:1,actionTaken:"",reportedBy:"",intakeFiled:false,carFlag:false });
  const [iF, setIF] = useState(blankI());

  const Incidents = () => {
    const fil = incidents.filter(i => { const s=st(i.studentId); return !q||(fn(s).toLowerCase().includes(q.toLowerCase())||i.offense.toLowerCase().includes(q.toLowerCase())); });
    const oList = OFFENSE_MAP[iF.offenseType]||MINOR_OFFENSES;
    const suggested = DISCIPLINARY[iF.offenseType]?.[iF.offenseCount] || "Refer to CPABC and School Head for appropriate action per DepEd guidelines.";
    return (
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
          <SH title="Behavioral Incidents" sub="Classified under DepEd DO 40 s.2012 and RA 10627: Minor, Major, and Special Cases"/>
          <PBtn color={C.red} onClick={()=>setModal("addInc")}><Ic n="plus" s={15}/>Log Incident</PBtn>
        </div>
        <SBar value={q} onChange={e=>setQ(e.target.value)} ph="Search by student or offense..."/>
        <div style={{ background:C.white, borderRadius:12, boxShadow:"0 1px 3px rgba(0,0,0,.06)", overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr style={{ background:C.bg }}>
              {["Date","Student","Classification","Specific Offense","Count","Action Taken","Reported By","Flags"].map(h=>(
                <th key={h} style={{ padding:"10px 12px", textAlign:"left", fontSize:10, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:.4, borderBottom:`1px solid ${C.line}` }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{fil.map(i => {
              const s=st(i.studentId);
              return (
                <tr key={i.id} style={{ borderBottom:`1px solid ${C.bg}` }}>
                  <td style={{ padding:"10px 12px", fontSize:12, color:C.muted, whiteSpace:"nowrap" }}>{fmt(i.date)}</td>
                  <td style={{ padding:"10px 12px" }}>
                    <div style={{ fontWeight:700, fontSize:13, color:C.navy }}>{fn(s)}</div>
                    <div style={{ fontSize:11, color:C.faint }}>{s?.grade}</div>
                  </td>
                  <td style={{ padding:"10px 12px" }}><OBadge type={i.offenseType}/></td>
                  <td style={{ padding:"10px 12px", fontSize:12, color:C.navy, maxWidth:170 }}>{i.offense}</td>
                  <td style={{ padding:"10px 12px", textAlign:"center" }}>
                    <span style={{ fontWeight:900, fontSize:15, color:i.offenseCount>=3?C.red:i.offenseCount===2?C.amber:C.muted }}>{i.offenseCount}</span>
                  </td>
                  <td style={{ padding:"10px 12px", fontSize:11, color:C.muted, maxWidth:190 }}>{i.actionTaken}</td>
                  <td style={{ padding:"10px 12px", fontSize:11, color:C.faint }}>{i.reportedBy}</td>
                  <td style={{ padding:"10px 12px" }}>
                    <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                      {i.intakeFiled&&<Badge label="Intake" color={C.orange} bg={C.orangeBg}/>}
                      {i.carFlag&&<CARTag/>}
                    </div>
                  </td>
                </tr>
              );
            })}</tbody>
          </table>
          {fil.length===0&&<div style={{ padding:34, textAlign:"center", color:C.faint, fontSize:14 }}>No incidents found.</div>}
        </div>

        {modal==="addInc"&&(
          <Overlay title="Log Behavioral Incident" onClose={close} wide>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:11 }}>
              <F label="Student" required ch={<Se value={iF.studentId} onChange={e=>setIF(p=>({...p,studentId:e.target.value}))}>
                <option value="">— Select —</option>
                {students.map(s=><option key={s.id} value={s.id}>{fn(s)} ({s.grade})</option>)}
              </Se>}/>
              <F label="Date" required ch={<In type="date" value={iF.date} onChange={e=>setIF(p=>({...p,date:e.target.value}))}/>}/>
              <F label="Offense Classification" required ch={<Se value={iF.offenseType} onChange={e=>setIF(p=>({...p,offenseType:e.target.value,offense:OFFENSE_MAP[e.target.value][0]}))}>
                <option>Minor</option><option>Major</option><option>Special</option>
              </Se>}/>
              <F label="Offense Count (max per classification)" ch={<Se value={iF.offenseCount} onChange={e=>setIF(p=>({...p,offenseCount:Number(e.target.value)}))}>
                {Array.from({length: OFFENSE_MAX[iF.offenseType]||3},(_,i)=>i+1).map(n=><option key={n}>{n}</option>)}
              </Se>}/>
            </div>
            <F label="Specific Offense" required ch={<Se value={iF.offense} onChange={e=>setIF(p=>({...p,offense:e.target.value}))}>
              {OFFENSE_MAP[iF.offenseType].map(o=><option key={o}>{o}</option>)}
            </Se>}/>
            <F label="Description" required ch={<Tx value={iF.description} onChange={e=>setIF(p=>({...p,description:e.target.value}))}/>}/>
            <div style={{ background:C.bg, borderRadius:9, padding:"11px 14px", marginBottom:12, border:`1px solid ${C.line}` }}>
              <div style={{ fontSize:10, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:.4, marginBottom:5 }}>Recommended Disciplinary Action (per DepEd guidelines)</div>
              <div style={{ fontSize:12, color:C.navy, lineHeight:1.65 }}>{suggested}</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:11 }}>
              <F label="Action Taken" required ch={<Tx value={iF.actionTaken} onChange={e=>setIF(p=>({...p,actionTaken:e.target.value}))}/>}/>
              <div>
                <F label="Reported By" ch={<In value={iF.reportedBy} onChange={e=>setIF(p=>({...p,reportedBy:e.target.value}))}/>}/>
                <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:8 }}>
                  <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:C.navy, cursor:"pointer" }}>
                    <input type="checkbox" checked={iF.intakeFiled} onChange={e=>setIF(p=>({...p,intakeFiled:e.target.checked}))} style={{ width:14,height:14 }}/>
                    <span style={{ fontWeight:600 }}>Intake Sheet Filed (Annex B)</span>
                  </label>
                  <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:C.navy, cursor:"pointer" }}>
                    <input type="checkbox" checked={iF.carFlag} onChange={e=>setIF(p=>({...p,carFlag:e.target.checked}))} style={{ width:14,height:14 }}/>
                    <span style={{ fontWeight:600 }}>Flag as Child-at-Risk (CAR)</span>
                  </label>
                </div>
              </div>
            </div>
            <PBtn full color={C.red} onClick={()=>{ if(!iF.studentId||!iF.description) return; setIncidents(p=>[...p,{...iF,id:gid("I",p)}]); setIF(blankI()); close(); }} style={{marginTop:8}}>Save Incident Record</PBtn>
          </Overlay>
        )}
      </div>
    );
  };

  // ── INTAKE SHEET (Annex B) ──────────────────────────────────────────────────
  const blankIn = () => ({
    date:today(), status:"Under Review",
    victim:{ studentId:"",name:"",dob:"",age:"",sex:"Female",grade:"Grade 7",section:"",adviser:"",mother:{name:"",age:"",occupation:"",address:"",contact:""},father:{name:"",age:"",occupation:"",address:"",contact:""} },
    complainant:{ name:"",relationship:"",address:"",contact:"" },
    respondentType:"Student",
    respondentStudent:{ studentId:"",name:"",dob:"",age:"",sex:"Female",grade:"Grade 7",section:"",adviser:"",mother:{name:"",age:"",occupation:"",address:"",contact:""},father:{name:"",age:"",occupation:"",address:"",contact:""} },
    respondentPersonnel:{ name:"",dob:"",age:"",sex:"Female",designation:"",address:"",contact:"" },
    caseDetails:"", actionsText:"", recommendationsText:"",
    preparedBy:{ name:"",designation:"",date:today() },
  });
  const [inF, setInF] = useState(blankIn());
  const sv = (k,v) => setInF(p=>({...p,victim:{...p.victim,[k]:v}}));
  const sc2 = (k,v) => setInF(p=>({...p,complainant:{...p.complainant,[k]:v}}));
  const srs = (k,v) => setInF(p=>({...p,respondentStudent:{...p.respondentStudent,[k]:v}}));
  const srp = (k,v) => setInF(p=>({...p,respondentPersonnel:{...p.respondentPersonnel,[k]:v}}));
  const spb = (k,v) => setInF(p=>({...p,preparedBy:{...p.preparedBy,[k]:v}}));

  const Intakes = () => {
    const fil = intakes.filter(x => !q||x.victim.name.toLowerCase().includes(q.toLowerCase())||x.id.toLowerCase().includes(q.toLowerCase()));
    return (
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
          <SH title="Intake Sheets (Annex B)" sub="DepEd Child Protection Intake Sheet — DO 40, s.2012"/>
          <PBtn color={C.orange} onClick={()=>setModal("addInt")}><Ic n="plus" s={15}/>New Intake Sheet</PBtn>
        </div>
        <SBar value={q} onChange={e=>setQ(e.target.value)} ph="Search intake sheets..."/>
        <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
          {fil.map(x=>(
            <div key={x.id} style={{ background:C.white, borderRadius:11, padding:"15px 18px", boxShadow:"0 1px 3px rgba(0,0,0,.06)", borderLeft:`4px solid ${C.orange}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6 }}>
                    <span style={{ fontWeight:900, fontSize:14, color:C.navy, fontFamily:"monospace" }}>{x.id}</span>
                    <SBadge s={x.status}/>
                    <span style={{ fontSize:12, color:C.faint }}>Filed: {fmt(x.date)}</span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"5px 18px", fontSize:13, marginBottom:7 }}>
                    <div><span style={{ color:C.faint, fontWeight:600 }}>Victim: </span><strong style={{ color:C.navy }}>{x.victim.name}</strong></div>
                    <div><span style={{ color:C.faint, fontWeight:600 }}>Grade: </span><span style={{ color:C.navy }}>{x.victim.grade} — {x.victim.section}</span></div>
                    <div><span style={{ color:C.faint, fontWeight:600 }}>Respondent: </span><span style={{ color:C.navy }}>{x.respondentType==="Student"?x.respondentStudent?.name:x.respondentPersonnel?.name}</span></div>
                  </div>
                  <div style={{ fontSize:12, color:C.muted, lineHeight:1.5 }}>{x.caseDetails.substring(0,220)}{x.caseDetails.length>220?"...":""}</div>
                  <div style={{ fontSize:11, color:C.faint, marginTop:5 }}>Prepared by: {x.preparedBy.name} · {x.preparedBy.designation}</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:6, marginLeft:14 }}>
                  <button onClick={()=>{setSel(x);setModal("viewInt");}} style={{ background:C.blueBg, border:"none", borderRadius:7, padding:"6px 10px", cursor:"pointer", color:C.blue, display:"flex" }}><Ic n="eye" s={14}/></button>
                  {x.status==="Under Review"&&<button onClick={()=>setIntakes(p=>p.map(i=>i.id===x.id?{...i,status:"Closed"}:i))} style={{ background:C.greenBg, border:"none", borderRadius:7, padding:"5px 9px", cursor:"pointer", color:C.green, fontWeight:700, fontSize:11 }}>Close</button>}
                </div>
              </div>
            </div>
          ))}
          {fil.length===0&&<div style={{ background:C.white, borderRadius:11, padding:36, textAlign:"center", color:C.faint }}>No intake sheets filed yet.</div>}
        </div>

        {modal==="viewInt"&&sel&&(
          <Overlay title={`Intake Sheet — ${sel.id}`} onClose={close} wide>
            <div style={{ textAlign:"center", fontWeight:900, fontSize:12, color:C.muted, textTransform:"uppercase", letterSpacing:.5, marginBottom:14 }}>Department of Education · Intake Sheet (Annex B)</div>
            <SecTitle>I. Victim</SecTitle>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:9, marginBottom:10 }}>
              {[["Name",sel.victim.name],["DOB",fmt(sel.victim.dob)],["Age",sel.victim.age],["Sex",sel.victim.sex],["Grade & Section",`${sel.victim.grade} — ${sel.victim.section}`],["Adviser",sel.victim.adviser]].map(([k,v])=>(
                <div key={k} style={{ background:C.bg, borderRadius:6, padding:"7px 10px" }}>
                  <div style={{ fontSize:9, color:C.faint, fontWeight:700, textTransform:"uppercase" }}>{k}</div>
                  <div style={{ fontSize:13, color:C.navy, fontWeight:600, marginTop:2 }}>{v||"—"}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:14 }}>
              {[["Mother",sel.victim.mother],["Father",sel.victim.father]].map(([role,p])=>(
                <div key={role} style={{ background:C.bg, borderRadius:7, padding:"9px 12px" }}>
                  <div style={{ fontSize:11, fontWeight:800, color:C.muted, marginBottom:4 }}>{role}</div>
                  <div style={{ fontSize:12, color:C.navy }}>{p?.name||"—"} (Age {p?.age||"—"}) · {p?.occupation||"—"}</div>
                  <div style={{ fontSize:11, color:C.faint }}>{p?.contact||"—"} · {p?.address||"—"}</div>
                </div>
              ))}
            </div>
            <SecTitle>II. Complainant</SecTitle>
            <div style={{ background:C.bg, borderRadius:7, padding:"9px 12px", marginBottom:14, fontSize:13 }}>
              <strong style={{ color:C.navy }}>{sel.complainant.name}</strong> · {sel.complainant.relationship}
              <div style={{ fontSize:11, color:C.faint, marginTop:2 }}>{sel.complainant.address} · {sel.complainant.contact}</div>
            </div>
            <SecTitle>III. Respondent ({sel.respondentType})</SecTitle>
            <div style={{ background:C.bg, borderRadius:7, padding:"9px 12px", marginBottom:14, fontSize:13 }}>
              {sel.respondentType==="Student"&&sel.respondentStudent?(
                <><strong style={{ color:C.navy }}>{sel.respondentStudent.name}</strong>
                <div style={{ fontSize:12, color:C.faint }}>{sel.respondentStudent.grade} — {sel.respondentStudent.section} · Adviser: {sel.respondentStudent.adviser}</div></>
              ):(
                <><strong style={{ color:C.navy }}>{sel.respondentPersonnel?.name}</strong>
                <div style={{ fontSize:12, color:C.faint }}>{sel.respondentPersonnel?.designation} · {sel.respondentPersonnel?.contact}</div></>
              )}
            </div>
            {[["IV. Details of the Case",sel.caseDetails],["V. Action Taken",sel.actionsText],["VI. Recommendations",sel.recommendationsText]].map(([t,txt])=>(
              <div key={t} style={{ marginBottom:14 }}>
                <SecTitle>{t}</SecTitle>
                <div style={{ background:C.bg, borderRadius:7, padding:"10px 14px", fontSize:13, color:C.navy, lineHeight:1.7, whiteSpace:"pre-line" }}>{txt||"—"}</div>
              </div>
            ))}
            <div style={{ textAlign:"right", marginTop:10, paddingTop:12, borderTop:`1px solid ${C.line}` }}>
              <div style={{ fontSize:11, color:C.muted }}>Prepared by:</div>
              <div style={{ fontSize:13, fontWeight:800, color:C.navy }}>{sel.preparedBy.name}</div>
              <div style={{ fontSize:12, color:C.muted }}>{sel.preparedBy.designation}</div>
              <div style={{ fontSize:12, color:C.muted }}>{fmt(sel.preparedBy.date)}</div>
            </div>
          </Overlay>
        )}

        {modal==="addInt"&&(
          <Overlay title="New Intake Sheet — Annex B (DO 40, s.2012)" onClose={close} wide>
            <SecTitle>I. Victim</SecTitle>
            <F label="Auto-fill from enrolled student" ch={<Se value={inF.victim.studentId} onChange={e=>{ const s=st(e.target.value); if(s) setInF(p=>({...p,victim:{studentId:s.id,name:fn(s),dob:s.dob,age:s.age,sex:s.sex,grade:s.grade,section:s.section,adviser:s.adviser,mother:{...s.mother},father:{...s.father}}})); }}>
              <option value="">— Select or fill manually below —</option>
              {students.map(s=><option key={s.id} value={s.id}>{fn(s)} ({s.grade})</option>)}
            </Se>}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:9 }}>
              <F label="Name" required ch={<In value={inF.victim.name} onChange={e=>sv("name",e.target.value)}/>}/>
              <F label="DOB" ch={<In type="date" value={inF.victim.dob} onChange={e=>sv("dob",e.target.value)}/>}/>
              <F label="Age" ch={<In type="number" value={inF.victim.age} onChange={e=>sv("age",e.target.value)}/>}/>
              <F label="Sex" ch={<Se value={inF.victim.sex} onChange={e=>sv("sex",e.target.value)}><option>Female</option><option>Male</option></Se>}/>
              <F label="Grade" ch={<Se value={inF.victim.grade} onChange={e=>sv("grade",e.target.value)}>{GRADES.map(g=><option key={g}>{g}</option>)}</Se>}/>
              <F label="Section" ch={<In value={inF.victim.section} onChange={e=>sv("section",e.target.value)}/>}/>
              <F label="Adviser" ch={<In value={inF.victim.adviser} onChange={e=>sv("adviser",e.target.value)}/>}/>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:7, marginBottom:4 }}>
              {[["Mother","name","mother"],["Age","age","mother"],["Occupation","occupation","mother"],["Address","address","mother"],["Contact","contact","mother"]].map(([l,k])=>(
                <F key={l} label={l} ch={<In value={inF.victim.mother[k]} onChange={e=>setInF(p=>({...p,victim:{...p.victim,mother:{...p.victim.mother,[k]:e.target.value}}}))}/>}/>
              ))}
              {[["Father","name"],["Age","age"],["Occupation","occupation"],["Address","address"],["Contact","contact"]].map(([l,k])=>(
                <F key={l+"f"} label={l} ch={<In value={inF.victim.father[k]} onChange={e=>setInF(p=>({...p,victim:{...p.victim,father:{...p.victim.father,[k]:e.target.value}}}))}/>}/>
              ))}
            </div>
            <SecTitle>II. Complainant</SecTitle>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:9 }}>
              {[["Name","name"],["Relationship to Victim","relationship"],["Address","address"],["Contact No.","contact"]].map(([l,k])=>(
                <F key={l} label={l} ch={<In value={inF.complainant[k]} onChange={e=>sc2(k,e.target.value)}/>}/>
              ))}
            </div>
            <SecTitle>III. Respondent</SecTitle>
            <F label="Respondent Type" ch={<Se value={inF.respondentType} onChange={e=>setInF(p=>({...p,respondentType:e.target.value}))}><option>Student</option><option>School Personnel</option></Se>}/>
            {inF.respondentType==="Student"?(
              <>
                <F label="Auto-fill from enrolled student" ch={<Se value={inF.respondentStudent.studentId} onChange={e=>{ const s=st(e.target.value); if(s) setInF(p=>({...p,respondentStudent:{studentId:s.id,name:fn(s),dob:s.dob,age:s.age,sex:s.sex,grade:s.grade,section:s.section,adviser:s.adviser,mother:{...s.mother},father:{...s.father}}})); }}>
                  <option value="">— Select —</option>
                  {students.map(s=><option key={s.id} value={s.id}>{fn(s)} ({s.grade})</option>)}
                </Se>}/>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:9 }}>
                  {[["Name","name"],["DOB","dob"],["Age","age"],["Sex","sex"],["Grade","grade"],["Section","section"],["Adviser","adviser"]].map(([l,k])=>(
                    <F key={l} label={l} ch={<In type={k==="dob"?"date":"text"} value={inF.respondentStudent[k]||""} onChange={e=>srs(k,e.target.value)}/>}/>
                  ))}
                </div>
              </>
            ):(
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:9 }}>
                {[["Name","name"],["DOB","dob"],["Age","age"],["Sex","sex"],["Designation","designation"],["Address & Contact","contact"]].map(([l,k])=>(
                  <F key={l} label={l} ch={<In value={inF.respondentPersonnel[k]||""} onChange={e=>srp(k,e.target.value)}/>}/>
                ))}
              </div>
            )}
            <SecTitle>IV. Details of the Case</SecTitle>
            <F label="Case Details" required ch={<Tx rows={5} value={inF.caseDetails} onChange={e=>setInF(p=>({...p,caseDetails:e.target.value}))} placeholder="Describe the incident, including date, place, persons involved, and nature of the complaint..."/>}/>
            <SecTitle>V. Action Taken</SecTitle>
            <F label="Actions Taken (one per line)" ch={<Tx rows={4} value={inF.actionsText} onChange={e=>setInF(p=>({...p,actionsText:e.target.value}))} placeholder={"1. \n2. \n3. "}/>}/>
            <SecTitle>VI. Recommendations</SecTitle>
            <F label="Recommendations (one per line)" ch={<Tx rows={4} value={inF.recommendationsText} onChange={e=>setInF(p=>({...p,recommendationsText:e.target.value}))} placeholder={"1. \n2. \n3. "}/>}/>
            <SecTitle>Prepared By</SecTitle>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:9 }}>
              <F label="Name over Printed Name" required ch={<In value={inF.preparedBy.name} onChange={e=>spb("name",e.target.value)}/>}/>
              <F label="Designation" ch={<In value={inF.preparedBy.designation} onChange={e=>spb("designation",e.target.value)}/>}/>
              <F label="Date" ch={<In type="date" value={inF.preparedBy.date} onChange={e=>spb("date",e.target.value)}/>}/>
            </div>
            <PBtn full color={C.orange} onClick={()=>{ if(!inF.victim.name||!inF.caseDetails||!inF.preparedBy.name) return; setIntakes(p=>[...p,{...inF,id:gid("IS",p)}]); setInF(blankIn()); close(); }} style={{marginTop:10}}>File Intake Sheet</PBtn>
          </Overlay>
        )}
      </div>
    );
  };
  const SecTitle = ({ children }) => <div style={{ fontSize:11, fontWeight:900, color:C.navy, textTransform:"uppercase", letterSpacing:.5, margin:"14px 0 8px", borderBottom:`2px solid ${C.line}`, paddingBottom:5 }}>{children}</div>;

  // ── MHPSS REFERRAL SYSTEM (RM-2025-134) ─────────────────────────────────────
  const blankM = () => ({
    studentId:"", date:today(), referralType:"Internal", referredBy:"", referredByDesignation:"",
    riskLevel:"low-risk", tier:"Tier 1", concernType:"Academic", presentingConcern:"",
    initialActionsTaken:"", studentAgreed:true, parentName:"", parentContact:"",
    // IRF Behavior checklist
    behaviors:[],
    status:"Pending", acknowledgedDate:"", sessionStarted:"", followUpCount:0,
    statusChecks:{ closedIntake:false, forCounseling:false, sessionOngoing:false, parentConference:false, terminated:false, noShow:false, monitoring:false },
    referredToExternal:"", conductedBy:"Jovie B. Malapad — Guidance Designate / CPABC Vice Chairperson", notes:"",
    // ERF fields (external)
    erf_toAgency:"", erf_agencyAddress:"", erf_chiefComplaint:"", erf_impression:"", erf_remarks:"",
    erf_returnSlip:{ institutionName:"", findings:"", actionsRecommendations:"", returnDate:"" },
  });
  const [mF, setMF] = useState(blankM());

  const tierColor = (rl) => RISK_TIERS.find(t=>t.id===rl)||RISK_TIERS[1];

  const Counseling = () => {
    const fil = counseling.filter(c=>{ const s=st(c.studentId); return !q||(fn(s)||"").toLowerCase().includes(q.toLowerCase())||c.concernType.toLowerCase().includes(q.toLowerCase()); });
    const pending = counseling.filter(c=>c.status==="Pending").length;
    const ongoing = counseling.filter(c=>c.status==="Ongoing").length;
    const tier3 = counseling.filter(c=>c.tier==="Tier 3").length;

    return (
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
          <SH title="MHPSS Referral System" sub={`RM-2025-134 · Counselling and Mental Health Psychosocial Support Referral System · ${ongoing} ongoing · ${pending} pending`}/>
          <PBtn color={C.purple} onClick={()=>setModal("addMHPSS")}><Ic n="plus" s={15}/>New Referral</PBtn>
        </div>

        {/* Process Flow Banner */}
        <div style={{ background:"linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4c1d95 100%)", borderRadius:12, padding:"14px 18px", marginBottom:14, color:"#fff" }}>
          <div style={{ fontWeight:900, fontSize:11, textTransform:"uppercase", letterSpacing:1, color:"#c4b5fd", marginBottom:10 }}>Counselling & MHPSS Referral System Process Flow (Annex A — RM-2025-134)</div>
          <div style={{ display:"flex", gap:0, alignItems:"center", flexWrap:"wrap" }}>
            {[
              ["Teacher/Learner/Parent","identifies concern or CARS/HEADSS result","#6d28d9"],
              ["Guidance Designate","intake interview + school head notification","#7c3aed"],
              ["Assessment","risk stratification (No/Low/Moderate/High)","#5b21b6"],
              ["Tier 1","No/Low Risk → General Interventions","#16a34a"],
              ["Tier 2","Moderate → Mental Health Specialist","#d97706"],
              ["Tier 3","High/Emergency → Hospitals / Law Enforcement","#dc2626"],
            ].map(([label,desc,col],i,arr)=>(
              <div key={label} style={{ display:"flex", alignItems:"center" }}>
                <div style={{ background:col+"33", border:`1.5px solid ${col}`, borderRadius:8, padding:"7px 11px", textAlign:"center", minWidth:90 }}>
                  <div style={{ fontWeight:800, fontSize:10, color:"#fff" }}>{label}</div>
                  <div style={{ fontSize:9, color:"#c4b5fd", marginTop:2 }}>{desc}</div>
                </div>
                {i<arr.length-1&&<div style={{ width:16, textAlign:"center", color:"#6d28d9", fontWeight:900, fontSize:14 }}>›</div>}
              </div>
            ))}
          </div>
          <div style={{ fontSize:10, color:"#a78bfa", marginTop:9 }}>
            Southville 1 INHS · Guidance Designate: <strong style={{ color:"#e9d5ff" }}>Ma'am Jovie B. Malapad</strong> · External partners: nearby school GC, mental health specialists, LRPO per DO 40 s.2012
          </div>
        </div>

        {/* Tier Summary */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:14 }}>
          {[["Tier 1 Cases",counseling.filter(c=>c.tier==="Tier 1").length,"General Interventions",C.green,"#f0fdf4"],
            ["Tier 2 Cases",counseling.filter(c=>c.tier==="Tier 2").length,"Mental Health Specialist",C.amber,"#fffbeb"],
            ["Tier 3 Cases",tier3,"Critical / Emergency",C.red,"#fef2f2"],
            ["External Referrals",counseling.filter(c=>c.referredToExternal).length,"Referred out",C.blue,"#eff6ff"]
          ].map(([l,n,sub,c,bg])=>(
            <div key={l} style={{ background:bg, borderRadius:10, padding:"12px 14px", textAlign:"center", border:`1px solid ${c}33` }}>
              <div style={{ fontSize:26, fontWeight:900, color:c }}>{n}</div>
              <div style={{ fontSize:11, fontWeight:700, color:c }}>{l}</div>
              <div style={{ fontSize:10, color:C.faint, marginTop:2 }}>{sub}</div>
            </div>
          ))}
        </div>

        <SBar value={q} onChange={e=>setQ(e.target.value)} ph="Search by student name or concern type..."/>

        <div style={{ display:"flex", flexDirection:"column", gap:9, marginTop:10 }}>
          {fil.map(c=>{
            const s=st(c.studentId);
            const tc=tierColor(c.riskLevel);
            return (
              <div key={c.id} style={{ background:C.white, borderRadius:11, padding:"14px 18px", boxShadow:"0 1px 3px rgba(0,0,0,.06)", borderLeft:`4px solid ${tc.color}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:5, flexWrap:"wrap" }}>
                      <span style={{ fontWeight:900, fontSize:13, fontFamily:"monospace", color:C.navy }}>{c.id}</span>
                      <Badge label={tc.label} color={tc.color} bg={tc.bg}/>
                      <Badge label={c.tier} color={C.purple} bg={C.purpleBg}/>
                      <Badge label={c.concernType} color={C.blue} bg={C.blueBg}/>
                      <Badge label={c.status} color={c.status==="Resolved"?C.green:c.status==="Ongoing"?C.amber:c.status==="Pending"?C.red:C.muted} bg={c.status==="Resolved"?C.greenBg:c.status==="Ongoing"?C.amberBg:c.status==="Pending"?C.redBg:C.bg}/>
                      {c.referredToExternal&&<Badge label="External Referral" color={C.orange} bg={C.orangeBg}/>}
                    </div>
                    <div style={{ fontSize:13, fontWeight:700, color:C.navy, marginBottom:3 }}>{fn(s)||"—"}</div>
                    <div style={{ fontSize:12, color:C.muted, marginBottom:3 }}><strong>Presenting Concern:</strong> {c.presentingConcern}</div>
                    <div style={{ fontSize:11, color:C.faint }}>
                      Referred by: {c.referredBy} ({c.referredByDesignation}) · {fmt(c.date)}
                      {c.conductedBy&&<span> · {c.conductedBy}</span>}
                    </div>
                    {c.referredToExternal&&<div style={{ fontSize:11, color:C.orange, marginTop:3, fontWeight:700 }}>→ External: {c.referredToExternal}</div>}
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:5, marginLeft:14 }}>
                    <button onClick={()=>{setSel(c);setModal("viewMHPSS");}} style={{ background:C.purpleBg, border:"none", borderRadius:7, padding:"6px 10px", cursor:"pointer", color:C.purple, display:"flex" }}><Ic n="eye" s={14}/></button>
                    {c.status!=="Resolved"&&<button onClick={()=>setCounseling(p=>p.map(x=>x.id===c.id?{...x,status:"Resolved"}:x))} style={{ background:C.greenBg, border:"none", borderRadius:7, padding:"5px 8px", cursor:"pointer", color:C.green, fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}>✓ Close</button>}
                  </div>
                </div>
              </div>
            );
          })}
          {fil.length===0&&<div style={{ background:C.white, borderRadius:11, padding:36, textAlign:"center", color:C.faint }}>No referral records found.</div>}
        </div>

        {/* VIEW MODAL */}
        {modal==="viewMHPSS"&&sel&&(()=>{
          const tc=tierColor(sel.riskLevel);
          const s=st(sel.studentId);
          return (
            <Overlay title={`MHPSS Referral — ${sel.id} (Confidential)`} onClose={close} wide>
              <div style={{ fontWeight:900, fontSize:11, textTransform:"uppercase", letterSpacing:.5, color:C.muted, textAlign:"center", marginBottom:12 }}>
                RM-2025-134 · {sel.referralType} Referral Form · Southville 1 INHS · Guidance Designate: {sel.conductedBy}
              </div>

              {/* Risk level banner */}
              <div style={{ background:tc.bg, border:`1.5px solid ${tc.color}`, borderRadius:9, padding:"10px 16px", marginBottom:14, display:"flex", gap:12, alignItems:"center" }}>
                <div style={{ fontSize:20, fontWeight:900, color:tc.color }}>{tc.tier}</div>
                <div>
                  <div style={{ fontWeight:800, fontSize:13, color:tc.color }}>{tc.label}</div>
                  <div style={{ fontSize:11, color:tc.color+"bb" }}>
                    {sel.tier==="Tier 1"&&"General Interventions — school community support, counseling, stress management"}
                    {sel.tier==="Tier 2"&&"Specialist Interventions — Psychiatrist, Psychologist, mhGap-Trained Doctor"}
                    {sel.tier==="Tier 3"&&"Critical/Emergency — Hospital referral, Law Enforcement, immediate action required"}
                  </div>
                </div>
              </div>

              {/* INTERNAL REFERRAL FORM (Annex F — RM-2025-134) */}
              <SecTitle>Internal Referral Form (Annex F — Counseling Referral Form)</SecTitle>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:10 }}>
                {[["Name of Student",fn(s)],["Grade & Level",`${s?.grade} — ${s?.section}`],["Gender",s?.sex],["Date of Referral",fmt(sel.date)],["Referred By",sel.referredBy],["Designation",sel.referredByDesignation],["Parent/Guardian",sel.parentName],["Parent Contact",sel.parentContact]].map(([k,v])=>(
                  <div key={k} style={{ background:C.bg, borderRadius:6, padding:"7px 10px" }}>
                    <div style={{ fontSize:9, color:C.faint, fontWeight:700, textTransform:"uppercase" }}>{k}</div>
                    <div style={{ fontSize:12, color:C.navy, fontWeight:600, marginTop:2 }}>{v||"—"}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:10 }}>
                <div><div style={{ fontSize:10, color:C.faint, fontWeight:700, marginBottom:4, textTransform:"uppercase" }}>Reason/s for Referral — Concern Type</div><div style={{ background:C.purpleBg, borderRadius:7, padding:"8px 12px", fontSize:13, color:C.purple, fontWeight:700 }}>{sel.concernType}</div></div>
                <div><div style={{ fontSize:10, color:C.faint, fontWeight:700, marginBottom:4, textTransform:"uppercase" }}>Student Agreed to Referral?</div><div style={{ background:sel.studentAgreed?C.greenBg:C.redBg, borderRadius:7, padding:"8px 12px", fontSize:13, color:sel.studentAgreed?C.green:C.red, fontWeight:700 }}>{sel.studentAgreed?"YES — Student consented":"NO — Referred without consent (behavior endangers well-being)"}</div></div>
              </div>
              <div style={{ background:C.bg, borderRadius:8, padding:"10px 14px", marginBottom:10 }}>
                <div style={{ fontSize:10, color:C.faint, fontWeight:700, textTransform:"uppercase", marginBottom:5 }}>Presenting Concern / Reason/s for Referral</div>
                <div style={{ fontSize:13, color:C.navy, lineHeight:1.7 }}>{sel.presentingConcern||"—"}</div>
              </div>
              {sel.behaviors&&sel.behaviors.length>0&&<><div style={{ fontSize:10, color:C.faint, fontWeight:700, textTransform:"uppercase", marginBottom:5 }}>Observed Behaviors Indicating Need for Help</div><div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>{sel.behaviors.map(b=><Badge key={b} label={b} color={C.red} bg={C.redBg}/>)}</div></>}
              <div style={{ background:C.bg, borderRadius:8, padding:"10px 14px", marginBottom:10 }}>
                <div style={{ fontSize:10, color:C.faint, fontWeight:700, textTransform:"uppercase", marginBottom:5 }}>Initial Actions Taken</div>
                <div style={{ fontSize:13, color:C.navy, lineHeight:1.7, whiteSpace:"pre-line" }}>{sel.initialActionsTaken||"—"}</div>
              </div>

              {/* Acknowledgement Form */}
              <SecTitle>Counseling Referral Acknowledgement Form</SecTitle>
              <div style={{ background:"#faf5ff", border:`1px solid #c4b5fd`, borderRadius:9, padding:"12px 15px", marginBottom:12 }}>
                <div style={{ fontSize:12, color:C.navy, lineHeight:1.8 }}>
                  This is to confirm that <strong>{fn(s)}</strong> whom you referred to us on <strong>{fmt(sel.date)}</strong> had started his/her session on <strong>{fmt(sel.sessionStarted)||"(pending)"}</strong> and is being attended by <strong>{sel.conductedBy}</strong>.
                </div>
                <div style={{ marginTop:10, fontWeight:700, fontSize:11, color:C.purple, marginBottom:6 }}>Status of Case:</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:5 }}>
                  {[["closedIntake","Closed at Intake Interview"],["forCounseling","For Counseling"],["sessionOngoing","Counseling Sessions are On-going"],["parentConference","Parent/Guardian Conference Conducted"],["terminated","Sessions Completed / Case Terminated"],["noShow","Student did not show up"],["monitoring","Under Monitoring"]].map(([k,l])=>(
                    <div key={k} style={{ display:"flex", gap:6, alignItems:"center", padding:"5px 8px", borderRadius:6, background:sel.statusChecks[k]?C.purpleBg:C.bg, fontSize:11, color:sel.statusChecks[k]?C.purple:C.faint }}>
                      <span style={{ fontWeight:900 }}>{sel.statusChecks[k]?"☑":"☐"}</span><span>{l}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:8, fontSize:11, color:C.muted }}>Number of follow-ups made: <strong>{sel.followUpCount}</strong></div>
                {sel.referredToExternal&&<div style={{ marginTop:4, fontSize:11, color:C.orange, fontWeight:700 }}>Referred to (External): {sel.referredToExternal}</div>}
              </div>

              {/* External Referral Form (ERF) if applicable */}
              {sel.referralType==="External"&&sel.erf_toAgency&&(
                <>
                  <SecTitle>External Referral Form (ERF — 2019 SHD Form 3A, Modified)</SecTitle>
                  <div style={{ background:"#fffbeb", border:`1px solid ${C.amberBg}`, borderRadius:9, padding:"12px 15px", marginBottom:12 }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                      {[["To (Agency)",sel.erf_toAgency],["Agency Address",sel.erf_agencyAddress],["Division","Cabuyao City"],["Region","IV-A CALABARZON"]].map(([k,v])=>(
                        <div key={k} style={{ background:C.bg, borderRadius:6, padding:"6px 10px" }}><div style={{ fontSize:9, color:C.faint, fontWeight:700, textTransform:"uppercase" }}>{k}</div><div style={{ fontSize:12, color:C.navy, fontWeight:600 }}>{v||"—"}</div></div>
                      ))}
                    </div>
                    <div style={{ background:C.bg, borderRadius:7, padding:"9px 12px", marginBottom:7 }}>
                      <div style={{ fontSize:10, color:C.faint, fontWeight:700, textTransform:"uppercase", marginBottom:4 }}>Chief Complaint / Presenting Problem</div>
                      <div style={{ fontSize:12, color:C.navy }}>{sel.erf_chiefComplaint||"—"}</div>
                    </div>
                    {[["Impression",sel.erf_impression],["Remarks",sel.erf_remarks]].map(([k,v])=>v?<div key={k} style={{ fontSize:12, color:C.navy, marginBottom:4 }}><strong>{k}:</strong> {v}</div>:null)}
                    {(sel.erf_returnSlip?.findings||sel.erf_returnSlip?.actionsRecommendations)&&(
                      <div style={{ marginTop:10, borderTop:`1px dashed ${C.line}`, paddingTop:10 }}>
                        <div style={{ fontWeight:800, fontSize:11, color:C.amber, marginBottom:6 }}>RETURN SLIP (Back Referral)</div>
                        {[["Institution",sel.erf_returnSlip.institutionName],["Findings",sel.erf_returnSlip.findings],["Actions / Recommendations",sel.erf_returnSlip.actionsRecommendations],["Date Returned",fmt(sel.erf_returnSlip.returnDate)]].map(([k,v])=>v?<div key={k} style={{ fontSize:12, color:C.navy, marginBottom:3 }}><strong>{k}:</strong> {v}</div>:null)}
                      </div>
                    )}
                  </div>
                </>
              )}
              {sel.notes&&<><SecTitle>Notes</SecTitle><div style={{ background:C.bg, borderRadius:7, padding:"10px 14px", fontSize:13, color:C.navy }}>{sel.notes}</div></>}
              <div style={{ marginTop:12, paddingTop:10, borderTop:`1px solid ${C.line}`, fontSize:11, color:C.faint, fontStyle:"italic" }}>
                Always for the welfare of students · Guidance Designate: {sel.conductedBy} · Southville 1 INHS
              </div>
            </Overlay>
          );
        })()}

        {/* ADD REFERRAL MODAL */}
        {modal==="addMHPSS"&&(
          <Overlay title="New MHPSS Referral (RM-2025-134)" onClose={close} wide>

            {/* Process flow mini-banner */}
            <div style={{ background:"#ede9fe", borderRadius:8, padding:"9px 13px", marginBottom:14, fontSize:11, color:"#5b21b6", lineHeight:1.6 }}>
              <strong>Process Flow:</strong> Teacher/Learner/Parent → <strong>Guidance Designate (Ma'am Jovie B. Malapad)</strong> → Intake Interview + Risk Assessment → Tier 1/2/3 Intervention → External Referral if needed → Aftercare & Monitoring.
            </div>

            <SecTitle>A. Internal Referral Form (Annex F — Counseling Referral Form)</SecTitle>
            <div style={{ background:C.bg, borderRadius:9, padding:"12px 14px", marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:C.muted, marginBottom:8, textTransform:"uppercase" }}>A. Check behaviors that indicate need for help:</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5, marginBottom:10 }}>
                {IRF_BEHAVIORS.map(b=>(
                  <label key={b} style={{ display:"flex", gap:7, alignItems:"flex-start", padding:"5px 8px", borderRadius:6, cursor:"pointer", fontSize:11, color:mF.behaviors.includes(b)?C.red:C.navy, background:mF.behaviors.includes(b)?C.redBg:C.bg, fontWeight:mF.behaviors.includes(b)?700:400 }}>
                    <input type="checkbox" checked={mF.behaviors.includes(b)} style={{ marginTop:2, flexShrink:0, accentColor:C.red }}
                      onChange={e=>setMF(p=>({...p,behaviors:e.target.checked?[...p.behaviors,b]:p.behaviors.filter(x=>x!==b)}))}/>
                    <span>{b}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:9 }}>
              <F label="Student" required ch={<Se value={mF.studentId} onChange={e=>setMF(p=>({...p,studentId:e.target.value}))}>
                <option value="">— Select Student —</option>
                {students.map(s=><option key={s.id} value={s.id}>{fn(s)} ({s.grade})</option>)}
              </Se>}/>
              <F label="Date of Referral" ch={<In type="date" value={mF.date} onChange={e=>setMF(p=>({...p,date:e.target.value}))}/>}/>
              <F label="Referred By (Name)" required ch={<In value={mF.referredBy} onChange={e=>setMF(p=>({...p,referredBy:e.target.value}))}/>}/>
              <F label="Designation" ch={<In value={mF.referredByDesignation} onChange={e=>setMF(p=>({...p,referredByDesignation:e.target.value}))} placeholder="e.g. Class Adviser"/>}/>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:9 }}>
              <F label="Concern Type" ch={<Se value={mF.concernType} onChange={e=>setMF(p=>({...p,concernType:e.target.value}))}>{MHPSS_CONCERN_TYPES.map(t=><option key={t}>{t}</option>)}</Se>}/>
              <F label="Parent/Guardian Name" ch={<In value={mF.parentName} onChange={e=>setMF(p=>({...p,parentName:e.target.value}))}/>}/>
              <F label="Parent/Guardian Contact" ch={<In value={mF.parentContact} onChange={e=>setMF(p=>({...p,parentContact:e.target.value}))}/>}/>
            </div>
            <F label="Reason/s for Referral (Presenting Concern)" required ch={<Tx rows={3} value={mF.presentingConcern} onChange={e=>setMF(p=>({...p,presentingConcern:e.target.value}))} placeholder="Describe the presenting concern in detail..."/>}/>
            <F label="Initial Actions Taken" ch={<Tx rows={2} value={mF.initialActionsTaken} onChange={e=>setMF(p=>({...p,initialActionsTaken:e.target.value}))}/>}/>
            <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:10 }}>
              <label style={{ display:"flex", gap:8, alignItems:"center", cursor:"pointer", fontSize:12, fontWeight:700, color:C.navy }}>
                <input type="checkbox" checked={mF.studentAgreed} onChange={e=>setMF(p=>({...p,studentAgreed:e.target.checked}))} style={{ width:15,height:15 }}/>
                Student agreed to be referred to GCO
              </label>
            </div>

            <SecTitle>B. Risk Assessment & Tier Classification (RM-2025-134 Annex A)</SecTitle>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:12 }}>
              {RISK_TIERS.map(rt=>(
                <label key={rt.id} style={{ display:"flex", gap:8, alignItems:"center", padding:"9px 12px", borderRadius:8, cursor:"pointer", border:`2px solid ${mF.riskLevel===rt.id?rt.color:C.line}`, background:mF.riskLevel===rt.id?rt.bg:"#fff" }}>
                  <input type="radio" name="riskLevel" value={rt.id} checked={mF.riskLevel===rt.id} onChange={()=>setMF(p=>({...p,riskLevel:rt.id,tier:rt.tier}))} style={{ accentColor:rt.color }}/>
                  <div>
                    <div style={{ fontWeight:700, fontSize:12, color:rt.color }}>{rt.label}</div>
                    <div style={{ fontSize:10, color:C.faint }}>{rt.tier}</div>
                  </div>
                </label>
              ))}
            </div>

            <SecTitle>C. Referral Type & Direction</SecTitle>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
              <F label="Referral Type" ch={<Se value={mF.referralType} onChange={e=>setMF(p=>({...p,referralType:e.target.value}))}><option>Internal</option><option>External</option></Se>}/>
              {mF.referralType==="Internal"
                ? <F label="Internal Referred To" ch={<Se value={mF.referredToExternal} onChange={e=>setMF(p=>({...p,referredToExternal:e.target.value}))}>
                    <option value="">— Select Internal —</option>
                    {INTERNAL_REFERRAL_TYPES.map(t=><option key={t}>{t}</option>)}
                  </Se>}/>
                : <F label="External Referred To" ch={<Se value={mF.referredToExternal} onChange={e=>setMF(p=>({...p,referredToExternal:e.target.value}))}>
                    <option value="">— Select External Partner —</option>
                    {EXTERNAL_REFERRAL_TYPES.map(t=><option key={t}>{t}</option>)}
                  </Se>}/>
              }
            </div>

            {mF.referralType==="External"&&(
              <>
                <SecTitle>D. External Referral Form (ERF — 2019 SHD Form 3A, Modified)</SecTitle>
                <div style={{ background:"#fffbeb", border:`1px solid ${C.amberBg}`, borderRadius:9, padding:"12px 14px", marginBottom:10 }}>
                  <div style={{ fontSize:11, color:"#78350f", marginBottom:8 }}><strong>2019 SHD Form 3A (Modified 09/04/2024)</strong> · Republic of the Philippines · Dept. of Education · Region IV-A CALABARZON · Division of Cabuyao City · Southville 1 INHS</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                    <F label="To (Agency Name)" ch={<In value={mF.erf_toAgency} onChange={e=>setMF(p=>({...p,erf_toAgency:e.target.value}))} placeholder="e.g. Cabuyao City Health Office"/>}/>
                    <F label="Agency Address" ch={<In value={mF.erf_agencyAddress} onChange={e=>setMF(p=>({...p,erf_agencyAddress:e.target.value}))}/>}/>
                  </div>
                  <F label="Chief Complaint / Presenting Problem" ch={<Tx rows={2} value={mF.erf_chiefComplaint} onChange={e=>setMF(p=>({...p,erf_chiefComplaint:e.target.value}))}/>}/>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                    <F label="Impression" ch={<In value={mF.erf_impression} onChange={e=>setMF(p=>({...p,erf_impression:e.target.value}))}/>}/>
                    <F label="Remarks" ch={<In value={mF.erf_remarks} onChange={e=>setMF(p=>({...p,erf_remarks:e.target.value}))}/>}/>
                  </div>
                  <div style={{ marginTop:6, borderTop:`1px dashed ${C.line}`, paddingTop:8 }}>
                    <div style={{ fontWeight:700, fontSize:11, color:C.amber, marginBottom:6 }}>Return Slip (Back Referral — to be filled upon return)</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                      <F label="Institution Name" ch={<In value={mF.erf_returnSlip.institutionName} onChange={e=>setMF(p=>({...p,erf_returnSlip:{...p.erf_returnSlip,institutionName:e.target.value}}))}/>}/>
                      <F label="Date Returned" ch={<In type="date" value={mF.erf_returnSlip.returnDate} onChange={e=>setMF(p=>({...p,erf_returnSlip:{...p.erf_returnSlip,returnDate:e.target.value}}))}/>}/>
                    </div>
                    <F label="Findings" ch={<Tx rows={2} value={mF.erf_returnSlip.findings} onChange={e=>setMF(p=>({...p,erf_returnSlip:{...p.erf_returnSlip,findings:e.target.value}}))}/>}/>
                    <F label="Actions / Recommendations" ch={<Tx rows={2} value={mF.erf_returnSlip.actionsRecommendations} onChange={e=>setMF(p=>({...p,erf_returnSlip:{...p.erf_returnSlip,actionsRecommendations:e.target.value}}))}/>}/>
                  </div>
                </div>
              </>
            )}

            <SecTitle>E. Counseling Referral Acknowledgement</SecTitle>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
              <F label="Date Acknowledged / Session Started" ch={<In type="date" value={mF.sessionStarted} onChange={e=>setMF(p=>({...p,sessionStarted:e.target.value}))}/>}/>
              <F label="No. of Follow-up Contacts Made" ch={<In type="number" min={0} value={mF.followUpCount} onChange={e=>setMF(p=>({...p,followUpCount:Number(e.target.value)}))}/>}/>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:5, marginBottom:10 }}>
              {[["closedIntake","Closed at Intake"],["forCounseling","For Counseling"],["sessionOngoing","Sessions On-going"],["parentConference","Parent Conference Done"],["terminated","Case Terminated"],["noShow","Did Not Show Up"],["monitoring","Under Monitoring"]].map(([k,l])=>(
                <label key={k} style={{ display:"flex", gap:7, alignItems:"flex-start", padding:"5px 8px", borderRadius:6, cursor:"pointer", fontSize:11, color:mF.statusChecks[k]?C.purple:C.navy, background:mF.statusChecks[k]?C.purpleBg:C.bg }}>
                  <input type="checkbox" checked={mF.statusChecks[k]} onChange={e=>setMF(p=>({...p,statusChecks:{...p.statusChecks,[k]:e.target.checked}}))} style={{ marginTop:2, accentColor:C.purple }}/>
                  <span>{l}</span>
                </label>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
              <F label="Status" ch={<Se value={mF.status} onChange={e=>setMF(p=>({...p,status:e.target.value}))}><option>Pending</option><option>Ongoing</option><option>Resolved</option></Se>}/>
              <F label="Conducted by (Guidance Designate)" ch={<In value={mF.conductedBy} onChange={e=>setMF(p=>({...p,conductedBy:e.target.value}))}/>}/>
            </div>
            <F label="Additional Notes" ch={<Tx rows={2} value={mF.notes} onChange={e=>setMF(p=>({...p,notes:e.target.value}))}/>}/>
            <PBtn full color={C.purple} onClick={()=>{
              if(!mF.studentId||!mF.presentingConcern||!mF.referredBy) return;
              setCounseling(p=>[...p,{...mF,id:gid("M",p)}]);
              setMF(blankM()); close();
            }} style={{marginTop:10}}>Save MHPSS Referral Record</PBtn>
          </Overlay>
        )}
      </div>
    );
  };


  // ── REFERRALS ────────────────────────────────────────────────────────────────
  const blankR = () => ({ studentId:"",date:today(),type:"Academic",direction:"Internal",referredTo:"",reason:"",status:"In Progress",outcome:"" });
  const [rF, setRF] = useState(blankR());

  const Referrals = () => {
    const fil = referrals.filter(r=>{ const s=st(r.studentId); return !q||(fn(s).toLowerCase().includes(q.toLowerCase())||r.type.toLowerCase().includes(q.toLowerCase())); });
    return (
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
          <SH title="Referrals & Follow-ups" sub="Aligned with DepEd Child Protection Referral and Monitoring System — Annex D"/>
          <PBtn color={C.amber} onClick={()=>setModal("addRef")}><Ic n="plus" s={15}/>File Referral</PBtn>
        </div>
        <div style={{ background:"#fffbeb", border:`1px solid ${C.amberBg}`, borderRadius:9, padding:"10px 13px", marginBottom:12, fontSize:12, color:"#78350f", lineHeight:1.5 }}>
          <strong>Referral Flow (Annex D):</strong> Complaint → School Head/Principal → Child Protection Committee → CPABC fills Intake Sheet (Annex B) → Internal/External Referral (LSWDO, PNP, DSWD, NGOs) → Division Office Monitoring System
        </div>
        <SBar value={q} onChange={e=>setQ(e.target.value)} ph="Search referrals..."/>
        <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
          {fil.map(r=>{
            const s=st(r.studentId);
            return (
              <div key={r.id} style={{ background:C.white, borderRadius:11, padding:"14px 18px", boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:7, alignItems:"center", marginBottom:6 }}>
                      <span style={{ fontWeight:800, fontSize:14, color:C.navy }}>{fn(s)}</span>
                      <SBadge s={r.direction}/><Badge label={r.type} color={C.amber} bg={C.amberBg}/><SBadge s={r.status==="In Progress"?"Ongoing":r.status}/>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5px 18px", fontSize:13 }}>
                      <div><span style={{ color:C.faint, fontWeight:600 }}>Date: </span>{fmt(r.date)}</div>
                      <div><span style={{ color:C.faint, fontWeight:600 }}>Referred To: </span>{r.referredTo}</div>
                      <div><span style={{ color:C.faint, fontWeight:600 }}>Reason: </span>{r.reason}</div>
                      <div><span style={{ color:C.faint, fontWeight:600 }}>Outcome: </span>{r.outcome||"Pending"}</div>
                    </div>
                  </div>
                  {r.status==="In Progress"&&<button onClick={()=>setReferrals(p=>p.map(x=>x.id===r.id?{...x,status:"Completed"}:x))} style={{ background:C.greenBg, color:C.green, border:"none", borderRadius:7, padding:"6px 11px", cursor:"pointer", fontWeight:700, fontSize:12, marginLeft:14, whiteSpace:"nowrap" }}>Complete</button>}
                </div>
              </div>
            );
          })}
          {fil.length===0&&<div style={{ background:C.white, borderRadius:11, padding:36, textAlign:"center", color:C.faint }}>No referrals found.</div>}
        </div>
        {modal==="addRef"&&(
          <Overlay title="File Referral" onClose={close}>
            <F label="Student" required ch={<Se value={rF.studentId} onChange={e=>setRF(p=>({...p,studentId:e.target.value}))}>
              <option value="">— Select Student —</option>
              {students.map(s=><option key={s.id} value={s.id}>{fn(s)} ({s.grade})</option>)}
            </Se>}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:11 }}>
              <F label="Date" ch={<In type="date" value={rF.date} onChange={e=>setRF(p=>({...p,date:e.target.value}))}/>}/>
              <F label="Referral Type" ch={<Se value={rF.type} onChange={e=>setRF(p=>({...p,type:e.target.value}))}>{REFERRAL_TYPES.map(t=><option key={t}>{t}</option>)}</Se>}/>
              <F label="Direction" ch={<Se value={rF.direction} onChange={e=>setRF(p=>({...p,direction:e.target.value}))}><option>Internal</option><option>External</option></Se>}/>
              <F label="Referred To (person / office)" ch={<In value={rF.referredTo} onChange={e=>setRF(p=>({...p,referredTo:e.target.value}))}/>}/>
            </div>
            <F label="Reason for Referral" required ch={<Tx value={rF.reason} onChange={e=>setRF(p=>({...p,reason:e.target.value}))}/>}/>
            <F label="Initial Outcome / Notes" ch={<In value={rF.outcome} onChange={e=>setRF(p=>({...p,outcome:e.target.value}))}/>}/>
            <PBtn full color={C.amber} onClick={()=>{ if(!rF.studentId||!rF.reason) return; setReferrals(p=>[...p,{...rF,id:gid("R",p)}]); setRF(blankR()); close(); }} style={{marginTop:8}}>File Referral</PBtn>
          </Overlay>
        )}
      </div>
    );
  };

  // ── ANALYTICS ────────────────────────────────────────────────────────────────
  const Analytics = () => {
    const byGrade = GRADES.map(g=>{ const gs=students.filter(s=>s.grade===g).map(s=>s.id); return { g, c:counseling.filter(c=>gs.includes(c.studentId)).length, i:incidents.filter(i=>gs.includes(i.studentId)).length }; });
    const byConcern = MHPSS_CONCERN_TYPES.map(t=>({ t, n:counseling.filter(c=>(c.concernType||c.type)===t).length })).filter(x=>x.n>0);
    const byTier = [["Tier 1",C.green,C.greenBg],["Tier 2",C.amber,C.amberBg],["Tier 3",C.red,C.redBg]].map(([tier,c,bg])=>({ tier, n:counseling.filter(c2=>c2.tier===tier).length, c, bg }));
    const byOT = ["Minor","Major","Special"].map(t=>({ t, n:incidents.filter(i=>i.offenseType===t).length, c:{Minor:C.amber,Major:C.red,Special:C.orange}[t], bg:{Minor:C.amberBg,Major:C.redBg,Special:C.orangeBg}[t] }));
    const resRate = counseling.length ? Math.round((counseling.filter(c=>c.status==="Resolved").length/counseling.length)*100) : 0;
    const carCount = students.filter(s=>isCAR(s.id,incidents)).length;
    const cTotal = counseling.length||1, iTotal = incidents.length||1, rTotal = referrals.length||1;

    return (
      <div>
        <SH title="Data Analytics" sub="Descriptive analysis — frequency distributions, cross-tabulations, trend summaries, intervention outcomes"/>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:11, marginBottom:18 }}>
          <SC label="Resolution Rate" value={`${resRate}%`} icon="check" color={C.green}/>
          <SC label="Avg Referrals / Student" value={(counseling.length/students.length).toFixed(1)} icon="counseling" color={C.purple}/>
          <SC label="Special Cases Filed" value={incidents.filter(i=>i.offenseType==="Special").length} icon="incidents" color={C.orange}/>
          <SC label="Intake Sheets" value={intakes.length} icon="intake" color={C.orange}/>
          <SC label="Child-at-Risk (CAR)" value={carCount} icon="risk" color={C.red}/>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
          <div style={{ background:C.white, borderRadius:12, padding:16, boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}>
            <div style={{ fontWeight:800, fontSize:13, color:C.navy, marginBottom:13 }}>Cases by Grade Level</div>
            {byGrade.filter(g=>g.c>0||g.i>0).map(g=>(
              <div key={g.g} style={{ marginBottom:9 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:C.navy }}>{g.g}</span>
                  <span style={{ fontSize:11, color:C.muted }}>{g.c} referrals · {g.i} incidents</span>
                </div>
                <div style={{ display:"flex", height:6, borderRadius:99, overflow:"hidden", background:C.bg }}>
                  <div style={{ width:`${(g.c/cTotal)*100}%`, background:C.purple }}/>
                  <div style={{ width:`${(g.i/iTotal)*60}%`, background:C.red }}/>
                </div>
              </div>
            ))}
            <div style={{ display:"flex", gap:14, marginTop:8 }}>
              {[[C.purple,"MHPSS Referral"],[C.red,"Incidents"]].map(([c,l])=><div key={l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:10, color:C.muted }}><div style={{ width:8,height:8,borderRadius:2,background:c }}/>{l}</div>)}
            </div>
          </div>
          <div style={{ background:C.white, borderRadius:12, padding:16, boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}>
            <div style={{ fontWeight:800, fontSize:13, color:C.navy, marginBottom:13 }}>Incidents by Offense Classification</div>
            {byOT.map(({t,n,c,bg})=>(
              <div key={t} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                <Badge label={t} color={c} bg={bg} style={{ width:50, textAlign:"center" }}/>
                <div style={{ flex:1, height:6, background:C.bg, borderRadius:99, overflow:"hidden" }}>
                  <div style={{ width:`${(n/iTotal)*100}%`, height:"100%", background:c, borderRadius:99 }}/>
                </div>
                <span style={{ fontWeight:800, fontSize:14, color:c, width:18, textAlign:"right" }}>{n}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
          <div style={{ background:C.white, borderRadius:12, padding:16, boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}>
            <div style={{ fontWeight:800, fontSize:13, color:C.navy, marginBottom:13 }}>MHPSS Referrals by Concern Type</div>
            {byConcern.length===0&&<div style={{ fontSize:12, color:C.faint, fontStyle:"italic" }}>No data yet.</div>}
            {byConcern.map(({t,n})=>(
              <div key={t} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${C.bg}` }}>
                <span style={{ fontSize:12, fontWeight:600, color:C.navy }}>{t}</span>
                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                  <div style={{ width:80, height:6, background:C.bg, borderRadius:99, overflow:"hidden" }}>
                    <div style={{ width:`${(n/cTotal)*100}%`, height:"100%", background:C.purple, borderRadius:99 }}/>
                  </div>
                  <span style={{ fontWeight:800, fontSize:13, color:C.purple, width:18, textAlign:"right" }}>{n}</span>
                </div>
              </div>
            ))}
            <div style={{ marginTop:12, borderTop:`1px solid ${C.line}`, paddingTop:10 }}>
              <div style={{ fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", marginBottom:7 }}>By Risk Tier (Annex A)</div>
              {byTier.map(({tier,n,c,bg})=>(
                <div key={tier} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                  <Badge label={tier} color={c} bg={bg} style={{ width:52, textAlign:"center" }}/>
                  <div style={{ flex:1, height:6, background:C.bg, borderRadius:99, overflow:"hidden" }}>
                    <div style={{ width:`${(n/cTotal)*100}%`, height:"100%", background:c, borderRadius:99 }}/>
                  </div>
                  <span style={{ fontWeight:800, fontSize:13, color:c, width:18 }}>{n}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background:C.white, borderRadius:12, padding:16, boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}>
            <div style={{ fontWeight:800, fontSize:13, color:C.navy, marginBottom:13 }}>Referral Status Summary</div>
            {[["Completed",C.green,C.greenBg],["In Progress",C.blue,C.blueBg],["Pending",C.amber,C.amberBg]].map(([s,c,bg])=>{
              const n=referrals.filter(r=>r.status===s).length;
              return (
                <div key={s} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <Badge label={s} color={c} bg={bg} style={{ width:70, textAlign:"center" }}/>
                  <div style={{ flex:1, height:6, background:C.bg, borderRadius:99, overflow:"hidden" }}>
                    <div style={{ width:`${(n/rTotal)*100}%`, height:"100%", background:c, borderRadius:99 }}/>
                  </div>
                  <span style={{ fontWeight:800, fontSize:13, color:c, width:16, textAlign:"right" }}>{n}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ background:C.white, borderRadius:12, padding:16, boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}>
          <div style={{ fontWeight:800, fontSize:13, color:C.navy, marginBottom:13 }}>Cross-Tabulation: Grade Level × Offense Classification</div>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead><tr style={{ background:C.bg }}>
              <th style={{ padding:"9px 12px", textAlign:"left", fontWeight:800, color:C.muted, borderBottom:`1px solid ${C.line}` }}>Grade Level</th>
              <th style={{ padding:"9px 12px", textAlign:"center", fontWeight:800, color:C.amber, borderBottom:`1px solid ${C.line}` }}>Minor</th>
              <th style={{ padding:"9px 12px", textAlign:"center", fontWeight:800, color:C.red, borderBottom:`1px solid ${C.line}` }}>Major</th>
              <th style={{ padding:"9px 12px", textAlign:"center", fontWeight:800, color:C.orange, borderBottom:`1px solid ${C.line}` }}>Special</th>
              <th style={{ padding:"9px 12px", textAlign:"center", fontWeight:900, color:C.navy, borderBottom:`1px solid ${C.line}` }}>Total</th>
            </tr></thead>
            <tbody>{GRADES.map(g=>{ const gs=students.filter(s=>s.grade===g).map(s=>s.id), gi=incidents.filter(i=>gs.includes(i.studentId)); const mi=gi.filter(i=>i.offenseType==="Minor").length, ma=gi.filter(i=>i.offenseType==="Major").length, sp=gi.filter(i=>i.offenseType==="Special").length, tot=gi.length; if(!tot) return null; return (
              <tr key={g} style={{ borderBottom:`1px solid ${C.bg}` }}>
                <td style={{ padding:"9px 12px", fontWeight:700, color:C.navy }}>{g}</td>
                <td style={{ padding:"9px 12px", textAlign:"center", color:mi>0?C.amber:C.line, fontWeight:mi>0?800:400 }}>{mi>0?mi:"—"}</td>
                <td style={{ padding:"9px 12px", textAlign:"center", color:ma>0?C.red:C.line, fontWeight:ma>0?800:400 }}>{ma>0?ma:"—"}</td>
                <td style={{ padding:"9px 12px", textAlign:"center", color:sp>0?C.orange:C.line, fontWeight:sp>0?800:400 }}>{sp>0?sp:"—"}</td>
                <td style={{ padding:"9px 12px", textAlign:"center", fontWeight:900, color:C.navy }}>{tot}</td>
              </tr>
            );})}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ── RISK / CAR ───────────────────────────────────────────────────────────────
  const Risk = () => {
    const rd = students.map(s=>({ ...s, score:computeRisk(s.id,counseling,incidents), car:isCAR(s.id,incidents) })).sort((a,b)=>b.score-a.score);
    const high=rd.filter(x=>x.score>=60), mod=rd.filter(x=>x.score>=30&&x.score<60), low=rd.filter(x=>x.score<30);
    const RG = ({ title, data, color }) => !data.length?null:(
      <div style={{ marginBottom:16 }}>
        <div style={{ fontWeight:800, fontSize:11, color, textTransform:"uppercase", letterSpacing:.5, marginBottom:8 }}>{title} ({data.length})</div>
        {data.map(s=>{ const r=getRisk(s.score), si=incidents.filter(i=>i.studentId===s.id); return (
          <div key={s.id} style={{ background:C.white, borderRadius:11, padding:"13px 16px", boxShadow:"0 1px 3px rgba(0,0,0,.06)", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7, borderLeft:`4px solid ${color}` }}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:3 }}>
                <span style={{ fontWeight:700, fontSize:14, color:C.navy }}>{fn(s)}</span>
                {s.car&&<CARTag/>}
              </div>
              <div style={{ fontSize:12, color:C.muted }}>{s.grade} — {s.section} · Adviser: {s.adviser}</div>
              <div style={{ display:"flex", gap:7, marginTop:5 }}>
                {si.filter(i=>i.offenseType==="Special").length>0&&<Badge label={`${si.filter(i=>i.offenseType==="Special").length} Special Case(s)`} color={C.orange} bg={C.orangeBg}/>}
                {si.some(i=>i.offenseCount>=3)&&<Badge label="Repeated Violations" color={C.red} bg={C.redBg}/>}
                {si.some(i=>i.intakeFiled)&&<Badge label="Intake Filed" color={C.orange} bg={C.orangeBg}/>}
              </div>
            </div>
            <div style={{ textAlign:"center", marginLeft:18 }}>
              <div style={{ fontWeight:900, fontSize:26, color, lineHeight:1 }}>{s.score}</div>
              <div style={{ fontSize:9, color:C.faint, fontWeight:600, marginTop:1 }}>RISK SCORE</div>
            </div>
          </div>
        );})}
      </div>
    );
    return (
      <div>
        <SH title="Early Warning & Risk Assessment" sub="Rule-based risk classification per DepEd behavioral thresholds — DO 18, s.2015 (CAR/CICL)"/>
        <div style={{ background:"#fffbeb", borderRadius:10, padding:"11px 15px", marginBottom:16, display:"flex", gap:10, alignItems:"flex-start", border:`1px solid ${C.amberBg}` }}>
          <span style={{ color:C.amber, flexShrink:0 }}><Ic n="warn" s={17}/></span>
          <div style={{ fontSize:12, color:"#78350f", lineHeight:1.6 }}>
            <strong>About Risk Scores & CAR Classification:</strong> Scores are computed from MHPSS referral frequency, incident count, offense type (Special = highest weight), offense count escalation, and intake sheet filing. <strong>Child-at-Risk (CAR)</strong> is automatically flagged when a student has 2+ Special Case incidents, 4+ total incidents, or a manual CAR flag — per DepEd Order No. 18, s. 2015. These scores support professional judgment and do not constitute clinical or psychological diagnosis.
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:11, marginBottom:16 }}>
          {[["🔴 High Risk",high.length,C.red,"#fef2f2"],["🟡 Moderate Risk",mod.length,C.amber,"#fffbeb"],["🟢 Low Risk",low.length,C.green,"#f0fdf4"],["⚠️ Child-at-Risk",students.filter(s=>isCAR(s.id,incidents)).length,"#dc2626","#fff1f2"]].map(([l,n,c,bg])=>(
            <div key={l} style={{ background:bg, borderRadius:10, padding:"14px 16px", textAlign:"center" }}>
              <div style={{ fontSize:26, fontWeight:900, color:c }}>{n}</div>
              <div style={{ fontSize:11, fontWeight:700, color:c, marginTop:3 }}>{l}</div>
            </div>
          ))}
        </div>
        <RG title="🔴 High Risk" data={high} color={C.red}/>
        <RG title="🟡 Moderate Risk" data={mod} color={C.amber}/>
        <RG title="🟢 Low Risk" data={low} color={C.green}/>
      </div>
    );
  };

  // ── CAR PROFILING TOOL (DO 18 s.2015 Appendix A) ────────────────────────────
  const blankCAR = () => ({
    studentId:"", date:today(), assessedBy:"", assessedByDesignation:"", notedBy:"", notedByDesignation:"",
    // Individual factors
    ind_substanceAbuse:false, ind_gangs:false, ind_positiveActivity:"", ind_angerOutbursts:false,
    ind_trauma:false, ind_suicidal:false, ind_depressed:false, ind_somaticComplaints:false, ind_thoughtDisturbances:false,
    // Offense types committed
    off_theft:0, off_robbery:0, off_physicalInjuries:0, off_sexualHarassment:0, off_rape:0,
    off_homicide:0, off_murder:0, off_drugRelated:0, off_other:"",
    // Family/community factors
    fam_victimOfAbuse:"", fam_victimNeglect:false, fam_noParent:false, fam_parentCriminal:false,
    fam_siblingCriminal:false, fam_domesticViolence:false, fam_parentSubstance:false,
    fam_homeless:false, fam_abandoned:false, fam_communityViolence:false, fam_supportSystem:false,
    // School behavior
    sch_behavingWell:false, sch_bullyingVictim:false, sch_moderateBehavior:false, sch_severeBehavior:false,
    // Juvenile justice
    jj_firstOccurrence:false, jj_multipleActs:false,
    jj_statusViolations:false, jj_criminalBehavior:false, jj_criminalRisk:false,
    jj_peersClean:false, jj_peersDelinquent:false, jj_peersCriminal:false,
    // Part II referral urgency
    ref_immediateAbuse:false, ref_twoMinorInjuries:false, ref_seriousInjury:false, ref_sexualAbuse:false,
    ref_repeatedNonAccidental:false, ref_domesticViolenceHarm:false, ref_repeatedVerbalEmotional:false,
    ref_seriousNeglect:false, ref_directAllegationSexual:false, ref_connectionsSexualAbuse:false,
    ref_individualInHome:false, ref_childProtectionPlan:false, ref_noParentAbandoned:false, ref_fabricatedIllness:false,
    ref_sexualExploitation:false, ref_pregnancy:false, ref_forcedMarriage:false,
    ref_physicalAssaultNoInjury:false, ref_incidentConcern:false, ref_minorConcerns:false,
    ref_verbalThreatAllegation:false, ref_emotionalAbuse:false, ref_periodicNeglect:false,
    ref_suspicionSexualAbuse:false, ref_noParentTemporary:false,
    notes:"",
  });
  const [carF, setCarF] = useState(blankCAR());
  const [carProfiles, setCarProfiles] = useState([]);

  const CARProfilingPage = () => {
    const fil = carProfiles.filter(p => { const s=st(p.studentId); return !q||(fn(s)||"").toLowerCase().includes(q.toLowerCase()); });
    const CB = ({ label, checked, onChange, red }) => (
      <label style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:12, color: red ? C.red : C.navy, cursor:"pointer", marginBottom:6, fontWeight: red ? 700 : 400 }}>
        <input type="checkbox" checked={checked} onChange={onChange} style={{ marginTop:2, flexShrink:0, accentColor: red ? C.red : C.blue }}/>
        <span>{label}</span>
      </label>
    );
    return (
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
          <SH title="CAR Profiling & Initial Risk Assessment" sub="Appendix A — DO 18, s.2015 · Profiling and Initial Risk Assessment Tools for Children-at-Risk (Confidential)"/>
          <PBtn color={C.red} onClick={()=>setModal("addCAR")}><Ic n="plus" s={15}/>New Assessment</PBtn>
        </div>
        <div style={{ background:"#fff1f2", border:`1px solid #fecaca`, borderRadius:9, padding:"10px 14px", marginBottom:14, fontSize:12, color:"#7f1d1d", lineHeight:1.6 }}>
          <strong>Confidential.</strong> This form will help the guidance counselor quickly note risk factors that make a child vulnerable to coming into conflict with the law. Items marked in <span style={{ color:C.red, fontWeight:800 }}>red</span> require <strong>immediate referral to LSWDO/DSWD within 8 hours</strong>. Other items require further investigation before referral within 24 hours. This form does not substitute for professional assessment by a licensed counselor, child psychologist, or social worker.
        </div>
        <SBar value={q} onChange={e=>setQ(e.target.value)} ph="Search CAR profiles..."/>
        <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
          {fil.map(p=>{
            const s=st(p.studentId);
            const immediateFlags = [p.ref_immediateAbuse,p.ref_twoMinorInjuries,p.ref_seriousInjury,p.ref_sexualAbuse,p.ref_repeatedNonAccidental,p.ref_domesticViolenceHarm,p.ref_repeatedVerbalEmotional,p.ref_seriousNeglect,p.ref_directAllegationSexual,p.ref_connectionsSexualAbuse,p.ref_individualInHome,p.ref_childProtectionPlan,p.ref_noParentAbandoned,p.ref_fabricatedIllness,p.ref_sexualExploitation,p.ref_pregnancy,p.ref_forcedMarriage].filter(Boolean).length;
            return (
              <div key={p.id} style={{ background:C.white, borderRadius:11, padding:"14px 18px", boxShadow:"0 1px 3px rgba(0,0,0,.06)", borderLeft:`4px solid ${immediateFlags>0?C.red:C.amber}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4 }}>
                      <span style={{ fontWeight:900, fontSize:13, fontFamily:"monospace", color:C.navy }}>{p.id}</span>
                      {immediateFlags>0 && <Badge label={`${immediateFlags} Immediate Referral Flag${immediateFlags>1?"s":""}`} color={C.red} bg={C.redBg}/>}
                      <span style={{ fontSize:11, color:C.faint }}>{fmt(p.date)}</span>
                    </div>
                    <div style={{ fontSize:13, fontWeight:700, color:C.navy }}>{fn(s)||"—"}</div>
                    <div style={{ fontSize:11, color:C.muted }}>Assessed by: {p.assessedBy} · {p.assessedByDesignation}</div>
                  </div>
                  <button onClick={()=>{setSel(p);setModal("viewCAR");}} style={{ background:C.blueBg, border:"none", borderRadius:7, padding:"6px 10px", cursor:"pointer", color:C.blue, display:"flex" }}><Ic n="eye" s={14}/></button>
                </div>
              </div>
            );
          })}
          {fil.length===0&&<div style={{ background:C.white, borderRadius:11, padding:36, textAlign:"center", color:C.faint }}>No CAR profiles on record.</div>}
        </div>

        {modal==="viewCAR"&&sel&&(
          <Overlay title={`CAR Profile — ${sel.id} (Confidential)`} onClose={close} wide>
            <div style={{ textAlign:"center", fontWeight:900, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:.5, marginBottom:14 }}>DepEd · Profiling and Initial Risk Assessment Tools for Children-at-Risk (Appendix A) · Confidential</div>
            <SecTitle>I. Child's Identifying Information</SecTitle>
            {(()=>{ const s=st(sel.studentId); return (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:12 }}>
                {[["Name",fn(s)],["Age",s?.age],["Sex",s?.sex],["Date of Birth",fmt(s?.dob)],["Grade & Section",`${s?.grade} — ${s?.section}`],["Class Adviser",s?.adviser],["Assessment Date",fmt(sel.date)]].map(([k,v])=>(
                  <div key={k} style={{ background:C.bg, borderRadius:6, padding:"7px 10px" }}>
                    <div style={{ fontSize:9, color:C.faint, fontWeight:700, textTransform:"uppercase" }}>{k}</div>
                    <div style={{ fontSize:12, color:C.navy, fontWeight:600, marginTop:2 }}>{v||"—"}</div>
                  </div>
                ))}
              </div>
            );})()}
            <SecTitle>II. Individual Factors</SecTitle>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {[
                [sel.ind_substanceAbuse,"History of substance/alcohol abuse",true],[sel.ind_gangs,"Involvement in gangs",false],
                [sel.ind_angerOutbursts,"Reported incidents of sudden outbursts of anger/irritability",false],
                [sel.ind_trauma,"Report or allegations of traumatic experiences",true],
                [sel.ind_suicidal,"Reported recent suicide attempts or suicidal ideation",true],
                [sel.ind_depressed,"Child observed to be depressed, anxious and out of focus most of the time",false],
                [sel.ind_somaticComplaints,"Constant somatic complaints",false],[sel.ind_thoughtDisturbances,"Reported/Noted thought disturbances",false],
              ].map(([v,l,r])=> v ? <div key={l} style={{ background:r?C.redBg:C.amberBg, borderRadius:6, padding:"6px 10px", fontSize:11, color:r?C.red:C.amber, fontWeight:700 }}>✓ {l}</div> : null)}
            </div>
            <SecTitle>III. Family / Community Factors</SecTitle>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {[
                [sel.fam_victimNeglect,"Child is a victim of neglect",true],[sel.fam_noParent,"Child has no parents or no adult guardian",true],
                [sel.fam_parentCriminal,"History of parental criminal behavior",false],[sel.fam_siblingCriminal,"History of sibling's criminal behavior",false],
                [sel.fam_domesticViolence,"Witness to family/domestic violence",false],[sel.fam_parentSubstance,"Parent substance abuse",false],
                [sel.fam_homeless,"Homeless",false],[sel.fam_abandoned,"Abandoned",true],
                [sel.fam_communityViolence,"Witness to community violence",false],
              ].map(([v,l,r])=> v ? <div key={l} style={{ background:r?C.redBg:C.amberBg, borderRadius:6, padding:"6px 10px", fontSize:11, color:r?C.red:C.amber, fontWeight:700 }}>✓ {l}</div> : null)}
              {sel.fam_victimOfAbuse && <div style={{ background:C.redBg, borderRadius:6, padding:"6px 10px", fontSize:11, color:C.red, fontWeight:700 }}>✓ Child is a victim of abuse: {sel.fam_victimOfAbuse}</div>}
            </div>
            <SecTitle>IV. School Behavior</SecTitle>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {[[sel.sch_behavingWell,"Behaving well in school",false],[sel.sch_bullyingVictim,"Victim of bullying in school",false],[sel.sch_moderateBehavior,"Moderate behavior problems",true],[sel.sch_severeBehavior,"Severe behavior problems / Reported for bullying",true]].map(([v,l,r])=> v ? <Badge key={l} label={l} color={r?C.red:C.amber} bg={r?C.redBg:C.amberBg}/> : null)}
            </div>
            <SecTitle>V. Referral Urgency Assessment (Part II)</SecTitle>
            {[["🔴 Immediate Referral to LSWDO (within 8 hours)",[sel.ref_immediateAbuse&&"Any allegation of abuse/neglect or suspicious injury in non-mobile child",sel.ref_twoMinorInjuries&&"Two or more minor injuries in non-verbal young children",sel.ref_seriousInjury&&"Allegations/suspicions of serious injury",sel.ref_sexualAbuse&&"Allegations/suspicions of sexual abuse perpetrated against a child",sel.ref_repeatedNonAccidental&&"Repeated allegations of non-accidental injury",sel.ref_domesticViolenceHarm&&"Child traumatised/injured/neglected due to domestic violence",sel.ref_repeatedVerbalEmotional&&"Repeated allegations of serious verbal threats and/or emotional abuse",sel.ref_seriousNeglect&&"Allegations/suspicions of serious neglect",sel.ref_directAllegationSexual&&"Direct allegation of sexual abuse by child or abuser's confession",sel.ref_connectionsSexualAbuse&&"Allegations suggesting connections between sexually abused children",sel.ref_individualInHome&&"Individual inside child's home posing a risk to the child",sel.ref_childProtectionPlan&&"Suspicious injury involving child already on child protection plan",sel.ref_noParentAbandoned&&"No parent/carer and child is left abandoned",sel.ref_fabricatedIllness&&"Suspicion of significant harm due to fabricated/induced illness",sel.ref_sexualExploitation&&"Child reported to be at risk of sexual exploitation or trafficking",sel.ref_pregnancy&&"Pregnancy in a child",sel.ref_forcedMarriage&&"A child at risk of forced marriage"].filter(Boolean),C.red,C.redBg],
              ["🟡 For Further Investigation (within 24 hours)",[sel.ref_physicalAssaultNoInjury&&"Allegation of physical assault with no visible injury",sel.ref_incidentConcern&&"Any incident/injury triggering concern",sel.ref_minorConcerns&&"Repeated expressed minor concerns from one or more sources",sel.ref_verbalThreatAllegation&&"Allegation concerning verbal threats",sel.ref_emotionalAbuse&&"Allegations of emotional abuse including minor domestic violence",sel.ref_periodicNeglect&&"Allegations of periodic neglect",sel.ref_suspicionSexualAbuse&&"Suspicions of sexual abuse (medical concerns, sexualized behaviour)",sel.ref_noParentTemporary&&"No available parent, child in need of temporary accommodation"].filter(Boolean),C.amber,C.amberBg],
            ].map(([title,flags,color,bg])=>(
              <div key={title} style={{ marginBottom:12 }}>
                <div style={{ fontWeight:800, fontSize:11, color, marginBottom:5 }}>{title}</div>
                {flags.length>0 ? flags.map((f,i)=><div key={i} style={{ background:bg, borderRadius:6, padding:"5px 10px", fontSize:11, color, fontWeight:600, marginBottom:4 }}>✓ {f}</div>) : <div style={{ fontSize:11, color:C.faint, fontStyle:"italic" }}>None flagged.</div>}
              </div>
            ))}
            {sel.notes && <><SecTitle>Notes</SecTitle><div style={{ background:C.bg, borderRadius:7, padding:"10px 14px", fontSize:13, color:C.navy }}>{sel.notes}</div></>}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:14, paddingTop:12, borderTop:`1px solid ${C.line}` }}>
              <div><div style={{ fontSize:10, color:C.faint, fontWeight:700, marginBottom:3 }}>INITIAL ASSESSMENT MADE BY:</div><div style={{ fontSize:13, fontWeight:700, color:C.navy }}>{sel.assessedBy}</div><div style={{ fontSize:11, color:C.muted }}>{sel.assessedByDesignation}</div></div>
              <div><div style={{ fontSize:10, color:C.faint, fontWeight:700, marginBottom:3 }}>NOTED BY:</div><div style={{ fontSize:13, fontWeight:700, color:C.navy }}>{sel.notedBy}</div><div style={{ fontSize:11, color:C.muted }}>{sel.notedByDesignation}</div></div>
            </div>
          </Overlay>
        )}

        {modal==="addCAR"&&(
          <Overlay title="CAR Profiling & Initial Risk Assessment (Appendix A — DO 18, s.2015)" onClose={close} wide>
            <div style={{ background:"#fff1f2", borderRadius:8, padding:"8px 12px", marginBottom:14, fontSize:11, color:"#7f1d1d" }}>
              <strong>Confidential.</strong> Items in <span style={{ color:C.red, fontWeight:800 }}>red</span> = Immediate referral to LSWDO/DSWD within 8 hours. Other items = Further investigation before referral within 24 hours.
            </div>
            <SecTitle>I. Child's Identifying Information</SecTitle>
            <F label="Student" required ch={<Se value={carF.studentId} onChange={e=>setCarF(p=>({...p,studentId:e.target.value}))}>
              <option value="">— Select Student —</option>
              {students.map(s=><option key={s.id} value={s.id}>{fn(s)} ({s.grade})</option>)}
            </Se>}/>
            <F label="Date of Assessment" ch={<In type="date" value={carF.date} onChange={e=>setCarF(p=>({...p,date:e.target.value}))}/>}/>

            <SecTitle>II. Individual Factors</SecTitle>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
              {[
                ["ind_substanceAbuse","History of substance/alcohol abuse",false],
                ["ind_gangs","Involvement in gangs",false],
                ["ind_angerOutbursts","Reported incidents of sudden outbursts of anger/irritability exhibited in school",false],
                ["ind_trauma","Report or allegations of traumatic experiences of the child",true],
                ["ind_suicidal","Reported recent suicide attempts or suicidal ideation",true],
                ["ind_depressed","Child observed to be depressed, anxious and out of focus most of the time",false],
                ["ind_somaticComplaints","Constant somatic complaints",false],
                ["ind_thoughtDisturbances","Reported/Noted thought disturbances",false],
              ].map(([key,label,red])=>(
                <label key={key} style={{ display:"flex", gap:8, alignItems:"flex-start", padding:"6px 9px", borderRadius:7, background:carF[key]?(red?C.redBg:C.amberBg):C.bg, cursor:"pointer", fontSize:12, color:red?C.red:C.navy, fontWeight:red?700:400 }}>
                  <input type="checkbox" checked={carF[key]} onChange={e=>setCarF(p=>({...p,[key]:e.target.checked}))} style={{ marginTop:2, flexShrink:0 }}/>
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <div style={{ marginTop:8 }}>
              <F label="Involvement in positive youth development activity (specify)" ch={<In value={carF.ind_positiveActivity} onChange={e=>setCarF(p=>({...p,ind_positiveActivity:e.target.value}))} placeholder="Describe activity..."/>}/>
            </div>
            <div style={{ fontWeight:700, fontSize:12, color:C.muted, textTransform:"uppercase", letterSpacing:.4, margin:"8px 0 6px" }}>Types of Offenses Committed (enter count, 0 if none)</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
              {[["off_theft","Theft"],["off_robbery","Robbery"],["off_physicalInjuries","Physical Injuries"],["off_sexualHarassment","Sexual Harassment"],["off_rape","Rape"],["off_homicide","Homicide"],["off_murder","Murder"],["off_drugRelated","Drug-related Offense"]].map(([k,l])=>(
                <F key={k} label={l} ch={<In type="number" min={0} value={carF[k]} onChange={e=>setCarF(p=>({...p,[k]:Number(e.target.value)}))}/>}/>
              ))}
            </div>
            <F label="Other offenses under penal laws" ch={<In value={carF.off_other} onChange={e=>setCarF(p=>({...p,off_other:e.target.value}))} placeholder="Please indicate..."/>}/>

            <SecTitle>III. Family / Community Factors</SecTitle>
            <F label="Child is a victim of abuse — identify type (sexual, physical, emotional, verbal)" ch={<In value={carF.fam_victimOfAbuse} onChange={e=>setCarF(p=>({...p,fam_victimOfAbuse:e.target.value}))} placeholder="Leave blank if not applicable"/>}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
              {[
                ["fam_victimNeglect","Child is a victim of neglect",true],
                ["fam_noParent","Child has no parents or no adult guardian in the household",true],
                ["fam_parentCriminal","History of parental criminal behavior",false],
                ["fam_siblingCriminal","History of sibling's criminal behavior",false],
                ["fam_domesticViolence","Witness to family/domestic violence",false],
                ["fam_parentSubstance","Parent substance abuse",false],
                ["fam_homeless","Homeless",false],
                ["fam_abandoned","Abandoned",true],
                ["fam_communityViolence","Witness to community violence",false],
                ["fam_supportSystem","Presence of support system (family, community, church, school)",false],
              ].map(([key,label,red])=>(
                <label key={key} style={{ display:"flex", gap:8, alignItems:"flex-start", padding:"6px 9px", borderRadius:7, background:carF[key]?(red?C.redBg:C.amberBg):C.bg, cursor:"pointer", fontSize:12, color:red?C.red:C.navy, fontWeight:red?700:400 }}>
                  <input type="checkbox" checked={carF[key]} onChange={e=>setCarF(p=>({...p,[key]:e.target.checked}))} style={{ marginTop:2, flexShrink:0 }}/>
                  <span>{label}</span>
                </label>
              ))}
            </div>

            <SecTitle>IV. School Behavior</SecTitle>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
              {[
                ["sch_behavingWell","Child is behaving well in school",false],
                ["sch_bullyingVictim","Child is a victim of bullying in school",false],
                ["sch_moderateBehavior","Child has been observed to have moderate behavior problems in school",true],
                ["sch_severeBehavior","Child had severe problems with behavior in school / reported for bullying",true],
              ].map(([key,label,red])=>(
                <label key={key} style={{ display:"flex", gap:8, alignItems:"flex-start", padding:"6px 9px", borderRadius:7, background:carF[key]?(red?C.redBg:C.amberBg):C.bg, cursor:"pointer", fontSize:12, color:red?C.red:C.navy, fontWeight:red?700:400 }}>
                  <input type="checkbox" checked={carF[key]} onChange={e=>setCarF(p=>({...p,[key]:e.target.checked}))} style={{ marginTop:2, flexShrink:0 }}/>
                  <span>{label}</span>
                </label>
              ))}
            </div>

            <SecTitle>V. Juvenile Justice Indicators</SecTitle>
            <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", marginBottom:6 }}>History of Criminal Behavior</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4, marginBottom:8 }}>
              {[["jj_firstOccurrence","Current criminal behavior is the first known occurrence",false],["jj_multipleActs","Youth has engaged in multiple delinquent acts in the past year",true]].map(([key,label,red])=>(
                <label key={key} style={{ display:"flex", gap:8, alignItems:"flex-start", padding:"6px 9px", borderRadius:7, background:carF[key]?(red?C.redBg:C.amberBg):C.bg, cursor:"pointer", fontSize:12, color:red?C.red:C.navy, fontWeight:red?700:400 }}>
                  <input type="checkbox" checked={carF[key]} onChange={e=>setCarF(p=>({...p,[key]:e.target.checked}))} style={{ marginTop:2, flexShrink:0 }}/>
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", marginBottom:6 }}>Seriousness</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:4, marginBottom:8 }}>
              {[["jj_statusViolations","Status violations or violations of local ordinances only",false],["jj_criminalBehavior","Youth has engaged in criminal behavior",true],["jj_criminalRisk","Youth has engaged in criminal behavior that places others at risk of significant physical harm",true]].map(([key,label,red])=>(
                <label key={key} style={{ display:"flex", gap:8, alignItems:"flex-start", padding:"6px 9px", borderRadius:7, background:carF[key]?(red?C.redBg:C.amberBg):C.bg, cursor:"pointer", fontSize:12, color:red?C.red:C.navy, fontWeight:red?700:400 }}>
                  <input type="checkbox" checked={carF[key]} onChange={e=>setCarF(p=>({...p,[key]:e.target.checked}))} style={{ marginTop:2, flexShrink:0 }}/>
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", marginBottom:6 }}>Peer Influences</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:4, marginBottom:10 }}>
              {[["jj_peersClean","Youth's primary peer network does not engage in delinquent behavior",false],["jj_peersDelinquent","Youth predominantly has peers who engage in delinquent behavior",false],["jj_peersCriminal","Youth's primary peer network are known to engage in criminal behavior",true]].map(([key,label,red])=>(
                <label key={key} style={{ display:"flex", gap:8, alignItems:"flex-start", padding:"6px 9px", borderRadius:7, background:carF[key]?(red?C.redBg:C.amberBg):C.bg, cursor:"pointer", fontSize:12, color:red?C.red:C.navy, fontWeight:red?700:400 }}>
                  <input type="checkbox" checked={carF[key]} onChange={e=>setCarF(p=>({...p,[key]:e.target.checked}))} style={{ marginTop:2, flexShrink:0 }}/>
                  <span>{label}</span>
                </label>
              ))}
            </div>

            <SecTitle>Part II — Referral Urgency Assessment</SecTitle>
            <div style={{ fontWeight:800, fontSize:11, color:C.red, marginBottom:6 }}>🔴 Referral to LSWDO for IMMEDIATE Intervention (within 8 hours)</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4, marginBottom:12 }}>
              {[["ref_immediateAbuse","Any allegation of abuse/neglect or suspicious injury in a non-mobile child"],["ref_twoMinorInjuries","Two or more minor injuries in non-verbal young children (including disabled)"],["ref_seriousInjury","Allegations or suspicions about a serious injury"],["ref_sexualAbuse","Allegations or suspicions about sexual abuse perpetrated against a child"],["ref_repeatedNonAccidental","Repeated allegations or suspicions of non-accidental injury"],["ref_domesticViolenceHarm","Child has been traumatised, injured or neglected as a result of domestic violence"],["ref_repeatedVerbalEmotional","Repeated allegations involving serious verbal threats and/or emotional abuse"],["ref_seriousNeglect","Allegations/reasonable suspicions of serious neglect"],["ref_directAllegationSexual","Direct allegation of sexual abuse by child or abuser's confession"],["ref_connectionsSexualAbuse","Allegation suggesting connections between sexually abused children"],["ref_individualInHome","Individual inside child's home posing a risk to the child"],["ref_childProtectionPlan","Suspicious injury involving a child already on child protection plan"],["ref_noParentAbandoned","No available parent/carer and child is left abandoned"],["ref_fabricatedIllness","Suspicion that child has suffered significant harm due to fabricated/induced illness"],["ref_sexualExploitation","A child reported to be at risk of sexual exploitation or trafficking"],["ref_pregnancy","Pregnancy in a child"],["ref_forcedMarriage","A child at risk of forced marriage"]].map(([key,label])=>(
                <label key={key} style={{ display:"flex", gap:8, alignItems:"flex-start", padding:"6px 9px", borderRadius:7, background:carF[key]?C.redBg:C.bg, cursor:"pointer", fontSize:11, color:C.red, fontWeight:carF[key]?700:400 }}>
                  <input type="checkbox" checked={carF[key]} onChange={e=>setCarF(p=>({...p,[key]:e.target.checked}))} style={{ marginTop:2, flexShrink:0, accentColor:C.red }}/>
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <div style={{ fontWeight:800, fontSize:11, color:C.amber, marginBottom:6 }}>🟡 Initial Assessment: For Further Investigation before referral (within 24 hours)</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4, marginBottom:12 }}>
              {[["ref_physicalAssaultNoInjury","Allegation of physical assault with no visible injury (child is mobile and verbal)"],["ref_incidentConcern","Any incident/injury triggering concern (series of apparently accidental injuries)"],["ref_minorConcerns","Repeated expressed minor concerns from one or more sources on suspicions of non-accidental injury"],["ref_verbalThreatAllegation","Allegation concerning verbal threats"],["ref_emotionalAbuse","Allegations of emotional abuse including that caused by minor domestic violence"],["ref_periodicNeglect","Allegations of periodic neglect including insufficient supervision; poor hygiene; failure to seek treatment"],["ref_suspicionSexualAbuse","Suspicions of sexual abuse (medical concerns, sexualized behaviour, referral by concerned relative)"],["ref_noParentTemporary","No available parent, child in need of temporary accommodation and no specific risk"]].map(([key,label])=>(
                <label key={key} style={{ display:"flex", gap:8, alignItems:"flex-start", padding:"6px 9px", borderRadius:7, background:carF[key]?C.amberBg:C.bg, cursor:"pointer", fontSize:11, color:C.amber, fontWeight:carF[key]?700:400 }}>
                  <input type="checkbox" checked={carF[key]} onChange={e=>setCarF(p=>({...p,[key]:e.target.checked}))} style={{ marginTop:2, flexShrink:0, accentColor:C.amber }}/>
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <F label="Additional Notes / Observations" ch={<Tx rows={3} value={carF.notes} onChange={e=>setCarF(p=>({...p,notes:e.target.value}))}/>}/>

            <SecTitle>Initial Assessment Made By / Noted By</SecTitle>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:9 }}>
              <F label="Assessed By (Name)" required ch={<In value={carF.assessedBy} onChange={e=>setCarF(p=>({...p,assessedBy:e.target.value}))}/>}/>
              <F label="Designation" ch={<In value={carF.assessedByDesignation} onChange={e=>setCarF(p=>({...p,assessedByDesignation:e.target.value}))}/>}/>
              <F label="Noted By (Name)" ch={<In value={carF.notedBy} onChange={e=>setCarF(p=>({...p,notedBy:e.target.value}))}/>}/>
              <F label="Designation" ch={<In value={carF.notedByDesignation} onChange={e=>setCarF(p=>({...p,notedByDesignation:e.target.value}))}/>}/>
            </div>
            <PBtn full color={C.red} onClick={()=>{ if(!carF.studentId||!carF.assessedBy) return; setCarProfiles(p=>[...p,{...carF,id:gid("CP",p)}]); setCarF(blankCAR()); close(); }} style={{marginTop:10}}>Save CAR Profile (Confidential)</PBtn>
          </Overlay>
        )}
      </div>
    );
  };

  // ── CICL INTAKE FORM (DO 18 s.2015 Appendix B) ──────────────────────────────
  const blankCICL = () => ({
    division:"Cabuyao City", region:"IV-A (CALABARZON)", schoolName:"Southville 1 Integrated National High School",
    schoolAddress:"Southville 1, Cabuyao, Laguna", caseNo:"", date:today(),
    name:"", nickname:"", age:"", sex:"Female", dob:"", placeOfBirth:"", address:"",
    gradeSection:"", classAdviser:"", parentGuardian:"", parentAddress:"", parentContact:"",
    allegedOffense:"", placeDate:"", referringParty:"", victimName:"", victimGrade:"",
    previousOffense:"", actionsTaken:"",
    disposition:{ lswdo:false, lswdoName:"", lswdoContact:"", pnp:false, pnpName:"", pnpContact:"", ngo:false, ngoName:"", ngoContact:"" },
    releasedTo:"Parents", relativeNameContact:"",
    receivingPartyName:"", receivingPartyAddress:"",
    preparedBy:"", preparedByDesignation:"", notedBy:"", notedByDesignation:"",
  });
  const [ciclF, setCiclF] = useState(blankCICL());
  const [ciclForms, setCiclForms] = useState([]);

  const CICLPage = () => {
    const fil = ciclForms.filter(f => !q || f.name.toLowerCase().includes(q.toLowerCase()) || f.caseNo.toLowerCase().includes(q.toLowerCase()));
    return (
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
          <SH title="CICL Intake Form (DO 18 Appendix B)" sub="Children in Conflict with the Law — DepEd DO 18, s.2015 · Confidential"/>
          <PBtn color={"#7c3aed"} onClick={()=>setModal("addCICL")}><Ic n="plus" s={15}/>New CICL Form</PBtn>
        </div>
        <div style={{ background:C.purpleBg, border:`1px solid #c4b5fd`, borderRadius:9, padding:"10px 14px", marginBottom:14, fontSize:12, color:"#5b21b6", lineHeight:1.6 }}>
          <strong>Section 17 (DO 18 s.2015):</strong> When a pupil/student commits a serious offense, the school head/principal with the assistance of the guidance counselor shall <strong>immediately report the case to the law enforcement officer</strong> and refer the case using this form to the LSWDO. Parents/guardians must be notified immediately. This form must be prepared in triplicate.
        </div>
        <SBar value={q} onChange={e=>setQ(e.target.value)} ph="Search CICL forms by name or case no..."/>
        <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
          {fil.map(f=>(
            <div key={f.id} style={{ background:C.white, borderRadius:11, padding:"14px 18px", boxShadow:"0 1px 3px rgba(0,0,0,.06)", borderLeft:`4px solid ${C.purple}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4 }}>
                    <span style={{ fontWeight:900, fontSize:13, fontFamily:"monospace", color:C.navy }}>{f.id}</span>
                    {f.caseNo&&<span style={{ fontSize:11, color:C.faint }}>Case No. {f.caseNo}</span>}
                    <span style={{ fontSize:11, color:C.faint }}>{fmt(f.date)}</span>
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, color:C.navy }}>{f.name}</div>
                  <div style={{ fontSize:12, color:C.muted }}>{f.gradeSection} · Offense: {f.allegedOffense.substring(0,80)}{f.allegedOffense.length>80?"...":""}</div>
                </div>
                <button onClick={()=>{setSel(f);setModal("viewCICL");}} style={{ background:C.purpleBg, border:"none", borderRadius:7, padding:"6px 10px", cursor:"pointer", color:C.purple, display:"flex" }}><Ic n="eye" s={14}/></button>
              </div>
            </div>
          ))}
          {fil.length===0&&<div style={{ background:C.white, borderRadius:11, padding:36, textAlign:"center", color:C.faint }}>No CICL forms on record.</div>}
        </div>

        {modal==="viewCICL"&&sel&&(
          <Overlay title={`CICL Intake Form — ${sel.id} (Confidential)`} onClose={close} wide>
            <div style={{ textAlign:"center", fontWeight:900, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:.5, marginBottom:4 }}>DepEd · Children in Conflict with the Law (CICL) Intake Form (Appendix B)</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
              {[["Division",sel.division],["Region",sel.region],["Name of School",sel.schoolName],["Address",sel.schoolAddress],["Case No.",sel.caseNo],["Date",fmt(sel.date)]].map(([k,v])=>(<div key={k} style={{ background:C.bg, borderRadius:6, padding:"6px 10px" }}><div style={{ fontSize:9, color:C.faint, fontWeight:700, textTransform:"uppercase" }}>{k}</div><div style={{ fontSize:12, color:C.navy, fontWeight:600 }}>{v||"—"}</div></div>))}
            </div>
            <SecTitle>I. Identifying Information</SecTitle>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
              {[["Name",sel.name],["Nickname",sel.nickname],["Age",sel.age],["Sex",sel.sex],["Date of Birth",fmt(sel.dob)],["Place of Birth",sel.placeOfBirth],["Address",sel.address],["Grade & Section",sel.gradeSection],["Class Adviser",sel.classAdviser]].map(([k,v])=>(<div key={k} style={{ background:C.bg, borderRadius:6, padding:"6px 10px" }}><div style={{ fontSize:9, color:C.faint, fontWeight:700, textTransform:"uppercase" }}>{k}</div><div style={{ fontSize:12, color:C.navy, fontWeight:600 }}>{v||"—"}</div></div>))}
            </div>
            <div style={{ marginTop:8, background:C.bg, borderRadius:7, padding:"8px 12px", fontSize:12, color:C.navy }}>
              <strong>Parent/Guardian:</strong> {sel.parentGuardian} · {sel.parentAddress} · {sel.parentContact}
            </div>
            {[["II. Problem Presented (Reported Offense)",<div><div style={{ background:C.bg, borderRadius:7, padding:"10px 14px", fontSize:13, color:C.navy, lineHeight:1.7, whiteSpace:"pre-line", marginBottom:8 }}>{sel.allegedOffense||"—"}</div>{[["Place and Date",sel.placeDate],["Referring Party",sel.referringParty],["Victim/s",sel.victimName+(sel.victimGrade?" ("+sel.victimGrade+")":"")],["Previous Offense",sel.previousOffense]].map(([k,v])=>v?<div key={k} style={{ fontSize:12, color:C.muted, marginBottom:3 }}><strong>{k}:</strong> {v}</div>:null)}</div>],
              ["III. Actions Taken",<div style={{ background:C.bg, borderRadius:7, padding:"10px 14px", fontSize:13, color:C.navy, lineHeight:1.7, whiteSpace:"pre-line" }}>{sel.actionsTaken||"—"}</div>],
            ].map(([t,content])=><div key={t} style={{ marginBottom:12 }}><SecTitle>{t}</SecTitle>{content}</div>)}
            <SecTitle>IV. Disposition — Referred and/or Released To</SecTitle>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:10 }}>
              {sel.disposition.lswdo&&<Badge label={`LSWDO: ${sel.disposition.lswdoName} (${sel.disposition.lswdoContact})`} color={C.green} bg={C.greenBg}/>}
              {sel.disposition.pnp&&<Badge label={`PNP: ${sel.disposition.pnpName} (${sel.disposition.pnpContact})`} color={C.red} bg={C.redBg}/>}
              {sel.disposition.ngo&&<Badge label={`NGO/FBO: ${sel.disposition.ngoName} (${sel.disposition.ngoContact})`} color={C.blue} bg={C.blueBg}/>}
            </div>
            <div style={{ fontSize:12, color:C.navy, marginBottom:4 }}><strong>Released to:</strong> {sel.releasedTo}{sel.relativeNameContact?" — "+sel.relativeNameContact:""}</div>
            {sel.receivingPartyName&&<div style={{ fontSize:12, color:C.muted }}><strong>Receiving Party:</strong> {sel.receivingPartyName} · {sel.receivingPartyAddress}</div>}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:14, paddingTop:12, borderTop:`1px solid ${C.line}` }}>
              <div><div style={{ fontSize:10, color:C.faint, fontWeight:700, marginBottom:3 }}>PREPARED BY:</div><div style={{ fontSize:13, fontWeight:700, color:C.navy }}>{sel.preparedBy}</div><div style={{ fontSize:11, color:C.muted }}>{sel.preparedByDesignation}</div></div>
              <div><div style={{ fontSize:10, color:C.faint, fontWeight:700, marginBottom:3 }}>NOTED BY:</div><div style={{ fontSize:13, fontWeight:700, color:C.navy }}>{sel.notedBy}</div><div style={{ fontSize:11, color:C.muted }}>{sel.notedByDesignation}</div></div>
            </div>
          </Overlay>
        )}

        {modal==="addCICL"&&(
          <Overlay title="CICL Intake Form — DO 18, s.2015 Appendix B (Confidential)" onClose={close} wide>
            <SecTitle>School Information</SecTitle>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:9 }}>
              <F label="Division" ch={<In value={ciclF.division} onChange={e=>setCiclF(p=>({...p,division:e.target.value}))}/>}/>
              <F label="Region" ch={<In value={ciclF.region} onChange={e=>setCiclF(p=>({...p,region:e.target.value}))}/>}/>
              <F label="Case No." ch={<In value={ciclF.caseNo} onChange={e=>setCiclF(p=>({...p,caseNo:e.target.value}))}/>}/>
            </div>
            <F label="Date" ch={<In type="date" value={ciclF.date} onChange={e=>setCiclF(p=>({...p,date:e.target.value}))}/>}/>
            <SecTitle>I. Identifying Information</SecTitle>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:9 }}>
              <F label="Full Name" required ch={<In value={ciclF.name} onChange={e=>setCiclF(p=>({...p,name:e.target.value}))}/>}/>
              <F label="Nickname" ch={<In value={ciclF.nickname} onChange={e=>setCiclF(p=>({...p,nickname:e.target.value}))}/>}/>
              <F label="Age" ch={<In type="number" value={ciclF.age} onChange={e=>setCiclF(p=>({...p,age:e.target.value}))}/>}/>
              <F label="Sex" ch={<Se value={ciclF.sex} onChange={e=>setCiclF(p=>({...p,sex:e.target.value}))}><option>Female</option><option>Male</option></Se>}/>
              <F label="Date of Birth" ch={<In type="date" value={ciclF.dob} onChange={e=>setCiclF(p=>({...p,dob:e.target.value}))}/>}/>
              <F label="Place of Birth" ch={<In value={ciclF.placeOfBirth} onChange={e=>setCiclF(p=>({...p,placeOfBirth:e.target.value}))}/>}/>
              <F label="Grade & Section" ch={<In value={ciclF.gradeSection} onChange={e=>setCiclF(p=>({...p,gradeSection:e.target.value}))}/>}/>
              <F label="Class Adviser" ch={<In value={ciclF.classAdviser} onChange={e=>setCiclF(p=>({...p,classAdviser:e.target.value}))}/>}/>
            </div>
            <F label="Address" ch={<In value={ciclF.address} onChange={e=>setCiclF(p=>({...p,address:e.target.value}))}/>}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:9 }}>
              <F label="Parent/Guardian" ch={<In value={ciclF.parentGuardian} onChange={e=>setCiclF(p=>({...p,parentGuardian:e.target.value}))}/>}/>
              <F label="Parent/Guardian Address" ch={<In value={ciclF.parentAddress} onChange={e=>setCiclF(p=>({...p,parentAddress:e.target.value}))}/>}/>
              <F label="Parent/Guardian Contact" ch={<In value={ciclF.parentContact} onChange={e=>setCiclF(p=>({...p,parentContact:e.target.value}))}/>}/>
            </div>
            <SecTitle>II. Problem Presented (Reported Offense)</SecTitle>
            <F label="Alleged offense committed (describe incident as reported)" required ch={<Tx rows={4} value={ciclF.allegedOffense} onChange={e=>setCiclF(p=>({...p,allegedOffense:e.target.value}))} placeholder="Describe the incident as reported..."/>}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
              <F label="Place and Date of Alleged Commission" ch={<In value={ciclF.placeDate} onChange={e=>setCiclF(p=>({...p,placeDate:e.target.value}))}/>}/>
              <F label="Name of Referring Party / Relation to Child" ch={<In value={ciclF.referringParty} onChange={e=>setCiclF(p=>({...p,referringParty:e.target.value}))}/>}/>
              <F label="Name of Victim/s (if any)" ch={<In value={ciclF.victimName} onChange={e=>setCiclF(p=>({...p,victimName:e.target.value}))}/>}/>
              <F label="Victim's Grade/Level" ch={<In value={ciclF.victimGrade} onChange={e=>setCiclF(p=>({...p,victimGrade:e.target.value}))}/>}/>
            </div>
            <F label="Previous offense reported in school, if any (indicate date)" ch={<In value={ciclF.previousOffense} onChange={e=>setCiclF(p=>({...p,previousOffense:e.target.value}))} placeholder="None if not applicable"/>}/>
            <SecTitle>III. Actions Taken</SecTitle>
            <F label="Actions taken, if any" ch={<Tx rows={3} value={ciclF.actionsTaken} onChange={e=>setCiclF(p=>({...p,actionsTaken:e.target.value}))}/>}/>
            <SecTitle>IV. Disposition — Referred and/or Released To</SecTitle>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:10 }}>
              {[["LSWDO","lswdo","lswdoName","lswdoContact"],["PNP","pnp","pnpName","pnpContact"],["NGO/FBO","ngo","ngoName","ngoContact"]].map(([label,ck,cn,cc])=>(
                <div key={label} style={{ background:C.bg, borderRadius:8, padding:"10px 12px" }}>
                  <label style={{ display:"flex", gap:8, alignItems:"center", fontSize:12, fontWeight:700, color:C.navy, marginBottom:7, cursor:"pointer" }}>
                    <input type="checkbox" checked={ciclF.disposition[ck]} onChange={e=>setCiclF(p=>({...p,disposition:{...p.disposition,[ck]:e.target.checked}}))} style={{ width:14,height:14 }}/>
                    {label}
                  </label>
                  {ciclF.disposition[ck]&&<>
                    <F label="Name" ch={<In value={ciclF.disposition[cn]} onChange={e=>setCiclF(p=>({...p,disposition:{...p.disposition,[cn]:e.target.value}}))}/>}/>
                    <F label="Contact No." ch={<In value={ciclF.disposition[cc]} onChange={e=>setCiclF(p=>({...p,disposition:{...p.disposition,[cc]:e.target.value}}))}/>}/>
                  </>}
                </div>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
              <F label="Released To" ch={<Se value={ciclF.releasedTo} onChange={e=>setCiclF(p=>({...p,releasedTo:e.target.value}))}><option>Parents</option><option>Guardian</option><option>Relative/s</option></Se>}/>
              {ciclF.releasedTo==="Relative/s"&&<F label="Relative Name & Contact" ch={<In value={ciclF.relativeNameContact} onChange={e=>setCiclF(p=>({...p,relativeNameContact:e.target.value}))}/>}/>}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
              <F label="Name and Signature of Receiving Party" ch={<In value={ciclF.receivingPartyName} onChange={e=>setCiclF(p=>({...p,receivingPartyName:e.target.value}))}/>}/>
              <F label="Receiving Party Address" ch={<In value={ciclF.receivingPartyAddress} onChange={e=>setCiclF(p=>({...p,receivingPartyAddress:e.target.value}))}/>}/>
            </div>
            <SecTitle>Prepared By / Noted By</SecTitle>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:9 }}>
              <F label="Prepared By (Name)" required ch={<In value={ciclF.preparedBy} onChange={e=>setCiclF(p=>({...p,preparedBy:e.target.value}))}/>}/>
              <F label="Designation" ch={<In value={ciclF.preparedByDesignation} onChange={e=>setCiclF(p=>({...p,preparedByDesignation:e.target.value}))}/>}/>
              <F label="Noted By (Name)" ch={<In value={ciclF.notedBy} onChange={e=>setCiclF(p=>({...p,notedBy:e.target.value}))}/>}/>
              <F label="Designation" ch={<In value={ciclF.notedByDesignation} onChange={e=>setCiclF(p=>({...p,notedByDesignation:e.target.value}))}/>}/>
            </div>
            <PBtn full color={C.purple} onClick={()=>{ if(!ciclF.name||!ciclF.allegedOffense||!ciclF.preparedBy) return; setCiclForms(p=>[...p,{...ciclF,id:gid("CICL",p)}]); setCiclF(blankCICL()); close(); }} style={{marginTop:10}}>Save CICL Intake Form (Confidential)</PBtn>
          </Overlay>
        )}
      </div>
    );
  };


  const carProfCount = carProfiles.length;
  const ciclCount = ciclForms.length;
  const nav = [
    { id:"dashboard", label:"Dashboard",        icon:"dashboard",  c:C.blue },
    { id:"students",  label:"Students",         icon:"students",   c:C.blue },
    { id:"counseling",label:"MHPSS Referral",     icon:"counseling", c:C.purple },
    { id:"incidents", label:"Incidents",        icon:"incidents",  c:C.red },
    { id:"intake",    label:"Intake Sheets",    icon:"intake",     c:C.orange },
    { id:"referrals", label:"Referrals",        icon:"referrals",  c:C.amber },
    { id:"analytics", label:"Analytics",        icon:"analytics",  c:C.green },
    { id:"risk",      label:"Risk & CAR",       icon:"risk",       c:C.red },
    { id:"carprof",   label:"CAR Profiling",    icon:"risk",       c:"#dc2626", badge:carProfCount },
    { id:"cicl",      label:"CICL Intake Form", icon:"intake",     c:"#7c3aed", badge:ciclCount },
  ];
  const pages = { dashboard:<Dashboard/>, students:<Students/>, counseling:<Counseling/>, incidents:<Incidents/>, intake:<Intakes/>, referrals:<Referrals/>, analytics:<Analytics/>, risk:<Risk/>, carprof:<CARProfilingPage/>, cicl:<CICLPage/> };
  const hrCount = students.filter(s=>computeRisk(s.id,counseling,incidents)>=60).length + students.filter(s=>isCAR(s.id,incidents)).length;
  const piCount = intakes.filter(x=>x.status==="Under Review").length;

  return (
    <div style={{ display:"flex", height:"100vh", background:C.bg, fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ width:224, background:C.navy, display:"flex", flexDirection:"column", flexShrink:0 }}>
        <div style={{ padding:"16px 15px 13px" }}>
          <div style={{ fontSize:9, fontWeight:900, color:C.blue, textTransform:"uppercase", letterSpacing:2, marginBottom:3 }}>Guidance OMS</div>
          <div style={{ fontSize:13, fontWeight:800, color:C.white, lineHeight:1.35 }}>Southville 1 INHS</div>
          <div style={{ fontSize:10, color:"#475569", marginTop:2 }}>DO 40 s.2012 · DO 55 s.2013 · DO 18 s.2015</div>
        </div>
        <div style={{ flex:1, padding:"5px 9px", overflowY:"auto" }}>
          {nav.map(n=>(
            <button key={n.id} onClick={()=>{setPage(n.id);setQ("");}} style={{ display:"flex", alignItems:"center", gap:9, width:"100%", padding:"8px 9px", borderRadius:8, border:"none", cursor:"pointer", marginBottom:2, background:page===n.id?"#1e293b":"transparent", color:page===n.id?C.white:"#94a3b8", fontWeight:page===n.id?700:500, fontSize:13, textAlign:"left" }}>
              <span style={{ color:page===n.id?n.c:"#475569" }}><Ic n={n.icon} s={16}/></span>
              <span style={{ flex:1 }}>{n.label}</span>
              {n.id==="risk"&&hrCount>0&&<span style={{ background:C.red, color:"#fff", fontSize:9, fontWeight:900, borderRadius:99, padding:"1px 6px" }}>{hrCount}</span>}
              {n.id==="intake"&&piCount>0&&<span style={{ background:C.orange, color:"#fff", fontSize:9, fontWeight:900, borderRadius:99, padding:"1px 6px" }}>{piCount}</span>}
              {n.id==="carprof"&&carProfCount>0&&<span style={{ background:"#dc2626", color:"#fff", fontSize:9, fontWeight:900, borderRadius:99, padding:"1px 6px" }}>{carProfCount}</span>}
              {n.id==="cicl"&&ciclCount>0&&<span style={{ background:"#7c3aed", color:"#fff", fontSize:9, fontWeight:900, borderRadius:99, padding:"1px 6px" }}>{ciclCount}</span>}
            </button>
          ))}
        </div>
        <div style={{ padding:"11px 15px 13px", borderTop:"1px solid #1e293b" }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.white }}>Ma'am Jovie B. Malapad</div>
          <div style={{ fontSize:10, color:C.muted }}>Guidance Designate</div>
          <div style={{ fontSize:10, color:"#475569", marginTop:2 }}>CPABC Vice Chairperson · S.Y. 2025–2026</div>
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"24px 24px" }}>
        {pages[page]||<Dashboard/>}
      </div>
    </div>
  );
}
