import React, { useMemo, useState, useEffect } from "react";
import { useTable, useSortBy } from "react-table";
import { FaEdit, FaTrashAlt, FaCheck, FaEye, FaTimes, FaArrowUp, FaArrowDown, FaPlus, FaSearch, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import UseAnimations from "react-useanimations";
import loading from "react-useanimations/lib/loading";
import debounce from 'lodash.debounce';
import { validateHeading, validateSubheading } from '../../utiles/validations';

const PortfolioTable = () => {
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [portfolio, setPortfolio] = useState([]);
  const [loadings, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [errors, setErrors] = useState({ heading: "", subheading: "" });
  const navigate = useNavigate();
  const pageSize = 10;

  const toggleRowExpansion = (id) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "id",
      },
      {
        Header: "Category",
        accessor: "categoryName",
      },
      {
        Header: "Title",
        accessor: "title",
      },
      {
        Header: "Photo",
        accessor: "photo",
        Cell: ({ value }) => {
          const firstImage = Array.isArray(value) && value.length > 0 ? value[0] : null;
          return firstImage ? (
            <img src={`/api/image/download/${firstImage}`} alt="Portfolio" className="w-20 h-12 object-cover rounded shadow-sm border border-gray-100" />
          ) : (
            <span className="text-gray-400 italic text-xs">N/A</span>
          );
        },
        disableSortBy: true,
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) => value === "active" ? (
          <span className="flex items-center gap-1 text-green-600 font-medium text-xs bg-green-50 px-2 py-1 rounded-full border border-green-100 italic">
            <FaCheck size={10} /> Active
          </span>
        ) : (
          <span className="flex items-center gap-1 text-red-600 font-medium text-xs bg-red-50 px-2 py-1 rounded-full border border-red-100 italic">
            <FaTimes size={10} /> Inactive
          </span>
        ),
      },
      {
        Header: "Options",
        Cell: ({ row }) => {
          const isExpanded = expandedRows.has(row.original._id);
          return (
            <div className="flex gap-4 items-center">
              <button
                className={`transition-colors duration-200 ${isExpanded ? 'text-[#ffc108]' : 'text-gray-400 hover:text-gray-600'}`} 
                onClick={() => toggleRowExpansion(row.original._id)}
                title={isExpanded ? "Hide Details" : "View Details"}
              >
                {isExpanded ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
              <Link 
                to={`/edit-portfolio/${row.original._id}`}
                className="text-blue-500 hover:text-blue-700 transition"
              >
                <FaEdit size={16} />
              </Link>
              <button
                className="text-red-500 hover:text-red-700 transition font-bold"
                onClick={() => handleDelete(row.original._id)}
              >
                <FaTrashAlt size={16} />
              </button>
            </div>
          );
        },
        disableSortBy: true,
      },
    ],
    [portfolio, expandedRows]
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
      data: portfolio,
    },
    useSortBy
  );

  const fetchData = async (page, search = "") => {
    setLoading(true);
    try {
      const endpoint = search
        ? `/api/portfolio/simpleSearchPortfolio?title=${encodeURIComponent(search)}&page=${page + 1}&limit=${pageSize}`
        : `/api/portfolio/getPortfolio?page=${page + 1}&limit=${pageSize}`;
      const response = await axios.get(endpoint, { withCredentials: true });

      const portfolios = search ? response.data.data.portfolios : response.data.data;
      const pagination = search ? response.data.data.pagination : {
        totalPages: Math.ceil(response.data.total / pageSize),
      };

      const portfolioWithIds = portfolios.map((portfolioItem, index) => ({
        ...portfolioItem,
        id: page * pageSize + index + 1,
        categoryName: portfolioItem.categoryName || 'N/A',
      }));

      setPortfolio(portfolioWithIds);
      setPageCount(pagination.totalPages || 1);
    } catch (error) {
      toast.error("Failed to fetch data");
      setPortfolio([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchData = useMemo(
    () => debounce((page, term) => fetchData(page, term), 500),
    []
  );

  useEffect(() => {
    debouncedFetchData(pageIndex, searchTerm);
    fetchHeadings();
    return () => debouncedFetchData.cancel();
  }, [pageIndex, searchTerm, debouncedFetchData]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this portfolio item?")) {
      try {
        await axios.delete(`/api/portfolio/deletePortfolio?slugs=${id}`, { withCredentials: true });
        toast.success("Portfolio deleted successfully!");
        fetchData(pageIndex, searchTerm);
      } catch (error) {
        toast.error("Failed to delete portfolio");
      }
    }
  };

  const fetchHeadings = async () => {
    try {
      const response = await axios.get('/api/pageHeading/heading?pageType=portfolio', { withCredentials: true });
      setHeading(response.data.heading || '');
      setSubheading(response.data.subheading || '');
    } catch (error) {
      console.error(error);
    }
  };

  const saveHeadings = async () => {
    const hErr = validateHeading(heading);
    const sErr = validateSubheading(subheading);
    if (hErr || sErr) {
      setErrors({ heading: hErr, subheading: sErr });
      toast.error("Please fix validation errors");
      return;
    }
    try {
      await axios.put('/api/pageHeading/updateHeading?pageType=portfolio', {
        pagetype: 'Portfolio',
        heading,
        subheading,
      }, { withCredentials: true });
      toast.success("Headings updated!");
    } catch (error) {
      toast.error("Failed to update headings");
    }
  };

  return (
    <div className="p-6 bg-gray-50/30 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Headings Section */}
      <div className="mb-8 bg-white border border-gray-100 shadow-sm p-6 rounded-xl transition-all duration-300 hover:shadow-md">
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Page Heading <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={heading}
              onChange={(e) => {
                setHeading(e.target.value);
                setErrors(prev => ({ ...prev, heading: validateHeading(e.target.value) }));
              }}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc108] focus:border-transparent transition-all duration-200 ${errors.heading ? 'border-red-500 bg-red-50/30' : 'border-gray-200'}`}
            />
            {errors.heading && <p className="text-red-500 text-xs mt-1 animate-pulse">{errors.heading}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Page Sub-heading <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subheading}
              onChange={(e) => {
                setSubheading(e.target.value);
                setErrors(prev => ({ ...prev, subheading: validateSubheading(e.target.value) }));
              }}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc108] focus:border-transparent transition-all duration-200 ${errors.subheading ? 'border-red-500 bg-red-50/30' : 'border-gray-200'}`}
            />
            {errors.subheading && <p className="text-red-500 text-xs mt-1 animate-pulse">{errors.subheading}</p>}
          </div>
        </div>
        <button
          onClick={saveHeadings}
          className="px-6 py-2.5 bg-[#ffc108]-[#1a1a1a] rounded-lg hover:bg-[#e6ac07] transition duration-300 shadow-sm font-medium"
        >
          Update Headings
        </button>
      </div>

      {/* Table Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Portfolio Management</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FaSearch size={14} />
            </span>
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc108] focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>
          <Link 
            to="/portfolio-form"
            className="flex items-center gap-2 px-5 py-2 bg-[#ffc108]-[#1a1a1a] rounded-lg hover:bg-[#e6ac07] transition-all duration-300 shadow-sm font-medium text-sm whitespace-nowrap"
          >
            <FaPlus size={12} /> Add Portfolio
          </Link>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
        {loadings ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <UseAnimations animation={loading} size={48} />
            <p className="text-gray-400 text-sm font-medium tracking-wider">Syncing Data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {portfolio.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                  <FaSearch size={24} />
                </div>
                <p className="text-gray-500 font-medium">No results found matching your search.</p>
              </div>
            ) : (
              <table className="w-full table-auto" {...getTableProps()}>
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  {headerGroups.map((headerGroup) => (
                    <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th
                          key={column.id}
                          {...column.getHeaderProps(column.getSortByToggleProps())}
                          className="py-4 px-6 text-left text-xs font-bold text-gray-600 uppercase tracking-widest cursor-pointer group transition-colors hover:text-gray-900"
                        >
                          <div className="flex items-center gap-2">
                            {column.render("Header")}
                            {column.canSort && (
                              <span className="text-gray-300 flex-shrink-0">
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
                          className={`group border-b border-gray-50 transition-all duration-200 ${isExpanded ? 'bg-gray-50/30' : 'hover:bg-gray-50/50'}`}
                        >
                          {row.cells.map((cell) => (
                            <td 
                              key={cell.id} 
                              {...cell.getCellProps()} 
                              className="py-4 px-6 text-sm text-gray-600"
                            >
                              {cell.render("Cell")}
                            </td>
                          ))}
                        </tr>
                        
                        {/* Simplified Expanded Content Section */}
                        {isExpanded && (
                          <tr className="bg-gray-50/30 border-b border-gray-100 animate-in slide-in-from-top-1 duration-200">
                            <td colSpan={columns.length} className="px-6 py-6">
                              <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
                                {/* Close Button */}
                                <button 
                                  onClick={() => toggleRowExpansion(row.original._id)}
                                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition p-1.5 hover:bg-gray-50 rounded-full"
                                >
                                  <FaTimes size={16} />
                                </button>

                                {/* Portfolio Image Section */}
                                <div className="md:w-1/4 flex-shrink-0">
                                  <img 
                                    src={row.original.photo && row.original.photo[0] ? `/api/image/download/${row.original.photo[0]}` : '/placeholder.jpg'} 
                                    alt={row.original.title} 
                                    className="w-full h-auto aspect-[4/3] object-cover rounded-lg shadow-sm border border-gray-100"
                                  />
                                </div>

                                {/* Portfolio Content Section */}
                                <div className="flex-1 min-w-0">
                                  <div className="mb-4">
                                    <p className="text-[#ffc108] font-bold text-[10px] uppercase tracking-wider mb-1">{row.original.categoryName}</p>
                                    <h4 className="text-xl font-bold text-gray-900 leading-tight mb-1">{row.original.title}</h4>
                                    {row.original.link && (
                                      <a 
                                        href={row.original.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-500 hover:underline inline-block mt-1"
                                      >
                                        Visit Website →
                                      </a>
                                    )}
                                  </div>
                                  
                                  <div className="text-gray-700 leading-relaxed text-sm">
                                    <ReactQuill
                                      readOnly={true}
                                      value={row.original.details || ''}
                                      modules={{ toolbar: false }}
                                      theme="bubble"
                                      className="quill-preview-simple"
                                    />
                                  </div>
                                  <p className="mt-4 text-[10px] text-gray-400 font-medium">Slug: {row.original.slug}</p>
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
        
        {/* Pagination Section */}
        {!loadings && portfolio.length > 0 && (
          <div className="p-6 border-t border-gray-50 bg-gray-50/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest italic">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPageIndex(0)} 
                disabled={pageIndex === 0} 
                className="p-2.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition hover:text-[#ffc108]"
              >
                {"<<"}
              </button>
              <button 
                onClick={() => setPageIndex(pageIndex - 1)} 
                disabled={pageIndex === 0} 
                className="p-2.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition hover:text-[#ffc108]"
              >
                {"<"}
              </button>
              <button 
                onClick={() => setPageIndex(pageIndex + 1)} 
                disabled={pageIndex + 1 >= pageCount} 
                className="p-2.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition hover:text-[#ffc108]"
              >
                {">"}
              </button>
              <button 
                onClick={() => setPageIndex(pageCount - 1)} 
                disabled={pageIndex + 1 >= pageCount} 
                className="p-2.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition hover:text-[#ffc108]"
              >
                {">>"}
              </button>
            </div>
            <div className="font-serif tracking-normal text-slate-400 capitalize whitespace-nowrap">
              Page <span className="text-[#ffc108] text-sm">{pageIndex + 1}</span> of <span className="text-slate-800 text-sm">{pageCount}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioTable;