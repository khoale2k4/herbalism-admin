import ModalWrapper from '@/components/ModalWrapper/ModalWrapper';
import { ProductOperation } from '@/lib/main';
import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill-new';

type ProductSize = {
    size: string;
    price: number;
    stock: number;
};

type ProductTab = {
    name: string;
    description: string;
};

type ProductOption = {
    type: 'type' | 'form' | 'need';
    selectedValue: string;
    availableValues: string[];
};

type Tab = {
    id: 'info' | 'images' | 'sizes' | 'tabs' | 'options';
    label: string;
}

type CategoryResponse = {
    success: boolean;
    message: string;
    data: {
        forms: Array<{ id: string; name: string }>;
        types: Array<{ id: string; name: string }>;
        needs: Array<{ id: string; name: string }>;
    };
};

type ProductImage = {
    id: string;
    url: string;
    file?: File;
};

export type ProductFormData = {
    id: string;
    slug: string;
    name: string;
    content: string;
    images: ProductImage[];
    size_stock: ProductSize[];
    tabs: ProductTab[];
    options: ProductOption[];
};

const defaultOptions: ProductOption[] = [
    {
        type: 'type',
        selectedValue: '',
        availableValues: ['Type 1', 'Type 2', 'Type 3']
    },
    {
        type: 'form',
        selectedValue: '',
        availableValues: ['Form A', 'Form B', 'Form C']
    },
    {
        type: 'need',
        selectedValue: '',
        availableValues: ['Need X', 'Need Y', 'Need Z']
    }
];

const AddProductPopup = ({ onClose, onSubmit, adding, initialProductId }: {
    onClose: () => void;
    onSubmit: (product: ProductFormData) => void;
    adding: boolean;
    initialProductId?: string;
}) => {
    const [activeTab, setActiveTab] = useState<'info' | 'images' | 'sizes' | 'tabs' | 'options'>('info');
    const [product, setProduct] = useState<ProductFormData>({
        name: '',
        id: '',
        slug: '',
        content: '',
        images: [],
        size_stock: [],
        tabs: [{ name: '', description: '' }],
        options: [...defaultOptions]
    });
    const [loading, setLoading] = useState(false);
    const productOp = new ProductOperation();
    const formatType = (type: string) => {
        if (type === 'type') {
            return "Product Type";
        } else if (type === 'form') {
            return "Product Form";
        } else {
            return "Wellness Need"
        }
    }

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }],
            ['link'],
            ['clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list',
        'link', 'image'
    ];

    const [newOptionValues, setNewOptionValues] = useState<{ type: 'type' | 'form' | 'need', value: string }>({
        type: 'type',
        value: ''
    });

    const handleOptionChange = (type: 'type' | 'form' | 'need', value: string) => {
        setProduct(prev => ({
            ...prev,
            options: prev.options.map(option =>
                option.type === type ? { ...option, selectedValue: value } : option
            )
        }));
    };

    const addNewOptionValue = (type: 'type' | 'form' | 'need') => {
        if (!newOptionValues.value.trim()) return;

        setProduct(prev => ({
            ...prev,
            options: prev.options.map(option =>
                option.type === type
                    ? option.availableValues.includes(newOptionValues.value) ? option : {
                        ...option,
                        availableValues: [...option.availableValues, newOptionValues.value],
                        selectedValue: newOptionValues.value
                    }
                    : option
            )
        }));

        setNewOptionValues(prev => ({ ...prev, value: '' }));
    };

    const removeOptionValue = (type: 'type' | 'form' | 'need', value: string) => {
        setProduct(prev => ({
            ...prev,
            options: prev.options.map(option =>
                option.type === type
                    ? {
                        ...option,
                        availableValues: option.availableValues.filter(v => v !== value),
                        selectedValue: option.selectedValue === value ? '' : option.selectedValue
                    }
                    : option
            )
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files).map(file => ({
                id: Math.random().toString(36).substring(2, 9),
                url: URL.createObjectURL(file),
                file,
            }));

            setProduct(prev => ({
                ...prev,
                images: [...prev.images, ...newImages],
            }));
        }
    };

    const removeImage = (id: string) => {
        setProduct(prev => ({
            ...prev,
            images: prev.images.filter(img => img.id !== id),
        }));
    };

    const addSize = () => {
        setProduct(prev => ({
            ...prev,
            sizes: [...prev.size_stock, { size: '', price: 0, stock: 0 }],
        }));
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')                         // chuẩn hóa dấu tiếng Việt
            .replace(/[\u0300-\u036f]/g, '')         // xóa dấu
            .replace(/'/g, '')                       // xóa dấu nháy đơn
            .replace(/[^a-z0-9\s-]/g, '')            // xóa ký tự đặc biệt
            .trim()
            .replace(/\s+/g, '-')                    // thay khoảng trắng = dấu -
            .replace(/-+/g, '-');                    // gộp nhiều dấu - liên tiếp
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const id = generateSlug(name);
        setProduct({ ...product, name, id });
    }

    const updateSize = (index: number, field: keyof ProductSize, value: string | number) => {
        const newSizes = [...product.size_stock];
        newSizes[index][field] = value as never;
        setProduct(prev => ({ ...prev, sizes: newSizes }));
    };

    const removeSize = (index: number) => {
        setProduct(prev => ({
            ...prev,
            sizes: prev.size_stock.filter((_, i) => i !== index),
        }));
    };

    const addTab = () => {
        setProduct(prev => ({
            ...prev,
            tabs: [...prev.tabs, { name: '', description: '' }],
        }));
    };

    const updateTab = (index: number, field: keyof ProductTab, value: string) => {
        const newTabs = [...product.tabs];
        newTabs[index][field] = value;
        setProduct(prev => ({ ...prev, tabs: newTabs }));
    };

    const removeTab = (index: number) => {
        setProduct(prev => ({
            ...prev,
            tabs: prev.tabs.filter((_, i) => i !== index),
        }));
    };

    const handleContentChange = (content: string) => {
        setProduct(prev => ({
            ...prev,
            content,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(product);
        // onClose();
    };

    const tabs: Tab[] = [
        { id: 'info', label: 'Thông tin' },
        { id: 'images', label: 'Hình ảnh' },
        { id: 'sizes', label: 'Size & Giá' },
        { id: 'tabs', label: 'Tabs' },
        { id: 'options', label: 'Phân loại' }
    ];

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                const categoryRes: CategoryResponse = await productOp.getCategory();

                if (categoryRes.success) {
                    const availableOptions: ProductOption[] = [
                        {
                            type: 'type' as const,
                            availableValues: categoryRes.data.types.map(t => t.name),
                            selectedValue: '',
                        },
                        {
                            type: 'form' as const,
                            availableValues: categoryRes.data.forms.map(f => f.name),
                            selectedValue: '',
                        },
                        {
                            type: 'need' as const,
                            availableValues: categoryRes.data.needs.map(n => n.name),
                            selectedValue: '',
                        },
                    ];

                    if (initialProductId) {
                        const productRes = await productOp.getById(initialProductId);
                        if (productRes.success) {
                            const fetchedProduct = productRes.data;

                            setProduct({
                                ...fetchedProduct,
                                options: availableOptions.map(opt => ({
                                    ...opt,
                                    selectedValue:
                                        opt.type === 'form' ? fetchedProduct.form.name :
                                            opt.type === 'need' ? fetchedProduct.need.name :
                                                opt.type === 'type' ? fetchedProduct.type.name : ''
                                }))
                            });
                        }
                    } else {
                        setProduct(prev => ({
                            ...prev,
                            options: availableOptions,
                        }));
                    }
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);


    return (
        <ModalWrapper onClose={onClose}>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
                    <div className="p-6">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Thêm Sản Phẩm Mới
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors duration-200"
                                aria-label="Đóng"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
                            <div
                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                style={{
                                    width: `${(
                                        (product.name ? 1 : 0) +
                                        (product.id ? 1 : 0) +
                                        (product.tabs.length > 0 ? 1 : 0) +
                                        (product.size_stock.length > 0 ? 1 : 0) +
                                        (product.content ? 1 : 0) +
                                        (product.options.length > 0 ? 1 : 0)
                                    ) * (100 / 6)}%`
                                }}
                            />
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex border-b border-gray-200 bg-gray-50 px-6">
                            {tabs.map((tab: Tab) => (
                                <button
                                    key={tab.id}
                                    className={`relative px-4 py-3 font-medium text-sm transition-all duration-200 
                ${activeTab === tab.id
                                            ? 'text-blue-600 before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-blue-600'
                                            : 'text-gray-600 hover:text-blue-500 hover:bg-gray-100'}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="overflow-y-auto p-6 flex-grow">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Info Tab */}
                                {activeTab === 'info' && (
                                    <div className="space-y-5 animate-fadeIn">
                                        <div className="grid grid-cols-1 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                    value={product.name}
                                                    onChange={(e) => handleNameChange(e)}
                                                    placeholder="Nhập tên sản phẩm"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">ID sản phẩm</label>
                                                <div className="relative">
                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                                        </svg>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                        value={product.slug ?? ""}
                                                        onChange={(e) => setProduct({ ...product, slug: e.target.value })}
                                                        placeholder="Nhập ID sản phẩm"
                                                        required
                                                    />
                                                </div>
                                                <p className="mt-1 text-xs text-gray-500">ID phải là duy nhất, ví dụ: sp001</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả sản phẩm</label>
                                                <div className="border border-gray-300 rounded-lg shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                                                    <ReactQuill
                                                        theme="snow"
                                                        value={product.content}
                                                        onChange={handleContentChange}
                                                        modules={modules}
                                                        formats={formats}
                                                        className="h-64"
                                                        placeholder="Nhập mô tả chi tiết về sản phẩm..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Images Tab */}
                                {activeTab === 'images' && (
                                    <div className="animate-fadeIn">
                                        <div className="mb-6">
                                            <p className="text-sm text-gray-600 mb-4">Thêm hình ảnh sản phẩm để hiển thị cho khách hàng. Hình ảnh chất lượng cao sẽ giúp tăng tỷ lệ chuyển đổi.</p>

                                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                                                <div className="flex flex-col items-center justify-center p-6 text-center">
                                                    <svg className="w-12 h-12 mb-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                    </svg>
                                                    <p className="mb-2 text-sm font-medium text-gray-700">Kéo thả hoặc click để tải lên</p>
                                                    <p className="text-xs text-gray-500">PNG, JPG (Tối đa: 10MB/ảnh)</p>
                                                </div>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                />
                                            </label>
                                        </div>

                                        {product.images.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-700 mb-3">Hình ảnh đã tải lên ({product.images.length})</h3>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                    {product.images.map((image) => (
                                                        <div key={image.id || image.url} className="relative group rounded-lg overflow-hidden shadow-sm border border-gray-200">
                                                            <img
                                                                src={image.url}
                                                                alt="Preview"
                                                                className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                                <div className="absolute bottom-2 right-2 flex space-x-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeImage(image.id)}
                                                                        className="bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors duration-200"
                                                                        title="Xóa ảnh"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Sizes Tab */}
                                {activeTab === 'sizes' && (
                                    <div className="animate-fadeIn">
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-700">Quản lý size và giá</h3>
                                                <p className="text-xs text-gray-500 mt-1">Thiết lập các phiên bản size khác nhau của sản phẩm</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={addSize}
                                                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Thêm size
                                            </button>
                                        </div>

                                        {product.size_stock.length === 0 ? (
                                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                                                </svg>
                                                <p className="text-gray-600 mb-2">Chưa có size nào được thêm</p>
                                                <p className="text-gray-500 text-sm">Bấm "Thêm size" để bắt đầu tạo các phiên bản sản phẩm</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {product.size_stock.map((size, index) => (
                                                    <div
                                                        key={index}
                                                        className="grid grid-cols-12 gap-4 p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow duration-300"
                                                    >
                                                        <div className="col-span-12 sm:col-span-3">
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                                                            <input
                                                                type="text"
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                                value={size.size}
                                                                onChange={(e) => updateSize(index, 'size', e.target.value)}
                                                                placeholder="VD: S, M, L, XL..."
                                                                required
                                                            />
                                                        </div>
                                                        <div className="col-span-12 sm:col-span-4">
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VND)</label>
                                                            <div className="relative rounded-lg shadow-sm">
                                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                    <span className="text-gray-500 sm:text-sm">₫</span>
                                                                </div>
                                                                <input
                                                                    type="number"
                                                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                                    value={size.price}
                                                                    onChange={(e) => updateSize(index, 'price', Number(e.target.value))}
                                                                    min="0"
                                                                    step="1000"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-span-12 sm:col-span-3">
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho</label>
                                                            <input
                                                                type="number"
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                                value={size.stock}
                                                                onChange={(e) => updateSize(index, 'stock', Number(e.target.value))}
                                                                min="0"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="col-span-12 sm:col-span-2 flex items-end justify-end">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeSize(index)}
                                                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                                Xóa
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Tabs Tab */}
                                {activeTab === 'tabs' && (
                                    <div className="animate-fadeIn">
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-700">Quản lý tab thông tin</h3>
                                                <p className="text-xs text-gray-500 mt-1">Tạo các tab thông tin chi tiết về sản phẩm</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={addTab}
                                                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Thêm tab
                                            </button>
                                        </div>

                                        <div className="space-y-6">
                                            {product.tabs.map((tab, index) => (
                                                <div key={index} className="p-5 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow duration-300">
                                                    <div className="mb-4">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên tab</label>
                                                        <input
                                                            type="text"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                            value={tab.name}
                                                            onChange={(e) => updateTab(index, 'name', e.target.value)}
                                                            placeholder="VD: Chi tiết sản phẩm, Hướng dẫn sử dụng..."
                                                            required
                                                        />
                                                    </div>

                                                    <div className="mb-4">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                                                        <div className="border border-gray-300 rounded-lg shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                                                            <ReactQuill
                                                                theme="snow"
                                                                value={tab.description}
                                                                onChange={(e) => updateTab(index, 'description', e)}
                                                                modules={modules}
                                                                formats={formats}
                                                                className="h-64"
                                                                placeholder="Nhập nội dung tab..."
                                                            />
                                                        </div>
                                                    </div>

                                                    {product.tabs.length > 1 && (
                                                        <div className="flex justify-end">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeTab(index)}
                                                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                                Xóa tab
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Options Tab */}
                                {activeTab === 'options' && (
                                    <div className="space-y-6 animate-fadeIn">
                                        {product.options.map((option) => (
                                            <div key={option.type} className="p-5 border border-gray-200 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow duration-300">
                                                <h3 className="text-sm font-medium text-gray-800 mb-4 capitalize border-b pb-2 flex items-center">
                                                    {formatType(option.type)}
                                                </h3>

                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {option.availableValues.map(value => (
                                                        <div
                                                            key={value}
                                                            className={`group transition-all duration-200 flex items-center px-3 py-2 rounded-lg border ${(option.selectedValue === value
                                                                ? 'border-blue-500 bg-blue-50'
                                                                : 'border-gray-200 hover:border-gray-300')
                                                                }`}
                                                        >

                                                            <>
                                                                <label className="inline-flex items-center cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        name={option.type}
                                                                        checked={option.selectedValue === value}
                                                                        onChange={() => handleOptionChange(option.type, value)}
                                                                        className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                                                                    />
                                                                    <span className={`ml-2 ${option.selectedValue === value ? 'font-medium' : ''}`}>{value}</span>
                                                                </label>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeOptionValue(option.type, value)}
                                                                    className="ml-2 text-gray-400 hover:text-red-500 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                                                                    aria-label={`Remove ${value}`}
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            </>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="flex gap-2 mt-4">
                                                    <div className="relative flex-1">
                                                        <input
                                                            type="text"
                                                            placeholder={`Thêm options mới`}
                                                            className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                            value={option.type === newOptionValues.type ? newOptionValues.value : ''}
                                                            onChange={(e) => setNewOptionValues({
                                                                type: option.type,
                                                                value: e.target.value
                                                            })}
                                                        />
                                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                            </svg>
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => addNewOptionValue(option.type)}
                                                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                                                    >
                                                        Thêm
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Footer with Actions */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors duration-200"
                            >
                                Hủy
                            </button>
                            <div className="flex gap-2">
                                <button
                                    type={activeTab === 'options' ? 'submit' : 'button'}
                                    onClick={activeTab === 'options' ? handleSubmit : () => {
                                        const nextTabIndex = tabs.findIndex(tab => tab.id === activeTab) + 1;
                                        if (nextTabIndex < tabs.length) {
                                            setActiveTab(tabs[nextTabIndex].id);
                                        }
                                    }}
                                    disabled={adding || loading}
                                    className={`px-6 py-2 border border-transparent text-sm font-medium rounded-lg ${activeTab === 'options'
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        } shadow-sm transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-1`}
                                >
                                    {adding ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Đang lưu</span>
                                        </>
                                    ) : loading ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Đang tải</span>
                                        </>
                                    ) : activeTab === 'options' ? (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Lưu sản phẩm</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Tiếp tục</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ModalWrapper>
    );
};

export default AddProductPopup;