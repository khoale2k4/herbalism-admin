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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Thêm Sản Phẩm Mới</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                        >
                            &times;
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 mb-6">
                        <button
                            className={`px-4 py-2 font-medium text-sm ${activeTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('info')}
                        >
                            Thông tin
                        </button>
                        <button
                            className={`px-4 py-2 font-medium text-sm ${activeTab === 'images' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('images')}
                        >
                            Hình ảnh
                        </button>
                        <button
                            className={`px-4 py-2 font-medium text-sm ${activeTab === 'sizes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('sizes')}
                        >
                            Size & Giá
                        </button>
                        <button
                            className={`px-4 py-2 font-medium text-sm ${activeTab === 'tabs' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('tabs')}
                        >
                            Tabs
                        </button>
                        <button
                            className={`px-4 py-2 font-medium text-sm ${activeTab === 'options' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('options')}
                        >
                            Phân loại
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Info Tab */}
                        {activeTab === 'info' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        value={product.name}
                                        onChange={(e) => handleNameChange(e)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">id</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        value={product.id}
                                        onChange={(e) => setProduct({ ...product, id: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                                    {/* <textarea
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        value={product.content}
                                        onChange={(e) => setProduct({ ...product, content: e.target.value })}
                                        required
                                    /> */}
                                    <ReactQuill
                                        theme="snow"
                                        value={product.content}
                                        onChange={handleContentChange}
                                        modules={modules}
                                        formats={formats}
                                        className="h-64 mb-16"
                                    />
                                    {/* <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        value={product.content}
                                        onChange={(e) => setProduct({ ...product, content: e.target.value })}
                                        required
                                    /> */}
                                </div>
                            </div>
                        )}

                        {/* Images Tab */}
                        {activeTab === 'images' && (
                            <div>
                                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 mb-4">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                        </svg>
                                        <p className="mb-2 text-sm text-gray-500">Kéo thả ảnh vào đây hoặc click để chọn</p>
                                        <p className="text-xs text-gray-500">PNG, JPG (MAX. 10MB)</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </label>

                                {product.images.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {product.images.map((image) => (
                                            <div key={image.id ? image.id : image.url} className="relative group">
                                                <img
                                                    src={image.url}
                                                    alt="Preview"
                                                    className="w-full h-32 object-cover rounded-md"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(image.id)}
                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Sizes Tab */}
                        {activeTab === 'sizes' && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-medium text-gray-700">Các loại size</h3>
                                    <button
                                        type="button"
                                        onClick={addSize}
                                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                    >
                                        + Thêm size
                                    </button>
                                </div>

                                {product.size_stock.length === 0 ? (
                                    <div className="text-center py-6 bg-gray-50 rounded-lg">
                                        <p className="text-gray-500">Chưa có size nào được thêm</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {product.size_stock.map((size, index) => (
                                            <div key={index} className="grid grid-cols-12 gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                                <div className="col-span-12 sm:col-span-3">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                        value={size.size}
                                                        onChange={(e) => updateSize(index, 'size', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-span-12 sm:col-span-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá</label>
                                                    <input
                                                        type="number"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                        value={size.price}
                                                        onChange={(e) => updateSize(index, 'price', Number(e.target.value))}
                                                        min="0"
                                                        required
                                                    />
                                                </div>
                                                <div className="col-span-12 sm:col-span-3">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
                                                    <input
                                                        type="number"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                                                        className="px-3 py-1 text-red-500 text-sm rounded hover:text-red-700"
                                                    >
                                                        Xóa size
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
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-medium text-gray-700">Các tab thông tin</h3>
                                    <button
                                        type="button"
                                        onClick={addTab}
                                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                    >
                                        + Thêm tab
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {product.tabs.map((tab, index) => (
                                        <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên tab</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                    value={tab.name}
                                                    onChange={(e) => updateTab(index, 'name', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>

                                                <div className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                                    <ReactQuill
                                                        theme="snow"
                                                        value={tab.description}
                                                        onChange={(e) => updateTab(index, 'description', e)}
                                                        modules={modules}
                                                        formats={formats}
                                                        className="h-64 mb-16"
                                                    />
                                                </div>
                                                {/* <textarea
                                                    rows={4}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                    value={tab.description}
                                                    onChange={(e) => updateTab(index, 'description', e.target.value)}
                                                    required
                                                /> */}
                                            </div>
                                            {product.tabs.length > 1 && (
                                                <div className="col-span-12 sm:col-span-2 flex items-end justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTab(index)}
                                                        className="px-3 py-1 text-red-500 text-sm rounded hover:text-red-700"
                                                    >
                                                        Xóa tab
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeTab === 'options' && (
                            <div className="space-y-6 animate-fadeIn">
                                {product.options.map((option) => (
                                    <div key={option.type} className="p-5 border border-gray-200 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow duration-300">
                                        <h3 className="text-sm font-medium text-gray-800 mb-4 capitalize border-b pb-2">{formatType(option.type)}</h3>

                                        <div className="flex flex-nowrap overflow-x-auto gap-3 mb-4"> {/* Sử dụng flex-nowrap và overflow-x-auto */}
                                            {option.availableValues.map(value => (
                                                <div
                                                    key={value}
                                                    className={`flex items-center px-3 py-2 rounded-md border ${option.selectedValue === value
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        } group transition-all duration-200`}
                                                >
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
                                                </div>
                                            ))}
                                        </div>


                                        <div className="flex gap-2 mt-4">
                                            <input
                                                type="text"
                                                placeholder={`Thêm ${option.type} mới`}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                value={option.type === newOptionValues.type ? newOptionValues.value : ''}
                                                onChange={(e) => setNewOptionValues({
                                                    type: option.type,
                                                    value: e.target.value
                                                })}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => addNewOptionValue(option.type)}
                                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                                            >
                                                Thêm
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="border-t pt-4 flex justify-end gap-3 mt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            {<button
                                type="submit"
                                disabled={adding || loading}
                                className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${adding || loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {adding ? "Đang lưu" : loading ? "Đang tải" : "Lưu sản phẩm"}
                            </button>}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddProductPopup;