"use client"

import type React from "react"
import { useRef } from "react"
import { ChevronLeft, ChevronRight, Upload, X, ImageIcon, Video } from "lucide-react"
import type { StepProps } from "../../types"

export default function Step3({ formData, setFormData, nextStep, prevStep }: StepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canProceed = formData.issueDescription.trim()

const MAX_FILES = 3;
const MAX_IMAGE_SIZE_MB = 5;
const MAX_VIDEO_SIZE_MB = 10;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime"];

const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  if (files.length > MAX_FILES) {
    alert(`❌ You can only upload up to ${MAX_FILES} files.`);
    return;
  }

  const validFiles: File[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      alert("❌ Only JPG, PNG, WEBP, MP4, or MOV files allowed.");
      return;
    }

    const sizeLimit = isImage ? MAX_IMAGE_SIZE_MB : MAX_VIDEO_SIZE_MB;
    if (file.size > sizeLimit * 1024 * 1024) {
      alert(
        `❌ File too large. Images must be under ${MAX_IMAGE_SIZE_MB}MB, videos under ${MAX_VIDEO_SIZE_MB}MB.`
      );
      return;
    }

    validFiles.push(file);
  }

  setFormData({ ...formData, uploadedFiles: validFiles });
};


const removeFile = (index: number) => {
  const updatedFiles = [...formData.uploadedFiles];
  updatedFiles.splice(index, 1);
  setFormData({ ...formData, uploadedFiles: updatedFiles });
};

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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
            Describe the Issue
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Tell us what's wrong so our technicians can prepare the right tools and parts
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10 space-y-10 animate-slide-up">
          <div className="space-y-4">
            <label className="block text-lg font-bold text-gray-900">
              Issue Description
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <textarea
                value={formData.issueDescription}
                onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
                placeholder="Please describe the problem in detail. What symptoms are you experiencing? When did it start? Any error messages?"
                rows={6}
                className="w-full px-6 py-5 text-lg bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 resize-none placeholder-gray-400"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-lg font-bold text-gray-900">
              Upload Images or Videos
              <span className="text-gray-500 font-normal ml-2">(Optional)</span>
            </label>

            {formData.uploadedFiles.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl group-hover:from-blue-200 group-hover:to-purple-200 transition-colors duration-300">
                  <Upload size={32} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-700 mb-2">Click to upload files</p>
                  <p className="text-sm text-gray-500">
                    Supported formats: JPG, PNG (up to 2MB) &nbsp;|&nbsp; MP4, MOV (up to 10MB)
                  </p>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <div className="flex items-center space-x-1">
                    <ImageIcon size={16} />
                    <span>Images</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Video size={16} />
                    <span>Videos</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {formData.uploadedFiles.map((file, idx) => (
                <div key={idx} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200 flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      {file.type.startsWith("image/") ? (
                        <ImageIcon size={20} className="text-green-600" />
                      ) : (
                        <Video size={20} className="text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(idx)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              {formData.uploadedFiles.length < 3 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 px-4 py-2 rounded-xl text-blue-600 hover:bg-blue-50 transition-all text-sm font-semibold border border-blue-100"
                >
                  + Add another file
                </button>
              )}
            </div>
          )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
              multiple
            />
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
