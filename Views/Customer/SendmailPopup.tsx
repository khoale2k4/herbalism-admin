import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill-new';

type EmailPopupProps = {
    onClose: () => void;
    onSubmit: (emails: string[], subject: string, content: string) => void;
    initialEmails: string[];
};

const EmailPopup = ({ onClose, onSubmit, initialEmails }: EmailPopupProps) => {
    const [emails, setEmails] = useState<string[]>(initialEmails);
    const [newEmail, setNewEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [errors, setErrors] = useState<{
        email?: string;
        subject?: string;
        content?: string;
        general?: string;
    }>({});

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

    const modalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus on email input when component mounts
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }

        // Close modal when clicking Escape key
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleAddEmail = () => {
        if (!newEmail.trim()) {
            setErrors(prev => ({ ...prev, email: 'Vui lòng nhập email' }));
            return;
        }

        if (!validateEmail(newEmail)) {
            setErrors(prev => ({ ...prev, email: 'Email không hợp lệ' }));
            return;
        }

        if (emails.includes(newEmail)) {
            setErrors(prev => ({ ...prev, email: 'Email đã tồn tại trong danh sách' }));
            return;
        }

        setEmails([...emails, newEmail]);
        setNewEmail('');
        setErrors(prev => ({ ...prev, email: undefined, general: undefined }));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddEmail();
        }
    };

    const removeEmail = (emailToRemove: string) => {
        setEmails(emails.filter(email => email !== emailToRemove));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: {
            email?: string;
            subject?: string;
            content?: string;
            general?: string;
        } = {};

        if (emails.length === 0) {
            newErrors.general = 'Vui lòng thêm ít nhất một email';
        }

        if (!subject.trim()) {
            newErrors.subject = 'Vui lòng nhập tiêu đề';
        }

        if (!content.trim()) {
            newErrors.content = 'Vui lòng nhập nội dung';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit(emails, subject, content);
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={onClose}>
            <div
                ref={modalRef}
                className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4 relative animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h3 className="text-xl font-semibold text-gray-800">Gửi Email</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Đóng"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Danh sách Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Danh sách email nhận</label>
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Nhập email và nhấn Enter hoặc Thêm"
                                className={`flex-1 border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all ${errors.email ? 'border-red-300' : 'border-gray-300'
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={handleAddEmail}
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-2 text-sm font-medium transition-colors"
                            >
                                Thêm
                            </button>
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}

                        {/* Email list */}
                        {emails.length > 0 && (
                            <div className="mt-3 max-h-32 overflow-y-auto">
                                <div className="space-y-1">
                                    {emails.map((email) => (
                                        <div key={email} className="flex justify-between items-center py-1 px-3 bg-gray-50 border border-gray-200 rounded-md group">
                                            <span className="text-sm text-gray-700">{email}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeEmail(email)}
                                                className="text-gray-400 hover:text-red-500 transition-colors text-xs"
                                            >
                                                <span className="hidden group-hover:inline mr-1">Xóa</span>
                                                <span className="inline group-hover:hidden">×</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {errors.general && <p className="text-red-500 text-xs mt-1">{errors.general}</p>}
                    </div>

                    {/* Tiêu đề Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tiêu đề
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className={`block border rounded-md w-full rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all ${errors.subject ? 'border-red-300' : 'border-gray-300'
                                }`}
                        />
                        {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                    </div>

                    {/* Email Content */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nội dung email
                        </label>
                        {/* <textarea
                            rows={6}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className={`block border rounded-md w-full rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all ${errors.content ? 'border-red-300' : 'border-gray-300'
                                }`}
                            placeholder="Nhập nội dung email..."
                        /> */}
                        <ReactQuill
                            theme="snow"
                            value={content}
                            onChange={(e) => setContent(e)}
                            modules={modules}
                            formats={formats}
                            className="h-64 mb-16"
                        />
                        {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
                    </div>

                    <div className="border-t pt-4 flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        >
                            Gửi Email
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmailPopup;