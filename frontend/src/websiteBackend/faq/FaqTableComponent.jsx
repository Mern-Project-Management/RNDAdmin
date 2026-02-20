import React, { useMemo, useState } from 'react';
import { useTable, useSortBy } from "react-table";
import { FaEdit, FaTrashAlt, FaCheck, FaEye, FaTimes, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { Collapse, Typography, Pagination } from "antd";

const { Panel } = Collapse;
const { Title } = Typography;

export const FaqTableComponent = ({ faqs, searchTerm, navigate, handleView, deleteFaq }) => {
  console.log("Rendering FaqTableComponent with FAQs:", faqs);
  const [categoryPage, setCategoryPage] = useState(1);
  const [dataPage, setDataPage] = useState({});
  const categoriesPerPage = 5;
  const dataPerPage = 20;

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [faqs, searchTerm]);

  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "id",
      },
      {
        Header: "Question",
        accessor: "question",
        Cell: ({ row }) => (
          <span
            className="hover:text-blue-500 cursor-pointer"
            onClick={() => navigate(`/faq/editFAQ/${row.original._id}`)}
          >
            {row.original.question}
          </span>
        ),
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) =>
          value === "active" ? (
            <FaCheck className="text-green-500" />
          ) : (
            <FaTimes className="text-red-500" />
          ),
        disableSortBy: true,
      },
      {
        Header: "Options",
        Cell: ({ row }) => (
          <div className="flex gap-4">
            <button
              className="text-gray-600 hover:text-gray-800 transition"
              onClick={() => handleView(row.original)}
            >
              <FaEye />
            </button>
            <button className="text-blue-500 hover:text-blue-700 transition">
              <Link to={`/faq/editFAQ/${row.original._id}`}>
                <FaEdit />
              </Link>
            </button>
            <button
              className="text-red-500 hover:text-red-700 transition"
              onClick={() => deleteFaq(row.original._id)}
            >
              <FaTrashAlt />
            </button>
          </div>
        ),
        disableSortBy: true,
      },
    ],
    [navigate, handleView, deleteFaq]
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
      data: filteredFaqs,
    },
    useSortBy
  );

  // Group FAQs by categories — fix: extract _id as key, category as label
  const categorizedFaqs = useMemo(() => {
    return filteredFaqs.reduce((acc, faq) => {
      const categoryObj = faq.serviceparentCategoryId;
      const categoryKey = categoryObj?._id || "Uncategorized";
      const categoryLabel = categoryObj?.category || "Uncategorized";

      if (!acc[categoryKey]) {
        acc[categoryKey] = { label: categoryLabel, faqs: [] };
      }
      acc[categoryKey].faqs.push(faq);
      return acc;
    }, {});
  }, [filteredFaqs]);

  // Get paginated categories
  const categoryKeys = Object.keys(categorizedFaqs);

  const paginatedCategories = useMemo(() => {
    return categoryKeys.slice(
      (categoryPage - 1) * categoriesPerPage,
      categoryPage * categoriesPerPage
    );
  }, [categoryKeys, categoryPage]);

  // Per-category page handler
  const getCategoryPage = (categoryKey) => dataPage[categoryKey] || 1;
  const setCategoryDataPage = (categoryKey, page) => {
    setDataPage((prev) => ({ ...prev, [categoryKey]: page }));
  };

  return (
    <>
      <Collapse accordion>
        {paginatedCategories.map((categoryKey) => {
          const { label, faqs: categoryFaqs } = categorizedFaqs[categoryKey];
          const currentPage = getCategoryPage(categoryKey);

          return (
            <Panel
              key={categoryKey}
              header={
                <span>
                  <strong>{label}</strong> &mdash; {categoryFaqs.length} FAQs
                </span>
              }
            >
              <div className="overflow-x-auto">
                <table
                  {...getTableProps()}
                  className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg"
                >
                  <thead className="bg-gray-50">
                    {headerGroups.map((headerGroup) => (
                      <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map((column) => (
                          <th
                            {...column.getHeaderProps(
                              column.getSortByToggleProps()
                            )}
                            className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider select-none"
                          >
                            <div className="flex items-center gap-1">
                              {column.render("Header")}
                              {column.canSort && (
                                <span className="ml-1">
                                  {column.isSorted ? (
                                    column.isSortedDesc ? (
                                      <FaArrowDown className="text-gray-500" />
                                    ) : (
                                      <FaArrowUp className="text-gray-500" />
                                    )
                                  ) : (
                                    <FaArrowUp className="text-gray-300" />
                                  )}
                                </span>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody
                    {...getTableBodyProps()}
                    className="bg-white divide-y divide-gray-100"
                  >
                    {categoryFaqs
                      .slice(
                        (currentPage - 1) * dataPerPage,
                        currentPage * dataPerPage
                      )
                      .map((faq) => {
                        const row = rows.find(
                          (r) => r.original._id === faq._id
                        );
                        if (!row) return null;
                        prepareRow(row);
                        return (
                          <tr
                            {...row.getRowProps()}
                            key={row.id}
                            className="hover:bg-gray-50 transition"
                          >
                            {row.cells.map((cell) => (
                              <td
                                {...cell.getCellProps()}
                                className="px-4 py-3 text-sm text-gray-700"
                              >
                                {cell.render("Cell")}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Per-category pagination */}
              {categoryFaqs.length > dataPerPage && (
                <div className="flex justify-end mt-3">
                  <Pagination
                    current={currentPage}
                    pageSize={dataPerPage}
                    total={categoryFaqs.length}
                    onChange={(page) => setCategoryDataPage(categoryKey, page)}
                    showSizeChanger={false}
                  />
                </div>
              )}
            </Panel>
          );
        })}
      </Collapse>

      {/* Category-level pagination */}
      {categoryKeys.length > categoriesPerPage && (
        <div className="flex justify-end mt-4">
          <Pagination
            current={categoryPage}
            pageSize={categoriesPerPage}
            total={categoryKeys.length}
            onChange={(page) => setCategoryPage(page)}
            showSizeChanger={false}
          />
        </div>
      )}
    </>
  );
};