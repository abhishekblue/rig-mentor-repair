"use client"

import type { ProductType } from "../types"

interface ProductCardProps {
  product: ProductType
  isSelected: boolean
  onSelect: (productId: string) => void
}

export default function ProductCard({ product, isSelected, onSelect }: ProductCardProps) {
  return (
    <button
      onClick={() => onSelect(product.id)}
      className={`group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border ${
        isSelected
          ? "border-blue-500 bg-gradient-to-br from-blue-50/80 to-purple-50/80 shadow-blue-500/20"
          : "border-white/30 hover:border-blue-300/50 hover:bg-white/80"
      }`}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Glow effect */}
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl animate-pulse" />
      )}

      <div className="relative flex flex-col items-center space-y-6">
        <div className="relative">
          <div
            className={`w-72 h-48 rounded-2xl overflow-hidden transition-all duration-500 ${
              isSelected
                ? "ring-4 ring-blue-500/30 shadow-lg shadow-blue-500/20"
                : "group-hover:ring-4 group-hover:ring-blue-300/20"
            }`}
          >
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.label}
              className="w-full h-full transition-transform duration-500 group-hover:scale-110 object-contain pr-2"
            />
          </div>

          {/* Selection indicator */}
          {isSelected && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
            {product.label}
          </h3>
          <div className="mt-2 h-1 w-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full group-hover:w-full transition-all duration-500 mx-auto" />
        </div>
      </div>
    </button>
  )
}
