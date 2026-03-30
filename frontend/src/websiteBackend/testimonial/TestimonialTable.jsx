import React, { useMemo, useState, useEffect } from "react";
import { useTable, useSortBy } from "react-table";
import { FaEdit, FaTrashAlt, FaCheck, FaTimes, FaEye, FaArrowUp, FaArrowDown, FaPlus } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from 'react-modal';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import UseAnimations from "react-useanimations";
import loading from "react-useanimations/lib/loading";


Modal.setAppElement('#root')

const TestimonialsTable = () => {
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [testimonials, setTestimonials] = useState([]);
  const [loadings, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState(new Set()); // State for inline expansion
  const pageSize = 5; // Define the number of items per page
  const navigate = useNavigate()
  const filteredtestimonials = useMemo(() => {
    return testimonials.filter((testimonials) =>
      testimonials.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [testimonials, searchTerm]);

  const notify = () => {
    toast.success("Updated Successfully!");
  };

  const toggleRowExpansion = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "id",
      },
      {
        Header: "Name",
        accessor: "name",
        Cell: ({ row }) => (
          <span
            className="hover:text-blue-500 cursor-pointer text-sm font-medium"
            onClick={() => navigate(`/testimonials/editTestimonials/${row.original._id}`)}
          >
            {row.original.name}
          </span>
        ),
      },
      {
        Header: "Designation",
        accessor: "designation",
        Cell: ({ row }) => (
          <span
            className="hover:text-blue-500 cursor-pointer text-sm text-gray-500"
            onClick={() => navigate(`/testimonials/editTestimonials/${row.original._id}`)}
          >
            {row.original.designation}
          </span>
        ),
      },
      {
        Header: "Photo",
        accessor: "photo",
        Cell: ({ value }) => {
          const firstImage = Array.isArray(value) && value.length > 0 ? value[0] : null;
          return firstImage ? <img src={`/api/image/download/${firstImage}`} alt="Testimonial" className="w-16 h-10 object-cover rounded shadow-sm border border-gray-100" /> : null;
        },
        disableSortBy: true,
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) => value  ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" />,
        disableSortBy: true,
      },
      {
        Header: "Options",
        Cell: ({ row }) => (
          <div className="flex  gap-4 justify-center">
            <button 
              className={`transition-colors duration-200 ${expandedRows.has(row.original._id) ? 'text-[#7a6b00]' : 'text-slate-800 hover:text-slate-600'}`} 
              onClick={() => toggleRowExpansion(row.original._id)}
              title="View Details"
            >
              <FaEye size={18} />
            </button>
            <button className="text-green-500 hover:text-green-700 p-1 transition-colors" title="Edit">
              <Link to={`/testimonials/editTestimonials/${row.original._id}`}>  <FaEdit size={18} /></Link>
            </button>
            <button className="text-red-500 hover:text-red-700 p-1 transition-colors" title="Delete" onClick={() => deleteTestimonial(row.original._id)}>
              <FaTrashAlt size={18} />
            </button>
          </div>
        ),
        disableSortBy: true,
      },
    ],
    [expandedRows]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data: filteredtestimonials,
    },
    useSortBy
  );

  const fetchData = async (pageIndex) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/testimonial/getTestimonial?page=${pageIndex + 1}`, { withCredentials: true });
      const testimonialsWithIds = response.data.data.map((testimonial, index) => ({
        ...testimonial,
        id: pageIndex * pageSize + index + 1,
      }));
      setTestimonials(testimonialsWithIds);
      setPageCount(Math.ceil(response.data.total / pageSize)); // Assuming the API returns the total number of items
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTestimonial = async (id) => {
    try {
      if (!window.confirm("Are you sure you want to delete this testimonial?")) return;
      await axios.delete(`/api/testimonial/deleteTestimonial?id=${id}`, { withCredentials: true });
      fetchData(pageIndex);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData(pageIndex);
  }, [pageIndex]);

  const fetchHeadings = async () => {
    try {
      const response = await axios.get('/api/pageHeading/heading?pageType=testimonial', { withCredentials: true });
      const { heading, subheading } = response.data;
      setHeading(heading || '');
      setSubheading(subheading || '');
    } catch (error) {
      console.error(error);
    }
  };

  const saveHeadings = async () => {
    try {
      await axios.put('/api/pageHeading/updateHeading?pageType=testimonial', {
        pagetype: 'testimonial',
        heading,
        subheading,
      }, { withCredentials: true });
      notify();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchHeadings();
  }, []);


  const handleHeadingChange = (e) => setHeading(e.target.value);
  const handleSubheadingChange = (e) => setSubheading(e.target.value);

  return (
    <div className="p-4 overflow-x-auto min-h-screen bg-gray-50/30">
      <ToastContainer />
      <div className="mb-8 bg-white border border-gray-200 shadow-sm p-6 rounded-xl ">
        <div className="grid md:grid-cols-2 lg:gap-8 gap-6 grid-cols-1">
          <div className="mb-2">
            <label className="block text-gray-700 font-bold mb-2 uppercase text-xs tracking-wider font-serif">Heading</label>
            <input
              type="text"
              value={heading}
              onChange={handleHeadingChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffcc00] focus:border-transparent transition duration-200"
            />
          </div>
          <div className="mb-2">
            <label className="block text-gray-700 font-bold mb-2 font-serif uppercase text-xs tracking-wider">Sub heading</label>
            <textarea
              rows={1}
              value={subheading}
              onChange={handleSubheadingChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffcc00] focus:border-transparent transition duration-200"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={saveHeadings}
            className="px-6 py-2 bg-[#ffd333] text-[#1a1a1a] rounded-lg hover:bg-[#edc32f] transition duration-300 font-serif font-semibold shadow-sm"
          >
            Save Headings
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold font-serif text-gray-800 uppercase tracking-tight">Manage Testimonials</h1>
            <p className="text-gray-500 text-sm mt-1">View and manage customer feedback</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffcc00] focus:border-transparent transition duration-200 text-sm"
              />
            </div>
            <Link 
              to="/add-testimonials"
              className="px-4 py-2 bg-[#ffd333] text-[#1a1a1a] rounded-lg hover:bg-[#edc32f] transition duration-300 flex items-center justify-center shadow-sm"
            >
              <FaPlus size={14} className="mr-2" /> <span className="text-sm font-semibold">Add New</span>
            </Link>
          </div>
        </div>

        {loadings ? (
          <div className="flex justify-center p-20"><UseAnimations animation={loading} size={56} /></div>
        ) : (
          <div className="overflow-x-auto">
            {testimonials.length === 0 ? (
              <div className="flex flex-col justify-center items-center p-20">
                <iframe className="w-64 h-64" src="https://lottie.host/embed/1ce6d411-765d-4361-93ca-55d98fefb13b/AonqR3e5vB.json"></iframe>
                <p className="text-gray-500 font-serif mt-4">No testimonials found</p>
              </div>
            ) : (
              <table className="w-full border-collapse" {...getTableProps()}>
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th
                          {...column.getHeaderProps(column.getSortByToggleProps())}
                          className="py-4 px-6 text-left text-xs font-bold uppercase tracking-wider font-serif"
                        >
                          <div className="flex items-center gap-2">
                            <span>{column.render("Header")}</span>
                            {column.canSort && (
                              <span className="text-gray-400">
                                {column.isSorted ? (
                                  column.isSortedDesc ? <FaArrowDown size={10} /> : <FaArrowUp size={10} />
                                ) : (
                                  <FaArrowDown size={10} className="transition-opacity" />
                                )}
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                  {rows.map((row) => {
                    prepareRow(row);
                    const isExpanded = expandedRows.has(row.original._id);
                    return (
                      <React.Fragment key={row.original._id}>
                        <tr 
                          {...row.getRowProps()} 
                          className={`hover:bg-gray-50/80 transition-colors duration-150 ${isExpanded ? 'bg-gray-50/50' : 'border-b border-gray-100'}`}
                        >
                          {row.cells.map((cell) => (
                            <td {...cell.getCellProps()} className="py-4 px-6">
                              {cell.render("Cell")}
                            </td>
                          ))}
                        </tr>
                        {isExpanded && (
                          <tr className="bg-gray-50/50">
                            <td colSpan={columns.length} className="px-6 pb-6 pt-2">
                              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative animate-in fade-in slide-in-from-top-2 duration-300">
                                <button 
                                  onClick={() => toggleRowExpansion(row.original._id)}
                                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                                  title="Close"
                                >
                                  <FaTimes />
                                </button>
                                <div className="flex flex-col md:flex-row gap-8">
                                  <div className="flex-shrink-0 flex justify-center">
                                    {row.original.photo && row.original.photo.length > 0 ? (
                                      <div className="relative">
                                        <img 
                                          src={`/api/image/download/${row.original.photo[0]}`} 
                                          alt={row.original.name} 
                                          className="w-32 h-32 object-cover rounded-xl shadow-md border-2 border-white"
                                        />
                                        <div className="absolute -bottom-2 -right-2 bg-[#ffcc00]-[#1a1a1a] p-2 rounded-lg shadow-lg">
                                          <FaEye size={14} />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 font-bold text-4xl shadow-inner border border-gray-200">
                                        {row.original.name?.charAt(0)}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="mb-6">
                                      <h4 className="text-2xl font-bold text-gray-900 font-serif leading-tight">{row.original.name}</h4>
                                      <p className="text-[#7a6b00] font-bold uppercase tracking-widest text-xs mt-1">{row.original.designation}</p>
                                    </div>
                                    <div className="relative bg-gray-50/50 rounded-xl p-6 border-l-4 border-[#ead37a]">
                                      <div className="absolute -top-6 -left-2 text-[#7a6b00]/10 text-8xl font-serif select-none italic pointer-events-none">
                                        &ldquo;
                                      </div>
                                      <div className="relative z-10 italic text-gray-700 leading-relaxed font-serif">
                                        <ReactQuill
                                          readOnly={true}
                                          value={row.original.testimony}
                                          modules={{ toolbar: false }}
                                          theme="bubble"
                                          className="quill-preview text-lg"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
        
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPageIndex(0)} 
              disabled={pageIndex === 0} 
              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {"<<"}
            </button>
            <button 
              onClick={() => setPageIndex(pageIndex - 1)} 
              disabled={pageIndex === 0} 
              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {"<"}
            </button>
            <button 
              onClick={() => setPageIndex(pageIndex + 1)} 
              disabled={pageIndex + 1 >= pageCount} 
              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {">"}
            </button>
            <button 
              onClick={() => setPageIndex(pageCount - 1)} 
              disabled={pageIndex + 1 >= pageCount} 
              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {">>"}
            </button>
          </div>
          <div className="font-serif">
            Page <span className="font-bold text-slate-800">{pageIndex + 1}</span> of <span className="font-bold text-slate-800">{pageCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};


export default TestimonialsTable;




