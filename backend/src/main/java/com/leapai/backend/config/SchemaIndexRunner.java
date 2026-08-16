package com.leapai.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Creates the hot-path database indexes explicitly at startup.
 *
 * We deliberately do NOT declare these via {@code @Index} on the entities:
 * Hibernate's {@code ddl-auto=update} tries to create annotated indexes
 * against a schema snapshot taken before its own table-creation pass finishes
 * (and before H2 applies case folding), which fails on fresh databases with
 * "database column 'user_id' not found". Running {@code CREATE INDEX IF NOT
 * EXISTS} here, after Hibernate has finished with the schema, is idempotent,
 * works on both fresh and existing databases (including Postgres), and keeps
 * the schema migrations in one obvious place.
 */
@Component
public class SchemaIndexRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SchemaIndexRunner.class);

    private final JdbcTemplate jdbc;

    public SchemaIndexRunner(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(ApplicationArguments args) {
        Map<String, String> indexes = new LinkedHashMap<>();
        indexes.put("idx_goals_user", "CREATE INDEX IF NOT EXISTS idx_goals_user ON goals (user_id)");
        indexes.put("idx_flashcards_user", "CREATE INDEX IF NOT EXISTS idx_flashcards_user ON flashcards (user_id)");
        indexes.put("idx_flashcards_user_due", "CREATE INDEX IF NOT EXISTS idx_flashcards_user_due ON flashcards (user_id, due_at)");
        indexes.put("idx_submissions_user", "CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions (user_id)");
        indexes.put("idx_submissions_problem", "CREATE INDEX IF NOT EXISTS idx_submissions_problem ON submissions (problem_id)");
        indexes.put("idx_conversations_user", "CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations (user_id)");
        indexes.put("idx_messages_conversation", "CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages (conversation_id)");
        indexes.put("idx_scenario_progress_user", "CREATE INDEX IF NOT EXISTS idx_scenario_progress_user ON scenario_progress (user_id)");
        indexes.put("idx_scenario_progress_user_slug", "CREATE UNIQUE INDEX IF NOT EXISTS idx_scenario_progress_user_slug ON scenario_progress (user_id, scenario_slug)");
        indexes.put("idx_resource_progress_user", "CREATE INDEX IF NOT EXISTS idx_resource_progress_user ON resource_progress (user_id)");
        indexes.put("idx_resource_progress_user_url", "CREATE UNIQUE INDEX IF NOT EXISTS idx_resource_progress_user_url ON resource_progress (user_id, resource_url)");
        indexes.put("idx_roadmaps_user", "CREATE INDEX IF NOT EXISTS idx_roadmaps_user ON roadmaps (user_id)");
        indexes.put("idx_events_host", "CREATE INDEX IF NOT EXISTS idx_events_host ON events (host_by_id)");
        indexes.put("idx_resources_creator", "CREATE INDEX IF NOT EXISTS idx_resources_creator ON resources (created_by_id)");
        indexes.put("idx_resources_category", "CREATE INDEX IF NOT EXISTS idx_resources_category ON resources (category)");

        int created = 0;
        for (Map.Entry<String, String> e : indexes.entrySet()) {
            try {
                jdbc.execute(e.getValue());
                created++;
            } catch (Exception ex) {
                log.warn("Index {} not created: {}", e.getKey(), ex.getMessage());
            }
        }
        if (created > 0) {
            log.info("Schema indexes ensured ({} of {} applied).", created, indexes.size());
        }
    }
}
