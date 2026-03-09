import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const VideoForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const [formData, setFormData] = useState({
    heading: '',
    slug: '',
    subheading: '',
    description: '',
    alt: '',
    imgTitle: '',
    video: null,
    image: null
  });

  const [preview, setPreview] = useState({
    video: null,
    image: null
  });

  // ReactQuill modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'link', 'image'
  ];

  useEffect(() => {
    if (id) {
      const fetchVideo = async () => {
        try {
          const response = await axios.get(`/api/video/getVideoById?id=${id}`);
          const data = response.data;
          setFormData({
            heading: data.heading,
            slug: data.slug || '',
            subheading: data.subheading,
            description: data.description,
            alt: data.alt,
            imgTitle: data.imgTitle,
            video: null,
            image: null
          });
          setPreview({
            video: data.video ? `/uploads/${data.video}` : null,
            image: data.image ? `/uploads/${data.image}` : null
          });
        } catch (error) {
          console.error("Error fetching video details:", error);
        }
      };
      fetchVideo();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Auto-generate slug from heading when creating new video
      if (name === 'heading' && !id) {
        newData.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
      }
      return newData;
    });
  };

  const handleDescriptionChange = (value) => {
    setFormData(prev => ({ ...prev, description: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
      setPreview(prev => ({ ...prev, [name]: URL.createObjectURL(files[0]) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('heading', formData.heading);
    data.append('slug', formData.slug);
    data.append('subheading', formData.subheading);
    data.append('description', formData.description);
    data.append('alt', formData.alt);
    data.append('imgTitle', formData.imgTitle);
    if (formData.video) data.append('video', formData.video);
    if (formData.image) data.append('image', formData.image);

    try {
      if (id) {
        await axios.put(`/api/video/updateVideo?id=${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert("Video updated successfully!");
      } else {
        await axios.post('/api/video/createVideo', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert("Video created successfully!");
      }
      navigate('/video-table');
    } catch (error) {
      console.error("Error saving video:", error);
      alert("Failed to save video.");
    }
  };

  return (
    <div className="p-6 w-full max-w-7xl mx-auto bg-white rounded-lg shadow mt-10">
      <h2 className="text-2xl font-bold mb-6">{id ? 'Edit Video' : 'Add New Video'}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="heading">Heading *</Label>
            <Input
              id="heading"
              name="heading"
              value={formData.heading}
              onChange={handleChange}
              placeholder="Enter video heading"
              required
            />
          </div>

          <div>
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="url-friendly-slug"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Auto-generated from heading. Edit if needed.
            </p>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="subheading">Subheading *</Label>
            <Input
              id="subheading"
              name="subheading"
              value={formData.subheading}
              onChange={handleChange}
              placeholder="Enter video subheading"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description *</Label>
          <div className="mt-2">
            <ReactQuill
              theme="snow"
              value={formData.description}
              onChange={handleDescriptionChange}
              modules={modules}
              formats={formats}
              placeholder="Write a detailed description..."
              style={{ height: '250px', marginBottom: '50px' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-8">
          <div>
            <Label htmlFor="alt">Alt Text</Label>
            <Input
              id="alt"
              name="alt"
              value={formData.alt}
              onChange={handleChange}
              placeholder="Image alt text"
            />
          </div>
          <div>
            <Label htmlFor="imgTitle">Image Title</Label>
            <Input
              id="imgTitle"
              name="imgTitle"
              value={formData.imgTitle}
              onChange={handleChange}
              placeholder="Image title"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="image">Upload Image</Label>
            <Input
              id="image"
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-2"
            />
            {preview.image && (
              <div className="mt-3">
                <img
                  src={preview.image}
                  alt="Preview"
                  className="h-40 w-auto object-cover rounded border"
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="video">Upload Video</Label>
            <Input
              id="video"
              type="file"
              name="video"
              accept="video/*"
              onChange={handleFileChange}
              className="mt-2"
            />
            {preview.video && (
              <div className="mt-3">
                <video
                  src={preview.video}
                  controls
                  className="h-40 w-auto object-cover rounded border"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/video-table')}
          >
            Cancel
          </Button>
          <Button type="submit">
            {id ? 'Update Video' : 'Create Video'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VideoForm;