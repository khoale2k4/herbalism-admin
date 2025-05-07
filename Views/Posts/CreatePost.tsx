import ModalWrapper from '@/components/ModalWrapper/ModalWrapper';
import { ArticleOperation } from '@/lib/main';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactQuill from 'react-quill-new'; // Sử dụng react-quill-new
import 'react-quill-new/dist/quill.snow.css'; // Cập nhật đường dẫn CSS

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

    const [activeTab, setActiveTab] = useState<'content' | 'title' | 'category'>('title');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [categories, setCategories] = useState<Array<{ id: string, name: string }>>([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list',
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
                images: [...newImages],
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
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(article);
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                if (articleId) {
                    const response = await articleOp.getById(articleId);
                    if (response.success) {
                        const articleData = response.data;
                        const trimmedImageUrl = articleData.imageUrl?.trim() ?? "";

                        const categoryResponse = await articleOp.getAllCategories();
                        if (categoryResponse.success) {
                            const categoryList = categoryResponse.data;
                            const matchedCategory = categoryList.find(
                                (cate: any) => cate.id === articleData.categoryId
                            );

                            setCategories(categoryList);
                            setArticle({
                                ...articleData,
                                images: [{ url: trimmedImageUrl }],
                                category: matchedCategory.name ?? null
                            });
                        }
                    }
                } else {
                    const categoryResponse = await articleOp.getAllCategories();
                    if (categoryResponse.success) {
                        setCategories(categoryResponse.data);
                    }
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);


    return (

        <ModalWrapper onClose={onClose}>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Viết Bài Mới</h2>
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
                                className={`px-4 py-2 font-medium text-sm ${activeTab === 'title' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('title')}
                            >
                                Tiêu đề
                            </button>
                            <button
                                className={`px-4 py-2 font-medium text-sm ${activeTab === 'category' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('category')}
                            >
                                Danh mục
                            </button>
                            <button
                                className={`px-4 py-2 font-medium text-sm ${activeTab === 'content' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('content')}
                            >
                                Nội dung
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Content Tab */}
                            {activeTab === 'content' && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung bài viết</label>
                                    <ReactQuill
                                        theme="snow"
                                        value={article.content}
                                        onChange={handleContentChange}
                                        modules={modules}
                                        formats={formats}
                                        className="h-64 mb-16"
                                    />
                                </div>
                            )}

                            {activeTab === 'category' && <div className="mb-6">
                                <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-2">
                                    Danh mục
                                </label>

                                <div className="relative">
                                    <div className="relative">
                                        <input
                                            id="category-select"
                                            type="text"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                            value={article.category}
                                            onChange={(e) => {
                                                setArticle({ ...article, category: e.target.value });
                                                setShowDropdown(false);
                                            }}
                                            placeholder="Tìm hoặc tạo danh mục"
                                            autoComplete="off"
                                            onFocus={() => setShowDropdown(true)}
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                onClick={() => setShowDropdown(!showDropdown)}
                                            >
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>

                                    {showDropdown && (
                                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-auto">
                                            <ul className="py-1">
                                                {categories.map(cat => (
                                                    <li
                                                        key={cat.id}
                                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                                        onClick={() => {
                                                            setArticle({ ...article, category: cat.name });
                                                            setShowDropdown(false);
                                                        }}
                                                    >
                                                        <span className="flex-1">{cat.name}</span>
                                                        {cat.id === 'new' && (
                                                            <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                                                                Mới
                                                            </span>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>}

                            {activeTab === 'title' && (
                                <div className="mb-6">
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề bài viết</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            value={article.title}
                                            onChange={(e) => setArticle({ ...article, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            value={article.shortDescription}
                                            onChange={(e) => setArticle({ ...article, shortDescription: e.target.value })}
                                            required
                                        />
                                    </div>
                                    {article.images.length === 0 &&
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-sm font-medium text-gray-700">Hình ảnh bài viết</h3>
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                            >
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
                                    }

                                    {article.images.length === 0 ? (
                                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                                            <p className="text-gray-500">Chưa có hình ảnh nào được thêm</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {article.images.map((image) => (
                                                <div key={image.url} className="relative group">
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
                                    {adding ? "Đang lưu" : loading ? "Đang tải" : "Lưu bài"}
                                </button>}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </ModalWrapper>
    );
};

export default ArticleEditorPopup;