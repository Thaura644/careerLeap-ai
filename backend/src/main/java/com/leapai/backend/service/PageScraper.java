package com.leapai.backend.service;

import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Lightweight page scraper for the resource engine: fetches a URL with a real
 * browser user-agent and extracts the title, meta description, and readable
 * body text. No external parsing library — the extraction is deliberately
 * small and defensive, and any failure returns {@code ok=false} so callers
 * degrade gracefully instead of crashing.
 *
 * <p>Used by the resource engine's AI import flow: scrape the page, then hand
 * the real text to the LLM to classify and describe it. Nothing here invents
 * content — it only extracts what the page actually says.
 */
@Service
public class PageScraper {

    /** A full browser UA so real sites (which block default Java UAs) respond. */
    private static final String USER_AGENT =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                    + "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

    /** The usable parts of a scraped page. {@code ok=false} means the fetch or
     *  parse failed and the caller should fall back to platform metadata. */
    public record Scraped(String url, String title, String description, String text, boolean ok) {
        static Scraped failed(String url) {
            return new Scraped(url, "", "", "", false);
        }
    }

    private final HttpClient client;

    public PageScraper() {
        this.client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    public Scraped scrape(String url) {
        if (url == null || url.isBlank()) return Scraped.failed(url);
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(12))
                    .header("User-Agent", USER_AGENT)
                    .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                    .header("Accept-Language", "en-US,en;q=0.9")
                    .GET()
                    .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 400) {
                return Scraped.failed(url);
            }
            String html = response.body();
            if (html == null || html.isBlank()) return Scraped.failed(url);

            String title = tagText("title", html);
            if (title.isBlank()) title = metaContent("og:title", html);
            String description = metaContent("og:description", html);
            if (description.isBlank()) description = metaContent("description", html);

            String text = extractText(html);
            // A page with no readable text is not scrapable — treat as failed
            // rather than feeding the AI an empty page.
            if (text.length() < 80) return Scraped.failed(url);
            return new Scraped(url, trim(title, 200), trim(description, 500), text, true);
        } catch (Exception e) {
            return Scraped.failed(url);
        }
    }

    // ------------------------------------------------------------ extraction

    /** Inner text of the first occurrence of a tag, or "" — e.g. {@code <title>}. */
    private static String tagText(String tag, String html) {
        Matcher m = Pattern.compile("(?is)<" + tag + "[^>]*>(.*?)</" + tag + ">").matcher(html);
        return m.find() ? clean(m.group(1)) : "";
    }

    /** The {@code content} attribute of a meta tag whose name/property equals the given value. */
    private static String metaContent(String name, String html) {
        Matcher m = Pattern.compile("(?is)<meta[^>]+>").matcher(html);
        while (m.find()) {
            String tag = m.group();
            boolean matches = tag.matches("(?is).*(?:name|property)\\s*=\\s*[\"']" + Pattern.quote(name) + "[\"'].*")
                    || tag.matches("(?is).*(?:name|property)\\s*=\\s*" + name + "(?:\\s|>).*");
            if (!matches) continue;
            Matcher c = Pattern.compile("(?i)content\\s*=\\s*[\"'](.*?)[\"']").matcher(tag);
            if (c.find()) return clean(c.group(1));
            Matcher c2 = Pattern.compile("(?i)content\\s*=\\s*([^\\s>'\"]+)").matcher(tag);
            if (c2.find()) return clean(c2.group(1));
        }
        return "";
    }

    /** Readable body text: strip scripts/styles/tags, collapse whitespace, cap length. */
    private static String extractText(String html) {
        String body = html;
        Matcher bodyMatch = Pattern.compile("(?is)<body[^>]*>(.*)</body>").matcher(html);
        if (bodyMatch.find()) body = bodyMatch.group(1);
        body = body.replaceAll("(?is)<script[^>]*>.*?</script>", " ");
        body = body.replaceAll("(?is)<style[^>]*>.*?</style>", " ");
        body = body.replaceAll("(?is)<noscript[^>]*>.*?</noscript>", " ");
        body = body.replaceAll("(?is)<svg[^>]*>.*?</svg>", " ");
        body = body.replaceAll("(?is)<[^>]+>", " ");
        body = body.replaceAll("&nbsp;", " ").replaceAll("&amp;", "&")
                .replaceAll("&lt;", "<").replaceAll("&gt;", ">")
                .replaceAll("&#39;", "'").replaceAll("&quot;", "\"");
        body = body.replaceAll("\\s+", " ").trim();
        return body.length() > 8000 ? body.substring(0, 8000) : body;
    }

    private static String clean(String value) {
        if (value == null) return "";
        return value.replaceAll("\\s+", " ").trim();
    }

    private static String trim(String value, int max) {
        if (value == null) return "";
        return value.length() <= max ? value : value.substring(0, max);
    }
}
