package com.leapai.backend.config;

import com.leapai.backend.model.Skill;
import com.leapai.backend.repository.SkillRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;

/** Seeds the skill catalog on first boot (idempotent by normalized name). */
@Component
public class SkillSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(SkillSeeder.class);

    private final SkillRepository skills;

    public SkillSeeder(SkillRepository skills) {
        this.skills = skills;
    }

    @Override
    public void run(String... args) {
        int created = 0;
        for (String[] row : CATALOG) {
            if (skills.countByNormalizedName(normalize(row[0])) > 0) continue;
            Skill s = new Skill();
            s.setName(row[0]);
            s.setNormalizedName(normalize(row[0]));
            s.setCategory(row[1]);
            s.setUsageCount(1);
            skills.save(s);
            created++;
        }
        if (created > 0) {
            log.info("[seeder] created {} skill(s)", created);
        }
    }

    public static String normalize(String name) {
        return name.trim().toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
    }

    // name, category — a broad, real catalog. Anything not here can be created by users.
    private static final String[][] CATALOG = {
        // Languages
        {"JavaScript", "Languages"}, {"TypeScript", "Languages"}, {"Python", "Languages"},
        {"Java", "Languages"}, {"Go", "Languages"}, {"Rust", "Languages"}, {"C#", "Languages"},
        {"C++", "Languages"}, {"Ruby", "Languages"}, {"PHP", "Languages"}, {"Swift", "Languages"},
        {"Kotlin", "Languages"}, {"SQL", "Languages"}, {"HTML", "Languages"}, {"CSS", "Languages"},
        {"Bash / Shell Scripting", "Languages"}, {"Scala", "Languages"}, {"Dart", "Languages"},
        // Frameworks
        {"React", "Frameworks"}, {"Next.js", "Frameworks"}, {"Vue.js", "Frameworks"},
        {"Angular", "Frameworks"}, {"Svelte", "Frameworks"}, {"Node.js", "Frameworks"},
        {"Express.js", "Frameworks"}, {"Django", "Frameworks"}, {"Flask", "Frameworks"},
        {"FastAPI", "Frameworks"}, {"Spring Boot", "Frameworks"}, {"Rails", "Frameworks"},
        {"Laravel", "Frameworks"}, {".NET", "Frameworks"}, {"Flutter", "Frameworks"},
        {"React Native", "Frameworks"}, {"Tailwind CSS", "Frameworks"}, {"GraphQL", "Frameworks"},
        {"gRPC", "Frameworks"}, {"REST API Design", "Frameworks"}, {"WebSockets", "Frameworks"},
        // Data & ML
        {"Machine Learning", "Data & ML"}, {"Deep Learning", "Data & ML"},
        {"Data Analysis", "Data & ML"}, {"Data Engineering", "Data & ML"},
        {"Data Visualization", "Data & ML"}, {"Pandas", "Data & ML"}, {"NumPy", "Data & ML"},
        {"TensorFlow", "Data & ML"}, {"PyTorch", "Data & ML"}, {"Scikit-learn", "Data & ML"},
        {"Natural Language Processing", "Data & ML"}, {"Computer Vision", "Data & ML"},
        {"Large Language Models", "Data & ML"}, {"Prompt Engineering", "Data & ML"},
        {"Apache Spark", "Data & ML"}, {"Apache Airflow", "Data & ML"}, {"dbt", "Data & ML"},
        {"Tableau", "Data & ML"}, {"Power BI", "Data & ML"}, {"Statistics", "Data & ML"},
        // Cloud & DevOps
        {"AWS", "Cloud & DevOps"}, {"Microsoft Azure", "Cloud & DevOps"},
        {"Google Cloud", "Cloud & DevOps"}, {"Docker", "Cloud & DevOps"},
        {"Kubernetes", "Cloud & DevOps"}, {"Terraform", "Cloud & DevOps"},
        {"CI/CD", "Cloud & DevOps"}, {"GitHub Actions", "Cloud & DevOps"},
        {"Jenkins", "Cloud & DevOps"}, {"Linux", "Cloud & DevOps"},
        {"Networking", "Cloud & DevOps"}, {"Serverless", "Cloud & DevOps"},
        {"Cloud Architecture", "Cloud & DevOps"}, {"Infrastructure as Code", "Cloud & DevOps"},
        {"Nginx", "Cloud & DevOps"}, {"Observability", "Cloud & DevOps"},
        {"Monitoring & Alerting", "Cloud & DevOps"}, {"SRE", "Cloud & DevOps"},
        // Databases
        {"PostgreSQL", "Databases"}, {"MySQL", "Databases"}, {"MongoDB", "Databases"},
        {"Redis", "Databases"}, {"Elasticsearch", "Databases"}, {"DynamoDB", "Databases"},
        {"Cassandra", "Databases"}, {"Firestore", "Databases"}, {"Supabase", "Databases"},
        {"Prisma", "Databases"}, {"Database Design", "Databases"}, {"Query Optimization", "Databases"},
        // Testing
        {"Unit Testing", "Testing"}, {"Integration Testing", "Testing"},
        {"End-to-End Testing", "Testing"}, {"Test-Driven Development", "Testing"},
        {"Jest", "Testing"}, {"JUnit", "Testing"}, {"pytest", "Testing"},
        {"Cypress", "Testing"}, {"Playwright", "Testing"}, {"Selenium", "Testing"},
        // Practices
        {"Git", "Practices"}, {"Code Review", "Practices"}, {"Agile Methodologies", "Practices"},
        {"Scrum", "Practices"}, {"Kanban", "Practices"}, {"Design Patterns", "Practices"},
        {"System Design", "Practices"}, {"Microservices", "Practices"}, {"Event-Driven Architecture", "Practices"},
        {"Security Best Practices", "Practices"}, {"Performance Optimization", "Practices"},
        {"Refactoring", "Practices"}, {"Technical Writing", "Practices"}, {"API Design", "Practices"},
        // Design
        {"UX Research", "Design"}, {"UI Design", "Design"}, {"Figma", "Design"},
        {"Prototyping", "Design"}, {"Design Systems", "Design"}, {"Accessibility", "Design"},
        {"User Testing", "Design"},
        // Leadership
        {"Technical Leadership", "Leadership"}, {"Team Management", "Leadership"},
        {"Architecture", "Leadership"}, {"Mentoring", "Leadership"}, {"Hiring", "Leadership"},
        {"Strategic Planning", "Leadership"}, {"Roadmapping", "Leadership"},
        {"Influence Without Authority", "Leadership"}, {"Incident Management", "Leadership"},
        {"Project Management", "Leadership"}, {"Product Management", "Leadership"},
        // Soft skills
        {"Communication", "Soft Skills"}, {"Stakeholder Management", "Soft Skills"},
        {"Public Speaking", "Soft Skills"}, {"Negotiation", "Soft Skills"},
        {"Cross-Functional Collaboration", "Soft Skills"}, {"Decision Making", "Soft Skills"},
        {"Problem Solving", "Soft Skills"}, {"Critical Thinking", "Soft Skills"},
        {"Time Management", "Soft Skills"}, {"Adaptability", "Soft Skills"},
    };
}
