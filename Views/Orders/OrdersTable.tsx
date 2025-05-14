"use client";

import { DataTable } from "@/components/DataTable/DataTable";
import OrderDetailPopup from "./Details";
import { useState } from "react";
import { FiRefreshCcw } from "react-icons/fi";
import { OrderOperation } from "@/lib/main";

export type Order = {
    id: string;
    customerName: string;
    trackingNumber: string;
    paymentMethod: 'cod' | 'bank';
    createdAt: string;
    total: number;
    status: "pending" | "processing" | 'shipped' | 'delivered' | "cancelled";
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
    const [updating, setUpdating] = useState(false);
    const orderOp = new OrderOperation();
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [notification, setNotification] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    const handleRowClick = (order: Order) => {
        setSelectedOrder(order);
        setIsPopupOpen(true);
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            setUpdating(true);
            const response = await orderOp.updateStatus(newStatus, orderId);
            if (response.success) {
                setNotification({
                    type: 'success',
                    message: "Cập nhật thành công!"
                });
                onReload();
            } else {
                setNotification({
                    type: 'error',
                    message: "Cập nhật không thành công"
                });
            }
        } catch (error) {
            console.log(error);
        } finally {
            setUpdating(false);
            setTimeout(() => {
                setNotification(null);
            }, 5000);
            setIsPopupOpen(false);
        }
    }

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
        if (sta === 'shipped') {
            return "Đang giao";
        }
        if (sta === 'delivered') {
            return "Hoàn thành";
        }
        if (sta === 'cancelled') {
            return "Đã huỷ";
        }
        return sta;
    }

    return (
        <div className="p-6">
            {notification && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    } text-white animate-fade-in-down`}>
                    <div className="flex items-center">
                        {notification.type === 'success' ? (
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        )}
                        <span>{notification.message}</span>
                    </div>
                </div>
            )}
            <DataTable
                columns={[
                    { title: "Khách hàng", render: (o) => o.customerName },
                    { title: "Mã vận đơn", render: (o) => o.trackingNumber },
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
                searchFields={["customerName", "status", 'trackingNumber']}
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
                updateOrderStatus={handleUpdateStatus}
                updating={updating}
            />
        </div>
    );
}
