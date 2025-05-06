import ModalWrapper from '@/components/ModalWrapper/ModalWrapper';
import React, { useState } from 'react';
import { Voucher } from './VouchersTable';

const VoucherEditorPopup = ({ onClose, onSubmit }: {
    onClose: () => void;
    onSubmit: (voucher: Voucher) => void;
}) => {
    const [voucher, setVoucher] = useState<Voucher>({
        id: '',
        type: 'amount',
        discount: 0,
    });

    const handleChange = (field: keyof Voucher, value: string | number) => {
        setVoucher(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(voucher);
        onClose();
    };

    return (
        <ModalWrapper onClose={onClose}>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Thêm Voucher</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Mã voucher */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mã Voucher
                                </label>
                                <input
                                    type="text"
                                    value={voucher.id}
                                    onChange={(e) => handleChange('id', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            {/* Loại giảm giá */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Loại Giảm Giá
                                </label>
                                <select
                                    value={voucher.type}
                                    onChange={(e) => handleChange('type', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="amount">Giảm theo số tiền</option>
                                    <option value="percentage">Giảm theo phần trăm</option>
                                </select>
                            </div>

                            {/* Giá trị giảm */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giá trị Giảm
                                </label>
                                <input
                                    type="number"
                                    value={voucher.discount}
                                    onChange={(e) => handleChange('discount', Number(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                    required
                                    min={0}
                                />
                            </div>

                            {/* Actions */}
                            <div className="border-t pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Lưu Voucher
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
