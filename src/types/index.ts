
export interface FormData {
  productType: string
  productModel: string
  serialNumber: string
  issueDescription: string
  uploadedFile: File | null
  pickupDate: string
}

export interface ProductType {
  id: string
  label: string
  image: string
}

export interface StepperProps {
  currentStep: number
  totalSteps: number
}

export interface StepProps {
  formData: FormData
  setFormData: (data: FormData) => void
  nextStep: () => void
  prevStep: () => void
}

export interface ServiceCardProps {
  icon: string;
  title: string;
  description: string;
}

