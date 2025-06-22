"use client"

import type { StepProps } from "../../types"
import { productTypes } from "../../data/products"
import ProductCard from "../product-card"

export default function Step1({ formData, setFormData, nextStep }: StepProps) {
  const handleProductTypeSelect = (productId: string) => {
    setFormData({ ...formData, productType: productId })
    setTimeout(nextStep, 400)
  }

  return (
    <div className="w-full flex-shrink-0 flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block p-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
            What needs repair?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Select your product type to begin the repair process. We'll guide you through each step.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
          {productTypes.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isSelected={formData.productType === product.id}
              onSelect={handleProductTypeSelect}
            />
          ))}
        </div>

        <div className="mt-16 text-center animate-fade-in">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Select a product to continue</span>
          </div>
        </div>
      </div>
    </div>
  )
}
