import { Customer } from "./Customer/CustomerTable";
import { Order } from "./Orders/OrdersTable";
import { Post } from "./Posts/PostsTable";
import { Product } from "./Product/ProductTable";
import { useState } from "react";
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { ArrowUpRight, Users, Package, ShoppingCart, DollarSign, FileText, ArrowDownRight } from "lucide-react";

export default function Dashboard({ customers, orders, products, posts, onChangeTab }: {
    customers: Customer[],
    orders: Order[],
    products: Product[],
    posts: Post[],
    onChangeTab: (TabName: 'Dashboard' | 'Customers' | 'Products' | 'Orders' | 'Posts') => void
}) {
    const [timeRange, setTimeRange] = useState<"today" | "week" | "month" | "year">("month");


    function exportToExcel() {
        // Tạo workbook mới
        const wb = XLSX.utils.book_new();

        // Định nghĩa styles
        const headerStyle = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4472C4" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
                top: { style: "thin" },
                bottom: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" }
            }
        };

        const cellStyle = {
            border: {
                top: { style: "thin" },
                bottom: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" }
            }
        };

        const numberFormat = "#,##0";
        const currencyFormat = "#,##0 ₫";
        const dateFormat = "dd/mm/yyyy";

        // Tạo trang bìa
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('vi-VN');
        const coverData = [
            ["BÁO CÁO THỐNG KÊ"],
            [""],
            [`Ngày xuất báo cáo: ${formattedDate}`],
            [""],
            ["Thông tin báo cáo:"],
            ["- Danh sách khách hàng"],
            ["- Danh sách đơn hàng"],
            ["- Danh sách sản phẩm"],
            ["- Danh sách bài viết"]
        ];

        const coverWS = XLSX.utils.aoa_to_sheet(coverData);

        // Thiết lập style cho trang bìa
        coverWS["!cols"] = [{ wch: 50 }];
        coverWS["A1"] = { v: "BÁO CÁO THỐNG KÊ", t: "s" };
        coverWS["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];

        // Tạo và định dạng worksheet cho khách hàng
        const customerData = customers.map(c => ({
            "ID": c.id,
            "Tên khách hàng": c.name,
            "Email": c.mail,
            // "SĐT": c.phone || "",
            // "Địa chỉ": c.address || "",
            "Ngày tạo": new Date(c.createdAt)
        }));

        const customerWS = XLSX.utils.json_to_sheet(customerData);

        // Thiết lập độ rộng cột cho sheet khách hàng
        customerWS["!cols"] = [
            { wch: 10 }, // ID
            { wch: 25 }, // Tên
            { wch: 30 }, // Email
            { wch: 15 }, // SĐT
            { wch: 40 }, // Địa chỉ
            { wch: 15 }, // Ngày tạo
        ];

        // Định dạng ngày tháng
        Object.keys(customerWS).forEach(cell => {
            if (cell[0] === "F" && cell !== "F1") { // Column F (Ngày tạo)
                customerWS[cell].z = dateFormat;
            }
        });

        // Thêm dòng tổng kết
        const customerTotal = `Tổng số khách hàng: ${customerData.length}`;
        XLSX.utils.sheet_add_aoa(customerWS, [[customerTotal]], { origin: -1 });

        // Tạo và định dạng worksheet cho đơn hàng
        const orderData = orders.map(o => ({
            "Mã đơn": o.trackingNumber,
            "Khách hàng": o.customerName,
            "Trạng thái": o.status === "delivered" ? "Hoàn thành" : "Đang xử lý",
            "Ngày đặt": new Date(o.createdAt),
            "Tổng tiền": o.total + o.shippingFee,
            // "Phương thức thanh toán": o.paymentMethod || "Chuyển khoản"
        }));

        const orderWS = XLSX.utils.json_to_sheet(orderData);

        // Thiết lập độ rộng cột cho sheet đơn hàng
        orderWS["!cols"] = [
            { wch: 15 }, // Mã đơn
            { wch: 25 }, // Khách hàng
            { wch: 15 }, // Trạng thái
            { wch: 15 }, // Ngày đặt
            { wch: 15 }, // Tổng tiền
            { wch: 25 }, // Phương thức thanh toán
        ];

        // Định dạng tiền tệ và ngày tháng
        Object.keys(orderWS).forEach(cell => {
            if (cell[0] === "D" && cell !== "D1") { // Column D (Ngày đặt)
                orderWS[cell].z = dateFormat;
            }
            if (cell[0] === "E" && cell !== "E1") { // Column E (Tổng tiền)
                orderWS[cell].z = currencyFormat;
            }
        });

        // Tính tổng doanh thu
        const totalRevenue = orderData.reduce((sum, order) => sum + (order["Tổng tiền"] || 0), 0);
        const completedOrders = orderData.filter(o => o["Trạng thái"] === "Hoàn thành").length;

        // Thêm dòng tổng kết
        XLSX.utils.sheet_add_aoa(orderWS, [
            [`Tổng số đơn hàng: ${orderData.length}`],
            [`Đơn hàng hoàn thành: ${completedOrders}`],
            [`Tổng doanh thu: ${totalRevenue.toLocaleString('vi-VN')} ₫`]
        ], { origin: -1 });

        // Tạo và định dạng worksheet cho sản phẩm
        const productData = products.map(p => ({
            "ID": p.id,
            "Tên sản phẩm": p.name,
            "Giá bán": p.price,
            "Tồn kho": p.totalStock,
            "Danh mục": p.category,
            "Ngày tạo": new Date(p.createdAt)
        }));

        const productWS = XLSX.utils.json_to_sheet(productData);

        // Thiết lập độ rộng cột cho sheet sản phẩm
        productWS["!cols"] = [
            { wch: 10 }, // ID
            { wch: 35 }, // Tên SP
            { wch: 15 }, // Giá bán
            { wch: 10 }, // Tồn kho
            { wch: 20 }, // Danh mục
            { wch: 15 }, // Ngày tạo
        ];

        // Định dạng tiền tệ và ngày tháng
        Object.keys(productWS).forEach(cell => {
            if (cell[0] === "C" && cell !== "C1") { // Column C (Giá bán)
                productWS[cell].z = currencyFormat;
            }
            if (cell[0] === "F" && cell !== "F1") { // Column F (Ngày tạo)
                productWS[cell].z = dateFormat;
            }
        });

        // Thêm dòng tổng kết
        const totalStock = productData.reduce((sum, product) => sum + (product["Tồn kho"] || 0), 0);
        XLSX.utils.sheet_add_aoa(productWS, [
            [`Tổng số sản phẩm: ${productData.length}`],
            [`Tổng hàng tồn kho: ${totalStock}`]
        ], { origin: -1 });

        // Tạo và định dạng worksheet cho bài viết
        const postData = posts.map(p => ({
            "ID": p.id,
            "Tiêu đề": p.title,
            "Tác giả": p.author?.name || "Không xác định",
            "Ngày đăng": new Date(p.createdAt),
            // "Lượt xem": p.views || 0
        }));

        const postWS = XLSX.utils.json_to_sheet(postData);

        // Thiết lập độ rộng cột cho sheet bài viết
        postWS["!cols"] = [
            { wch: 10 }, // ID
            { wch: 45 }, // Tiêu đề
            { wch: 25 }, // Tác giả
            { wch: 15 }, // Ngày đăng
            { wch: 10 }, // Lượt xem
        ];

        // Định dạng ngày tháng và số
        Object.keys(postWS).forEach(cell => {
            if (cell[0] === "D" && cell !== "D1") { // Column D (Ngày đăng)
                postWS[cell].z = dateFormat;
            }
            if (cell[0] === "E" && cell !== "E1") { // Column E (Lượt xem)
                postWS[cell].z = numberFormat;
            }
        });

        // Thêm dòng tổng kết
        // const totalViews = postData.reduce((sum, post) => sum + (post["Lượt xem"] || 0), 0);
        // XLSX.utils.sheet_add_aoa(postWS, [
        //     [`Tổng số bài viết: ${postData.length}`],
        //     [`Tổng lượt xem: ${totalViews}`]
        // ], { origin: -1 });

        // Thêm bộ lọc tự động cho các worksheet
        customerWS["!autofilter"] = { ref: "A1:F" + customerData.length };
        orderWS["!autofilter"] = { ref: "A1:F" + orderData.length };
        productWS["!autofilter"] = { ref: "A1:F" + productData.length };
        postWS["!autofilter"] = { ref: "A1:E" + postData.length };

        // Thêm các worksheet vào workbook
        XLSX.utils.book_append_sheet(wb, coverWS, "Trang bìa");
        XLSX.utils.book_append_sheet(wb, customerWS, "Khách hàng");
        XLSX.utils.book_append_sheet(wb, orderWS, "Đơn hàng");
        XLSX.utils.book_append_sheet(wb, productWS, "Sản phẩm");
        XLSX.utils.book_append_sheet(wb, postWS, "Bài viết");

        // Xuất file với tên có thông tin ngày tháng
        const fileName = `BaoCao_${formattedDate.replace(/\//g, '-')}.xlsx`;
        XLSX.writeFile(wb, fileName);

        // Thông báo xuất file thành công
        alert(`Đã xuất báo cáo thành công: ${fileName}`);
    }

    const getStatus = (sta: string) => {
        if (sta === 'pending') {
            return "Vừa tạo";
        }
        if (sta === 'processing') {
            return "Đang xử lý";
        }
        if (sta === 'shipped') {
            return "Đang giao";
        }
        if (sta === 'delivered') {
            return "Hoàn thành";
        }
        if (sta === 'cancelled') {
            return "Đã huỷ";
        }
        return sta;
    }

    function getChartData(orders: Order[], range: "today" | "week" | "month" | "year") {
        const now = new Date();
        const dataMap: Record<string, number> = {};
        let labels: string[] = [];

        if (range === "today") {
            labels = Array.from({ length: 24 }, (_, i) => `${i}h`);
        } else if (range === "week") {
            labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        } else if (range === "month") {
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
        } else if (range === "year") {
            labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        }

        labels.forEach(label => (dataMap[label] = 0));

        orders.forEach(order => {
            const date = new Date(order.createdAt);
            let key = "";

            if (range === "today") {
                key = `${date.getHours()}h`;
            } else if (range === "week") {
                key = labels[(date.getDay() + 6) % 7];
            } else if (range === "month") {
                key = `${date.getDate()}`;
            } else if (range === "year") {
                key = labels[date.getMonth()];
            }

            if (key in dataMap) {
                dataMap[key] += (order.total as number);
            }
        });

        return labels.map(label => ({
            name: label,
            total: dataMap[label]
        }));
    }

    function filterByTimeRange<T extends { createdAt: string | Date }>(
        items: T[],
        range: "today" | "week" | "month" | "year"
    ): T[] {
        const now = new Date();
        const start = new Date();

        if (range === "today") {
            start.setHours(0, 0, 0, 0);
        } else if (range === "week") {
            const day = now.getDay() || 7;
            start.setDate(now.getDate() - day + 1);
            start.setHours(0, 0, 0, 0);
        } else if (range === "month") {
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
        } else if (range === "year") {
            start.setMonth(0, 1);
            start.setHours(0, 0, 0, 0);
        }

        return items.filter((item) => new Date(item.createdAt) >= start);
    }

    const filteredOrders = filterByTimeRange(orders, timeRange);
    const filteredCustomers = filterByTimeRange(customers, timeRange);
    const filteredProducts = filterByTimeRange(products, timeRange);
    const filteredPosts = filterByTimeRange(posts, timeRange);

    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total as number), 0);
    const recentOrders = filteredOrders.slice(0, 5);
    const chartData = getChartData(filteredOrders, timeRange);
    // console.log('Chart data:', chartData);

    // Thêm hàm này vào component Dashboard của bạn
    function getPreviousTimeRangeData<T extends { createdAt: string | Date }>(
        items: T[],
        currentRange: "today" | "week" | "month" | "year"
    ): T[] {
        const now = new Date();
        const start = new Date();
        const end = new Date();

        if (currentRange === "today") {
            // Lấy dữ liệu ngày hôm qua
            start.setDate(now.getDate() - 1);
            start.setHours(0, 0, 0, 0);
            end.setDate(now.getDate() - 1);
            end.setHours(23, 59, 59, 999);
        } else if (currentRange === "week") {
            // Lấy dữ liệu tuần trước
            const day = now.getDay() || 7;
            start.setDate(now.getDate() - day - 6);
            start.setHours(0, 0, 0, 0);
            end.setDate(now.getDate() - day);
            end.setHours(23, 59, 59, 999);
        } else if (currentRange === "month") {
            // Lấy dữ liệu tháng trước
            start.setMonth(now.getMonth() - 1, 1);
            start.setHours(0, 0, 0, 0);
            end.setMonth(now.getMonth(), 0);
            end.setHours(23, 59, 59, 999);
        } else if (currentRange === "year") {
            // Lấy dữ liệu năm trước
            start.setFullYear(now.getFullYear() - 1, 0, 1);
            start.setHours(0, 0, 0, 0);
            end.setFullYear(now.getFullYear() - 1, 11, 31);
            end.setHours(23, 59, 59, 999);
        }

        return items.filter((item) => {
            const itemDate = new Date(item.createdAt);
            return itemDate >= start && itemDate <= end;
        });
    }

    // Hàm tính phần trăm thay đổi
    function calculatePercentageChange(current: number, previous: number): number {
        if (previous === 0) {
            return current === 0 ? 0 : 100; // Tránh chia cho 0
        }
        return ((current - previous) / previous) * 100;
    }

    // Sử dụng trong component
    const previousCustomers = getPreviousTimeRangeData(customers, timeRange);
    const previousProducts = getPreviousTimeRangeData(products, timeRange);
    const previousOrders = getPreviousTimeRangeData(orders, timeRange);
    const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.total as number), 0);

    // Tính phần trăm thay đổi
    const customerChange = calculatePercentageChange(filteredCustomers.length, previousCustomers.length);
    const productChange = calculatePercentageChange(filteredProducts.length, previousProducts.length);
    const orderChange = calculatePercentageChange(filteredOrders.length, previousOrders.length);
    const revenueChange = calculatePercentageChange(totalRevenue, previousRevenue);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
                <div className="flex bg-gray-100 rounded-lg p-1">
                    {(["today", "week", "month", "year"] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${timeRange === range
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            {range === "today" && "Hôm nay"}
                            {range === "week" && "Tuần này"}
                            {range === "month" && "Tháng này"}
                            {range === "year" && "Năm nay"}
                        </button>
                    ))}
                </div>

                <button
                    onClick={exportToExcel}
                    className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm transition-colors"
                >
                    <FileText size={16} className="mr-2" />
                    Xuất Excel
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Thẻ Khách hàng */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Khách hàng</p>
                            <p className="text-3xl font-bold mt-2">{filteredCustomers.length}</p>
                            <div className={`flex items-center mt-2 text-sm font-medium ${customerChange >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                {customerChange >= 0 ? (
                                    <ArrowUpRight size={16} className="mr-1" />
                                ) : (
                                    <ArrowDownRight size={16} className="mr-1" />
                                )}
                                <span>{Math.abs(Math.round(customerChange))}% so với {timeRange === "today" ? "hôm qua" : timeRange === "week" ? "tuần trước" : timeRange === "month" ? "tháng trước" : "năm trước"}</span>
                            </div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <Users size={24} className="text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Thẻ Sản phẩm */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Sản phẩm</p>
                            <p className="text-3xl font-bold mt-2">{filteredProducts.length}</p>
                            <div className={`flex items-center mt-2 text-sm font-medium ${productChange >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                {productChange >= 0 ? (
                                    <ArrowUpRight size={16} className="mr-1" />
                                ) : (
                                    <ArrowDownRight size={16} className="mr-1" />
                                )}
                                <span>{Math.abs(Math.round(productChange))}% so với {timeRange === "today" ? "hôm qua" : timeRange === "week" ? "tuần trước" : timeRange === "month" ? "tháng trước" : "năm trước"}</span>
                            </div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                            <Package size={24} className="text-purple-600" />
                        </div>
                    </div>
                </div>

                {/* Thẻ Đơn hàng */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Đơn hàng</p>
                            <p className="text-3xl font-bold mt-2">{filteredOrders.length}</p>
                            <div className={`flex items-center mt-2 text-sm font-medium ${orderChange >= 0 ? "text-amber-600" : "text-rose-600"}`}>
                                {orderChange >= 0 ? (
                                    <ArrowUpRight size={16} className="mr-1" />
                                ) : (
                                    <ArrowDownRight size={16} className="mr-1" />
                                )}
                                <span>{Math.abs(Math.round(orderChange))}% so với {timeRange === "today" ? "hôm qua" : timeRange === "week" ? "tuần trước" : timeRange === "month" ? "tháng trước" : "năm trước"}</span>
                            </div>
                        </div>
                        <div className="bg-amber-50 p-3 rounded-lg">
                            <ShoppingCart size={24} className="text-amber-600" />
                        </div>
                    </div>
                </div>

                {/* Thẻ Doanh thu */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Tổng doanh thu</p>
                            <p className="text-3xl font-bold mt-2">{totalRevenue.toLocaleString()}₫</p>
                            <div className={`flex items-center mt-2 text-sm font-medium ${revenueChange >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                {revenueChange >= 0 ? (
                                    <ArrowUpRight size={16} className="mr-1" />
                                ) : (
                                    <ArrowDownRight size={16} className="mr-1" />
                                )}
                                <span>{Math.abs(Math.round(revenueChange))}% so với {timeRange === "today" ? "hôm qua" : timeRange === "week" ? "tuần trước" : timeRange === "month" ? "tháng trước" : "năm trước"}</span>
                            </div>
                        </div>
                        <div className="bg-emerald-50 p-3 rounded-lg">
                            <DollarSign size={24} className="text-emerald-600" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-gray-900">Doanh thu theo thời gian</h2>
                        <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-500 mr-3">Đơn vị: VNĐ</div>
                        </div>
                    </div>
                    <div style={{ height: '400px', width: '100%' }}>
                        {chartData.some(item => item.total > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6b7280' }}
                                    />
                                    <YAxis
                                        dataKey="total"
                                        domain={[0, (dataMax: any) => Math.max(dataMax * 1.2, 100000)]}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(value) => `${value.toLocaleString()} ₫`}
                                        tick={{ fill: '#6b7280' }}
                                    />
                                    <Tooltip
                                        formatter={(value) => [`${Number(value).toLocaleString()}₫`, "Doanh thu"]}
                                        labelFormatter={(label) => `Thời gian: ${label}`}
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: 'none',
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="total"
                                        name="Doanh thu"
                                        fill="#4f46e5"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <Package size={40} className="mb-3" />
                                <p>Không có dữ liệu doanh thu</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-gray-900">Bài viết gần đây</h2>
                        <button className="text-blue-600 text-sm font-medium hover:text-blue-800"
                            onClick={() => onChangeTab('Posts')}>
                            Xem tất cả
                        </button>
                    </div>
                    <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                        {filteredPosts.map((post, index) => (
                            <div key={post.id || index} className="flex items-start">
                                <div className="bg-gray-100 p-2 rounded flex-shrink-0">
                                    <FileText size={16} className="text-gray-500" />
                                </div>
                                <div className="ml-3 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                        {post.title || `Bài viết #${index + 1}`}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {post.createdAt
                                            ? new Date(post.createdAt).toLocaleDateString('vi-VN')
                                            : "Không có ngày"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-bold text-gray-900">Đơn hàng gần đây</h2>
                    <button className="text-blue-600 text-sm font-medium hover:text-blue-800"
                        onClick={() => onChangeTab('Orders')}>
                        Xem tất cả
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {recentOrders.map((order, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.trackingNumber}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{order.customerName || "Khách hàng"}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${order.status === "delivered" ? "bg-green-100 text-green-800" :
                                            order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                                order.status === "cancelled" ? "bg-red-100 text-red-800" :
                                                    "bg-gray-100 text-gray-800"
                                            }`}>
                                            {getStatus(order.status)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{(new Date(order.createdAt).toLocaleDateString('vi-VN')) || "01/01/2025"}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.total?.toLocaleString()}₫</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}