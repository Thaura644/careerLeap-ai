import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileUp, Sparkles, Loader2, CheckCheck, ArrowRight, FileText } from "lucide-react";
import { apiPost, apiPostMultipart } from "@/lib/api";

export interface ResumeSkill {
  name: string;
  category: string;
  inCatalog?: boolean;
}

interface ResumeAnalysisProps {
  onComplete: (skills: ResumeSkill[]) => void;
  className?: string;
}

const ResumeAnalysis: React.FC<ResumeAnalysisProps> = ({ onComplete, className }) => {
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [found, setFound] = useState<ResumeSkill[]>([]);
  const [source, setSource] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyze = async (text: string, label: string) => {
    if (!text.trim()) return;
    setAnalyzing(true);
    setError("");
    setFound([]);
    try {
      const res = await apiPost<{ ok: boolean; skills: ResumeSkill[]; source: string }>(
        "/resume/analyze",
        { text }
      );
      setFound(res.skills || []);
      setSource(res.source || "llm");
      setFileName(label);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not analyze the resume.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFile = async (file: File) => {
    setAnalyzing(true);
    setError("");
    setFound([]);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await apiPostMultipart<{ ok: boolean; skills: ResumeSkill[]; source: string }>(
        "/resume/analyze",
        fd
      );
      setFound(res.skills || []);
      setSource(res.source || "llm");
      setFileName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read that file.");
    } finally {
      setAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const pasted = resumeText.trim().length >= 40;

  return (
    <div className={className}>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Resume Analysis</h1>
        <p className="text-gray-600">
          Upload your resume — the AI reads it and surfaces the skills you've already proven.
          You'll pick which ones to keep in the next step.
        </p>
      </div>

      <Card className="p-6">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={analyzing}
              >
                <FileUp className="mr-1.5 h-4 w-4" /> Upload PDF / TXT
              </Button>
              <span className="text-xs text-muted-foreground">or paste your resume below</span>
            </div>
            {fileName && (
              <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5" /> {fileName}
              </p>
            )}
            <Textarea
              placeholder="Paste your resume text here… (at least a few lines works best)"
              className="min-h-[120px] text-sm"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              className="mt-3"
              onClick={() => analyze(resumeText, "pasted resume")}
              disabled={analyzing || !pasted}
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Analyzing…
                </>
              ) : (
                <>
                  <Sparkles className="mr-1.5 h-4 w-4" /> Analyze resume
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {found.length > 0 && (
          <div className="mt-5 rounded-md border border-leap-purple/20 bg-leap-purple/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCheck className="h-4 w-4 text-green-600" />
              <p className="text-sm font-medium">
                Found {found.length} skill{found.length === 1 ? "" : "s"} in your resume
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {found.map((s) => (
                <Badge key={s.name} variant="secondary" className="select-none">
                  {s.name}
                  <span className="ml-1.5 text-[10px] text-muted-foreground">{s.category}</span>
                </Badge>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {source === "llm"
                ? "Extracted by AI. These become suggestions in the next step — you decide which you actually have."
                : "These become suggestions in the next step."}
            </p>
          </div>
        )}

        {!found.length && !error && !analyzing && (
          <p className="mt-4 text-xs text-muted-foreground">
            No resume yet? That's fine — skip this step and rate your skills manually. You can
            always come back later.
          </p>
        )}
      </Card>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={() => onComplete([])}>
          Skip for now
        </Button>
        <Button className="bg-leap-purple" onClick={() => onComplete(found)}>
          {found.length > 0 ? "Use these skills & continue" : "Continue"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ResumeAnalysis;
