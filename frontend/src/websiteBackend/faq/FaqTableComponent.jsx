import React, { useMemo, useState } from 'react';
import { useTable, useSortBy } from "react-table";
import { FaEdit, FaTrashAlt, FaCheck, FaEye, FaTimes, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { Collapse, Typography, Pagination } from "antd";

const { Panel } = Collapse;
const { Title } = Typography;

export const FaqTableComponent = ({ faqs, searchTerm, navigate, handleView, deleteFaq, simple }) => {
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
            className="cursor-pointer"
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
              className="text-slate-800 hover:text-slate-600 transition"
              onClick={() => handleView(row.original)}
            >
              <FaEye />
            </button>
            <button className="text-green-500 hover:text-green-700 transition">
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

  // Group FAQs into a hierarchical tree
  const hierarchicalFaqs = useMemo(() => {
    const tree = {};

    filteredFaqs.forEach((faq) => {
      if (faq.blogId) {
        const pId = "Blogs";
        const pLabel = "Blogs";
        if (!tree[pId]) tree[pId] = { label: pLabel, faqs: [], subs: {} };
        tree[pId].faqs.push(faq);
        return;
      }

      const parent = faq.serviceparentCategoryId;
      const sub = faq.servicesubCategoryId;
      const subSub = faq.servicesubSubCategoryId;

      const pId = parent?._id || "Uncategorized";
      const pLabel = parent?.category || "Uncategorized";

      if (!tree[pId]) tree[pId] = { label: pLabel, faqs: [], subs: {} };

      if (sub?._id) {
        const sId = sub._id;
        const sLabel = sub.category;
        if (!tree[pId].subs[sId]) tree[pId].subs[sId] = { label: sLabel, faqs: [], subSubs: {} };

        if (subSub?._id) {
          const ssId = subSub._id;
          const ssLabel = subSub.category;
          if (!tree[pId].subs[sId].subSubs[ssId]) tree[pId].subs[sId].subSubs[ssId] = { label: ssLabel, faqs: [] };
          tree[pId].subs[sId].subSubs[ssId].faqs.push(faq);
        } else {
          tree[pId].subs[sId].faqs.push(faq);
        }
      } else {
        tree[pId].faqs.push(faq);
      }
    });

    return tree;
  }, [filteredFaqs]);

  const renderFaqTable = (data) => (
    <div className="overflow-x-auto my-2">
      <table {...getTableProps()} className="min-w-full divide-y divide-gray-200 border border-gray-100 rounded-lg shadow-sm">
        <thead className="bg-[#ffd333] text-white">
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className="px-4 py-2 text-left text-[11px] font-bold uppercase tracking-wider"
                >
                  <div className="flex items-center gap-1">
                    {column.render("Header")}
                    {column.canSort && (
                      <span>
                        {column.isSorted ? (
                          column.isSortedDesc ? <FaArrowDown /> : <FaArrowUp />
                        ) : <FaArrowUp className="opacity-20" />}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-50">
          {data.map((faq) => {
            const row = rows.find((r) => r.original._id === faq._id);
            if (!row) return null;
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} key={row.id} className="hover:bg-blue-50/30 transition-colors">
                {row.cells.map((cell) => (
                  <td {...cell.getCellProps()} className="px-4 py-2 text-sm text-gray-600">
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  if (simple) {
    return (
      <div className="faq-simple-table-container mt-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        {renderFaqTable(filteredFaqs)}
      </div>
    );
  }

  return (
    <div className="faq-hierarchy-container mt-6">
      <Collapse accordion className="bg-white border-0 shadow-sm rounded-xl overflow-hidden">
        {Object.entries(hierarchicalFaqs).map(([pId, parent]) => (
          <Panel
            key={pId}
            header={
              <div className="flex items-center justify-between w-full pr-4">
                <span className="font-bold text-gray-800 text-base">{parent.label}</span>
                <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-medium">
                  {filteredFaqs.filter(f => f.serviceparentCategoryId?._id === pId || (pId === "Uncategorized" && !f.serviceparentCategoryId)).length} Total
                </span>
              </div>
            }
            className="border-b border-gray-100 last:border-0"
          >
            {/* Directly attached Parent FAQs */}
            {parent.faqs.length > 0 && (
              <div className="mb-4 ml-2 border-l-2 border-blue-200 pl-4">
                <Title level={5} className="!mb-2 !text-blue-500 !text-sm uppercase tracking-wide">Category Specific FAQs</Title>
                {renderFaqTable(parent.faqs)}
              </div>
            )}

            {/* Sub Categories */}
            {Object.keys(parent.subs).length > 0 && (
              <Collapse ghost className="sub-category-collapse ml-2">
                {Object.entries(parent.subs).map(([sId, sub]) => (
                  <Panel
                    key={sId}
                    header={<span className="font-semibold text-gray-700">{sub.label}</span>}
                    className="mb-2 bg-gray-50/50 rounded-lg border border-gray-100"
                  >
                    {sub.faqs.length > 0 && (
                      <div className="mb-4 ml-4 border-l-2 border-green-200 pl-4">
                        <Title level={5} className="!mb-2 !text-green-600 !text-xs uppercase tracking-wide">Sub-Category Specific FAQs</Title>
                        {renderFaqTable(sub.faqs)}
                      </div>
                    )}

                    {/* Sub Sub Categories */}
                    {Object.keys(sub.subSubs).length > 0 && (
                      <Collapse ghost className="sub-sub-category-collapse ml-4">
                        {Object.entries(sub.subSubs).map(([ssId, subSub]) => (
                          <Panel
                            key={ssId}
                            header={<span className="text-gray-600 font-medium italic">{subSub.label}</span>}
                            className="bg-white/80 rounded border border-gray-50 mb-1"
                          >
                            {renderFaqTable(subSub.faqs)}
                          </Panel>
                        ))}
                      </Collapse>
                    )}
                  </Panel>
                ))}
              </Collapse>
            )}
          </Panel>
        ))}
      </Collapse>

      {/* Main Pagination (optional if categories are too many) */}
      {Object.keys(hierarchicalFaqs).length > categoriesPerPage && (
        <div className="flex justify-end mt-6">
          <Pagination
            current={categoryPage}
            pageSize={categoriesPerPage}
            total={Object.keys(hierarchicalFaqs).length}
            onChange={(page) => setCategoryPage(page)}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
};
