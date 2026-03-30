import React, { useMemo, useState, useEffect } from "react";
import { useTable, useSortBy, usePagination } from "react-table";
import {
  Edit,
  Trash2,
  Check,
  Eye,
  X,
  ArrowUp,
  ArrowDown,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from 'react-modal';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from "react-router-dom"
import UseAnimations from "react-useanimations";
import loading from "react-useanimations/lib/loading";


Modal.setAppElement('#root');

const CareerOptionTable = () => {
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [headingPhoto, setHeadingPhoto] = useState("");
  const [alt, setAlt] = useState("");
  const [imgTitle, setImgTitle] = useState("");
  const [careerOptions, setCareerOptions] = useState([]);
  const [loadings, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCoption, setSelectedCoption] = useState(null); // State for the selected banner
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const navigate = useNavigate()

  const notify = () => {
    toast.success("Updated Successfully!");
  };

  const filteredCareerOptions = useMemo(() => {
    return careerOptions.filter((option) =>
      option.jobtitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [careerOptions, searchTerm]);

  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "id",
      },
      {
        Header: "Priority",
        accessor: "priority",
        Cell: ({ value }) => (
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-sm">
            {value ?? 0}
          </span>
        ),
      },
      {
        Header: "Title",
        accessor: "jobtitle",
        Cell: ({ row }) => (
          <span
            className="cursor-pointer"
            onClick={() => navigate(`/careeroption/editCareerOption/${row.original._id}`)}
          >
            {row.original.jobtitle}
          </span>
        ),
      },
      {
        Header: "Description",
        accessor: "description",
        Cell: ({ row }) => (
          <span
            className="cursor-pointer"
            onClick={() => navigate(`/careeroption/editCareerOption/${row.original._id}`)}
          >
            <p dangerouslySetInnerHTML={{ __html: row.original.description }}></p>

          </span>
        ),
      },
      {
        Header: "Photo",
        accessor: "photo",
        Cell: ({ value }) => {
          const firstImage = Array.isArray(value) && value.length > 0 ? value[0] : null;
          return firstImage ? <img src={`/api/image/download/${firstImage}`} alt="Career" className="w-32 h-20 object-cover" /> : null;
        },
        disableSortBy: true,
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) => value === "active" ? <Check className="text-green-500" /> : <X className="text-red-500" />,
        disableSortBy: true,
      },
      {
        Header: "Options",
        Cell: ({ row }) => (
          <div className="flex gap-4">
            <button className="text-slate-800 hover:text-slate-600 transition" onClick={() => handleView(row.original)}>
              <Eye />
            </button>
            <button className="text-green-500 hover:text-green-700 transition">
              <Link to={`/careeroption/editCareerOption/${row.original._id}`}><Edit /></Link>
            </button>
            <button className="text-red-500 hover:text-red-700 transition" onClick={() => deleteCareerOption(row.original._id)}>
              <Trash2 />
            </button>
          </div>
        ),
        disableSortBy: true,
      },
    ],
    []
  );

  const PAGE_SIZE = 10;

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,          // rows for current page
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    state: { pageIndex },
  } = useTable(
    {
      columns,
      data: filteredCareerOptions,
      initialState: { pageIndex: 0, pageSize: PAGE_SIZE },
    },
    useSortBy,
    usePagination
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/career-option/getCareeroption`, { withCredentials: true });
      const careerOptionsWithIds = response.data.map((option, index) => ({
        ...option,
        id: index + 1,
      }));
      setCareerOptions(careerOptionsWithIds);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCareerOption = async (id) => {
    try {
      const response = await axios.delete(`/api/career-option/deleteCareeroption?id=${id}`, { withCredentials: true });

      fetchData();
    } catch (error) {
      console.error(error);

    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleView = (coption) => {
    setSelectedCoption(coption);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCoption(null);
  };

  const fetchHeadings = async () => {
    try {
      const response = await axios.get('/api/pageHeading/heading?pageType=career', { withCredentials: true });
      const { heading, subheading, photo, alt, imgTitle } = response.data;
      setHeading(heading || '');
      setSubheading(subheading || '');
      setHeadingPhoto(photo || '');
      setAlt(alt || '');
      setImgTitle(imgTitle || '');
    } catch (error) {
      console.error(error);
    }
  };

  const saveHeadings = async () => {
    const formData = new FormData();
    formData.append("heading", heading);
    formData.append("subheading", subheading);
    formData.append("alt", alt);
    formData.append("imgTitle", imgTitle);
    if (headingPhoto instanceof File) {
      formData.append("photo", headingPhoto);
    }
    try {
      await axios.put('/api/pageHeading/updateHeading?pageType=career', formData, { withCredentials: true });
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
  const handleAltChange = (e) => setAlt(e.target.value);
  const handleImgTitleChange = (e) => setImgTitle(e.target.value);
  const handleHeadingFileChange = (e) => {
    setHeadingPhoto(e.target.files[0]);
  };

  return (
    <div className="p-4 overflow-x-auto">
      <ToastContainer />
      <div className="mb-8 border border-gray-200 shadow-lg p-4 rounded ">
        <div className="grid md:grid-cols-2 md:gap-2 grid-cols-1">
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2 uppercase font-serif">Heading</label>
            <input
              type="text"
              value={heading}
              onChange={handleHeadingChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2 uppercase font-serif">Sub heading</label>
            <input
              type="text"
              value={subheading}
              onChange={handleSubheadingChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2 uppercase font-serif">Upload Image</label>
            <input
              type="file"
              onChange={handleHeadingFileChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
            />
            {headingPhoto && (
              <div className="mt-2">
                <img
                  src={headingPhoto instanceof File ? URL.createObjectURL(headingPhoto) : `/api/logo/download/${headingPhoto}`}
                  alt={alt}
                  className="w-32 h-32 object-cover rounded"
                />
              </div>
            )}
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2 uppercase font-serif">Alt Text</label>
            <input
              type="text"
              value={alt}
              onChange={handleAltChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
            />
          </div>

        </div>
        <button
          onClick={saveHeadings}
          className="px-4 py-2 bg-[#ffd333] text-[#1a1a1a] rounded hover:bg-[#edc32f] transition duration-300 font-serif"
        >
          Save
        </button>
      </div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold  text-gray-700 font-serif uppercase">Career Options</h1>
        <button className="px-4 py-2 bg-[#ffd333] text-[#1a1a1a] rounded hover:bg-[#edc32f] transition duration-300 font-serif">
          <Link to="/career/add"><Plus size={15} /></Link>
        </button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
        />
      </div>
      <h2 className="text-md font-semibold mb-4">Manage Career Options</h2>
      {loadings ? (
        <div className="flex justify-center"><UseAnimations animation={loading} size={56} /></div>

      ) : (
        <>
          {
            careerOptions.length == 0
              ? <div className="flex justify-center items-center"><iframe className="w-96 h-96" src="https://lottie.host/embed/1ce6d411-765d-4361-93ca-55d98fefb13b/AonqR3e5vB.json"></iframe></div>
              : <>
                <table className="w-full mt-4 border-collapse" {...getTableProps()}>
                  <thead className="bg-[#ffd333] text-white">
                    {headerGroups.map((headerGroup) => (
                      <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map((column) => (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            className="py-2 px-4 border-b border-gray-300 cursor-pointer uppercase font-serif "
                          >
                            <div className="flex items-center gap-2">
                              <span className="">{column.render("Header")}</span>
                              {column.canSort && (
                                <span className="ml-1">
                                  {column.isSorted ? (
                                    column.isSortedDesc ? (
                                      <ArrowDown />
                                    ) : (
                                      <ArrowUp />
                                    )
                                  ) : (
                                    <ArrowDown className="text-gray-400" />
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
                    {page.map((row) => {
                      prepareRow(row);
                      return (
                        <tr {...row.getRowProps()} className="border-b border-gray-300 hover:bg-gray-100 transition duration-150">
                          {row.cells.map((cell) => (
                            <td {...cell.getCellProps()} className="py-2 px-4 ">
                              {cell.render("Cell")}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between mt-4 px-2">
                  <span className="text-sm text-gray-600">
                    Page <strong>{pageIndex + 1}</strong> of <strong>{pageOptions.length}</strong>
                    {" "}({filteredCareerOptions.length} total records)
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => gotoPage(0)}
                      disabled={!canPreviousPage}
                      className="px-2 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-100"
                    >
                      Â«
                    </button>
                    <button
                      onClick={() => previousPage()}
                      disabled={!canPreviousPage}
                      className="p-1 border rounded disabled:opacity-40 hover:bg-gray-100"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {pageOptions.map((pg) => (
                      <button
                        key={pg}
                        onClick={() => gotoPage(pg)}
                        className={`px-3 py-1 text-sm border rounded ${
                          pageIndex === pg
                            ? 'bg-[#ffcc00] text-[#1a1a1a] border-slate-700'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {pg + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => nextPage()}
                      disabled={!canNextPage}
                      className="p-1 border rounded disabled:opacity-40 hover:bg-gray-100"
                    >
                      <ChevronRight size={16} />
                    </button>
                    <button
                      onClick={() => gotoPage(pageCount - 1)}
                      disabled={!canNextPage}
                      className="px-2 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-100"
                    >
                      Â»
                    </button>
                  </div>
                </div>
              </>
          }</>

      )}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Banner Details"
        className="fixed inset-0 flex items-center   justify-center bg-gray-800 bg-opacity-50"
      >
        <div className="bg-white p-8 rounded overflow-auto shadow-lg w-96 h-[80%] relative">
          <button onClick={closeModal} className="absolute top-5 right-5 text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
          <h2 className="text-xl font-bold mb-4">Career option Description</h2>
          {selectedCoption && (
            <div className="">
              <div className="flex mt-2">
                <p className="mr-2 font-semibold font-serif">Priority :</p>
                <p dangerouslySetInnerHTML={{ __html: selectedCoption.title }}></p>


              </div>
              <div className="flex mt-2">
                <p className="mr-2 font-semibold font-serif">Section :</p>
                <p>{selectedCoption.requirement}</p>
              </div>
              <div className="mt-2">
                <label className="font-semibold font-serif">Short Description:
                  <ReactQuill
                    readOnly={true}
                    value={selectedCoption.shortDescription}
                    modules={{ toolbar: false }}
                    theme="bubble"
                    className="quill"
                  />
                </label>
              </div>
              <div className="mt-2">
                <label className="mr-2 font-semibold font-serif">Long Description:
                  <ReactQuill
                    readOnly={true}
                    value={selectedCoption.longDescription}
                    modules={{ toolbar: false }}
                    theme="bubble"
                    className="quill"
                  />
                </label>
              </div>
            </div>
          )}
          <button
            onClick={closeModal}
            className="mt-4 px-4 py-2 bg-[#ffcc00] text-[#1a1a1a] rounded hover:bg-[#e6b800] transition duration-300"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default CareerOptionTable;




