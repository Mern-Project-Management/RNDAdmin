import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Plus, Eye } from 'lucide-react';
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const VideoTable = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const navigate = useNavigate();

  const fetchVideos = async () => {
    try {
      const response = await axios.get('/api/video/getVideos');
      setVideos(response.data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      try {
        await axios.delete(`/api/video/deleteVideo?id=${id}`);
        fetchVideos();
      } catch (error) {
        console.error("Error deleting video:", error);
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/video-form?id=${id}`);
  };

  const truncateText = (text, maxLength = 50) => {
    const strippedText = text.replace(/<[^>]*>/g, '');
    return strippedText.length > maxLength 
      ? strippedText.substring(0, maxLength) + '...' 
      : strippedText;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Video Management</h1>
        <Button 
          onClick={() => navigate('/video-form')}
          className="bg-[#ffd333] text-[#1a1a1a] hover:bg-[#edc32f] hover:text-[#1a1a1a] font-semibold"
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Video
        </Button>
      </div>

      <div className="overflow-x-auto border rounded-lg shadow">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase">
            <tr>
              <th className="px-6 py-3">Heading</th>
              <th className="px-6 py-3">Slug</th>
              <th className="px-6 py-3">Subheading</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3">Image</th>
              <th className="px-6 py-3">Video</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.length > 0 ? (
              videos.map((video) => (
                <tr key={video._id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{video.heading}</td>
                  <td className="px-6 py-4">
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {video.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4">{video.subheading}</td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">
                        {truncateText(video.description || '', 40)}
                      </span>
                      {video.description && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedVideo(video)}
                          className="p-1 h-6"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {video.image ? (
                      <img
                        src={`/api/uploads/${video.image}`}
                        alt={video.alt || "Video Thumbnail"}
                        className="h-16 w-24 object-cover rounded"
                      />
                    ) : (
                      <span className="text-gray-400">No Image</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {video.video ? (
                      <video
                        src={`/api/video/download/${video.video}`}
                        className="h-16 w-24 object-cover rounded"
                        controls
                        preload="metadata"
                      />
                    ) : (
                      <span className="text-gray-400">No Video</span>
                    )}
                  </td>
                  <td className="px-6 py-4 flex gap-4">
                    <button onClick={() => handleEdit(video._id)} title="Edit">
                      <FaEdit className="h-5 w-5 text-green-500 hover:text-green-700 transition" />
                    </button>
                    <button onClick={() => handleDelete(video._id)} title="Delete">
                      <FaTrashAlt className="h-5 w-5 text-red-500 hover:text-red-700 transition" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No videos found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Description Preview Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">{selectedVideo.heading}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedVideo(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedVideo.description }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoTable;
