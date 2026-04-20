export default function Stepper({ steps, current }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => (
        <div key={step.id} className="flex flex-1 items-center">
          <div className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {i > 0 && (
                <div className={`h-0.5 flex-1 transition-colors ${current > steps[i - 1].id ? "bg-primary" : "bg-border"}`} />
              )}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  current === step.id
                    ? "bg-primary text-white shadow-card"
                    : current > step.id
                    ? "bg-primary text-white"
                    : "bg-white text-muted border border-border"
                }`}
              >
                {current > step.id ? (
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 flex-1 transition-colors ${current > step.id ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
            <p className={`mt-1.5 text-[11px] font-medium ${current >= step.id ? "text-dark" : "text-muted"}`}>
              {step.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
