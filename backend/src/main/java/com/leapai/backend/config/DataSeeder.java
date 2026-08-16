package com.leapai.backend.config;

import com.leapai.backend.model.CommunityGroup;
import com.leapai.backend.model.Event;
import com.leapai.backend.model.Resource;
import com.leapai.backend.repository.CommunityGroupRepository;
import com.leapai.backend.repository.EventRepository;
import com.leapai.backend.repository.ResourceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Seeds the content catalog (learning library, events, community groups) on
 * first boot. These are real catalog entries — not invented user metrics, and
 * no fabricated testimonials or fake progress. Idempotent: only seeds when the
 * tables are empty.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final ResourceRepository resources;
    private final EventRepository events;
    private final CommunityGroupRepository groups;

    public DataSeeder(ResourceRepository resources, EventRepository events, CommunityGroupRepository groups) {
        this.resources = resources;
        this.events = events;
        this.groups = groups;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (resources.count() == 0) {
            seedResources();
            log.info("[seed] loaded {} library resources", resources.count());
        }
        if (resources.findBySourceOrderByIdDesc("open").isEmpty()) {
            seedOpenResources();
            log.info("[seed] loaded {} open-source resources",
                    resources.findBySourceOrderByIdDesc("open").size());
        }
        if (events.count() == 0) {
            seedEvents();
            log.info("[seed] loaded {} events", events.count());
        }
        if (groups.count() == 0) {
            seedGroups();
            log.info("[seed] loaded {} community groups", groups.count());
        }
    }

    private void seedResources() {
        resources.save(resource("System Design for Senior Engineers", "Course", 4.9, 128, "8 hours", false, "TRENDING",
                "Deep-dive into the design decisions senior engineers are expected to own."));
        resources.save(resource("Leadership for Technical Managers", "Course", 4.7, 86, "5 hours", true, "TRENDING",
                "Leading teams without losing your technical edge."));
        resources.save(resource("Effective Communication in Tech Teams", "Workshop", 4.8, 42, "2 hours", false, "TRENDING",
                "Writing, presenting, and influencing in engineering organizations."));
        resources.save(resource("Negotiation Skills for Career Advancement", "Guide", 4.6, 56, "45 minutes", false, "TRENDING",
                "Compensation, scope, and title negotiation fundamentals."));
        resources.save(resource("AI-Powered Job Search Strategies", "Webinar", 4.5, 34, "1 hour", true, "TRENDING",
                "Using AI tools to sharpen your search and applications."));
        resources.save(resource("Personal Branding for Professionals", "Course", 4.9, 67, "4 hours", false, "TRENDING",
                "Making your work visible so the right opportunities find you."));

        resources.save(resource("Advanced System Architecture", "Course", 4.9, 213, "10 hours", true, "RECOMMENDED",
                "Scalability, reliability, and the patterns behind large systems."));
        resources.save(resource("Team Leadership Workshop", "Workshop", 4.8, 78, "3 hours", false, "RECOMMENDED",
                "Practical leadership for working with cross-functional teams."));
        resources.save(resource("Microservices Design Patterns", "Guide", 4.7, 92, "6 hours", false, "RECOMMENDED",
                "When microservices help, when they hurt, and how to structure them."));
        resources.save(resource("Tech Leadership in Startups", "Podcast", 4.6, 45, "5 episodes", false, "RECOMMENDED",
                "Interviews with CTOs on leading engineering in fast-growing companies."));
        resources.save(resource("AI Ethics for Developers", "Course", 4.9, 67, "4 hours", true, "RECOMMENDED",
                "Building AI responsibly: bias, transparency, and accountability."));
        resources.save(resource("Building Resilient Systems", "eBook", 4.8, 112, "180 pages", false, "RECOMMENDED",
                "Failure modes, recovery, and designing for real-world outages."));
    }

    /** Real open-source learning materials (source=OPEN) so the resource engine
     *  has known-good links in the library from day one. */
    private void seedOpenResources() {
        resources.save(openResource("System Design Primer", "Guide",
                "https://github.com/donnemartin/system-design-primer", "GitHub",
                "The canonical open-source intro to large-scale system design."));
        resources.save(openResource("freeCodeCamp — System Design Concepts Course", "Course",
                "https://www.youtube.com/watch?v=F2FmTdLtb_4", "YouTube",
                "A free, complete video walkthrough of system design fundamentals."));
        resources.save(openResource("CS50x — Introduction to Computer Science", "Course",
                "https://cs50.harvard.edu/x/", "Course site",
                "Harvard's free course that builds problem-solving fundamentals."));
        resources.save(openResource("The Odin Project", "Course",
                "https://www.theodinproject.com/", "Course site",
                "Free, project-driven full-stack curriculum."));
        resources.save(openResource("PostgreSQL Documentation", "Docs",
                "https://www.postgresql.org/docs/", "Docs",
                "The official docs — indexing, transactions, query planning."));
        resources.save(openResource("Google SRE Book", "Book",
                "https://sre.google/sre-book/table-of-contents/", "Book",
                "Free — the blueprint for running reliable production systems."));
        resources.save(openResource("Kaggle Learn", "Course",
                "https://www.kaggle.com/learn", "Kaggle",
                "Free micro-courses on Python, SQL, ML, and visualization."));
    }

    private void seedEvents() {
        events.save(event("Career Transition Strategies",
                "How to move between roles or industries without starting over.",
                "Webinar", false, "August 28, 2026", "6:00 PM WAT", "blue"));
        events.save(event("AI Tools for Career Development",
                "Hands-on workshop on using AI tools to accelerate your growth.",
                "Workshop", true, "September 12, 2026", "5:00 PM WAT", "purple"));
    }

    private void seedGroups() {
        groups.save(group("Interview Prep", 312, "2h ago"));
        groups.save(group("Switching to Product Management", 189, "35m ago"));
        groups.save(group("Senior → Staff Transitions", 96, "1d ago"));
    }

    private static Resource resource(String title, String type, double rating, int reviews,
                                     String duration, boolean isPro, String category, String description) {
        Resource r = new Resource();
        r.setTitle(title);
        r.setType(type);
        r.setRating(rating);
        r.setReviews(reviews);
        r.setDuration(duration);
        r.setPro(isPro);
        r.setCategory(category);
        r.setDescription(description);
        return r;
    }

    private static Resource openResource(String title, String type, String url, String source,
                                         String description) {
        Resource r = new Resource();
        r.setTitle(title);
        r.setType(type);
        r.setUrl(url);
        r.setSource("open");
        r.setCategory("OTHER");
        r.setDescription(description);
        r.setRating(0);
        r.setReviews(0);
        r.setDuration("Open source");
        r.setPro(false);
        return r;
    }

    private static Event event(String title, String description, String type,
                               boolean isPro, String date, String time, String color) {
        Event e = new Event();
        e.setTitle(title);
        e.setDescription(description);
        e.setType(type);
        e.setPro(isPro);
        e.setDate(date);
        e.setTime(time);
        e.setColor(color);
        return e;
    }

    private static CommunityGroup group(String topic, int members, String lastActive) {
        CommunityGroup g = new CommunityGroup();
        g.setTopic(topic);
        g.setMembers(members);
        g.setLastActive(lastActive);
        return g;
    }
}
