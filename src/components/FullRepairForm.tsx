"use client"

import { useEffect, useState } from "react"
import type { FormData } from "../types"
import Stepper from "./stepper"
import Step1 from "./steps/step1"
import Step2 from "./steps/step2"
import Step3 from "./steps/step3"
import Step4 from "./steps/step4"
import Step5 from "./steps/step5"
import { supabase } from "../lib/supabaseClient"

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    productType: "",
    productModel: "",
    serialNumber: "",
    issueDescription: "",
    uploadedFiles: [],
    pickupDate: "",
  })

  const totalSteps = 5

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const stepProps = {
    formData,
    setFormData,
    nextStep,
    prevStep,
  }

  // ✅ If user is already logged in + pendingRepair exists, insert to Supabase
  useEffect(() => {
    const saved = localStorage.getItem("pendingRepair")
    if (!saved) return

    fetch("https://rigmentor.in/wp-json/wp/v2/users/me", {
      credentials: "include"
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not logged in")
        return res.json()
      })
      .then((user) => {
        const userEmail = user.email
        const parsed = JSON.parse(saved)

        supabase
          .from("repairs")
          .insert([
            {
              user_id: userEmail, // ✅ store email in user_id column
              product_type: parsed.productType,
              product_model: parsed.productModel,
              serial_number: parsed.serialNumber,
              issue_description: parsed.issueDescription,
              pickup_date: parsed.pickupDate,
              uploaded_file_url: null,
              status: "Request Submitted"
            }
          ])
          .then(({ error }) => {
            if (error) {
              console.error("Auto-insert error:", error)
            } else {
              localStorage.setItem("showRepairSuccess", "true")
              localStorage.removeItem("pendingRepair")
              window.location.href = "/repair"
            }
          })
      })
      .catch(() => {
        // user not logged in = no insert
      })
  }, [])

  useEffect(() => {
    if (localStorage.getItem("showRepairSuccess")) {
      alert("✅ Repair request submitted!")
      localStorage.removeItem("showRepairSuccess")
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-float"></div>
      </div>

      <Stepper currentStep={currentStep} totalSteps={totalSteps} />

      <div className="flex-1 overflow-hidden relative">
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${(currentStep - 1) * 100}%)` }}
        >
          <Step1 {...stepProps} />
          <Step2 {...stepProps} />
          <Step3 {...stepProps} />
          <Step4 {...stepProps} />
          <Step5 {...stepProps} />
        </div>
      </div>
    </div>
  )
}
