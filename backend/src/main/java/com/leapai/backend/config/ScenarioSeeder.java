package com.leapai.backend.config;

import com.leapai.backend.model.PracticeScenario;
import com.leapai.backend.repository.PracticeScenarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Seeds the real-world practice scenarios (idempotent by slug): case studies,
 * build projects, interview-prep tracks, and exam-prep tracks. One scenario
 * per category is a free <em>trial</em>; the rest require Pro. The gate is
 * enforced in PracticeScenarioService, not just hidden in the UI.
 */
@Component
public class ScenarioSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(ScenarioSeeder.class);

    private final PracticeScenarioRepository scenarios;

    public ScenarioSeeder(PracticeScenarioRepository scenarios) {
        this.scenarios = scenarios;
    }

    @Override
    public void run(String... args) {
        // Best-effort (idempotent catalog): a transient DB blip at boot must
        // not take the API down — the next boot retries.
        try {
            int created = 0;
            for (PracticeScenario s : ALL) {
                if (scenarios.findBySlug(s.getSlug()).isPresent()) continue;
                scenarios.save(s);
                created++;
            }
            if (created > 0) {
                log.info("[seeder] created {} practice scenario(s)", created);
            }
        } catch (Exception ex) {
            log.warn("[seeder] practice scenario seed skipped (will retry next boot): {}", ex.getMessage());
        }
    }

    private static PracticeScenario scenario(String slug, String title, PracticeScenario.Type type,
                                             String difficulty, String category, String estMinutes,
                                             String summary, String description, String stepsJson,
                                             boolean trial) {
        PracticeScenario s = new PracticeScenario();
        s.setSlug(slug);
        s.setTitle(title);
        s.setType(type);
        s.setDifficulty(difficulty);
        s.setCategory(category);
        s.setEstMinutes(estMinutes);
        s.setSummary(summary);
        s.setDescription(description);
        s.setStepsJson(stepsJson);
        s.setTrial(trial);
        return s;
    }

    private static final List<PracticeScenario> ALL = List.of(
            // ---- Case studies (real-world scenarios) -------------------------
            scenario("case-design-url-shortener", "Design a URL shortener", PracticeScenario.Type.CASE_STUDY,
                    "Intermediate", "System Design", "45–60 min",
                    "Walk through designing a production URL shortener: hashing, storage, redirects, and scale.",
                    """
                    You're the engineer asked to design a URL shortener (like bit.ly) at a company that expects
                    millions of links a day. This is a guided system-design case study — no single right answer,
                    but a strong candidate covers the trade-offs below.

                    Ground rules: short URLs must be unique and hard to guess, redirects must be fast (aim for
                    <100ms p95), and the system must survive traffic spikes without losing writes.
                    """,
                    """
                    [{"title":"Define requirements","detail":"List functional needs (create, redirect, custom slugs) and non-functional ones (latency, availability, scale). Write down your QPS and storage estimates."},
                     {"title":"Design the data model","detail":"Pick a storage engine and schema. Explain why you chose it — how many rows, read/write ratio, and index strategy."},
                     {"title":"Choose the short-code scheme","detail":"Compare base62 encoding vs hashing vs a counter. Show the math for collision probability and the max codes available."},
                     {"title":"Sketch the flow","detail":"Draw create + redirect flows end to end. Where does caching sit? What happens on cache miss?"},
                     {"title":"Handle scale and failure","detail":"Add caching (CDN or Redis), rate limiting, and a plan for the redirect hot path surviving a DB outage."},
                     {"title":"Write it up","detail":"One page: architecture diagram in words, the key decision with its trade-off, and what you'd monitor."}]
                    """,
                    true),
            scenario("case-design-notification-system", "Design a notification system", PracticeScenario.Type.CASE_STUDY,
                    "Advanced", "System Design", "60–90 min",
                    "A real distributed-systems case: multi-channel notifications (email, push, SMS) at scale.",
                    """
                    Design a system that sends notifications to users across email, push, and SMS. New notifications
                    are created by many internal services; delivery must be reliable (no lost messages), ordered per
                    user where it matters, and cheap to operate.

                    This is the full case — you'll design the pipeline from event creation to the provider adapters.
                    """,
                    """
                    [{"title":"Scope the channels and volume","detail":"Estimate messages per day across email/push/SMS, peak rates, and delivery SLOs per channel."},
                     {"title":"Model the data","detail":"Notification template, per-user preferences, and delivery status tables. Decide on the queueing primitive."},
                     {"title":"Design the pipeline","detail":"Producer -> queue -> workers -> provider adapters. Where do retries and dead-letter queues live?"},
                     {"title":"Dedupe and order","detail":"Exactly-once semantics per user (at-least-once + idempotency). How do you keep per-user ordering without a global lock?"},
                     {"title":"Provider failures","detail":"What happens when the SMS provider is down for 10 minutes? Design the circuit breaker and fallback."},
                     {"title":"Present the design","detail":"Final architecture with the two hardest trade-offs called out and defended."}]
                    """,
                    false),
            scenario("case-sql-inventory", "Inventory bloat on a checkout API", PracticeScenario.Type.CASE_STUDY,
                    "Intermediate", "Backend · SQL", "40–60 min",
                    "Debug a real production incident: a checkout API that oversells inventory under load.",
                    """
                    An e-commerce checkout API is overselling stock during flash sales. There's a Postgres inventory
                    table, a checkout endpoint that reads stock, checks, then decrements. Under concurrency, two
                    orders both pass the check. Your job: find the flaw, fix it, and prove the fix.

                    This case is about real-world SQL concurrency — not toy code. Think transactions, row locks,
                    and what "atomic" actually means here.
                    """,
                    """
                    [{"title":"Reproduce the race","detail":"Sketch the exact interleaving where two checkouts both see stock=1. Identify the isolation level that allows it."},
                     {"title":"Fix the read-check-write","detail":"Rewrite the decrement as a single atomic statement (UPDATE ... SET qty = qty - 1 WHERE qty >= ? RETURNING). Explain why it's safe."},
                     {"title":"Handle contention","detail":"Under flash-sale load, one row becomes a hot spot. Design a solution: order lines, retries, or queueing."},
                     {"title":"Add observability","detail":"What metrics and logs would have caught this in staging? Write the alert query."},
                     {"title":"Write the postmortem","detail":"Timeline, root cause, fix, and the process change that prevents the next one."}]
                    """,
                    false),
            scenario("case-pricing-page", "Pricing page conversion drop", PracticeScenario.Type.CASE_STUDY,
                    "Beginner", "Product · Analytics", "30–45 min",
                    "A product analytics case: figure out why the pricing page stopped converting.",
                    """
                    A SaaS company's pricing page conversion dropped 23% after a redesign. You have access to the
                    funnel data, session replays, and the new page. Diagnose the drop and propose a fix with a
                    measurement plan.

                    Real-world product thinking: form hypotheses, pick the metric, and design the experiment.
                    """,
                    """
                    [{"title":"State the funnel","detail":"Define the funnel stages (visit -> scroll -> click plan -> checkout start) and which one dropped."},
                     {"title":"Form hypotheses","detail":"Three candidate causes from the redesign (layout, pricing confusion, trust signals). Rank them."},
                     {"title":"Use the evidence","detail":"Which session-replay pattern or heatmap would confirm each hypothesis? Describe what you'd look for."},
                     {"title":"Design the fix and test","detail":"One change, one metric, one A/B test. Write the exact experiment: variants, sample size, duration."},
                     {"title":"Decision + rollout","detail":"What result would make you ship it, and what's the rollback plan?"}]
                    """,
                    false),

            // ---- Build projects --------------------------------------------------
            scenario("project-cli-todo", "Build a CLI todo app in Java", PracticeScenario.Type.PROJECT,
                    "Beginner", "Java · CLI", "60–90 min",
                    "A real build project: a working command-line todo app with persistence.",
                    """
                    Build a real, usable command-line todo app in Java — not a tutorial clone. It must persist
                    todos to disk, support add/list/complete/delete, and survive restarts. When you're done you'll
                    have a tool you actually use, and the project structure to grow.

                    Free tier trial: the full brief is included so you can see exactly what a Leap.ai build
                    project looks like.
                    """,
                    """
                    [{"title":"Scaffold the project","detail":"Maven project, main class, README. Make it runnable with `mvn exec:java`."},
                     {"title":"Model a Todo","detail":"Fields (id, text, done, createdAt), plus a repository that reads/writes JSON to ~/.todos.json."},
                     {"title":"Commands","detail":"Implement add, list, done <id>, delete <id>. Keep the CLI parsing trivial but robust to bad input."},
                     {"title":"Polish UX","detail":"Colored output, empty-state message, exit code 0 on success. Wrap it: a shell alias makes it feel real."},
                     {"title":"Ship it","detail":"Write a README with install + usage, and commit a working demo in your portfolio."}]
                    """,
                    true),
            scenario("project-rest-api", "Build a REST API with a real database", PracticeScenario.Type.PROJECT,
                    "Intermediate", "Backend · APIs", "2–3 hours",
                    "From spec to shipped: a CRUD API with validation, persistence, and tests.",
                    """
                    Build a small but production-shaped REST API (your choice of stack): resource modeling, input
                    validation, real persistence, and tests that actually run. This is the kind of project that
                    shows up in senior interviews as proof you can ship.

                    Requirements: at least two related resources, validation errors returned as structured JSON,
                    and a test suite covering the happy path plus at least two failure modes.
                    """,
                    """
                    [{"title":"Choose scope","detail":"Pick a domain (e.g. projects + tasks). Write the resource spec: endpoints, fields, status codes."},
                     {"title":"Set up persistence","detail":"Real database with migrations (not in-memory). Schema for both resources with a foreign key."},
                     {"title":"Implement CRUD","detail":"Full CRUD for the parent, nested operations for the child. Return 201/404/409 correctly."},
                     {"title":"Validation","detail":"Reject bad input with structured errors. Never let an empty title or negative quantity through."},
                     {"title":"Write tests","detail":"Happy path + two failure modes (not found, validation). Run them in CI locally at minimum."},
                     {"title":"Document + ship","detail":"README with run instructions and a curl walkthrough. Push it somewhere public."}]
                    """,
                    false),
            scenario("project-observability", "Instrument a service end to end", PracticeScenario.Type.PROJECT,
                    "Intermediate", "DevOps · Observability", "2 hours",
                    "Real observability: logs, metrics, and a dashboard that would catch an outage.",
                    """
                    Take any small service you can run locally and instrument it properly: structured logs,
                    request metrics, and a dashboard that would actually catch an outage. The deliverable is a
                    service where you can answer "is it healthy?" in one glance.

                    Use whatever tools you like (Prometheus+Grafana, OpenTelemetry, or a hosted option).
                    """,
                    """
                    [{"title":"Pick the service and stack","detail":"Choose a service and the observability tools. Write down the three golden signals for it."},
                     {"title":"Structured logging","detail":"Replace print-style logs with structured logs (JSON) including request_id and duration."},
                     {"title":"Metrics","detail":"Expose request count, error rate, and latency histograms. Prove they update by hitting the service."},
                     {"title":"The dashboard","detail":"One dashboard, three panels max, that surfaces an outage. Screenshot it for your portfolio."},
                     {"title":"Alert on it","detail":"Write one alert rule that fires when error rate crosses a threshold. Test it by breaking the service."}]
                    """,
                    false),
            scenario("project-portfolio", "Ship a portfolio case study", PracticeScenario.Type.PROJECT,
                    "Beginner", "Career · Portfolio", "1–2 hours",
                    "Turn one real project into a case study that hiring teams actually read.",
                    """
                    You've built things — now package one as a case study. The goal is a page that shows a
                    hiring manager the problem, your approach, and the outcome in under two minutes of reading.

                    This project is about communication as much as code: structure, evidence, and a clear
                    "before/after".
                    """,
                    """
                    [{"title":"Pick the project","detail":"Choose one project with a clear problem and a measurable outcome. Not your biggest — your clearest."},
                     {"title":"Write the problem","detail":"One paragraph: who had the problem, what it cost them, why it was hard."},
                     {"title":"Show the approach","detail":"Your key decisions and trade-offs. Include one diagram (architecture or flow) you draw yourself."},
                     {"title":"Evidence of impact","detail":"Numbers: time saved, errors reduced, users served. If you have none, run the measurement now."},
                     {"title":"Publish it","detail":"Put the case study where hiring teams will see it (GitHub README, blog, or portfolio site)."}]
                    """,
                    false),

            // ---- Interview prep ----------------------------------------------------
            scenario("interview-behavioral", "Behavioral interview: the STAR framework", PracticeScenario.Type.INTERVIEW_PREP,
                    "Beginner", "Interview · Behavioral", "45–60 min",
                    "Get ready for behavioral rounds: craft and rehearse your three core stories.",
                    """
                    Behavioral questions ("tell me about a time...") decide more offers than people admit. This
                    track gets you interview-ready: pick the right stories, structure them with STAR, and practice
                    out loud until they're natural.

                    Free tier trial: the full prep plan is included — work through it and you'll walk into any
                    behavioral round with three solid stories.
                    """,
                    """
                    [{"title":"Inventory your stories","detail":"List 5 work situations: a conflict, a failure, a win, a leadership moment, a time you were wrong."},
                     {"title":"Pick your three","detail":"Choose the three most reusable. Each should show a skill a senior hire needs (influence, ownership, judgment)."},
                     {"title":"Write STAR for each","detail":"Situation (2 sentences), Task (1), Action (3-4, what YOU did), Result (measured). One page each."},
                     {"title":"Rehearse out loud","detail":"Record yourself answering each in under 2 minutes. Listen for rambling and fix the openings."},
                     {"title":"Mock round","detail":"Do a real mock (friend, Pramp, or a practice session) and get feedback on at least one story."}]
                    """,
                    true),
            scenario("interview-system-design-mock", "System design interview: full mock", PracticeScenario.Type.INTERVIEW_PREP,
                    "Advanced", "Interview · System Design", "60–90 min",
                    "A realistic system design interview with the rubric interviewers actually use.",
                    """
                    A full mock system design interview. You'll be given a prompt, a timeboxed plan, and the rubric
                    interviewers use to score. Run it like the real thing: 45 minutes on the clock, talking your
                    reasoning out loud, ending with a clear architecture.

                    Use a real whiteboard tool (Excalidraw works) and keep your own time.
                    """,
                    """
                    [{"title":"Setup and prompt","detail":"Pick a prompt (e.g. design a chat app). Get your whiteboard ready. Start the 45-minute clock."},
                     {"title":"0-5 min: requirements","detail":"Clarify scope: who uses it, what's the scale, what's explicitly out of scope."},
                     {"title":"5-15 min: high-level","detail":"Draw the high-level architecture. Name the core components and the data flow."},
                     {"title":"15-30 min: deep dive","detail":"Go deep on one area (data model, messaging, or scale). Discuss trade-offs out loud."},
                     {"title":"30-40 min: bottlenecks","detail":"Call out the top 2 bottlenecks and how you'd address them. Show you know where it breaks."},
                     {"title":"40-45 min: wrap","detail":"Summarize the design in 3 sentences. Score yourself against the rubric and list the gap."}]
                    """,
                    false),
            scenario("interview-coding-day", "Coding interview: a full day of prep", PracticeScenario.Type.INTERVIEW_PREP,
                    "Intermediate", "Interview · Coding", "3–4 hours",
                    "The day-of plan: warm-up, timed problems, review — exactly like the real screen.",
                    """
                    A structured, timed session that simulates a real coding interview day. You'll warm up, solve
                    problems under the clock, and review what actually happened — the review is where the growth is.

                    Pair this track with the LeetCode-style problems on the Practice page: use the problems here
                    as your timed session, then come back for the debrief.
                    """,
                    """
                    [{"title":"Warm-up (15 min)","detail":"Two easy problems, no clock pressure. Get your hands moving and your editor set up."},
                     {"title":"Timed problem 1 (25 min)","detail":"One medium problem on the clock. Talk through your approach before typing — say it out loud."},
                     {"title":"Timed problem 2 (25 min)","detail":"Second problem. This time, optimize your first solution before writing the final version."},
                     {"title":"Debrief (30 min)","detail":"For each problem: what did you miss, where did you stall, what's the pattern? Write it down."},
                     {"title":"Plan tomorrow","detail":"Pick the one pattern to drill next and the specific problems you'll use. One clear next action."}]
                    """,
                    false),
            scenario("interview-offer-negotiation", "Offer negotiation rehearsal", PracticeScenario.Type.INTERVIEW_PREP,
                    "Intermediate", "Interview · Negotiation", "30–45 min",
                    "Practice the conversation that decides your comp: numbers, scripts, and the counter.",
                    """
                    Most people leave money on the table because they've never practiced the conversation. This
                    track gets you ready: know your numbers, have the scripts, and rehearse the counter out loud.

                    Use Levels.fyi data to anchor your target range before you start.
                    """,
                    """
                    [{"title":"Know your numbers","detail":"Research your market range for the role and level. Write down your walk-away number and your target."},
                     {"title":"Write your leverage","detail":"Three facts that raise your value: competing offers, unique skills, or concrete impact at work."},
                     {"title":"Script the conversation","detail":"Write what you'll say when they give a number below target. One polite, confident counter."},
                     {"title":"Rehearse out loud","detail":"Practice the full exchange with a friend or by recording. Fix your hesitation words."},
                     {"title":"Roleplay the counter","detail":"Simulate the back-and-forth: they push back, you hold. End with a clear ask and a timeline."}]
                    """,
                    false),

            // ---- Exam / test prep --------------------------------------------------
            scenario("exam-sql-basics", "SQL exam: joins to window functions", PracticeScenario.Type.EXAM_PREP,
                    "Beginner", "Exam · SQL", "45–60 min",
                    "Get ready for any SQL test: practice questions from basic joins to window functions.",
                    """
                    Most SQL exams (take-home, live screen, or certification) test a predictable set: joins,
                    aggregation, and window functions. This track walks you through the question types and has you
                    practice on real data until the patterns are automatic.

                    Free tier trial: the full question set and grading checklist are included.
                    """,
                    """
                    [{"title":"Review the core","detail":"Joins (inner/left/self), GROUP BY + HAVING, and the difference between WHERE and HAVING."},
                     {"title":"Practice: aggregation","detail":"Write queries: revenue per customer, orders per day, running totals. Check against expected output."},
                     {"title":"Practice: window functions","detail":"ROW_NUMBER, RANK, LAG/LEAD, SUM OVER. Solve 'top N per group' — the classic exam question."},
                     {"title":"Self-test (30 min)","detail":"Time yourself on 10 mixed questions without notes. Grade honestly and list what you missed."},
                     {"title":"Close the gaps","detail":"For each miss, one targeted practice query. Re-test tomorrow until the set is clean."}]
                    """,
                    true),
            scenario("exam-java-cert", "Java certification prep plan", PracticeScenario.Type.EXAM_PREP,
                    "Advanced", "Exam · Java", "3–5 hours",
                    "A week of focused prep for Java exams: what to study, and how to test yourself.",
                    """
                    A structured prep plan for Java certification-style exams (OCA/OCP or equivalent). The goal
                    isn't to memorize — it's to be able to answer tricky questions under time pressure, which is
                    exactly what these exams test.

                    Combine this with the practice problems on the Practice page where the topics overlap.
                    """,
                    """
                    [{"title":"Map the syllabus","detail":"List the exam's topic areas. Mark which you use daily (light review) vs rarely (deep review)."},
                     {"title":"Drill the gotchas","detail":"Autoboxing, == vs equals, switch fall-through, generics erasure. Write 2 questions on each from memory."},
                     {"title":"Practice under clock","detail":"Take one timed practice test (30 questions, 45 min). No notes, real time."},
                     {"title":"Analyze mistakes","detail":"Categorize each miss: knowledge gap vs misread vs time pressure. Fix the largest category first."},
                     {"title":"Final review pass","detail":"The morning-of list: the 10 rules you most often forget, written on one page."}]
                    """,
                    false),
            scenario("exam-whiteboard", "Whiteboard test: algorithms under pressure", PracticeScenario.Type.EXAM_PREP,
                    "Intermediate", "Exam · Coding", "60–90 min",
                    "Simulate the whiteboard exam: no editor, no autocomplete, just you and the board.",
                    """
                    Some exams and screens still do whiteboard-style questions — no editor, no autocomplete, and
                    the interviewer watches you think. This track trains exactly that: write clean code by hand,
                    out loud, under time.

                    Use a real whiteboard, a blank document, or paper. The point is no syntax help.
                    """,
                    """
                    [{"title":"Warm-up (10 min)","detail":"Write 'reverse a string' by hand, out loud, explaining each line as you write it."},
                     {"title":"Timed problem 1 (20 min)","detail":"A medium algorithm problem by hand. State your approach, write the code, then trace it with a small input."},
                     {"title":"Timed problem 2 (20 min)","detail":"A second problem. This time add the complexity analysis at the end, verbally."},
                     {"title":"Trace and correct","detail":"Reread each solution line by line as if you're the compiler. Fix the bugs you find out loud."},
                     {"title":"Debrief","detail":"What broke under pressure: syntax slips, edge cases missed, or explanation gaps? One drill for each."}]
                    """,
                    false),
            scenario("exam-behavioral-quiz", "Assessment-center behavioral quiz", PracticeScenario.Type.EXAM_PREP,
                    "Beginner", "Exam · Behavioral", "30 min",
                    "Practice the situational-judgment questions used in assessments and screenings.",
                    """
                    Many exams and assessment centers include situational-judgment questions: "your colleague
                    missed a deadline, what do you do?" There's no single right answer, but there are patterns
                    interviewers reward. This track gets you fluent in them.

                    Work through the question types and write your reasoning for each.
                    """,
                    """
                    [{"title":"Learn the patterns","detail":"The four archetypes: ownership, collaboration, conflict, and ethics. What each answer should signal."},
                     {"title":"Write answers (Q1-3)","detail":"Three situational questions. For each, pick your action and justify it in one paragraph."},
                     {"title":"Check the rubric","detail":"Score your answers: did you take ownership, involve the right people, and stay professional?"},
                     {"title":"Rewrite two","detail":"Rewrite the two weakest answers using the STAR-style structure. Make the action specific and yours."},
                     {"title":"Fast review","detail":"Five more questions, timed (2 min each). Speed without sacrificing the structure."}]
                    """,
                    false),

            // ---- Healthcare: clinical practice for non-engineering users ---------
            // Real clinical material so a healthcare student gets healthcare practice
            // (triage, handover, NCLEX-style priority questions) instead of only
            // system-design cases and Java projects. One case is a free trial so a
            // healthcare user's first taste is in their own field.
            scenario("case-clinical-triage", "Clinical triage: prioritize the waiting room", PracticeScenario.Type.CASE_STUDY,
                    "Beginner", "Healthcare · Clinical", "30–45 min",
                    "Six patients, one duty officer — assign acuity, spot red flags, and justify every call.",
                    """
                    You're the clinical officer on duty in a busy outpatient clinic. Six patients arrive within
                    ten minutes and you have to triage them. You can't treat everyone at once — you have to
                    decide who needs attention now, who can wait safely, and who needs escalation.

                    There's no single right answer, but strong candidates follow the same logic: airway,
                    breathing, circulation first; vital-sign red flags never wait; and every decision gets
                    documented. Work the case the way you'd actually have to in a real shift.
                    """,
                    """
                    [{"title":"Know the red flags","detail":"List the vital-sign and symptom red flags that mean 'do not wait': severe respiratory distress, chest pain with sweating, altered consciousness, uncontrolled bleeding, and high fever in an infant."},
                     {"title":"Assign acuity to each patient","detail":"For each of the six patients, assign an acuity level (resuscitation / emergent / urgent / standard) and the single strongest reason for it."},
                     {"title":"Justify your top three","detail":"Put the three sickest patients in order and defend it: why does patient A beat patient B? Use airway-breathing-circulation reasoning, not who arrived first."},
                     {"title":"Decide what can wait","detail":"Identify the patients who can safely wait, what monitoring you'd leave in place for them, and what would change your decision."},
                     {"title":"Escalate and document","detail":"Write the escalation note for the most urgent patient: findings, decision, and what you told the next provider. Practice it in under two minutes."}]
                    """,
                    true),
            scenario("case-patient-handover-sbar", "Safe patient handover: SBAR in practice", PracticeScenario.Type.CASE_STUDY,
                    "Intermediate", "Healthcare · Communication", "30–45 min",
                    "Hand over a post-op patient the way hospitals want it: structured, safe, complete.",
                    """
                    Shift change. You're handing over a post-operative patient to the next clinical officer.
                    Handovers are where care breaks — a fact forgotten, an allergy missed, a trend not flagged.
                    SBAR (Situation, Background, Assessment, Recommendation) is the structure hospitals use to
                    stop that. Your job: work the real case, spot what's missing from the chart, and write the
                    handover a colleague could act on.
                    """,
                    """
                    [{"title":"Gather the facts","detail":"From the patient chart: the surgery and when, the vitals trend, pain score, medications given, and any abnormal lab result. Write them down before anything else."},
                     {"title":"Write the SBAR","detail":"Situation (why this patient needs handover), Background (relevant history + what was done), Assessment (current status + what concerns you), Recommendation (the specific action you want the next provider to take)."},
                     {"title":"Spot the gaps","detail":"Identify three facts you'd want before accepting this handover that aren't in the chart. This is the step that prevents real harm."},
                     {"title":"Do the verbal handover","detail":"Practice saying it out loud in under two minutes, ending with a clear request. Record yourself if you can."},
                     {"title":"Score yourself","detail":"Check the checklist: allergies mentioned? bleeding risk? next review time? What did you miss, and how will you catch it next time?"}]
                    """,
                    false),
            scenario("exam-nclex-prep", "NCLEX-style priority questions", PracticeScenario.Type.EXAM_PREP,
                    "Intermediate", "Exam · Nursing", "45–60 min",
                    "Drill the question type that decides nursing exams: which patient do you see first?",
                    """
                    Nursing and clinical licensing exams (NCLEX and equivalents) are built on priority
                    questions — "which patient should the nurse see first?" The pattern is teachable: ABCs,
                    Maslow's hierarchy, safety, and recognizing the patient most likely to decompensate.
                    This track drills the pattern until it's automatic, because in the exam and on the ward
                    it's the same skill.
                    """,
                    """
                    [{"title":"Learn the priority rules","detail":"ABCs before everything; safety first; acute over chronic; the patient who might decompensate beats the stable one. Write the rules in your own words."},
                     {"title":"Practice: ABCs","detail":"Three priority questions where the answer is airway or breathing. Explain each choice in one sentence before looking at the rationale."},
                     {"title":"Practice: Maslow","detail":"Three questions mixing physical and psychosocial needs. Justify in writing why the physical need wins every time."},
                     {"title":"Practice: safety","detail":"Three questions on medication errors, fall risk, and infection control. What makes a patient unsafe right now, not later?"},
                     {"title":"Timed quiz (10 questions)","detail":"Ten mixed priority questions, 20 minutes, no notes. Grade honestly and categorize every miss: knowledge gap, misread, or hesitation."},
                     {"title":"Close the gaps","detail":"For each miss, write the rule you forgot on a single page. Re-test tomorrow until the set is clean."}]
                    """,
                    false),
            scenario("project-clinical-revision", "Build your clinical revision system", PracticeScenario.Type.PROJECT,
                    "Beginner", "Healthcare · Study", "1–2 hours",
                    "A real study system: syllabus map, flashcard bank, and a past-questions log that survives exam season.",
                    """
                    Build the revision system you'll use for the rest of your training: map your syllabus to
                    the exam blueprint, turn every weak topic into flashcards, keep a past-questions log with
                    the pattern of your misses, and schedule weekly reviews. The deliverable is a system, not
                    a notes dump — you should be able to see your weakest topic in one glance.
                    """,
                    """
                    [{"title":"Map the syllabus","detail":"List your program's topics and mark each strong / shaky / unknown against the exam blueprint. This is your source of truth for the whole system."},
                     {"title":"Build the flashcard bank","detail":"Turn every shaky and unknown topic into 20 flashcards, one concept each, in your own words. No copying from notes."},
                     {"title":"Start the past-questions log","detail":"A table: date, topic, question, your answer, correct? Add the pattern of each miss (knowledge, misread, time). This log is where you find your gaps."},
                     {"title":"Set the weekly review","detail":"Schedule one 45-minute review: 15 min flashcards, 15 min past questions, 15 min on the single weakest topic. Put it in your calendar now."},
                     {"title":"Make it visible","detail":"One page (or doc) showing your three weakest topics and this week's plan. Put it where you study so the system runs even on low-motivation days."}]
                    """,
                    false)
    );
}
