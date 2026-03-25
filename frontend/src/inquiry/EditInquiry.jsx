import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { 
    Form, 
    FormControl, 
    FormField, 
    FormItem, 
    FormLabel, 
    FormMessage 
} from "@/components/ui/form";
import { useAddInquiryMutation, useGetInquiryByIdQuery, useUpdateInquiryMutation } from "@/slice/inquiry/inquiry";
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom'; // Import useNavigate and useParams
import { BreadcrumbWithCustomSeparator } from '@/breadCrumb/BreadCrumb';
import { useGetAllStatusesQuery } from '@/slice/status/status';

const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Inquiry Table", href: "/inquiry-list" },
    { label: "Inquiry Form", href: null }, // No `href` indicates the current page
]
// Define validation schema
const inquirySchema = z.object({
    organisation: z.string().min(2, { message: "Organisation/Company name must be at least 2 characters" }),
    name: z.string().min(2, { message: "Full name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    phone: z.string()
        .regex(/^[0-9]{10}$/, { message: "Phone number must be 10 digits" }),
    address: z.string().optional(),
    department: z.string().optional(),
    status: z.string({ required_error: "Please select a status" })
});

export default function EditInquiryForm({ onClose }) {
    const { id } = useParams();  // Use the id from route params
    const navigate = useNavigate(); // Initialize useNavigate
    const { data: inquiryData, isLoading: isFetching } = useGetInquiryByIdQuery(id); // Fetch inquiry data by id
    const [updateInquiry, { isLoading }] = useUpdateInquiryMutation();
    const { data: statusesData, isLoading: isLoadingStatuses } = useGetAllStatusesQuery();

    // Initialize form with zod resolver
    const form = useForm({
        resolver: zodResolver(inquirySchema),
        defaultValues: {
            organisation: "",
            name: "",
            email: "",
            phone: "",
            address: "",
            department: "",
            status: "New Inquiry"
        }
    });

    // Set form values when inquiry data is fetched
    useEffect(() => {
        if (inquiryData) {
            form.reset({
                organisation: inquiryData.organisation || "",
                name: inquiryData.name || "",
                email: inquiryData.email || "",
                phone: inquiryData.phone || "",
                address: inquiryData.address || "",
                department: inquiryData.department || "",
                status: inquiryData.status || "New Inquiry"
            });
        }
    }, [inquiryData, form]);

    // Handle form submission
    const onSubmit = async (data) => {
        try {
            // Perform update mutation
            await updateInquiry({ id, ...data }).unwrap();
            
            // Reset form
            form.reset();

            // Redirect to the inquiry list page
            navigate('/inquiry-list');
        } catch (error) {
            // Handle error
            alert(error?.data?.message || "Failed to update inquiry");
        }
    };

    if (isFetching) return <div className="p-8 text-center text-gray-500 font-medium italic">Loading inquiry details...</div>;

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="mb-6">
                <BreadcrumbWithCustomSeparator items={breadcrumbItems} />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-100 p-6">
                    <h2 className="text-2xl font-bold text-gray-900">Update Inquiry</h2>
                    <p className="text-sm text-gray-500 mt-1">Modify the inquiry details below.</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-bold">Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter full name" {...field} className="h-11 border-gray-300 focus:ring-[#ffc108]" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-bold">Email Address</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="Enter email" {...field} className="h-11 border-gray-300 focus:ring-[#ffc108]" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="organisation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-bold">Organisation / Company</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter organisation name" {...field} className="h-11 border-gray-300 focus:ring-[#ffc108]" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="department"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-bold">Service (Department)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter service/department" {...field} className="h-11 border-gray-300 focus:ring-[#ffc108]" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-bold">Phone Number</FormLabel>
                                        <FormControl>
                                            <Input type="tel" placeholder="Enter 10-digit phone" {...field} className="h-11 border-gray-300 focus:ring-[#ffc108]" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-bold">Inquiry Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-11 border-gray-300 focus:ring-[#ffc108]">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {statusesData?.data?.map((statusItem) => (
                                                    <SelectItem key={statusItem._id} value={statusItem.status}>
                                                        {statusItem.status}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-bold">Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter address" {...field} className="h-11 border-gray-300 focus:ring-[#ffc108]" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                            <Button 
                                type="button" 
                                variant="outline" 
                                className="h-11 px-8"
                                onClick={() => navigate('/inquiry-list')}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isLoading}
                                className="h-11 px-10 bg-[#ffc108]-[#1a1a1a] font-bold"
                            >
                                {isLoading ? "Updating..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
