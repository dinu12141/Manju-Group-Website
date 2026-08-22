import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
}

interface CheckoutStepperProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (index: number) => void;
}

export function CheckoutStepper({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}: CheckoutStepperProps) {
  return (
    <nav aria-label="Checkout progress">
      <ol role="list" className="flex items-start">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = currentStep === index;
          const isLast = index === steps.length - 1;
          const isClickable = isCompleted && !!onStepClick;

          return (
            <li
              key={step.id}
              role="listitem"
              aria-current={isCurrent ? "step" : undefined}
              className={cn("flex flex-col items-center", !isLast && "flex-1")}
            >
              {/* Circle + connector row */}
              <div className="flex items-center w-full">
                <button
                  type="button"
                  onClick={isClickable ? () => onStepClick!(index) : undefined}
                  disabled={!isClickable}
                  aria-label={`${step.label}${isCompleted ? " — completed" : isCurrent ? " — current step" : ""}`}
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F85606] focus-visible:ring-offset-2",
                    isCompleted
                      ? "bg-[#0F2D5E] text-white"
                      : isCurrent
                        ? "border-2 border-[#0F2D5E] bg-white text-[#F85606]"
                        : "border-2 border-gray-200 bg-white text-gray-300",
                    isClickable && "cursor-pointer hover:scale-105"
                  )}
                >
                  {isCompleted ? (
                    <Check size={16} strokeWidth={2.5} />
                  ) : (
                    <span className="flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4">
                      {step.icon}
                    </span>
                  )}
                </button>

                {/* Connector line */}
                {!isLast && (
                  <div className="flex-1 h-px bg-gray-200 relative overflow-hidden mx-1">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-[#0F2D5E]"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: isCompleted ? 1 : 0 }}
                      style={{ originX: 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    />
                  </div>
                )}
              </div>

              {/* Label below circle */}
              <div className="mt-2 text-center px-1 hidden sm:block">
                <p
                  className={cn(
                    "text-[11px] font-semibold leading-tight transition-colors",
                    isCurrent
                      ? "text-[#0F2D5E] font-bold"
                      : isCompleted
                        ? "text-[#0F2D5E]"
                        : "text-gray-400"
                  )}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {step.description}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
