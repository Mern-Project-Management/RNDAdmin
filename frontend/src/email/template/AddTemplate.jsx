import React from "react";
import { useForm } from "react-hook-form";
import { useAddTemplateMutation } from "@/slice/template/emailTemplate";
import TipTapEditor from "@/components/TipTapEditor";
import { useGetEmailCategoriesQuery } from "@/slice/emailCategory/emailCategory";

const AddTemplateForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const bodyValue = watch("body");

  const [addTemplate, { isLoading }] = useAddTemplateMutation();

  const { data: categories, isLoading: categoriesLoading } = useGetEmailCategoriesQuery();

  const onSubmit = async (data) => {
    try {
      await addTemplate(data).unwrap();
      alert("Template added successfully!");
      reset(); // Clear the form
    } catch (error) {
      alert("Failed to add template: " + error.message);
    }
  };

  // Handle changes in the TipTap editor
  const handleEditorChange = (value) => {
    setValue("body", value);
  };

  return (
    <div className="p-4 mx-auto">
      <h1 className="text-xl font-bold mb-4">Add New Template</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Category Field */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            {...register("category", { required: "Category is required" })}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Select a category</option>
            {categories?.map((category) => (
              <option key={category._id} value={category._id}>
                {category.emailCategory}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-sm">{errors.category.message}</p>
          )}
        </div>

        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            {...register("name", { required: "Name is required" })}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Enter template name"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        {/* Subject Field */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="subject">
            Subject
          </label>
          <input
            id="subject"
            {...register("subject", { required: "Subject is required" })}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Enter template subject"
          />
          {errors.subject && <p className="text-red-500 text-sm">{errors.subject.message}</p>}
        </div>

        {/* Recipient Email Field */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="toEmail">
            Recipient Email (Optional)
          </label>
          <input
            id="toEmail"
            {...register("toEmail")}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Enter recipient email (if specific)"
          />
          {errors.toEmail && <p className="text-red-500 text-sm">{errors.toEmail.message}</p>}
        </div>

        {/* Body Field (TipTapEditor) */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="body">
            Body
          </label>
          <TipTapEditor
            value={bodyValue || ""}
            onChange={handleEditorChange}
            placeholder="Enter template body"
          />
          {errors.body && <p className="text-red-500 text-sm">{errors.body.message}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-1/4 bg-[#ffd333] text-[#1a1a1a] hover:bg-[#edc32f] px-4 py-2 rounded font-semibold transition duration-200 shadow-sm ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={isLoading}
        >
          {isLoading ? "Adding..." : "Add Template"}
        </button>
      </form>
    </div>
  );
};

export default AddTemplateForm;
