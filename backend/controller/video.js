const Video = require('../model/video');
const fs = require('fs');
const path = require('path');

// Create a new video entry
exports.createVideo = async (req, res) => {
  try {
    const { heading, subheading, description, alt, imgTitle, slug } = req.body;
    
    let video = null;
    let image = null;

    if (req.files) {
      if (req.files.video && req.files.video[0]) {
        video = 'uploads/' + req.files.video[0].filename;
      }
      if (req.files.image && req.files.image[0]) {
        image = 'uploads/' + req.files.image[0].filename;
      }
    }

    const newVideo = new Video({
      heading,
      slug,
      subheading,
      description,
      video,
      image,
      alt,
      imgTitle
    });

    await newVideo.save();
    res.status(201).json(newVideo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all video entries
exports.getVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single video entry by ID
exports.getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.query.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    res.status(200).json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single video entry by Slug
exports.getVideoBySlug = async (req, res) => {
  try {
    const video = await Video.findOne({ slug: req.query.slug });
    if (!video) return res.status(404).json({ message: 'Video not found' });
    res.status(200).json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a video entry by ID
exports.updateVideo = async (req, res) => {
  try {
    const { id } = req.query;
    const { heading, subheading, description, alt, imgTitle, slug } = req.body;
    
    const videoDoc = await Video.findById(id);
    if (!videoDoc) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const updateData = { heading, subheading, description, alt, imgTitle, slug };

    // Handle file updates
    if (req.files) {
      if (req.files.video && req.files.video[0]) {
        // Delete old video if exists
        if (videoDoc.video) {
          const oldVideoPath = path.join(__dirname, '..', videoDoc.video);
          if (fs.existsSync(oldVideoPath)) fs.unlinkSync(oldVideoPath);
        }
        updateData.video = 'uploads/' + req.files.video[0].filename;
      }

      if (req.files.image && req.files.image[0]) {
        // Delete old image if exists
        if (videoDoc.image) {
          const oldImagePath = path.join(__dirname, '..', videoDoc.image);
          if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
        }
        updateData.image = 'uploads/' + req.files.image[0].filename;
      }
    }

    const updatedVideo = await Video.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    res.status(200).json(updatedVideo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a video entry by ID
exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.query;
    const videoDoc = await Video.findById(id);
    
    if (!videoDoc) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Delete associated files
    if (videoDoc.video) {
      const videoPath = path.join(__dirname, '..', videoDoc.video);
      if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    }
    if (videoDoc.image) {
      const imagePath = path.join(__dirname, '..', videoDoc.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await Video.findByIdAndDelete(id);
    res.status(200).json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
