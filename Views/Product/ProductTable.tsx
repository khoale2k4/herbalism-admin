"use client";

import { DataTable } from "@/components/DataTable/DataTable";
import AddProductPopup, { ProductFormData } from "./AddContent";
import { useState } from "react";
import { ProductOperation } from "@/lib/main";
import { FiRefreshCcw } from "react-icons/fi";

export type Product = {
    id: number;
    slug: string;
    name: string;
    price: number;
    totalStock: number;
    category: string;
    createdAt: string;
};

export default function ProductPage({ products, onReload }: { products: Product[], onReload: () => void }) {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);
    const productOp = new ProductOperation();
    const [notification, setNotification] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    const handleSubmitProduct = async (productData: ProductFormData) => {
        try {
            setAdding(true);
            const productImageUrls = await Promise.all(
                productData.images.map(async (image) => {
                    if (image.file) {
                        const url = await productOp.uploadImage(image.file);
                        if (url.success) return url.data;
                    }
                    return null; // hoặc có thể lọc sau
                })
            );
            const filteredImageUrls = productImageUrls.filter(Boolean) as string[];
            const { size_stock, options, ...restProductData } = productData;
            let response;
            if (selectedProductId !== null) {
                response = await productOp.update(selectedProductId, {
                    id: restProductData.id,
                    content: restProductData.content,
                    name: restProductData.name,
                    tabs: restProductData.tabs,
                    images: filteredImageUrls,
                    product_form: productData.options[1].selectedValue,
                    product_type: productData.options[0].selectedValue,
                    wellness_need: productData.options[2].selectedValue,
                    size_stock: productData.size_stock,
                })
            } else {
                response = await productOp.create({
                    ...restProductData,
                    images: filteredImageUrls,
                    product_form: productData.options[1].selectedValue,
                    product_type: productData.options[0].selectedValue,
                    wellness_need: productData.options[2].selectedValue,
                    size_stock: productData.size_stock,
                })
            }
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
            setAdding(false);
            setTimeout(() => {
                setNotification(null);
            }, 5000);
            setIsPopupOpen(false);
        }
    };
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
                    { title: "Tên sản phẩm", render: (p) => p.name },
                    { title: "Giá", render: (p) => `${p.price.toLocaleString()}₫` },
                    { title: "Số lượng tồn", render: (p) => p.totalStock },
                    { title: "Danh mục", render: (p) => p.category },
                ]}
                data={products}
                selectable="none"
                onSelectionChange={(selectedProducts) => {
                    console.log('Selected products:', selectedProducts);
                }}
                searchable={true}
                searchFields={['name', 'category']}
                pagination={true}
                rowKey={(product) => product.id}
                itemsPerPage={10}
                actions={
                    <div className="flex gap-2 mb-4">
                        <button
                            className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                            onClick={() => {
                                setSelectedProductId(null);
                                setIsPopupOpen(true);
                            }}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Thêm sản phẩm
                        </button>

                        <button
                            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            onClick={onReload}
                        >
                            <FiRefreshCcw />
                            Tải lại
                        </button>
                    </div>
                }
                onRowClick={(product => {
                    setSelectedProductId(product.id.toString());
                    setIsPopupOpen(true);
                })}
                className="p-4 bg-white rounded-lg shadow"
                onDelete={(product) => console.log('Delete product:', product)}
            />
            {isPopupOpen &&
                <AddProductPopup
                    onClose={() => setIsPopupOpen(false)}
                    onSubmit={handleSubmitProduct}
                    adding={adding}
                    initialProductId={selectedProductId ? selectedProductId : undefined}
                />}
        </div>
    );
}
