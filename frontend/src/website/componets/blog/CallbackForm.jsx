import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { useAddInquiryMutation } from '@/slice/inquiry/inquiry'
import Swal from 'sweetalert2'
import ReCAPTCHA from 'react-google-recaptcha'
import { 
  User, 
  Mail, 
  Phone, 
  MessageSquare,
  ArrowUpRight
} from 'lucide-react'

export default function CallbackForm() {
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
      
      // Tag it as coming from Blog Page
      data.source = "Blog Page Callback";
      data.url = window.location.href;

      await addInquiry(data).unwrap()

      Swal.fire({
        title: 'Request Received!',
        text: 'We will call you back shortly.',
        icon: 'success',
        confirmButtonColor: '#ffc108',
        timer: 3000
      })
      
      e.target.reset()
      setCaptchaValue(null)
    } catch (error) {
      toast.error(error.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const InputField = ({ label, name, icon: Icon, type = "text", required = false, placeholder }) => (
    <div className="mb-6 group">
      <label className="block text-gray-800 text-sm font-semibold mb-1 group-focus-within:text-[#ffc108] transition-colors">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative border-b border-gray-200 group-focus-within:border-[#ffc108] transition-colors duration-300">
        <input
          required={required}
          name={name}
          type={type}
          placeholder={placeholder}
          className="w-full py-2 bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-300 transition-all pl-0 pr-8"
        />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ffc108] transition-colors">
          <Icon size={16} strokeWidth={1.5} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg border border-gray-50 relative overflow-hidden group">
      {/* Decorative background element */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-yellow-400/10 rounded-full blur-2xl group-hover:bg-yellow-400/20 transition-all duration-500"></div>
      
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 border-l-4 border-yellow-400 pl-3">Request a Callback</h2>
        <p className="text-xs text-gray-500 mt-2">Need expert advice? Leave your details below.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <InputField 
          label="Your Name" 
          name="name" 
          icon={User} 
          required 
          placeholder="Enter your name"
        />
        
        <InputField 
          label="Phone Number" 
          name="phone" 
          type="tel" 
          icon={Phone} 
          required 
          placeholder="Enter phone number"
        />

        <InputField 
          label="Email Address" 
          name="email" 
          type="email" 
          icon={Mail} 
          required 
          placeholder="Enter email"
        />

        <div className="mb-6 group">
          <label className="block text-gray-800 text-sm font-semibold mb-1 group-focus-within:text-[#ffc108]">
            Message/Service
          </label>
          <div className="relative border-b border-gray-200 group-focus-within:border-[#ffc108] transition-colors duration-300">
            <textarea
              name="message"
              rows={2}
              placeholder="How can we help?"
              className="w-full py-2 bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-300 resize-none pr-8"
            />
            <div className="absolute right-0 top-3 text-gray-400 group-focus-within:text-[#ffc108] transition-colors">
              <MessageSquare size={16} strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <div className="mb-6 scale-90 origin-left">
          <ReCAPTCHA
            sitekey={import.meta.env.VITE_SITE_KEY}
            onChange={(value) => setCaptchaValue(value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full group flex items-center justify-between bg-gray-900 text-[#1a1a1a]-[#ffc108] transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Request Now'}
          <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </form>
    </div>
  )
}
