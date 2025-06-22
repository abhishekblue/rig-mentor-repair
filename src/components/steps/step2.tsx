"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import type { StepProps } from "../../types"

export default function Step2({ formData, setFormData, nextStep, prevStep }: StepProps) {
  const canProceed = formData.productModel.trim() && formData.serialNumber.trim()

  return (
    <div className="w-full flex-shrink-0 flex items-center justify-center p-8">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block p-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
            Product Details
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Help us identify your specific product with model and serial information
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10 space-y-10 animate-slide-up">
          <div className="space-y-4">
            <label className="block text-lg font-bold text-gray-900">
              Product Model
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.productModel}
                onChange={(e) => setFormData({ ...formData, productModel: e.target.value })}
                placeholder="e.g., MacBook Pro 16-inch M2, RTX 4080 Gaming X"
                className="w-full px-6 py-5 text-lg bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 placeholder-gray-400"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-lg font-bold text-gray-900">
              Serial Number
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="Enter serial number, model number, or SKU"
                className="w-full px-6 py-5 text-lg bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 placeholder-gray-400"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
            <p className="text-sm text-gray-500 flex items-center space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Usually found on a sticker on your device or in settings</span>
            </p>
          </div>

          <div className="flex justify-between items-center pt-8">
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
