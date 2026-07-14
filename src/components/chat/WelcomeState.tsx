interface WelcomeStateProps {
  onSend: (content: string) => void;
  isGenerating: boolean;
}

const SUGGESTED_PROMPTS = [
  "Focus on the Tuscan drive: suggest a scenic route from Florence to Siena avoiding highways.",
  "Suggest boutique hotels in Florence with historical charm.",
  "Create a 3-day itinerary for exploring Amalfi coast.",
  "What are some must-try local dishes in Kyoto?"
];

export function WelcomeState({ onSend, isGenerating }: WelcomeStateProps) {
  return (
    <div className="flex flex-col gap-[48px] w-full">
      {/* Bot Initial Message */}
      <div className="flex gap-md items-start max-w-[85%]">
        <div className="pt-[8px] text-brand-text/90 leading-relaxed text-[16px]">
          <p>
            Hello! I'm Cora, your personal travel companion. I see we were planning a two-week trip to Italy.
            Shall we start by looking at some boutique hotels in Florence, or would you prefer to map out the
            Tuscan countryside drive first?
          </p>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="flex flex-col gap-[12px] w-full">
        <span className="text-[12px] font-medium text-brand-text/30 uppercase tracking-wider pl-1">
          Suggested plans
        </span>
        <div className="flex flex-wrap gap-sm">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onSend(prompt)}
              disabled={isGenerating}
              className="text-left px-[20px] py-[12px] border border-brand-border rounded-full hover:border-brand-sage/40 hover:bg-brand-sage/5 transition-all duration-200 text-[14px] text-brand-text/80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed max-w-full leading-[1.5] bg-white shadow-xs"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
