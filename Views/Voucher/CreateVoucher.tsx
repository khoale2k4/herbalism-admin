import ModalWrapper from '@/components/ModalWrapper/ModalWrapper';
import React, { useState, useEffect } from 'react';
import { Voucher } from './VouchersTable';

const VoucherEditorPopup = ({
    onClose,
    onSubmit,
    editVoucher = null
}: {
    onClose: () => void;
    onSubmit: (voucher: Voucher) => void;
    editVoucher?: Voucher | null;
}) => {
    const [voucher, setVoucher] = useState<Voucher>({
        id: '',
        type: 'amount',
        discount: 0,
    });
    const [error, setError] = useState<{ [key: string]: string }>({});

    // Populate form when editing an existing voucher
    useEffect(() => {
        if (editVoucher) {
            setVoucher(editVoucher);
        }
    }, [editVoucher]);

    const handleChange = (field: keyof Voucher, value: string | number) => {
        setVoucher(prev => ({
            ...prev,
            [field]: value,
        }));

        // Clear error when field is edited
        if (error[field]) {
            setError(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!voucher.id.trim()) {
            newErrors.id = 'Vui lòng nhập mã voucher';
        }

        if (voucher.discount <= 0) {
            newErrors.discount = 'Giá trị giảm phải lớn hơn 0';
        }

        if (voucher.type === 'percent' && voucher.discount > 100) {
            newErrors.discount = 'Phần trăm giảm giá không thể vượt quá 100%';
        }

        setError(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            onSubmit(voucher);
            onClose();
        }
    };

    return (
        <ModalWrapper onClose={onClose}>
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editVoucher ? 'Chỉnh Sửa Voucher' : 'Thêm Voucher Mới'}
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full transition-colors"
                                aria-label="Đóng"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Mã voucher */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="voucherId">
                                    Mã Voucher <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="voucherId"
                                    type="text"
                                    value={voucher.id}
                                    onChange={(e) => handleChange('id', e.target.value)}
                                    className={`w-full px-4 py-2 border ${error.id ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                                    placeholder="Nhập mã voucher..."
                                    required
                                />
                                {error.id && <p className="mt-1 text-sm text-red-500">{error.id}</p>}
                            </div>

                            {/* Loại giảm giá */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="voucherType">
                                    Loại Giảm Giá
                                </label>
                                <div className="relative">
                                    <select
                                        id="voucherType"
                                        value={voucher.type}
                                        onChange={(e) => handleChange('type', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pr-10"
                                    >
                                        <option value="amount">Giảm theo số tiền</option>
                                        <option value="percent">Giảm theo phần trăm</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Giá trị giảm */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="voucherDiscount">
                                    Giá trị Giảm <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        id="voucherDiscount"
                                        type="number"
                                        value={voucher.discount}
                                        onChange={(e) => handleChange('discount', Number(e.target.value))}
                                        className={`w-full px-4 py-2 border ${error.discount ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 transition-colors`}
                                        required
                                        min={0}
                                        step={voucher.type === 'percent' ? 1 : 1000}
                                        placeholder={voucher.type === 'percent' ? 'Nhập % giảm giá...' : 'Nhập số tiền giảm...'}
                                    />
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                        {voucher.type === 'percent' ? '%' : 'đ'}
                                    </div>
                                </div>
                                {error.discount && <p className="mt-1 text-sm text-red-500">{error.discount}</p>}
                                {voucher.type === 'percent' && !error.discount && (
                                    <p className="mt-1 text-sm text-gray-500">Giá trị từ 1% đến 100%</p>
                                )}
                            </div>

                            {/* Thông tin giới hạn (có thể thêm nếu cần) */}
                            {/* <div className="pt-2">
                                <h3 className="text-sm font-medium text-gray-700 mb-3">Thông tin thêm (tùy chọn)</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1" htmlFor="startDate">
                                            Ngày bắt đầu
                                        </label>
                                        <input
                                            id="startDate"
                                            type="date"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1" htmlFor="endDate">
                                            Ngày kết thúc
                                        </label>
                                        <input
                                            id="endDate"
                                            type="date"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div> */}

                            {/* Actions */}
                            <div className="border-t pt-5 flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                                >
                                    {editVoucher ? 'Cập nhật' : 'Tạo voucher'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </ModalWrapper>
    );
};

export default VoucherEditorPopup;