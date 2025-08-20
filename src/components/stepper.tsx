import type { StepperProps } from "../types"

export default function Stepper({ currentStep, totalSteps }: StepperProps) {
  return (
    <div className="bg-white/80 backdrop-blur-xl shadow-lg border border-white/20 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-2 py-3 sm:px-4 sm:py-4 md:px-8 md:py-6">
        <div className="flex items-center justify-center">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <div key={step} className="flex items-center">
              <div className="relative">
                <div
                  className={`w-6 h-6 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-500 ${
                    step <= currentStep
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-110"
                      : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                  }`}
                >
                  {step <= currentStep ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                {step <= currentStep && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse opacity-20"></div>
                )}
              </div>
              {step < totalSteps && (
                <div className="relative mx-2 sm:mx-4">
                  <div className="h-1 w-8 sm:w-16 md:w-24 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-700 ease-out ${
                        step < currentStep ? "w-full" : "w-0"
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <div className="text-xs sm:text-sm font-medium text-gray-600">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
      </div>
    </div>
  )
}
