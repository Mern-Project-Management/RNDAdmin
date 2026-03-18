import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp, EllipsisVertical, MoreVertical, Plus } from "lucide-react";
import FollowUpModal from "./FollowUpModel";
import { useDeleteInquiryMutation, useDeleteMultipleInquiriesMutation } from "@/slice/inquiry/inquiry";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useGetInquiriesQuery } from "@/slice/inquiry/inquiry";
import { Link, Links } from "react-router-dom";
import { useGetAllStatusesQuery } from "@/slice/status/status";
import { useGetAllSourcesQuery } from "@/slice/source/source";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Modal } from "antd";

// Define all possible statuses
const ALL_STATUSES = [
    "Contact in Future",
    "Pending",
    "Completed",
    "In Progress",
    "New Inquiry",
    "Rejected",
    "On Hold"
];

export default function InquiryList() {
    const { data: inquiryData = [], isLoading, isError } = useGetInquiriesQuery();
    console.log(inquiryData)
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [data, setData] = useState(inquiryData);
    const [deleteInquiry] = useDeleteInquiryMutation();
    const [deleteMultipleInquiries] = useDeleteMultipleInquiriesMutation();
    const { data: statuses, isLoading: statusesLoading } = useGetAllStatusesQuery();
    const { data: sources, isLoading: sourcesLoading } = useGetAllSourcesQuery();
    // console.log(statuses)
    // State for filters
    const [companyNameFilter, setCompanyNameFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState(null);
    const [sourceFilter, setSourceFilter] = useState(null);
    const [nameFilter, setNameFilter] = useState(null);
    const [emailFilter, setEmailFilter] = useState("");
    const [mobileFilter, setMobileFilter] = useState("");
    const [cityFilter, setCityFilter] = useState("");
    const [selectedInquiries, setSelectedInquiries] = useState([]);
    const [expandedRowId, setExpandedRowId] = useState(null);

    const toggleRowExpand = (id) => {
        setExpandedRowId(prevId => prevId === id ? null : id);
    };

    // Filtering function
    const filteredData = inquiryData.filter(item => {
        return (
            (companyNameFilter === "" ||
                (item.organisation || '').toLowerCase().includes(companyNameFilter.toLowerCase())) &&
            (statusFilter === null || item.status === statusFilter) &&
            (sourceFilter === null || item.source === sourceFilter) &&
            (nameFilter === null ||
                (item.name || '').toLowerCase().includes(nameFilter.toLowerCase())) &&
            (emailFilter === "" ||
                (item.email || '').toLowerCase().includes(emailFilter.toLowerCase())) &&
            (mobileFilter === "" ||
                (item.phone || '').toLowerCase().includes(mobileFilter.toLowerCase()))
        );
    });
    const handleDelete = async (inquiryId) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this inquiry?',
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteInquiry(inquiryId);
                    setData(prevData => prevData.filter(item => item._id !== inquiryId));
                } catch (error) {
                    console.error("Error deleting inquiry:", error);
                }
            },
        });
    };

    const handleBulkDelete = async () => {
        Modal.confirm({
            title: `Are you sure you want to delete ${selectedInquiries.length} inquiries?`,
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteMultipleInquiries(selectedInquiries).unwrap();
                    setSelectedInquiries([]);
                } catch (error) {
                    console.error("Error deleting multiple inquiries:", error);
                }
            },
        });
    };


    // Handle status update for a specific inquiry
    const handleStatusUpdate = (inquiry, newStatus) => {
        setData(prevData =>
            prevData.map(item =>
                item.companyName === inquiry.companyName
                    ? { ...item, status: newStatus }
                    : item
            )
        );
    };

    const handleFollowUpAdded = (inquiry, newTotalTasks) => {
        setData(prevData =>
            prevData.map(item =>
                item.companyName === inquiry.companyName
                    ? { ...item, totalTasks: newTotalTasks }
                    : item
            )
        );
    };

    const handleInquirySelect = (inquiryId) => {
        setSelectedInquiries((prev) =>
            prev.includes(inquiryId)
                ? prev.filter((id) => id !== inquiryId)
                : [...prev, inquiryId]
        );
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedInquiries(filteredData.map(item => item._id));
        } else {
            setSelectedInquiries([]);
        }
    };

    const formatUrl = (url) => {
        if (!url || url === 'Manual Entry') return 'Manual Entry';
        try {
            const urlObj = new URL(url);
            return urlObj.pathname;
        } catch (e) {
            return url;
        }
    };

    return (
        <div className="p-4">
            {selectedInquiries.length > 0 && (
                <div className="mb-4 flex gap-4">
                    <Button
                        variant="destructive"
                        onClick={handleBulkDelete}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        Delete Selected ({selectedInquiries.length})
                    </Button>
                </div>
            )}

            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-semibold">Inquiry List</h1>
                <Link to='/add-inquiry'>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Inquiry
                    </Button>
                </Link>

            </div>

            <Table className="border">
                <TableHeader>
                    <TableRow className="border-b bg-gray-100">
                        <TableHead className="w-12">
                            <Checkbox
                                checked={selectedInquiries.length === filteredData.length && filteredData.length > 0}
                                onCheckedChange={handleSelectAll}
                            />
                        </TableHead>
                        <TableHead className="lg:w-[100px] w-[50px] sticky left-0 bg-background z-50">Date</TableHead>
                        <TableHead className="text-left">Info</TableHead>
                        <TableHead className="text-left">Status</TableHead>
                        <TableHead className="text-left">Source</TableHead>
                        <TableHead className="text-left">Page</TableHead>
                        {/* <TableHead className="text-left">Email</TableHead> */}
                        <TableHead className="text-left">Message</TableHead>
                        <TableHead className="text-left">Follow Up</TableHead>
                        <TableHead className="w-[80px] text-left">Actions</TableHead>
                    </TableRow>
                    <TableRow className="border-b">
                        <TableHead></TableHead>
                        <TableHead></TableHead>
                        <TableHead>
                            <Input
                                placeholder="Search Info"
                                className="w-[180px]"
                                value={nameFilter || ""}
                                onChange={(e) => setNameFilter(e.target.value)}
                            />
                        </TableHead>
                        <TableHead>
                            <Select
                                value={statusFilter || "reset"}
                                onValueChange={(value) => setStatusFilter(value === "reset" ? null : value)}
                            >
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="reset">All Statuses</SelectItem>
                                    {statuses?.data?.map((status) => (
                                        <SelectItem key={status._id} value={status.status}>
                                            {status.status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </TableHead>
                        <TableHead>
                            <Select
                                value={sourceFilter || "reset"}
                                onValueChange={(value) => setSourceFilter(value === "reset" ? null : value)}
                            >
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Source" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="reset">All Sources</SelectItem>
                                    {sources?.data?.map((source) => (
                                        <SelectItem key={source._id} value={source.source}>
                                            {source.source}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </TableHead>
                        <TableHead></TableHead>
                        <TableHead></TableHead>
                        <TableHead></TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredData.map((item, index) => (
                        <TableRow key={index} className="border-b">
                            <TableCell className="p-5">
                                <Checkbox
                                    checked={selectedInquiries.includes(item._id)}
                                    onCheckedChange={() => handleInquirySelect(item._id)}
                                />
                            </TableCell>
                            <TableCell className="sticky left-0 bg-background">{item.createdAt.slice(0, 10)}</TableCell>
                            <TableCell>
                                <div className="space-y-1">
                                    <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                                    <div className="text-xs text-[#304a8a] font-medium">{item.email}</div>
                                    
                                    {expandedRowId === item._id && (
                                        <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2.5 text-sm shadow-inner scale-in-95 animate-in fade-in duration-200">
                                            {/* Core Information */}
                                            <div className="flex gap-3 border-b border-gray-200 pb-1.5">
                                                <span className="font-bold text-gray-500 w-24 shrink-0 uppercase text-[10px] tracking-widest mt-0.5">Full Name</span>
                                                <span className="text-gray-900 font-bold">{item.name}</span>
                                            </div>
                                            <div className="flex gap-3 border-b border-gray-200 pb-1.5">
                                                <span className="font-bold text-gray-500 w-24 shrink-0 uppercase text-[10px] tracking-widest mt-0.5">Email</span>
                                                <span className="text-[#304a8a] font-medium">{item.email}</span>
                                            </div>

                                            {/* Conditionally render fields only if they exist */}
                                            {item.organisation && (
                                                <div className="flex gap-3 border-b border-gray-200 pb-1.5">
                                                    <span className="font-bold text-gray-500 w-24 shrink-0 uppercase text-[10px] tracking-widest mt-0.5">Organisation</span>
                                                    <span className="text-gray-900 font-medium">{item.organisation}</span>
                                                </div>
                                            )}
                                            
                                            {(item.service || item.department) && (
                                                <div className="flex gap-3 border-b border-gray-200 pb-1.5">
                                                    <span className="font-bold text-gray-500 w-24 shrink-0 uppercase text-[10px] tracking-widest mt-0.5">Service</span>
                                                    <span className="text-[#304a8a] font-bold">{item.service || item.department}</span>
                                                </div>
                                            )}

                                            {(item.firstName || item.lastName) && (
                                                <div className="flex gap-3 border-b border-gray-200 pb-1.5">
                                                    <span className="font-bold text-gray-500 w-24 shrink-0 uppercase text-[10px] tracking-widest mt-0.5">Name Parts</span>
                                                    <span className="text-gray-900 font-medium">{item.firstName || ""} {item.lastName || ""}</span>
                                                </div>
                                            )}

                                            {item.phone && (
                                                <div className="flex gap-3 border-b border-gray-200 pb-1.5">
                                                    <span className="font-bold text-gray-500 w-24 shrink-0 uppercase text-[10px] tracking-widest mt-0.5">Phone</span>
                                                    <span className="text-gray-900 font-medium">{item.phone}</span>
                                                </div>
                                            )}

                                            {item.country && (
                                                <div className="flex gap-3 border-b border-gray-200 pb-1.5">
                                                    <span className="font-bold text-gray-500 w-24 shrink-0 uppercase text-[10px] tracking-widest mt-0.5">Country</span>
                                                    <span className="text-gray-900 font-medium">{item.country}</span>
                                                </div>
                                            )}

                                            {item.source && (
                                                <div className="flex gap-3 border-b border-gray-200 pb-1.5">
                                                    <span className="font-bold text-gray-500 w-24 shrink-0 uppercase text-[10px] tracking-widest mt-0.5">Source</span>
                                                    <span className="text-gray-900 font-medium">{item.source}</span>
                                                </div>
                                            )}

                                            {item.url && item.url !== 'Manual Entry' && (
                                                <div className="flex gap-3 border-b border-gray-200 pb-1.5">
                                                    <span className="font-bold text-gray-500 w-24 shrink-0 uppercase text-[10px] tracking-widest mt-0.5">Inquiry Page</span>
                                                    <span className="text-blue-600 font-medium break-all hover:underline cursor-pointer" onClick={() => window.open(item.url, '_blank')}>
                                                        {item.url}
                                                    </span>
                                                </div>
                                            )}

                                            {item.address && (
                                                <div className="flex gap-3 border-b border-gray-200 pb-1.5">
                                                    <span className="font-bold text-gray-500 w-24 shrink-0 uppercase text-[10px] tracking-widest mt-0.5">Address</span>
                                                    <span className="text-gray-900 font-medium whitespace-pre-wrap">{item.address}</span>
                                                </div>
                                            )}

                                            {item.message && (
                                                <div className="flex gap-3 pt-1">
                                                    <span className="font-bold text-gray-500 w-24 shrink-0 uppercase text-[10px] tracking-widest mt-1">Message</span>
                                                    <div className="bg-white border border-gray-100 rounded-lg p-3 text-gray-800 text-xs w-full shadow-sm">
                                                        {item.message}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => toggleRowExpand(item._id)}
                                        className="text-[#304a8a] text-xs font-bold hover:underline focus:outline-none flex items-center gap-1 mt-2"
                                    >
                                        {expandedRowId === item._id ? (
                                            <><ChevronUp className="w-4 h-4" /> View Less</>
                                        ) : (
                                            <><ChevronDown className="w-4 h-4" /> View Detailed Info</>
                                        )}
                                    </button>
                                </div>
                            </TableCell>
                            <TableCell>
                                {item.status ? (
                                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-indigo-50 text-[#304a8a] border border-indigo-100">
                                        {item.status}
                                    </span>
                                ) : (
                                    <span className="text-xs font-medium px-2.5 py-1 rounded bg-gray-50 text-gray-400 border border-gray-200 italic">
                                        Pending
                                    </span>
                                )}
                            </TableCell>
                            <TableCell>
                                {item.source ? <span className="font-medium text-gray-800">{item.source}</span> : <span className="text-gray-400 text-sm italic">Not set</span>}
                            </TableCell>
                            <TableCell>
                                <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-700 border border-gray-200">
                                    {formatUrl(item.url)}
                                </span>
                            </TableCell>
                            {/* <TableCell>{item.email}</TableCell> */}
                            <TableCell>
                                {item.message ? (
                                    <div>
                                        <p className={`text-sm text-gray-800 leading-relaxed ${expandedRowId === item._id ? '' : 'line-clamp-2'}`}>
                                            {item.message}
                                        </p>
                                    </div>
                                ) : (
                                    <span className="text-gray-400 text-sm italic">No message</span>
                                )}
                            </TableCell>
                            <TableCell className="text-left">
                                <FollowUpModal
                                    inquiry={item}
                                    onFollowUpAdded={handleFollowUpAdded}
                                />
                            </TableCell>
                            <TableCell className="text-center">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="h-9 w-9 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors">
                                            <EllipsisVertical className="h-5 w-5 text-gray-500" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[180px] p-1 shadow-xl">
                                        <Link to={`/edit-inquiry/${item._id}`}>
                                            <DropdownMenuItem className="cursor-pointer font-medium py-2">
                                                Edit Inquiry
                                            </DropdownMenuItem>
                                        </Link>
                                        <DropdownMenuItem 
                                            onClick={() => handleDelete(item._id)}
                                            className="text-red-600 focus:text-red-700 cursor-pointer font-bold py-2"
                                        >
                                            Delete Inquiry
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm">Items per page:</span>
                    <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                        <SelectTrigger className="w-[70px]">
                            <SelectValue>{itemsPerPage}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="15">15</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="text-sm text-muted-foreground">
                    {`1-${Math.min(itemsPerPage, filteredData.length)} of ${filteredData.length}`}
                </div>
            </div>
        </div>
    );
}