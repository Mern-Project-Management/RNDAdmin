import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";

export default function ExportModal({ data }) {
    const [isOpen, setIsOpen] = useState(false);
    const [exportOption, setExportOption] = useState("all");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");

    const filteredData = useMemo(() => {
        if (!data) return [];
        let filtered = [...data];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (exportOption === "today") {
            filtered = filtered.filter(item => {
                const itemDate = new Date(item.createdAt);
                itemDate.setHours(0, 0, 0, 0);
                return itemDate.getTime() === today.getTime();
            });
        } else if (exportOption === "custom" && fromDate && toDate) {
            const from = new Date(fromDate);
            from.setHours(0, 0, 0, 0);
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999);
            filtered = filtered.filter(item => {
                const itemDate = new Date(item.createdAt);
                return itemDate >= from && itemDate <= to;
            });
        } else if (exportOption === "monthly" && selectedMonth) {
            const [year, month] = selectedMonth.split("-");
            filtered = filtered.filter(item => {
                const itemDate = new Date(item.createdAt);
                return itemDate.getFullYear() === parseInt(year) && itemDate.getMonth() === parseInt(month) - 1;
            });
        }
        return filtered;
    }, [data, exportOption, fromDate, toDate, selectedMonth]);

    const previewData = filteredData.slice(0, 50);

    const handleExport = () => {
        if (filteredData.length === 0) return;

        const headers = ["Date", "Name", "Email", "Phone", "Service", "Message", "Status", "Source"];
        const csvRows = [];
        csvRows.push(headers.join(","));

        filteredData.forEach(item => {
            const date = new Date(item.createdAt);
            const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
            
            const row = [
                `"\t${formattedDate}"`,
                `"${(item.name || "").replace(/"/g, '""')}"`,
                `"${(item.email || "").replace(/"/g, '""')}"`,
                `"\t${item.phone || ""}"`,
                `"${(item.department || item.service || "").replace(/"/g, '""')}"`,
                `"${(item.message || "").replace(/"/g, '""')}"`,
                `"${(item.status || "").replace(/"/g, '""')}"`,
                `"${(item.source || "").replace(/"/g, '""')}"`
            ];
            csvRows.push(row.join(","));
        });

        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `inquiries_export_${new Date().getTime()}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    <Download className="w-4 h-4" /> Export
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Export Inquiries to CSV</DialogTitle>
                </DialogHeader>
                
                <div className="flex flex-col gap-4 py-4 flex-shrink-0">
                    <div className="flex gap-4 items-end">
                        <div className="space-y-2 flex-1">
                            <label className="text-sm font-medium">Export Options</label>
                            <Select value={exportOption} onValueChange={setExportOption}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select export option" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Export All Inquiries</SelectItem>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="custom">Custom Date Range</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {exportOption === "custom" && (
                            <>
                                <div className="space-y-2 flex-1">
                                    <label className="text-sm font-medium">From Date</label>
                                    <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                                </div>
                                <div className="space-y-2 flex-1">
                                    <label className="text-sm font-medium">To Date</label>
                                    <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
                                </div>
                            </>
                        )}

                        {exportOption === "monthly" && (
                            <div className="space-y-2 flex-1">
                                <label className="text-sm font-medium">Select Month</label>
                                <Input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-auto border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[110px] whitespace-nowrap">Date</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Message</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {previewData.length > 0 ? previewData.map((item, idx) => {
                                const date = new Date(item.createdAt);
                                const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
                                return (
                                    <TableRow key={idx}>
                                        <TableCell className="whitespace-nowrap">{formattedDate}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.email}</TableCell>
                                        <TableCell>{item.service || item.department}</TableCell>
                                        <TableCell className="max-w-[150px] truncate" title={item.message}>{item.message}</TableCell>
                                    </TableRow>
                                );
                            }) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4">No data available for the selected filters.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t flex-shrink-0">
                    <Button variant="outline" className="bg-gray-200 hover:bg-gray-300 text-gray-800" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleExport} disabled={filteredData.length === 0}>
                        Export to CSV ({filteredData.length} items)
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
