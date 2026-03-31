// Lightweight frontend-only Gemini proxy used to avoid real API calls.
// Simulates analysis + quick edit and returns deterministic mock data.

export type FakeGeminiProgress = { percent: number; message: string };

export interface FakeGeminiProxyOptions {
  videoId: string;
  sourceUrl?: string;
  onProgress?: (progress: FakeGeminiProgress) => void;
  onComplete?: (result: { editedUrl?: string; summary: string; beats: string[] }) => void;
}

const progressPlan: { delay: number; percent: number; message: string }[] = [
  { delay: 400, percent: 18, message: "Proxy: warming up Gemini" },
  { delay: 1300, percent: 42, message: "Analyzing scenes & transcript" },
  { delay: 2300, percent: 68, message: "Drafting cut list (non-Gemini edit)" },
  { delay: 3200, percent: 88, message: "Rendering lightweight edit" },
  { delay: 4200, percent: 100, message: "Edit ready for approval" },
];

/**
 * Run the fake Gemini pipeline on the client. Returns a cancel function that clears timers.
 */
export function runFakeGeminiProxy(options: FakeGeminiProxyOptions): () => void {
  const timeouts: ReturnType<typeof setTimeout>[] = [];

  // Kick off with an immediate progress ping
  options.onProgress?.({ percent: 10, message: "Proxy: starting analysis" });

  progressPlan.forEach((step) => {
    const t = setTimeout(() => {
      options.onProgress?.({ percent: step.percent, message: step.message });

      if (step.percent === 100) {
        options.onComplete?.({
          editedUrl: options.sourceUrl,
          summary: "Lightweight edit completed",
          beats: [
            "Silence detection & trims",
            "Jump-cuts for pauses",
            "Auto color balance",
            "Soft outro fade",
          ],
        });
      }
    }, step.delay);

    timeouts.push(t);
  });

  return () => timeouts.forEach((t) => clearTimeout(t));
}

// Axios-shaped helper used by aiAPI.analyzeVideo so callers don't hit the real API.
export function fakeAnalyzeVideo(body: any) {
  return new Promise<{ data: any }>((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          proxy: true,
          summary: `Mock Gemini analysis for ${body?.title || "video"}`,
          highlights: [
            "Scene pacing is smooth",
            "Detected long pause at 00:02:14",
            "Suggested B-roll slots at 00:00:48 and 00:03:10",
          ],
          confidence: 0.82,
        },
      });
    }, 600);
  });
}
