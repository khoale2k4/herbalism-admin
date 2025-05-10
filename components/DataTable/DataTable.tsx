import { Dialog, Transition } from '@headlessui/react';
import { on } from 'events';
import { Fragment } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';

type Column<T> = {
    title: string;
    render: (item: T) => React.ReactNode;
    width?: string;
    className?: string;
    sortable?: boolean;
    sortKey?: keyof T;
};

type SortDirection = 'asc' | 'desc' | null;

type DataTableProps<T> = {
    columns: Column<T>[];
    data: T[];
    className?: string;
    selectable?: 'single' | 'multiple' | 'none';
    searchable?: boolean;
    searchPlaceholder?: string;
    searchFields?: (keyof T)[];
    pagination?: boolean;
    itemsPerPage?: number;
    actions?: React.ReactNode;
    onRowClick?: (item: T) => void;
    onSelectionChange?: (selectedItems: T[]) => void;
    rowKey?: (item: T) => string | number;
    emptyMessage?: string;
    borderless?: boolean;
    striped?: boolean;
    compact?: boolean;
    rounded?: boolean;
    showShadow?: boolean;
    highlightOnHover?: boolean;
    onEdit?: (item: string | number) => void;
    onDelete?: (item: string | number) => void;
};

export function DataTable<T>({
    columns,
    data,
    className = '',
    selectable = 'none',
    searchable = true,
    searchPlaceholder = 'Search...',
    searchFields,
    pagination = true,
    itemsPerPage = 10,
    actions,
    onRowClick,
    onSelectionChange,
    rowKey = (item: any) => item.id || JSON.stringify(item),
    emptyMessage = 'No data found',
    borderless = false,
    striped = true,
    compact = false,
    rounded = true,
    showShadow = true,
    highlightOnHover = true,
    onEdit,
    onDelete,
}: DataTableProps<T>) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);
    const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | number | null>(null);

    // Thêm hàm xử lý mở modal xác nhận
    const handleDeleteClick = (itemId: string | number) => {
        setItemToDelete(itemId);
        setIsDeleteModalOpen(true);
    };

    // Thêm hàm xử lý xác nhận xóa
    const confirmDelete = () => {
        if (itemToDelete && onDelete) {
            onDelete(itemToDelete);
        }
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
    };

    // Reset page when data changes
    useEffect(() => {
        setCurrentPage(1);
    }, [data]);

    // Filter data based on search term
    const filteredData = useMemo(() => {
        if (!searchable || !searchTerm) return data;

        return data.filter(item => {
            if (searchFields) {
                return searchFields.some(field =>
                    String(item[field]).toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            return Object.values(item as object).some(value =>
                value !== null &&
                typeof value !== 'undefined' &&
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
    }, [data, searchTerm, searchable, searchFields]);

    // Sorting logic
    const sortedData = useMemo(() => {
        if (!sortColumn || !sortDirection) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aValue = a[sortColumn];
            const bValue = b[sortColumn];

            if (aValue === bValue) return 0;
            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            const comparison =
                typeof aValue === 'string' && typeof bValue === 'string'
                    ? aValue.localeCompare(bValue)
                    : (aValue < bValue ? -1 : 1);

            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [filteredData, sortColumn, sortDirection]);

    // Pagination logic
    const paginatedData = useMemo(() => {
        if (!pagination) return sortedData;

        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedData, currentPage, itemsPerPage, pagination]);

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);

    // Handle row selection
    const toggleRowSelection = (rowKeyValue: string | number) => {
        let newSelection;
        if (selectable === 'multiple') {
            if (selectedRows.includes(rowKeyValue)) {
                newSelection = selectedRows.filter(id => id !== rowKeyValue);
            } else {
                newSelection = [...selectedRows, rowKeyValue];
            }
        } else {
            // Single select mode
            newSelection = selectedRows.includes(rowKeyValue) ? [] : [rowKeyValue];
        }

        setSelectedRows(newSelection);

        if (onSelectionChange) {
            const selectedItems = data.filter(item =>
                newSelection.includes(rowKey(item))
            );
            onSelectionChange(selectedItems);
        }
    };

    // Select all/none in current page
    const toggleSelectAll = () => {
        const allPageKeys = paginatedData.map(item => rowKey(item));
        const allSelected = allPageKeys.every(key =>
            selectedRows.includes(key)
        );

        let newSelection;
        if (allSelected) {
            newSelection = selectedRows.filter(key =>
                !allPageKeys.includes(key)
            );
        } else {
            newSelection = Array.from(
                new Set([...selectedRows, ...allPageKeys])
            );
        }

        setSelectedRows(newSelection);

        if (onSelectionChange) {
            const selectedItems = data.filter(item =>
                newSelection.includes(rowKey(item))
            );
            onSelectionChange(selectedItems);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleSort = (column: Column<T>) => {
        if (!column.sortable || !column.sortKey) return;

        if (sortColumn === column.sortKey) {
            setSortDirection(current => {
                if (current === 'asc') return 'desc';
                if (current === 'desc') return null;
                return 'asc';
            });
        } else {
            setSortColumn(column.sortKey);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (column: Column<T>) => {
        if (!column.sortable || !column.sortKey) return null;

        if (sortColumn !== column.sortKey) {
            return (
                <svg className="w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M7 10l5 5 5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        }

        if (sortDirection === 'asc') {
            return (
                <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M17 16l-5-5-5 5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        }

        if (sortDirection === 'desc') {
            return (
                <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M7 10l5 5 5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        }

        return (
            <svg className="w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M7 10l5 5 5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    };

    // Generate table classes based on props
    const tableClasses = [
        'min-w-full table-auto',
        borderless ? '' : 'divide-y divide-gray-200',
        className
    ].filter(Boolean).join(' ');

    // Generate wrapper classes based on props
    const wrapperClasses = [
        'w-full overflow-x-auto',
        rounded ? 'rounded-lg' : '',
        showShadow ? 'shadow-sm' : '',
        borderless ? '' : 'border border-gray-200',
    ].filter(Boolean).join(' ');

    return (
        <div className="w-full flex flex-col">
            <Transition appear show={isDeleteModalOpen} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-50"
                    onClose={() => setIsDeleteModalOpen(false)}
                >
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        Xác nhận xóa
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Bạn có chắc chắn muốn xóa mục này? Hành động này không thể hoàn tác.
                                        </p>
                                    </div>

                                    <div className="mt-4 flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                            onClick={() => setIsDeleteModalOpen(false)}
                                        >
                                            Hủy bỏ
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                            onClick={confirmDelete}
                                        >
                                            Xác nhận xóa
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            {/* Action and Search Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                {actions && <div className="flex-1">{actions}</div>}

                {searchable && (
                    <div className="relative w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        />
                        <svg
                            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        {searchTerm && (
                            <button
                                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-600"
                                onClick={() => setSearchTerm('')}
                            >
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Table */}
            <div className={wrapperClasses}>
                <table className={tableClasses}>
                    <thead className="bg-gray-50">
                        <tr>
                            {selectable !== 'none' && (
                                <th className={`${compact ? 'px-3 py-2' : 'px-6 py-3'} text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10`}>
                                    {selectable === 'multiple' && (
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors duration-200"
                                                checked={
                                                    paginatedData.length > 0 &&
                                                    paginatedData.every(item =>
                                                        selectedRows.includes(rowKey(item))
                                                    )
                                                }
                                                onChange={toggleSelectAll}
                                            />
                                        </div>
                                    )}
                                </th>
                            )}
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    className={`${compact ? 'px-3 py-2' : 'px-6 py-3'} text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.className || ''} ${col.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                                    style={{ width: col.width }}
                                    onClick={() => handleSort(col)}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>{col.title}</span>
                                        {col.sortable && col.sortKey && getSortIcon(col)}
                                    </div>
                                </th>
                            ))}
                            {
                                (onEdit || onDelete) && (
                                    <th
                                        className={`${compact ? 'px-3 py-2' : 'px-6 py-3'} text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}
                                    >
                                        Hành động
                                    </th>
                                )
                            }
                        </tr>
                    </thead>
                    <tbody className={`bg-white divide-y divide-gray-100 ${borderless ? '' : 'divide-y divide-gray-200'}`}>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row, rowIndex) => {
                                const rowKeyValue = rowKey(row);
                                const isSelected = selectedRows.includes(rowKeyValue);

                                return (
                                    <tr
                                        key={rowKeyValue}
                                        className={`
            ${onRowClick || selectable !== 'none' ? 'cursor-pointer' : ''} 
            ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : `${striped && rowIndex % 2 === 1 ? 'bg-gray-50' : 'bg-white'}`}
            ${highlightOnHover && !isSelected ? 'hover:bg-gray-50' : ''}
            transition-colors duration-150
          `}
                                        onClick={(e) => {
                                            if ((e.target as HTMLElement).closest('input[type="checkbox"]')) {
                                                return;
                                            }
                                            if (selectable !== 'none') {
                                                toggleRowSelection(rowKeyValue);
                                            }
                                            if (onRowClick) {
                                                onRowClick(row);
                                            }
                                        }}
                                    >
                                        {selectable !== 'none' && (
                                            <td className={compact ? 'px-3 py-2' : 'px-6 py-4'}>
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors duration-200"
                                                        checked={isSelected}
                                                        onChange={() => toggleRowSelection(rowKeyValue)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                            </td>
                                        )}
                                        {columns.map((col, colIndex) => (
                                            <td
                                                key={colIndex}
                                                className={`${compact ? 'px-3 py-2' : 'px-6 py-4'} ${col.className || ''}`}
                                            >
                                                <div className="whitespace-normal">
                                                    {col.render(row)}
                                                </div>
                                            </td>
                                        ))}

                                        {/* ✅ Cột hành động */}
                                        {(onEdit || onDelete) && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {onEdit && (
                                                    <button
                                                        className="text-blue-500 hover:underline mr-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEdit(rowKeyValue);
                                                        }}
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button
                                                        className="text-red-500 hover:underline"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteClick(rowKeyValue);
                                                        }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length + (selectable !== 'none' ? 1 : 0) + (onEdit || onDelete ? 1 : 0)}
                                    className={`${compact ? 'px-3 py-6' : 'px-6 py-10'} text-center`}
                                >
                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                        <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                        <p>{emptyMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>

                </table>
            </div>

            {/* Pagination and Selection Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
                {selectable !== 'none' && selectedRows.length > 0 && (
                    <div className="text-sm text-gray-700 bg-gray-50 px-3 py-1 rounded-full font-medium border">
                        {selectedRows.length} selected
                    </div>
                )}

                {pagination && totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 ml-auto">
                        <div className="text-xs text-gray-500">
                            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                            <span className="font-medium">
                                {Math.min(currentPage * itemsPerPage, sortedData.length)}
                            </span>{' '}
                            of <span className="font-medium">{sortedData.length}</span> results
                        </div>
                        <nav className="flex space-x-1">
                            <button
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-md text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed border hover:bg-gray-50 transition-colors"
                                aria-label="First page"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-md text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed border hover:bg-gray-50 transition-colors"
                                aria-label="Previous page"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${currentPage === pageNum
                                            ? 'bg-blue-500 text-white'
                                            : 'border hover:bg-gray-50 text-gray-700'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            {totalPages > 5 && currentPage < totalPages - 2 && (
                                <span className="px-2 py-1 flex items-center justify-center">
                                    <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="2" />
                                        <circle cx="6" cy="12" r="2" />
                                        <circle cx="18" cy="12" r="2" />
                                    </svg>
                                </span>
                            )}

                            {totalPages > 5 && currentPage < totalPages - 2 && (
                                <button
                                    onClick={() => handlePageChange(totalPages)}
                                    className="w-8 h-8 flex items-center justify-center border rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    {totalPages}
                                </button>
                            )}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-md text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed border hover:bg-gray-50 transition-colors"
                                aria-label="Next page"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                            <button
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-md text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed border hover:bg-gray-50 transition-colors"
                                aria-label="Last page"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                </svg>
                            </button>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );
}