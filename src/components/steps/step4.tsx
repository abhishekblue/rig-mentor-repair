"use client"

import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import type { StepProps } from "../../types"

export default function Step4({ formData, setFormData, nextStep, prevStep }: StepProps) {
  const canProceed = formData.pickupDate

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  const getFormattedDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="w-full flex-shrink-0 flex items-center justify-center p-8">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block p-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
            Select Pickup Date
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Choose when you'd like us to collect your device for repair
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10 animate-slide-up">
          <div className="flex flex-col items-center space-y-8">
            <div className="bg-gradient-to-br from-blue-50/80 to-purple-50/80 p-8 rounded-3xl border border-blue-200/30">
              <div className="text-center mb-6">
                <Calendar size={48} className="text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pickup Date</h3>
                <p className="text-gray-600">Select a future date for device collection</p>
              </div>

              <input
                type="date"
                value={formData.pickupDate}
                onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                min={getTodayDate()}
                className="text-2xl font-bold text-center bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl px-8 py-4 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
              />

              {formData.pickupDate && (
                <div className="mt-6 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40">
                  <p className="text-center text-gray-700">
                    <span className="font-semibold">Selected: </span>
                    {getFormattedDate(formData.pickupDate)}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200/50 max-w-md">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                  <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-800 mb-1">Pickup Information</p>
                  <p className="text-sm text-amber-700">
                    We'll contact you to confirm the exact pickup time and provide tracking information.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-10">
            <button
              onClick={prevStep}
              className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 rounded-xl transition-all duration-200"
            >
              <ChevronLeft size={20} className="mr-2" />
              Back
            </button>

            <button
              onClick={nextStep}
              disabled={!canProceed}
              className={`flex items-center px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                canProceed
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-0.5"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Continue
              <ChevronRight size={20} className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
