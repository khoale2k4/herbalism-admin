"use client";

import { DataTable } from "@/components/DataTable/DataTable";
import { useState } from "react";
import ArticleEditorPopup, { ArticleFormData } from "./CreatePost";
import { ArticleOperation } from "@/lib/main";
import { FiRefreshCcw } from "react-icons/fi";
import { useNotification } from "@/providers/Notification";

export type Post = {
    id: string;
    title: string;
    createdAt: string;
    category: {
        name: string;
    };
    author: {
        name: string;
    }
};

export default function PostsPage({ posts, onReload }: { posts: Post[], onReload: () => void }) {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedArticleId, setSelectedArticleId] = useState<string>();
    const [adding, setAdding] = useState(false);
    const articleOp = new ArticleOperation();
    const { showNotification } = useNotification();

    const handleSubmit = async (articleData: ArticleFormData) => {
        try {
            setAdding(true);
            const parser = new DOMParser();
            const doc = parser.parseFromString(articleData.content, 'text/html');
            const images = Array.from(doc.querySelectorAll('img'));

            for (const img of images) {
                const src = img.getAttribute('src') || '';
                if (src.startsWith('data:image')) {
                    const blob = await (await fetch(src)).blob();
                    const file = new File([blob], 'image.png', { type: blob.type });
                    const url = await articleOp.uploadImage(file);

                    if (url.success) {
                        img.setAttribute('src', url.data);
                    }
                }
            }

            const updatedContent = doc.body.innerHTML;

            const finalData = {
                ...articleData,
                content: updatedContent,
            };

            const titleImageUrls = await Promise.all(
                articleData.images.map(async (image, index) => {
                    let file = image.file;

                    if (!file && image.url) {
                        try {
                            const response = await fetch(image.url);
                            const blob = await response.blob();
                            const filename = `image_${index}.jpg`;
                            file = new File([blob], filename, { type: blob.type });
                        } catch (err) {
                            console.error(`Lỗi khi fetch ảnh từ URL: ${image.url}`, err);
                            return null;
                        }
                    }

                    if (file) {
                        const url = await articleOp.uploadImage(file);
                        if (url.success) return url.data;
                    }
                    return null; // hoặc có thể lọc sau
                })
            );
            const filteredImageUrls = titleImageUrls.filter(Boolean) as string[];

            console.log('Final article data (after image upload):', finalData);
            let response;
            if (selectedArticleId !== undefined) {
                response = await articleOp.update(selectedArticleId, finalData.title, finalData.content, articleData.shortDescription, filteredImageUrls, articleData.category);
            } else {
                response = await articleOp.create(finalData.title, finalData.content, articleData.shortDescription, filteredImageUrls, articleData.category);
            }
            if (response.success) {
                showNotification({
                    type: 'success',
                    message: "Cập nhật thành công!"
                });
                setIsPopupOpen(false);
                onReload();
            } else {
                showNotification({
                    type: 'error',
                    message: "Cập nhật không thành công"
                });
            }
        } catch (error) {
            console.log(error);
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await articleOp.delete(id);
            if (response.success) {
                showNotification({
                    type: 'success',
                    message: "Xoá thành công!"
                });
                onReload();
            } else {
                showNotification({
                    type: 'error',
                    message: "Xoá không thành công"
                });
            }
        } catch (error) {
            console.log(error);
        } finally {
            setAdding(false);
            setIsPopupOpen(false);
        }
    }

    return (
        <div className="p-6">
            <DataTable
                columns={[
                    { title: "Tiêu đề", render: (p) => p.title },
                    { title: "Danh mục", render: (p) => p.category.name },
                    {
                        title: "Ngày đăng", render: (p) => {
                            const date = new Date(p.createdAt);
                            return date.toLocaleDateString('vi-VN');
                        }
                    },
                ]}
                data={posts}
                searchable={true}
                searchFields={["title"]}
                rowKey={(post) => post.id}
                pagination={true}
                itemsPerPage={10}
                selectable="none"
                onSelectionChange={(selected) => console.log("Selected posts:", selected)}
                actions={
                    <div className="flex gap-2 mb-4">
                        <button
                            className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                            onClick={() => {
                                setSelectedArticleId(undefined);
                                setIsPopupOpen(true);
                            }}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Viết bài mới
                        </button>

                        <button
                            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            onClick={onReload}
                        >
                            <FiRefreshCcw />
                            Tải lại
                        </button>
                    </div>
                    // <div>
                    //     <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    //         onClick={() => setIsPopupOpen(true)}>
                    //         Viết bài mới
                    //     </button>
                    //     <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    //         onClick={() => onReload()}>
                    //         Tải lại
                    //     </button>
                    // </div>
                }
                onRowClick={(post) => {
                    setSelectedArticleId(post.id);
                    setIsPopupOpen(true);
                }}
                className="p-4 bg-white rounded-lg shadow"
                // onEdit={(post => console.log('Edit post:', post))}
                onDelete={(post) => handleDelete(post as string)}
            />
            {isPopupOpen && <ArticleEditorPopup
                onClose={() => setIsPopupOpen(false)}
                onSubmit={handleSubmit}
                adding={adding}
                articleId={selectedArticleId}
            />}
        </div>
    );
}
