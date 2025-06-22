"use client"

import { useState } from "react"
import type { StepProps } from "../../types"
import { supabase } from "../../lib/supabaseClient"
import type { SupabaseClient } from '@supabase/supabase-js'
import { ChevronLeft, ShoppingCart } from "lucide-react"


function generateTrackingID(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

function getUniqueTrackingID(supabase: SupabaseClient, length = 6): Promise<string>  {
  return new Promise((resolve) => {
    function tryGenerate() {
      const code = generateTrackingID(length)
      supabase
        .from('repairs')
        .select('tracking_id')
        .eq('tracking_id', code)
        .single()
        .then(({ data }) => {
          if (!data) {
            resolve(code)
          } else {
            tryGenerate() // Try again if duplicate
          }
        })
    }
    tryGenerate()
  })
}


export default function Step5({ formData, prevStep }: StepProps) {
  const [checkingLogin, setCheckingLogin] = useState(false)

  // Helper: Uploads file to Supabase Storage & returns public URL
  async function uploadFileToStorage(file: File, userEmail: string) {
    const filePath = `${userEmail}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage
      .from('repairs')
      .upload(filePath, file, { cacheControl: '3600', upsert: false })
    if (error) throw error

    const { data } = supabase.storage
      .from('repairs')
      .getPublicUrl(filePath)
    return data.publicUrl
  }

  const handleLoginPopup = () => {
    localStorage.setItem("pendingRepair", JSON.stringify(formData))

    const popup = window.open(
      "https://rigmentor.in/my-account?redirect_to=about:blank",
      "loginPopup",
      "width=500,height=700"
    )

    setCheckingLogin(true)

    let userEmail: string | null = null

    const interval = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(interval)
        setCheckingLogin(false)
        return
      }

      fetch("https://rigmentor.in/wp-json/wp/v2/users/me", {
        credentials: "include"
      })
        .then((res) => {
          if (res.ok) {
            clearInterval(interval)
            popup.close()
            return res.json()
          } else {
            throw new Error("Not logged in")
          }
        })
        .then(async (user) => {
          userEmail = user.email

          const saved = localStorage.getItem("pendingRepair")
          if (saved) {
            const parsed = JSON.parse(saved)

            // --- File upload step ---
            const uploadedFileUrls: string[] = [];
            if (formData.uploadedFiles && formData.uploadedFiles.length && userEmail) {
              for (const file of formData.uploadedFiles) {
                try {
                  const url = await uploadFileToStorage(file, userEmail);
                  uploadedFileUrls.push(url);
                } catch (err) {
                  console.error(err);
                }
              }
            }

            // --- Generate unique tracking ID and insert repair row ---
            getUniqueTrackingID(supabase).then((tracking_id) => {
              supabase
                .from("repairs")
                .insert([
                  {
                    user_id: userEmail,
                    product_type: parsed.productType,
                    product_model: parsed.productModel,
                    serial_number: parsed.serialNumber,
                    issue_description: parsed.issueDescription,
                    pickup_date: parsed.pickupDate,
                    uploaded_file_url: uploadedFileUrls.join(","), // <-- Use actual URL if present
                    status: "Request Submitted",
                    tracking_id
                  }
                ])
                .select()
                .then(({ data, error }) => {
                  if (error) {
                    console.error("Insert error:", error)
                    setCheckingLogin(false)
                    alert("❌ Failed to submit repair request.")
                    return
                  }

                  const repairId = data?.[0]?.id

                  if (repairId) {
                    supabase
                      .from("repair_status_logs")
                      .insert([
                        {
                          repair_id: repairId,
                          status: "Request Submitted",
                        }
                      ])
                      .then(({ error: logError }) => {
                        if (logError) {
                          console.error("Status log insert failed:", logError)
                        }
                        alert("✅ Repair request submitted! Check details in My Account > Repairs")
                        localStorage.removeItem("pendingRepair")
                        window.location.href = "/repair"
                      })
                  } else {
                    alert("❌ Repair submitted but could not log status.")
                    setCheckingLogin(false)
                  }
                })
            })
          }
        })
        .catch((err) => {
          console.error("Login check or insert failed:", err)
          setCheckingLogin(false)
        })
    }, 2000)
  }



  return (
    <div className="w-full flex-shrink-0 flex items-center justify-center p-8">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block p-4 bg-gradient-to-r from-green-600/10 to-blue-600/10 rounded-2xl mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-blue-800 bg-clip-text text-transparent mb-6">
            Almost Done!
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Sign in to your account to complete your repair request and track progress
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10 animate-slide-up">
          <div className="space-y-6">
            <button
              onClick={handleLoginPopup}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 px-8 rounded-2xl text-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center space-x-3">
                <ShoppingCart size={24} />
                <span>{checkingLogin ? "Waiting for login..." : "Login or SignUp with Rig Mentor"}</span>
              </div>
            </button>
          </div>
          <div className="mt-10 p-6 bg-gradient-to-r from-blue-50/80 to-purple-50/80 rounded-2xl border border-blue-200/30">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-800 mb-1">Why sign in?</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Track your repair status in real-time</li>
                  <li>• Access repair history and warranties</li>
                  <li>• Receive updates via email and SMS</li>
                  <li>• Manage multiple device repairs</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-8">
            <button
              onClick={prevStep}
              className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 rounded-xl transition-all duration-200"
            >
              <ChevronLeft size={20} className="mr-2" />
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}