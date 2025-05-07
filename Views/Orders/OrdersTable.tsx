"use client";

import { DataTable } from "@/components/DataTable/DataTable";
import OrderDetailPopup from "./Details";
import { useState } from "react";
import { FiRefreshCcw } from "react-icons/fi";

export type Order = {
    id: number;
    customerName: string;
    trackingNumber: string;
    paymentMethod: 'cod' | 'bank';
    createdAt: string;
    total: number;
    status: "pending" | "processing" | "completed" | "cancelled";
    numberOfItems: number;
    items: {
        productId: number;
        productName: string;
        size: string;
        quantity: number;
        price_at_order: number;
        price: number;
    }[];
};

export default function OrdersPage({ orders, onReload }: { orders: Order[], onReload: () => void }) {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const handleRowClick = (order: Order) => {
        setSelectedOrder(order);
        setIsPopupOpen(true);
    };

    const getPaymentMethods = (met: string) => {
        if (met === 'cod') {
            return "Thanh toán khi nhận hàng";
        }
        if (met === 'bank') {
            return "Chuyển khoản";
        }
        return met;
    }

    const getStatus = (sta: string) => {
        if (sta === 'pending') {
            return "Vừa tạo";
        }
        if (sta === 'processing') {
            return "Đang xử lý";
        }
        if (sta === 'completed') {
            return "Hoàn thành";
        }
        if (sta === 'cancelled') {
            return "Đã huỷ";
        }
        return sta;
    }

    return (
        <div className="p-6">
            <DataTable
                columns={[
                    { title: "Khách hàng", render: (o) => o.customerName },
                    {
                        title: "Ngày đặt", render: (o) => {
                            const date = new Date(o.createdAt);
                            return date.toLocaleDateString('vi-VN');
                        }
                    },
                    { title: "Tổng tiền", render: (o) => `${o.total.toLocaleString()}₫` },
                    { title: "Phương thức", render: (o) => getPaymentMethods(o.paymentMethod) },
                    { title: "Trạng thái", render: (o) => getStatus(o.status) },
                    { title: "Số lượng sản phẩm", render: (o) => o.numberOfItems },
                    // { title: "Chi tiết", render: (o) => o.items.map(item => item.productName).join(", ") },
                ]}
                data={orders}
                searchable={true}
                searchFields={["customerName", "status"]}
                rowKey={(order) => order.id}
                pagination={true}
                actions={
                    // <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    //     onClick={() => onReload()}>
                    //     Tải lại
                    // </button>
                    <div className="flex gap-2 mb-4">
                        <button
                            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            onClick={onReload}
                        >
                            <FiRefreshCcw />
                            Tải lại
                        </button>
                    </div>
                }
                itemsPerPage={10}
                selectable="none"
                onSelectionChange={(selected) => console.log("Selected orders:", selected)}
                onRowClick={(order) => handleRowClick(order)}
                className="p-4 bg-white rounded-lg shadow"
            />
            <OrderDetailPopup
                order={selectedOrder}
                isOpen={isPopupOpen}
                onClose={() => setIsPopupOpen(false)}
            />
        </div>
    );
}
