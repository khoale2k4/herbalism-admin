'use client';

import { useEffect, useState } from "react";
import { FiUsers, FiPackage, FiFileText, FiShoppingCart, FiHome, FiMenu, FiGift } from "react-icons/fi";
import CustomerPage, { Customer } from "./Customer/CustomerTable";
import ProductPage, { Product } from "./Product/ProductTable";
import PostsPage, { Post } from "./Posts/PostsTable";
import OrdersPage, { Order } from "./Orders/OrdersTable";
import Dashboard from "./Dashboard";
import SideBar from "@/components/SideBar/SideBar";
import { ArticleOperation, CustomerOperation, OrderOperation, ProductOperation } from "@/lib/main";
import VouchersPage from "./Voucher/VouchersTable";

const menuItems = [
    { name: "Dashboard", icon: FiHome },
    { name: "Customers", icon: FiUsers },
    { name: "Products", icon: FiPackage },
    { name: "Orders", icon: FiShoppingCart },
    { name: "Posts", icon: FiFileText },
    { name: "Vouchers", icon: FiGift}
];
export type TabName = (typeof menuItems)[number]["name"];

export default function AdminLayout() {
    if (typeof window === 'undefined') {
        return;
    }
    const [posts, setPosts] = useState<Post[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const orderOp = new OrderOperation();
    const articleOp = new ArticleOperation();
    const customerOp = new CustomerOperation();
    const productOp = new ProductOperation();
    const [selected, setSelected] = useState<TabName>("Dashboard");
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    const onChangeTab = (tab: TabName) => {
        setSelected(tab);
    };
    const fetchPosts = async () => {
        setPosts([]);
        const response = await articleOp.getAll();
        if (response.success) {
            setPosts(response.data);
        }
    }
    const fetchProducts = async () => {
        setProducts([]);
        const response = await productOp.getAll();
        if (response.success) {
            const products = response.data;
            setProducts(products.map((product: any) => {
                return {
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                    totalStock: product.totalStock,
                    category: product.type.name + ', ' + product.need.name + ', ' + product.form.name,
                    createdAt: product.createdAt,
                };
            }
            ));
        }
    }

    const fetchCustomers = async () => {
        setCustomers([]);
        const response = await customerOp.getAll();
        if (response.success) {
            setCustomers(response.data);
        }
    }

    const fetchOrders = async () => {
        setOrders([]);
        const response = await orderOp.getAll();
        if (response.success) {
            setOrders(response.data.map((order: any) => {
                return {
                    id: order.id,
                    customerName: order.customer.name,
                    trackingNumber: order.trackingNumber,
                    createdAt: order.createdAt,
                    total: Number(order.totalPrice),
                    paymentMethod: order.paymentMethod,
                    status: order.status,
                    numberOfItems: order.orderDetails.length,
                    items: order.orderDetails.map((item: any) => {
                        return {
                            productId: item.product.id,
                            productName: item.product.name,
                            size: item.size,
                            quantity: Number(item.num),
                            price_at_order: Number(item.price_at_order),
                            price: Number(item.product.price),
                        }
                    })
                }
            }));
        }
    }

    useEffect(() => {
        fetchPosts();
        fetchCustomers();
        fetchProducts();
        fetchOrders();
    }, [selected])

    return (
        <div className="min-h-screen flex" >
            <SideBar
                menuItems={menuItems}
                selected={selected}
                setSelected={(select) => setSelected(select)
                }
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
            />
            {!isSidebarOpen && (
                <button
                    className="fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-md shadow"
                    onClick={toggleSidebar}
                >
                    <FiMenu className="text-xl" />
                </button>
            )}


            <main className="flex-1 min-h-screen bg-gray-50 transition-all duration-300 px-4 py-6">
                <div className="max-w-7xl mx-auto w-full">
                    <h1 className="text-2xl font-semibold text-gray-800 mb-6" > {selected} </h1>
                    {
                        selected === 'Customers' && <CustomerPage customers={customers} onReload={fetchCustomers} />
                    }
                    {
                        selected === 'Products' && <ProductPage products={products} onReload={fetchProducts}/>
                    }
                    {
                        selected === 'Orders' && <OrdersPage orders={orders} onReload={fetchOrders}/>
                    }
                    {
                        selected === 'Posts' && <PostsPage posts={posts} onReload={fetchPosts}/>
                    }
                    {
                        selected === 'Dashboard' && <Dashboard customers={customers} orders={orders} posts={posts} products={products} onChangeTab={onChangeTab} />
                    }
                    {
                        selected === 'Vouchers' && <VouchersPage/>
                    }
                </div>
            </main>
        </div >
    );
} 
