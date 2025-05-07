"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Order } from "./OrdersTable";
import {
    ShoppingBag,
    Package,
    Calendar,
    DollarSign,
    AlertTriangle,
    Check,
    X,
    Clock,
    Truck,
    User
} from "lucide-react";

export default function OrderDetailPopup({
    order,
    isOpen,
    updating,
    onClose,
    updateOrderStatus,
}: {
    order: Order | null;
    isOpen: boolean;
    updating: boolean;
    onClose: () => void;
    updateOrderStatus: (orderId: string, newStatus: string) => void;
}) {
    if (!order) return null;

    const handleMarkAsShipped = () => {
        updateOrderStatus(order.id, 'confirmShipped');
    };

    const handleCancelOrder = () => {
        updateOrderStatus(order.id, 'confirmCancelled');
    };

    // Helper function to map status to color and label
    const getStatusInfo = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return {
                    color: 'bg-yellow-100 text-yellow-800',
                    icon: <Clock size={16} className="mr-1" />,
                    label: 'Chờ xử lý'
                };
            case 'processing':
                return {
                    color: 'bg-blue-100 text-blue-800',
                    icon: <Package size={16} className="mr-1" />,
                    label: 'Đang xử lý'
                };
            case 'shipped':
                return {
                    color: 'bg-green-100 text-green-800',
                    icon: <Truck size={16} className="mr-1" />,
                    label: 'Đã giao'
                };
            case 'cancelled':
                return {
                    color: 'bg-red-100 text-red-800',
                    icon: <X size={16} className="mr-1" />,
                    label: 'Đã hủy'
                };
            default:
                return {
                    color: 'bg-gray-100 text-gray-800',
                    icon: <Clock size={16} className="mr-1" />,
                    label: status
                };
        }
    };

    const statusInfo = getStatusInfo(order.status);
    const orderTotal = order.items.reduce(
        (total, item) => total + item.price_at_order * item.quantity, 0
    );
    const orderDate = new Date(order.createdAt);
    const formattedDate = new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(orderDate);

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-0 text-left align-middle shadow-xl transition-all">
                                {/* Header with gradient */}
                                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <Dialog.Title as="div" className="flex items-center">
                                            <ShoppingBag className="h-6 w-6 text-white mr-2" />
                                            <h3 className="text-lg font-medium text-white">
                                                Chi tiết đơn hàng
                                            </h3>
                                        </Dialog.Title>
                                        <div className="flex items-center">
                                            <span className="text-white font-medium mr-2">
                                                #{order.trackingNumber}
                                            </span>
                                            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${statusInfo.color}`}>
                                                {statusInfo.icon}
                                                {statusInfo.label}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {/* Customer and Order Info Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        {/* Customer Information */}
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <div className="flex items-center mb-4">
                                                <User className="h-5 w-5 text-gray-500 mr-2" />
                                                <h4 className="font-medium text-gray-700">Thông tin khách hàng</h4>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-sm">
                                                    <span className="font-medium text-gray-500">Tên:</span> {order.customerName}
                                                </p>
                                                {/* <p className="text-sm">
                                                    <span className="font-medium text-gray-500">Địa chỉ:</span> {order.address || "Không có"}
                                                </p>
                                                <p className="text-sm">
                                                    <span className="font-medium text-gray-500">Điện thoại:</span> {order.phone || "Không có"}
                                                </p>
                                                <p className="text-sm">
                                                    <span className="font-medium text-gray-500">Email:</span> {order.email || "Không có"}
                                                </p> */}
                                            </div>
                                        </div>

                                        {/* Order Information */}
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <div className="flex items-center mb-4">
                                                <Package className="h-5 w-5 text-gray-500 mr-2" />
                                                <h4 className="font-medium text-gray-700">Thông tin đơn hàng</h4>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center text-sm">
                                                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                                                    <span className="font-medium text-gray-500 mr-1">Ngày đặt:</span>
                                                    {formattedDate}
                                                </div>
                                                <div className="flex items-center text-sm">
                                                    <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                                                    <span className="font-medium text-gray-500 mr-1">Tổng tiền:</span>
                                                    <span className="font-medium text-green-600">
                                                        {order.total.toLocaleString()}₫
                                                    </span>
                                                </div>
                                                {/* <div className="flex items-center text-sm">
                                                    <Truck className="h-4 w-4 text-gray-500 mr-2" />
                                                    <span className="font-medium text-gray-500 mr-1">Phương thức giao hàng:</span>
                                                    {order.shippingMethod || "Tiêu chuẩn"}
                                                </div> */}
                                                <div className="flex items-center text-sm">
                                                    <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                                                    <span className="font-medium text-gray-500 mr-1">Phương thức thanh toán:</span>
                                                    {order.paymentMethod || "COD"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Products */}
                                    <div className="mb-6">
                                        <div className="flex items-center mb-3">
                                            <ShoppingBag className="h-5 w-5 text-gray-700 mr-2" />
                                            <h4 className="font-medium text-gray-800">Sản phẩm</h4>
                                        </div>
                                        <div className="border rounded-lg overflow-hidden">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Sản phẩm
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Size
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Số lượng
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Đơn giá
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Thành tiền
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {order.items.map((item) => (
                                                        <tr key={`${item.productId}-${item.size}`} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center">
                                                                    <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded">
                                                                        <div className="h-10 w-10 flex items-center justify-center">
                                                                            <Package className="h-6 w-6 text-gray-400" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="ml-3">
                                                                        <p className="text-sm font-medium text-gray-900">
                                                                            {item.productName}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                                {item.size || "N/A"}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                                <span className="px-2 py-1 bg-gray-100 rounded text-gray-800">
                                                                    {item.quantity}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                                {item.price_at_order.toLocaleString()}₫
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {(item.price_at_order * item.quantity).toLocaleString()}₫
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot className="bg-gray-50">
                                                    <tr>
                                                        <td colSpan={4} className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                                                            Tổng cộng:
                                                        </td>
                                                        <td className="px-6 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                                                            {orderTotal.toLocaleString()}₫
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex justify-end items-center space-x-4 mt-6 pt-4 border-t border-gray-200">
                                        {order.status.toLowerCase() !== 'shipped' && order.status.toLowerCase() !== 'cancelled' && (
                                            <>
                                                <button
                                                    type="button"
                                                    disabled={updating}
                                                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    onClick={handleMarkAsShipped}
                                                >
                                                    {updating ? (
                                                        <span className="flex items-center">
                                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Đang xử lý...
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center">
                                                            <Check className="h-4 w-4 mr-1" />
                                                            Đánh dấu đã giao
                                                        </span>
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={updating}
                                                    className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    onClick={handleCancelOrder}
                                                >
                                                    {updating ? (
                                                        <span className="flex items-center">
                                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Đang xử lý...
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center">
                                                            <X className="h-4 w-4 mr-1" />
                                                            Huỷ đơn hàng
                                                        </span>
                                                    )}
                                                </button>
                                            </>
                                        )}
                                        <button
                                            type="button"
                                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                                            onClick={onClose}
                                        >
                                            Đóng
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}