import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useSubmitApplicationMutation } from "@/slice/career/CareerForm";
import { useGetBannerByPageSlugQuery } from "@/slice/banner/banner";
import { Banner } from "../componets/Banner";
import axios from 'axios';
import career from '../images/career.jpg';
import ReCAPTCHA from "react-google-recaptcha";

export default function CareerForm() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    email: '',
    contactNo: '',
    postAppliedFor: '',
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);
  const [submitApplication, { isLoading }] = useSubmitApplicationMutation();
  const location = useLocation();
  const path = location.pathname.replace(/^\//, '') || 'career';
  const { data: banners, isLoading: isBannerLoading } = useGetBannerByPageSlugQuery(path);
  const [careerInfo, setCareerInfo] = useState(null);

  useEffect(() => {
    axios.get('/api/careerInfo')
      .then(response => {
        if (response.data.length > 0) {
          setCareerInfo(response.data[0]);
        }
      })
      .catch(error => {
        console.error('Error fetching career info:', error);
      });
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (file) {
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload only PDF, DOC, or DOCX files');
        e.target.value = null;
        return;
      }
      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        e.target.value = null;
        return;
      }
      setResumeFile(file);
    }
  };

  const handleReset = (e) => {
    e.preventDefault();
    setFormData({
      name: '',
      address: '',
      email: '',
      contactNo: '',
      postAppliedFor: '',
    });
    setResumeFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaValue) {
      alert('Please complete the reCAPTCHA');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      setIsUploading(true);
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      if (resumeFile) {
        formDataToSend.append('resumeFile', resumeFile);
      }

      // Directly send data using axios
      const response = await axios.post('/api/career/add', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        alert('Application submitted successfully!');
        handleReset(e);
        e.target.reset();
        setCaptchaValue(null); // Reset reCAPTCHA value
      } else {
        // alert('Failed to submit application. Please try again.');
      }
    } catch (error) {
      alert('Failed to submit application: ' + error.response?.data?.message || error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {isBannerLoading ? (
        <div>Loading banner...</div>
      ) : (
        <Banner
          imageUrl={banners && banners.length > 0 ? `/api/image/download/${banners[0].image}` : career}
        />
      )}
      <div className="sm:max-w-[75rem] w-full mx-auto">
        <nav className="py-4 px-4 sm:px-0 md:px-6">
          <div className="flex border-b border-gray-300 pb-4 items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
            <span className="text-gray-400">»</span>
            <span className="text-orange-500">Careers</span>
          </div>
        </nav>
        <div className="mb-7 px-4 md:px-6 sm:px-0">
          <h1 className="text-3xl font-bold">Careers</h1>
          <div className="bg-orange-500 h-1 w-12"></div>
        </div>
        {careerInfo && (
          <>
            <div className="mb-4">
              <div dangerouslySetInnerHTML={{ __html: careerInfo.info }} />
            </div>

            <div className="grid md:grid-cols-2 w-full gap-7 px-4 md:px-6 sm:px-0">
              <form className="space-y-6 w-full" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="name">Name*</Label>
                  <Input
                    id="name"
                    required
                    className="rounded-none"
                    value={formData.name}
                    onChange={handleInputChange}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address*</Label>
                  <Textarea
                    id="address"
                    required
                    className="rounded-none"
                    value={formData.address}
                    onChange={handleInputChange}
                    maxLength={500}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email*</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    className="rounded-none"
                    value={formData.email}
                    onChange={handleInputChange}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactNo">Contact No*</Label>
                  <Input
                    id="contactNo"
                    type="tel"
                    required
                    className="rounded-none"
                    value={formData.contactNo}
                    onChange={handleInputChange}
                    maxLength={20}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resume">Upload Your resume*</Label>
                  <div className="text-sm text-gray-500">[doc,docx OR pdf, max 5MB]</div>
                  <Input
                    id="resume"
                    type="file"
                    accept=".doc,.docx,.pdf"
                    required
                    className="rounded-none"
                    onChange={handleFileChange}
                  />
                </div>

                {/* Mobile-specific fields */}
                <div className="md:hidden space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="postAppliedFor">Post Applied For*</Label>
                    <Input
                      id="postAppliedFor"
                      required
                      className="rounded-none"
                      value={formData.postAppliedFor}
                      onChange={handleInputChange}
                      maxLength={100}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="bg-blue-700 rounded-sm text-lg py-6 hover:bg-blue-800"
                    disabled={isLoading || isUploading}
                  >
                    {isLoading || isUploading ? 'Submitting...' : 'Submit'}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    className="bg-orange-500 hover:bg-orange-600 text-lg py-6 rounded-sm"
                    onClick={handleReset}
                  >
                    Reset
                  </Button>
                </div>
              </form>
              <div className="hidden md:flex flex-col items-start justify-start w-full">
                <div className="w-full ml-10 flex justify-center relative -top-8 items-center">
                  <img
                    src={careerInfo.image ? `/api/image/download/${careerInfo.image}` : "no-image"}
                    alt="Career growth illustration"
                    className="object-contain w-full h-[80%]"
                  />
                </div>
                <div className="space-y-2 w-full relative -top-24">
                  <Label htmlFor="postAppliedFor">Post Applied For*</Label>
                  <Input
                    id="postAppliedFor"
                    required
                    className="rounded-none"
                    value={formData.postAppliedFor}
                    onChange={handleInputChange}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2 w-full relative -top-20">
                  <ReCAPTCHA
                    sitekey={import.meta.env.VITE_SITE_KEY}
                    onChange={(value) => setCaptchaValue(value)}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
