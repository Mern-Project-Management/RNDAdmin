import React from "react";
import { useGetAllTemplatesQuery, useDeleteTemplateMutation } from "@/slice/template/emailTemplate";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";

const TemplateTable = () => {
  const { data: apiResponse, error, isLoading } = useGetAllTemplatesQuery();
  const [deleteTemplate] = useDeleteTemplateMutation();
  const navigate = useNavigate();

  // Handle different response formats
  // If data is an array directly, use it
  // If data is nested inside another object, try to find it
  const templates = React.useMemo(() => {
    if (!apiResponse) return [];
    
    // If apiResponse is an array, use it directly
    if (Array.isArray(apiResponse)) {
      return apiResponse;
    }
    
    // If apiResponse has a 'data' property that's an array, use that
    if (apiResponse.data && Array.isArray(apiResponse.data)) {
      return apiResponse.data;
    }
    
    // Look for any array property in the response
    for (const key in apiResponse) {
      if (Array.isArray(apiResponse[key])) {
        return apiResponse[key];
      }
    }
    
    console.warn("Unexpected API response format:", apiResponse);
    return [];
  }, [apiResponse]);

  console.log("Processed templates:", templates);

  // State to track expanded rows
  const [expandedRows, setExpandedRows] = React.useState({});

  // Function to toggle row expansion
  const toggleRowExpansion = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Function to truncate HTML text
  const truncateText = (html, maxLength = 100) => {
    if (!html) return '';
    const strippedText = html.replace(/<[^>]+>/g, '');
    if (strippedText.length <= maxLength) return html;
    return strippedText.substring(0, maxLength) + '...';
  };

  if (isLoading) return <p>Loading templates...</p>;
  if (error) return <p>Error loading templates: {error.message}</p>;
  if (!templates.length) return <p>No templates found.</p>;

  const handleEdit = (id) => {
    navigate(`/edit-template/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        await deleteTemplate(id).unwrap();
        alert("Template deleted successfully!");
      } catch (error) {
        alert("Failed to delete template: " + (error.message || "Unknown error"));
      }
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Email Templates</h1>
        <Link to="/add-template">
          <Button className="bg-[#ffd333] text-[#1a1a1a] hover:bg-[#edc32f] font-semibold" variant="primary">
            Add Template
          </Button>
        </Link>
      </div>
      <hr className="mb-5" />
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Subject</th>
              <th className="border border-gray-300 px-4 py-2">Body</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((template) => (
              <tr key={template._id} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">
                  {template.name || "Unnamed Template"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {template.subject || "No Subject"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: expandedRows[template._id] 
                        ? template.body 
                        : truncateText(template.body)
                    }}
                  />
                  {template.body && template.body.length > 100 && (
                    <Button
                      variant="link"
                      className="text-[#dbaf00] p-0 h-auto font-medium hover:text-[#edc32f]"
                      onClick={() => toggleRowExpansion(template._id)}
                    >
                      {expandedRows[template._id] ? 'Show Less' : 'Read More'}
                    </Button>
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <div className="flex gap-4 justify-center items-center">
                    <button 
                      className="text-green-500 hover:text-green-700 transition-colors" 
                      onClick={() => handleEdit(template._id)}
                      title="Edit"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button 
                      className="text-red-500 hover:text-red-700 transition-colors" 
                      onClick={() => handleDelete(template._id)}
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {templates.length === 0 && !isLoading && (
        <div className="text-center py-4">
          <p>No templates found. Create your first template by clicking "Add Template".</p>
        </div>
      )}
    </div>
  );
};

export default TemplateTable;




