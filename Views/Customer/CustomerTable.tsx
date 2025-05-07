"use client";

import { DataTable } from "@/components/DataTable/DataTable";
import EmailPopup from "./SendmailPopup";
import { useState } from "react";
import { MailOperation } from "@/lib/main";
import { FiRefreshCcw } from "react-icons/fi";

export type Customer = {
    id: number;
    name: string;
    mail: string;
    createdAt: string;
};

export default function CustomerPage({ customers, onReload }: { customers: Customer[], onReload: () => void }) {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedMails, setSelectedMails] = useState<string[]>([]);
    const mailOp = new MailOperation();

    const handleSendEmail = async (emails: string[], subject: string, content: string) => {
        const response = await mailOp.sendMails({
            mails: emails,
            subject,
            html: content
        });
        setIsPopupOpen(false);
    };
    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <DataTable
                columns={[
                    // { title: "ID", render: (c) => c.id },
                    { title: "Tên", render: (c) => c.name },
                    { title: "Email", render: (c) => c.mail },
                    {
                        title: "Ngày tạo", render: (c) => {
                            const date = new Date(c.createdAt);
                            return date.toLocaleDateString('vi-VN');
                        }
                    },
                ]}
                data={customers}
                selectable="multiple"
                onSelectionChange={(selectedUsers) => {
                    const emails = selectedUsers.map((user) => { return user.mail; });
                    console.log('Selected users mail:', emails);
                    setSelectedMails(emails)
                }}
                searchable={true}
                searchFields={['name', 'mail']}
                pagination={true}
                rowKey={(user) => user.id}
                itemsPerPage={10}
                actions={
                    <div className="flex gap-2 mb-4">
                        <button
                            className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                            onClick={() => {
                                // setSelectedProductId(null);
                                setIsPopupOpen(true);
                            }}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Gửi mail
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
                    //     <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    //         onClick={() => setIsPopupOpen(true)}>
                    //         Gửi mail
                    //     </button>
                    //     <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    //         onClick={() => onReload()}>
                    //         Tải lại
                    //     </button>
                    // </div>
                }
                onRowClick={(user) => console.log('Row clicked:', user)}
                className="p-4 bg-white rounded-lg shadow"
            />

            {isPopupOpen && <EmailPopup
                onClose={() => setIsPopupOpen(false)}
                onSubmit={handleSendEmail}
                initialEmails={selectedMails}
            />}
        </div>
    );
}
