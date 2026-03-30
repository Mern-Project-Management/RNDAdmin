import React, { useMemo, useState, useEffect } from "react";
import { useTable, useSortBy } from "react-table";
import { Edit, Trash2, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UseAnimations from "react-useanimations";
import loading from "react-useanimations/lib/loading";

const ClientsTable = () => {
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [clients, setClients] = useState([]);
  const [loadings, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filteredClients = useMemo(() => {
    return clients.filter((client) =>
      client.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  const notify = () => {
    toast.success("Updated Successfully!");
  };

  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "id",
      },
      {
        Header: "Title",
        accessor: "title",
        Cell: ({ row }) => (
          <span
            className="hover:text-blue-500 cursor-pointer"
            onClick={() => navigate(`/clients/editclient/${row.original._id}`)}
          >
            {row.original.title}
          </span>
        ),
      },
      {
        Header: "Photo",
        accessor: "photo",
        Cell: ({ value }) => {
          const firstImage = Array.isArray(value) && value.length > 0 ? value[0] : null;
          return firstImage ? (
            <img 
              src={`/api/image/download/${firstImage}`} 
              alt="Client" 
              className="w-32 h-20 object-contain grayscale hover:grayscale-0 transition-all duration-300" 
            />
          ) : null;
        },
        disableSortBy: true,
      },
      {
        Header: "Color",
        accessor: "color",
        Cell: ({ value }) => (
          <div className="flex items-center gap-2">
            {value && (
              <div 
                className="w-8 h-8 rounded border border-gray-300" 
                style={{ backgroundColor: value }}
              ></div>
            )}
            <span>{value || 'N/A'}</span>
          </div>
        ),
      },
      {
        Header: "Options",
        Cell: ({ row }) => (
          <div className="flex gap-4">
            <button className="text-green-500 hover:text-green-700 transition">
              <Link to={`/edit-client/${row.original._id}`}>
                <Edit />
              </Link>
            </button>
            <button 
              className="text-red-500 hover:text-red-700 transition" 
              onClick={() => deleteClient(row.original._id)}
            >
              <Trash2 />
            </button>
          </div>
        ),
        disableSortBy: true,
      },
    ],
    []
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
      data: filteredClients,
    },
    useSortBy
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/clients`, { withCredentials: true });
      const clientsWithIds = response.data.map((client, index) => ({
        ...client,
        id: index + 1,
      }));
      setClients(clientsWithIds);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (id) => {
    try {
      await axios.delete(`/api/clients/deleteClient?id=${id}`, { withCredentials: true });
      toast.success("Client deleted successfully!");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Error deleting client!");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchHeadings = async () => {
    try {
      const response = await axios.get('/api/pageHeading/heading?pageType=client', { withCredentials: true });
      const { heading, subheading } = response.data;
      setHeading(heading || '');
      setSubheading(subheading || '');
    } catch (error) {
      console.error(error);
    }
  };

  const saveHeadings = async () => {
    try {
      await axios.put('/api/pageHeading/updateHeading?pageType=client', {
        pagetype: 'client',
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

  return (
    <div className="p-4 overflow-x-auto">
      <ToastContainer />
      <div className="mb-8 border border-gray-200 shadow-lg p-4 rounded">
        <div className="grid grid-cols-2 gap-2">
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2 uppercase font-serif">
              Heading
            </label>
            <input
              type="text"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2 font-serif uppercase">
              Sub heading
            </label>
            <input
              type="text"
              value={subheading}
              onChange={(e) => setSubheading(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
            />
          </div>
        </div>
        <button
          onClick={saveHeadings}
          className="px-4 py-2 bg-[#ffcc00] text-[#1a1a1a] rounded hover:bg-[#e6b800] transition duration-300 font-serif"
        >
          Save
        </button>
      </div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-700 font-serif uppercase">Clients</h1>
        <button className="px-4 py-2 bg-[#ffcc00] text-[#1a1a1a] rounded hover:bg-[#e6b800] transition duration-300 font-serif">
          <Link to="/add-client">
            <Plus size={15} />
          </Link>
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
      <h2 className="text-md font-semibold mb-4">Manage your clients</h2>
      {loadings ? (
        <div className="flex justify-center">
          <UseAnimations animation={loading} size={56} />
        </div>
      ) : (
        <>
          {clients.length === 0 ? (
            <div className="flex justify-center items-center">
              <iframe 
                className="w-96 h-96" 
                src="https://lottie.host/embed/1ce6d411-765d-4361-93ca-55d98fefb13b/AonqR3e5vB.json"
              ></iframe>
            </div>
          ) : (
            <table className="w-full mt-4 border-collapse overflow-x-auto" {...getTableProps()}>
              <thead className="bg-[#ffcc00] text-[#1a1a1a] hover:bg-slate-800 text-white">
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps(column.getSortByToggleProps())}
                        className="py-2 px-4 border-b border-gray-300 cursor-pointer uppercase font-serif"
                      >
                        <div className="flex items-center gap-2">
                          <span>{column.render("Header")}</span>
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
                {rows.map((row) => {
                  prepareRow(row);
                  return (
                    <tr 
                      {...row.getRowProps()} 
                      className="border-b border-gray-300 hover:bg-gray-100 transition duration-150"
                    >
                      {row.cells.map((cell) => (
                        <td {...cell.getCellProps()} className="py-2 px-4">
                          {cell.render("Cell")}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default ClientsTable;




