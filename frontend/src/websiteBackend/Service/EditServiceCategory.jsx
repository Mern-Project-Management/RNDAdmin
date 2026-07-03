import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditServiceCategory = () => {
  const { categoryId, subCategoryId, subSubCategoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState("");
  const [dropdownPhoto, setDropdownPhoto] = useState(null);
  const [altText, setAltText] = useState("");
  const [dropdownPhotoAlt, setDropdownPhotoAlt] = useState("");
  const [imgtitle, setImgtitle] = useState("");
  const [currentPhoto, setCurrentPhoto] = useState("");
  const [currentDropdownPhoto, setCurrentDropdownPhoto] = useState("");
  const [slug, setSlug] = useState("");
  const [metatitle, setMetatitle] = useState("");
  const [metadescription, setMetadescription] = useState("");
  const [metakeywords, setMetakeywords] = useState("");
  const [metalanguage, setMetalanguage] = useState("")
  const [metacanonical, setMetacanonical] = useState("")
  const [metaschema, setMetaschema] = useState("")
  const [otherMeta, setOthermeta] = useState("")
  const [url, setUrl] = useState()
  const [changeFreq, setChangeFreq] = useState()
  const [priority, setPriority] = useState(0)
  const [status, setStatus] = useState("active");
  const [noIndex, setNoIndex] = useState(false);
  const [noFollow, setNoFollow] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      let urls = "";

      if (categoryId && subCategoryId && subSubCategoryId) {
        urls = `/api/services/getSpecificSubSubcategory?categoryId=${categoryId}&subCategoryId=${subCategoryId}&subSubCategoryId=${subSubCategoryId}`;
      } else if (categoryId && subCategoryId) {
        urls = `/api/services/getSpecificSubcategory?categoryId=${categoryId}&subCategoryId=${subCategoryId}`;
      } else if (categoryId) {
        urls = `/api/services/getSpecificCategory?categoryId=${categoryId}`;
      }

      try {
        const response = await axios.get(urls, { withCredentials: true });
        const { category, tag, description, photo, dropdownPhoto, alt, dropdownPhotoAlt, imgtitle, slug, metatitle, metadescription, metakeywords, metalanguage, metacanonical, metaschema, otherMeta, changeFreq, priority, status, noIndex, noFollow } = response.data;

        setCategory(category);
        setTag(tag);
        setDescription(description)
        setCurrentPhoto(photo);
        setCurrentDropdownPhoto(dropdownPhoto);
        setAltText(alt);
        setDropdownPhotoAlt(dropdownPhotoAlt);
        setImgtitle(imgtitle)
        setSlug(slug);
        setStatus(status);
        setNoIndex(noIndex || false);
        setNoFollow(noFollow || false);

        setMetatitle(metatitle);
        setMetadescription(metadescription)
        setMetakeywords(metakeywords);
        setMetalanguage(metalanguage);
        setMetacanonical(metacanonical || `https://www.rndtechnosoft.com/${slug}`);
        setMetaschema(metaschema);
        setOthermeta(otherMeta);
        setChangeFreq(changeFreq)
        setPriority(priority)
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [categoryId, subCategoryId, subSubCategoryId]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
  };

  const handleDropdownPhotoChange = (e) => {
    const file = e.target.files[0];
    setDropdownPhoto(file);
  };

  const handleDeleteImage = () => {
    setPhoto(null);
    setCurrentPhoto("");
    setAltText("");
    setImgtitle("");
  };

  const handleDeleteDropdownImage = () => {
    setDropdownPhoto(null);
    setCurrentDropdownPhoto("");
    setDropdownPhotoAlt("");
  };

  const generateUrl = () => {
    let baseUrl = "https://rndtechnosoft.com";
    if (categoryId && !subCategoryId) {
      return `${baseUrl}/${slug}`;
    } else if (categoryId && subCategoryId) {
      return `${baseUrl}/${slug}`;
    }
    return `${baseUrl}/${slug}`;
  };

  useEffect(() => {
    setUrl(generateUrl());
  }, [slug, categoryId, subCategoryId]);

  useEffect(() => {
    const generatedSlug = category.replace(/\s+/g, '-')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
    setSlug(generatedSlug);
    if (generatedSlug) {
      setMetacanonical(`https://www.rndtechnosoft.com/${generatedSlug}`);
    }
  }, [category])

  useEffect(() => {
    const cleanedSlug = slug.toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-');
    setSlug(cleanedSlug);
    if (cleanedSlug) {
      setMetacanonical(`https://www.rndtechnosoft.com/${cleanedSlug}`);
    }
  }, [slug])

  const handleSubmit = async (e) => {
    e.preventDefault();
    let urls = "";
    const formData = new FormData();
    formData.append("category", category);
    formData.append("description", description);
    formData.append("tag", tag);
    formData.append("alt", altText);
    formData.append("dropdownPhotoAlt", dropdownPhotoAlt);
    formData.append("imgtitle", imgtitle);
    formData.append('slug', slug);
    formData.append('metatitle', metatitle);
    formData.append('metakeywords', metakeywords);
    formData.append('metadescription', metadescription);
    formData.append('metalanguage', metalanguage);
    formData.append('metacanonical', metacanonical);
    formData.append('metaschema', metaschema);
    formData.append('otherMeta', otherMeta);
    formData.append('url', url);
    formData.append('changeFreq', changeFreq);
    formData.append('priority', priority);
    formData.append('status', status);
    formData.append('noIndex', noIndex);
    formData.append('noFollow', noFollow);

    if (photo instanceof File) {
      formData.append("photo", photo);
    }
    if (dropdownPhoto instanceof File) {
      formData.append("dropdownPhoto", dropdownPhoto);
    }

    if (categoryId && subCategoryId && subSubCategoryId) {
      urls = `/api/services/updatesubsubcategory?categoryId=${categoryId}&subCategoryId=${subCategoryId}&subSubCategoryId=${subSubCategoryId}`;
    } else if (categoryId && subCategoryId) {
      urls = `/api/services/updateSubCategory?categoryId=${categoryId}&subCategoryId=${subCategoryId}`;
    } else if (categoryId) {
      urls = `/api/services/updateCategory?categoryId=${categoryId}`;
    }

    try {
      const response = await axios.put(urls, formData, { withCredentials: true });
      toast.success("Service updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setTimeout(() => {
        navigate("/service-category");
      }, 1500);
    } catch (error) {
      console.error("Error updating data:", error);
      toast.error(error.response?.data?.message || "Failed to update service. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        let deleteUrl = "";
        if (categoryId && subCategoryId && subSubCategoryId) {
          deleteUrl = `/api/services/deleteSubSubCategory?categoryId=${categoryId}&subCategoryId=${subCategoryId}&subSubCategoryId=${subSubCategoryId}`;
        } else if (categoryId && subCategoryId) {
          deleteUrl = `/api/services/deleteSubCategory?categoryId=${categoryId}&subCategoryId=${subCategoryId}`;
        } else if (categoryId) {
          deleteUrl = `/api/services/deleteCategory?categoryId=${categoryId}`;
        }

        await axios.delete(deleteUrl, { withCredentials: true });

        toast.success("Service deleted successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        setTimeout(() => {
          navigate("/service-category");
        }, 1500);
      } catch (error) {
        console.error("Error deleting service:", error);
        toast.error(error.response?.data?.message || "Failed to delete service. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <h1 className="text-xl font-bold font-serif text-gray-700 uppercase text-center">Edit Category</h1>
      <div className="mb-4">
        <label htmlFor="category" className="block font-semibold mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="category"
          value={category}
          onChange={(e) => {
            const val = e.target.value;
            setCategory(val);
            const generatedSlug = val.replace(/\s+/g, '-')
              .toLowerCase()
              .replace(/[^a-z0-9-]/g, '')
              .replace(/--+/g, '-')
              .replace(/^-+/, '')
              .replace(/-+$/, '');
            setSlug(generatedSlug);
            if (generatedSlug) {
              setMetacanonical(`https://www.rndtechnosoft.com/${generatedSlug}`);
            }
          }}
          className="w-full p-2 border rounded focus:outline-none"
          required
        />
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 font-bold mb-2 uppercase font-serif">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none h-40"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="tag" className="block font-semibold mb-2">
          Tag
        </label>
        <input
          id="tag"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none"
        ></input>
      </div>
      <div className="mb-8">
        <label htmlFor="photo" className="block font-semibold mb-2">Photo (For Service Page)</label>
        <input
          type="file"
          name="photo"
          id="photo"
          onChange={handlePhotoChange}
          className="hidden"
          accept="image/*"
        />
        <label
          htmlFor="photo"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded cursor-pointer hover:bg-gray-300 transition inline-block"
        >
          {photo ? (photo instanceof File ? photo.name : "Change File") : (currentPhoto ? "Change File" : "Choose File")}
        </label>

        {(photo || currentPhoto) && (
          <div className="mt-2 w-56 relative group">
            <img
              src={photo instanceof File ? URL.createObjectURL(photo) : `/api/logo/download/${currentPhoto}`}
              alt={altText}
              className="h-32 w-56 object-cover"
            />
            <button
              type="button"
              onClick={handleDeleteImage}
              className="absolute top-4 right-2 bg-red-500 text-white rounded-md p-1 size-6 flex items-center justify-center hover:bg-red-600 focus:outline-none"
            >
              X
            </button>
            <div className="mb-4">
              <label htmlFor="alt" className="block font-semibold mb-2">Alternative Text</label>
              <input
                type="text"
                id="alt"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="imgtitle" className="block font-semibold mb-2">Image Title Text</label>
              <input
                type="text"
                id="imgtitle"
                value={imgtitle}
                onChange={(e) => setImgtitle(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none"
                required
              />
            </div>
          </div>
        )}
      </div>

      <div className="mb-8">
        <label htmlFor="dropdownPhoto" className="block font-semibold mb-2">Dropdown Photo (For Navbar MegaMenu)</label>
        <input
          type="file"
          name="dropdownPhoto"
          id="dropdownPhoto"
          onChange={handleDropdownPhotoChange}
          className="hidden"
          accept="image/*"
        />
        <label
          htmlFor="dropdownPhoto"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded cursor-pointer hover:bg-gray-300 transition inline-block"
        >
          {dropdownPhoto ? (dropdownPhoto instanceof File ? dropdownPhoto.name : "Change File") : (currentDropdownPhoto ? "Change File" : "Choose File")}
        </label>

        {(dropdownPhoto || currentDropdownPhoto) && (
          <div className="mt-2 w-56 relative group">
            <img
              src={dropdownPhoto instanceof File ? URL.createObjectURL(dropdownPhoto) : `/api/logo/download/${currentDropdownPhoto}`}
              alt={dropdownPhotoAlt}
              className="h-32 w-56 object-cover"
            />
            <button
              type="button"
              onClick={handleDeleteDropdownImage}
              className="absolute top-4 right-2 bg-red-500 text-white rounded-md p-1 size-6 flex items-center justify-center hover:bg-red-600 focus:outline-none"
            >
              X
            </button>
            <div className="mb-4">
              <label htmlFor="dropdownPhotoAlt" className="block font-semibold mb-2">Dropdown Alt Text</label>
              <input
                type="text"
                id="dropdownPhotoAlt"
                value={dropdownPhotoAlt}
                onChange={(e) => setDropdownPhotoAlt(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none"
                required
              />
            </div>
          </div>
        )}
      </div>
      <div className="mb-4 mt-4">
        <label htmlFor="slug" className="block font-semibold mb-2">
          Slug
        </label>
        <input
          type="text"
          id="slug"
          value={slug}
          onChange={(e) => {
            const val = e.target.value.toLowerCase()
              .replace(/[^a-z0-9-]/g, '')
              .replace(/--+/g, '-');
            setSlug(val);
            if (val) {
              setMetacanonical(`https://www.rndtechnosoft.com/${val}`);
            }
          }}
          className="w-full p-2 border rounded focus:outline-none"
        />
      </div>
      <div className="mb-4 mt-4">
        <label htmlFor="url" className="block font-semibold mb-2">
          URL
        </label>
        <input
          type="text"
          id="url"
          value={url}
          disabled
          className="w-full p-2 border rounded focus:outline-none"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="meta" className="block font-semibold mb-2">
          Meta Title
        </label>
        <textarea
          id="metatitle"
          value={metatitle}
          onChange={(e) => setMetatitle(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none"
          rows="3"
        ></textarea>
      </div>
      <div className="mb-4">
        <label htmlFor="meta" className="block font-semibold mb-2">
          Meta Description
        </label>
        <textarea
          id="metadescription"
          value={metadescription}
          onChange={(e) => setMetadescription(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none"
          rows="3"
        ></textarea>
      </div>
      <div className="mb-4">
        <label htmlFor="meta" className="block font-semibold mb-2">
          Meta Keywords
        </label>
        <textarea
          id="metakeywords"
          value={metakeywords}
          onChange={(e) => setMetakeywords(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none"
          rows="3"
        ></textarea>
      </div>
      <div className="mb-4">
        <label htmlFor="meta" className="block font-semibold mb-2">
          Meta Canonical
        </label>
        <textarea
          id="metacanonical"
          value={metacanonical}
          onChange={(e) => setMetacanonical(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none"
          rows="3"
        ></textarea>
      </div>
      <div className="mb-4">
        <label htmlFor="meta" className="block font-semibold mb-2">
          Meta Language
        </label>
        <textarea
          id="meta"
          value={metalanguage}
          onChange={(e) => setMetalanguage(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none"
          rows="3"
        ></textarea>
      </div>
      <div className="mb-4">
        <label htmlFor="meta" className="block font-semibold mb-2">
          Other Meta
        </label>
        <textarea
          id="meta"
          value={otherMeta}
          onChange={(e) => setOthermeta(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none"
          rows="3"
        ></textarea>
      </div>
      <div className="mb-4">
        <label htmlFor="meta" className="block font-semibold mb-2">
          Schema
        </label>
        <textarea
          id="meta"
          value={metaschema}
          onChange={(e) => setMetaschema(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none"
          rows="3"
        ></textarea>
      </div>
      <div className="mb-4">
        <label htmlFor="priority" className="block font-semibold mb-2">
          Priority
        </label>
        <input
          type="number"
          id="priority"
          min={0}
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="changeFreq" className="block font-semibold mb-2">
          Change Frequency
        </label>
        <select
          id="changeFreq"
          value={changeFreq}
          onChange={(e) => setChangeFreq(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none"
        >
          <option value="">Select Change Frequency</option>
          <option value="always">Always</option>
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="status" className="block font-semibold mb-2">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="robots" className="block font-semibold mb-2">
          Robots (Index/Follow)
        </label>
        <select
          id="robots"
          value={(!noIndex && !noFollow) ? "index,follow" : (noIndex && noFollow) ? "noindex,nofollow" : (!noIndex && noFollow) ? "index,nofollow" : "noindex,follow"}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "index,follow") { setNoIndex(false); setNoFollow(false); }
            if (val === "noindex,nofollow") { setNoIndex(true); setNoFollow(true); }
            if (val === "index,nofollow") { setNoIndex(false); setNoFollow(true); }
            if (val === "noindex,follow") { setNoIndex(true); setNoFollow(false); }
          }}
          className="w-full p-2 border rounded focus:outline-none"
        >
          <option value="index,follow">Index, Follow</option>
          <option value="noindex,nofollow">NoIndex, NoFollow</option>
          <option value="index,nofollow">Index, NoFollow</option>
          <option value="noindex,follow">NoIndex, Follow</option>
        </select>
      </div>
      <div className="flex justify-between mt-6">
        {/* <button
          type="button"
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-300"
        >
          Delete Service
        </button> */}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default EditServiceCategory;
