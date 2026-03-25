import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'
import { useAddInquiryMutation } from '@/slice/inquiry/inquiry'
import Swal from 'sweetalert2'
import ReCAPTCHA from 'react-google-recaptcha'
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  MapPin, 
  Globe, 
  MessageSquare,
  ArrowUpRight
} from 'lucide-react'

export default function RightSection() {
  const [loading, setLoading] = useState(false)
  const [captchaValue, setCaptchaValue] = useState(null)
  const [addInquiry] = useAddInquiryMutation()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!captchaValue) {
      toast.error('Please complete the reCAPTCHA')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData(e.target)
      const data = Object.fromEntries(formData.entries())

      // Synthesize name for model consistency
      data.name = `${data.firstName} ${data.lastName}`.trim();
      // Ensure service is set from department if using that field name
      data.service = data.department;

      await addInquiry(data).unwrap()

      Swal.fire({
        title: 'Thank You!',
        text: 'Your inquiry has been submitted successfully. We will get back to you soon.',
        icon: 'success',
        confirmButtonColor: '#ffc108',
        timer: 3000,
        timerProgressBar: true
      })
      
      e.target.reset()
      setCaptchaValue(null)
    } catch (error) {
      toast.error(error.data?.message || error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const InputField = ({ label, name, icon: Icon, type = "text", required = false, placeholder }) => (
    <div className="mb-8 group">
      <label className="block text-gray-800 font-semibold mb-2 transform transition-all group-focus-within:text-[#ffc108]">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative border-b-2 border-gray-200 group-focus-within:border-[#ffc108] transition-colors duration-300">
        <input
          required={required}
          name={name}
          type={type}
          placeholder={placeholder}
          className="w-full py-2 bg-transparent outline-none text-gray-700 placeholder:text-gray-300 transition-all pl-0 pr-10"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ffc108] transition-colors">
          <Icon size={20} strokeWidth={1.5} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-white p-8 lg:p-12 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-50">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Quick Help</h2>
        <div className="w-16 h-1 bg-yellow-400 rounded-full"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <InputField 
            label="What's your first name?" 
            name="firstName" 
            icon={User} 
            required 
            placeholder="First name here"
          />
          <InputField 
            label="What's your last name?" 
            name="lastName" 
            icon={User} 
            required 
            placeholder="Last name here"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <InputField 
            label="What's your organisation?" 
            name="organisation" 
            icon={Building2} 
            required 
            placeholder="Company name"
          />
          <InputField 
            label="What's your department/service?" 
            name="department" 
            icon={Briefcase} 
            placeholder="e.g. Sales, Support"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <InputField 
            label="Where are you from?" 
            name="country" 
            icon={Globe} 
            placeholder="Country"
          />
          <InputField 
            label="What's your phone number?" 
            name="phone" 
            type="tel" 
            icon={Phone} 
            placeholder="Phone number"
          />
        </div>

        <InputField 
          label="What's your e-mail?" 
          name="email" 
          type="email" 
          icon={Mail} 
          required 
          placeholder="Enter your mail here"
        />

        <div className="mb-10 group">
          <label className="block text-gray-800 font-semibold mb-2 group-focus-within:text-[#ffc108]">
            Your Message<span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative border-b-2 border-gray-200 group-focus-within:border-[#ffc108] transition-colors duration-300">
            <textarea
              required
              name="message"
              rows={3}
              placeholder="Tell us more about your inquiry..."
              className="w-full py-2 bg-transparent outline-none text-gray-700 placeholder:text-gray-300 resize-none pr-10"
            />
            <div className="absolute right-2 top-4 text-gray-400 group-focus-within:text-[#ffc108] transition-colors">
              <MessageSquare size={20} strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <div className="mb-8 overflow-hidden rounded-lg border border-gray-100 p-2 bg-gray-50/50">
          <ReCAPTCHA
            sitekey={import.meta.env.VITE_SITE_KEY}
            onChange={(value) => setCaptchaValue(value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="group flex items-center gap-3 bg-white border-2 border-gray-900 text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-gray-900 hover:text-white transition-all duration-300 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Send Message'}
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${loading ? 'bg-gray-200' : 'bg-gray-100 group-hover:bg-white'} transition-colors`}>
              <ArrowUpRight className={`w-5 h-5 ${loading ? 'text-gray-400' : 'text-gray-900 group-hover:text-gray-900'}`} />
            </div>
          </button>
        </div>
      </form>
    </div>
  )
}