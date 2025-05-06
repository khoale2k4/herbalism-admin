"use client";

import { DataTable } from "@/components/DataTable/DataTable";
import { useCallback, useEffect, useState } from "react";
import VoucherEditorPopup from "./CreateVoucher";
import { VoucherOperation } from "@/lib/main";

export type Voucher = {
    id: string;
    discount: number;
    type: 'amount' | 'percent';
    createdAt?: string;
};

export default function VouchersPage() {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const voucherOp = new VoucherOperation();

    const handleSubmit = async (voucher: Voucher) => {
        // const resposne = await articleOp.create(finalData.title, finalData.content, articleData.shortDescription, filteredImageUrls, articleData.category);
        const response = await voucherOp.create(voucher);
        fetchVouchers();
    };

    const handleDelete = async (id: string) => {
        const response = await voucherOp.delete(id);
        fetchVouchers();
    }

    const fetchVouchers = useCallback(async () => {
        setVouchers([]);
        const response = await voucherOp.getAll();

        if (response.success) {
            setVouchers(response.data);
        }
    }, []);

    useEffect(() => {
        fetchVouchers();
    }, [fetchVouchers])

    return (
        <div className="p-6">
            <DataTable
                columns={[
                    { title: "ID", render: (v) => v.id },
                    { title: "Loại", render: (v) => (v.type === 'amount' ? "Giảm theo giá tiền" : "Giảm theo phần trăm") },
                    { title: "Mức giảm", render: (v) => v.discount },
                    {
                        title: "Ngày tạo", render: (v) => {
                            const date = new Date(v.createdAt ?? "");
                            return date.toLocaleDateString('vi-VN');
                        }
                    },
                ]}
                data={vouchers}
                searchable={true}
                searchFields={["id", "type"]}
                rowKey={(voucher) => voucher.id}
                pagination={true}
                itemsPerPage={10}
                selectable="none"
                onSelectionChange={(selected) => console.log("Selected posts:", selected)}
                actions={
                    <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        onClick={() => setIsPopupOpen(true)}>
                        Tạo voucher
                    </button>
                }
                onRowClick={(post) => console.log("Row clicked:", post)}
                className="p-4 bg-white rounded-lg shadow"
                // onEdit={(post => console.log('Edit post:', post))}
                onDelete={(voucher) => handleDelete(voucher as string)}
            />
            {isPopupOpen && <VoucherEditorPopup
                onClose={() => setIsPopupOpen(false)}
                onSubmit={handleSubmit}
            />}
        </div>
    );
}
