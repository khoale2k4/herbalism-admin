import ModalWrapper from '@/components/ModalWrapper/ModalWrapper';
import { ArticleOperation } from '@/lib/main';
import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

type ArticleImage = {
    id: string;
    url: string;
    file?: File;
};

export type ArticleFormData = {
    title: string;
    content: string;
    shortDescription: string;
    images: ArticleImage[];
    category: string;
};

const ArticleEditorPopup = ({ onClose, onSubmit, adding, articleId }: {
    onClose: () => void;
    onSubmit: (article: ArticleFormData) => void;
    adding: boolean;
    articleId?: string;
}) => {
    const [article, setArticle] = useState<ArticleFormData>({
        title: '',
        content: '',
        shortDescription: '',
        images: [],
        category: ''
    });
    const [loading, setLoading] = useState(false);
    const articleOp = new ArticleOperation();
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const [activeTab, setActiveTab] = useState<'content' | 'title' | 'category'>('title');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [categories, setCategories] = useState<Array<{ id: string, name: string }>>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'align': [] }],
            ['link', 'image'],
            ['clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'align',
        'link', 'image'
    ];

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files).map(file => ({
                id: Math.random().toString(36).substring(2, 9),
                url: URL.createObjectURL(file),
                file,
            }));

            setArticle(prev => ({
                ...prev,
                images: [...prev.images, ...newImages],
            }));
        }
    };

    const removeImage = (id: string) => {
        setArticle(prev => ({
            ...prev,
            images: prev.images.filter(img => img.id !== id),
        }));
    };

    const handleContentChange = (content: string) => {
        setArticle(prev => ({
            ...prev,
            content,
        }));

        // Clear error when content is added
        if (content && errors.content) {
            setErrors(prev => ({ ...prev, content: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!article.title.trim()) {
            newErrors.title = 'Vui lòng nhập tiêu đề bài viết';
        }

        if (!article.shortDescription.trim()) {
            newErrors.shortDescription = 'Vui lòng nhập mô tả ngắn';
        }

        if (!article.category.trim()) {
            newErrors.category = 'Vui lòng chọn danh mục';
        }

        if (!article.content.trim()) {
            newErrors.content = 'Vui lòng nhập nội dung bài viết';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            onSubmit(article);
        } else {
            // Switch to tab with error
            if (errors.title || errors.shortDescription) {
                setActiveTab('title');
            } else if (errors.category) {
                setActiveTab('category');
            } else if (errors.content) {
                setActiveTab('content');
            }
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                // Get all categories first
                const categoryResponse = await articleOp.getAllCategories();
                if (categoryResponse.success) {
                    setCategories(categoryResponse.data);
                }

                // Then load article if editing
                if (articleId) {
                    const response = await articleOp.getById(articleId);
                    if (response.success) {
                        const articleData = response.data;
                        const trimmedImageUrl = articleData.imageUrl?.trim() ?? "";

                        const matchedCategory = categoryResponse.success ?
                            categoryResponse.data.find((cate: any) => cate.id === articleData.categoryId) : null;

                        setArticle({
                            ...articleData,
                            images: trimmedImageUrl ? [{
                                id: Math.random().toString(36).substring(2, 9),
                                url: trimmedImageUrl
                            }] : [],
                            category: matchedCategory?.name ?? ''
                        });
                    }
                }
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [articleId]);

    const getTabStatus = (tab: 'content' | 'title' | 'category') => {
        switch (tab) {
            case 'title':
                return (errors.title || errors.shortDescription) ? 'error' :
                    (article.title && article.shortDescription) ? 'complete' : 'incomplete';
            case 'category':
                return errors.category ? 'error' :
                    article.category ? 'complete' : 'incomplete';
            case 'content':
                return errors.content ? 'error' :
                    article.content ? 'complete' : 'incomplete';
            default:
                return 'incomplete';
        }
    };

    const getTabIcon = (tab: 'content' | 'title' | 'category') => {
        const status = getTabStatus(tab);

        if (status === 'complete') {
            return (
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            );
        } else if (status === 'error') {
            return (
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
            );
        }

        return null;
    };

    const tabClasses = (tab: 'content' | 'title' | 'category') => {
        const isActive = activeTab === tab;
        const status = getTabStatus(tab);

        let baseClasses = "flex items-center gap-1 px-4 py-3 font-medium text-sm transition-all duration-200 border-b-2 ";

        if (isActive) {
            baseClasses += "text-blue-600 border-blue-600 ";
        } else {
            baseClasses += "text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300 ";
        }

        if (status === 'error' && !isActive) {
            baseClasses += "text-red-500 ";
        }

        return baseClasses;
    };

    return (
        <ModalWrapper onClose={onClose}>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {articleId ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700 text-2xl transition-colors duration-200"
                                aria-label="Đóng"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Progress indicator */}
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
                            <div
                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                style={{
                                    width: `${(
                                        (article.title ? 1 : 0) +
                                        (article.shortDescription ? 1 : 0) +
                                        (article.category ? 1 : 0) +
                                        (article.content ? 1 : 0) +
                                        (article.images.length > 0 ? 1 : 0)
                                    ) * 20}%`
                                }}
                            />
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 mb-6">
                            <button
                                className={tabClasses('title')}
                                onClick={() => setActiveTab('title')}
                            >
                                <span>Tiêu đề & Hình ảnh</span>
                                {getTabIcon('title')}
                            </button>
                            <button
                                className={tabClasses('category')}
                                onClick={() => setActiveTab('category')}
                            >
                                <span>Danh mục</span>
                                {getTabIcon('category')}
                            </button>
                            <button
                                className={tabClasses('content')}
                                onClick={() => setActiveTab('content')}
                            >
                                <span>Nội dung</span>
                                {getTabIcon('content')}
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title Tab */}
                            {activeTab === 'title' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tiêu đề bài viết <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`w-full px-4 py-3 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                                            value={article.title}
                                            onChange={(e) => {
                                                setArticle({ ...article, title: e.target.value });
                                                if (e.target.value) {
                                                    setErrors({ ...errors, title: '' });
                                                }
                                            }}
                                            placeholder="Nhập tiêu đề bài viết..."
                                        />
                                        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Mô tả ngắn <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            className={`w-full px-4 py-3 border ${errors.shortDescription ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                                            value={article.shortDescription}
                                            onChange={(e) => {
                                                setArticle({ ...article, shortDescription: e.target.value });
                                                if (e.target.value) {
                                                    setErrors({ ...errors, shortDescription: '' });
                                                }
                                            }}
                                            rows={3}
                                            placeholder="Nhập mô tả ngắn về bài viết..."
                                        />
                                        {errors.shortDescription && <p className="mt-1 text-sm text-red-500">{errors.shortDescription}</p>}
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="text-sm font-medium text-gray-700">Hình ảnh bài viết</h3>
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Thêm ảnh
                                            </button>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                multiple
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                            />
                                        </div>

                                        {article.images.length === 0 ? (
                                            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="mt-2 text-gray-500">Chưa có hình ảnh nào được thêm</p>
                                                <p className="text-sm text-gray-400 mt-1">Kéo thả hoặc nhấn vào nút Thêm ảnh</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                {article.images.map((image) => (
                                                    <div key={image.id || image.url} className="relative group rounded-lg overflow-hidden shadow-sm border border-gray-200">
                                                        <img
                                                            src={image.url}
                                                            alt="Hình ảnh bài viết"
                                                            className="w-full h-32 object-cover transition-all duration-300 group-hover:scale-105"
                                                        />
                                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImage(image.id || '')}
                                                                className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                                                                aria-label="Xóa ảnh"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Category Tab */}
                            {activeTab === 'category' && (
                                <div className="mb-6">
                                    <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-2">
                                        Danh mục <span className="text-red-500">*</span>
                                    </label>

                                    <div className="relative" ref={dropdownRef}>
                                        <div className="relative">
                                            <input
                                                id="category-select"
                                                type="text"
                                                className={`w-full px-4 py-3 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                                                value={article.category}
                                                onChange={(e) => {
                                                    setArticle({ ...article, category: e.target.value });
                                                    if (e.target.value) {
                                                        setErrors({ ...errors, category: '' });
                                                    }
                                                    // Show dropdown when typing
                                                    setShowDropdown(true);
                                                }}
                                                placeholder="Tìm hoặc tạo danh mục"
                                                autoComplete="off"
                                                onFocus={() => setShowDropdown(true)}
                                            />
                                            <div
                                                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                                onClick={() => setShowDropdown(!showDropdown)}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                        {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}

                                        {showDropdown && (
                                            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 max-h-60 overflow-auto animate-fadeIn">
                                                {categories.length > 0 ? (
                                                    <ul className="py-1 divide-y divide-gray-100">
                                                        {categories
                                                            .filter(cat => cat.name.toLowerCase().includes(article.category.toLowerCase()) || article.category === '')
                                                            .map(cat => (
                                                                <li
                                                                    key={cat.id}
                                                                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center transition-colors duration-150"
                                                                    onClick={() => {
                                                                        setArticle({ ...article, category: cat.name });
                                                                        setErrors({ ...errors, category: '' });
                                                                        setShowDropdown(false);
                                                                    }}
                                                                >
                                                                    <span className="flex-1 font-medium">{cat.name}</span>
                                                                    {cat.id === 'new' && (
                                                                        <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                                                                            Mới
                                                                        </span>
                                                                    )}
                                                                </li>
                                                            ))}

                                                        {/* Option to create new category */}
                                                        {article.category && !categories.some(cat => cat.name.toLowerCase() === article.category.toLowerCase()) && (
                                                            <li
                                                                className="px-4 py-2 hover:bg-green-50 cursor-pointer flex items-center text-green-600 border-t border-gray-100"
                                                                onClick={() => {
                                                                    // Here you would typically add the new category to your categories list
                                                                    setCategories([...categories, { id: 'new-' + Date.now(), name: article.category }]);
                                                                    setErrors({ ...errors, category: '' });
                                                                    setShowDropdown(false);
                                                                }}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                                </svg>
                                                                <span>Tạo mới "{article.category}"</span>
                                                            </li>
                                                        )}
                                                    </ul>
                                                ) : (
                                                    <div className="px-4 py-3 text-sm text-gray-500">
                                                        Không có danh mục nào. Hãy nhập để tạo mới.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Popular categories */}
                                    {categories.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-sm text-gray-500 mb-2">Danh mục phổ biến:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {categories.slice(0, 5).map(cat => (
                                                    <button
                                                        key={cat.id}
                                                        type="button"
                                                        className={`px-3 py-1 rounded-full text-sm ${article.category === cat.name
                                                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            } transition-colors duration-200`}
                                                        onClick={() => {
                                                            setArticle({ ...article, category: cat.name });
                                                            setErrors({ ...errors, category: '' });
                                                        }}
                                                    >
                                                        {cat.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Content Tab */}
                            {activeTab === 'content' && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nội dung bài viết <span className="text-red-500">*</span>
                                    </label>
                                    <div className={`${errors.content ? 'border border-red-500 rounded-lg' : ''}`}>
                                        <ReactQuill
                                            theme="snow"
                                            value={article.content}
                                            onChange={handleContentChange}
                                            modules={modules}
                                            formats={formats}
                                            className="h-72 mb-12 bg-white rounded-lg"
                                            placeholder="Viết nội dung bài viết của bạn ở đây..."
                                        />
                                    </div>
                                    {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}

                                    <div className="mt-16 bg-blue-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-medium text-blue-800 mb-2">Mẹo viết bài:</h4>
                                        <ul className="text-sm text-blue-700 space-y-1">
                                            <li>• Sử dụng tiêu đề (H1, H2, H3) để tổ chức nội dung</li>
                                            <li>• Thêm hình ảnh minh họa để làm sinh động bài viết</li>
                                            <li>• Viết đoạn văn ngắn, dễ đọc (3-5 dòng)</li>
                                            <li>• Sử dụng danh sách để trình bày các ý chính</li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="border-t pt-6 flex justify-between items-center mt-6">
                                <div className="flex gap-3">
                                    {activeTab !== 'title' && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (activeTab === 'content') setActiveTab('category');
                                                if (activeTab === 'category') setActiveTab('title');
                                            }}
                                            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                                        >
                                            Quay lại
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 text-sm font-medium rounded-md text-gray-600 hover:text-gray-800 transition-colors duration-200"
                                    >
                                        Hủy
                                    </button>
                                </div>

                                <div className="flex gap-3">
                                    {activeTab !== 'content' && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (activeTab === 'title') {
                                                    if (!article.title) {
                                                        setErrors({ ...errors, title: 'Vui lòng nhập tiêu đề bài viết' });
                                                        return;
                                                    }
                                                    if (!article.shortDescription) {
                                                        setErrors({ ...errors, shortDescription: 'Vui lòng nhập mô tả ngắn' });
                                                        return;
                                                    }
                                                    setActiveTab('category');
                                                } else if (activeTab === 'category') {
                                                    if (!article.category) {
                                                        setErrors({ ...errors, category: 'Vui lòng chọn danh mục' });
                                                        return;
                                                    }
                                                    setActiveTab('content');
                                                }
                                            }}
                                            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                                        >
                                            Tiếp theo
                                        </button>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={adding || loading}
                                        className={`px-6 py-2 border border-transparent text-sm font-medium rounded-lg bg-green-600 hover:bg-green-700 text-white shadow-sm transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-1`}
                                    >
                                        {adding ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Đang lưu
                                            </span>
                                        ) : loading ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Đang tải
                                            </span>
                                        ) : (
                                            <span className="flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                {articleId ? 'Cập nhật bài viết' : 'Lưu bài viết'}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </ModalWrapper>
    );
};

export default ArticleEditorPopup;