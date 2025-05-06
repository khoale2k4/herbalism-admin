
export type ResponseForm = {
    success: boolean;
    message: string;
    data: any;
}

export type CreateProductDto = {
    id: string;
    name: string;
    images: string[];
    content: string;
    tabs: Tab[];
    size_stock: SizeStock[];
    product_type: string; // name
    product_form: string // name
    wellness_need: string // name
}

type Tab = {
    name: string;
    description: string;
}

type SizeStock = {
    size: string;
    stock: number;
    price: number;
}

export type CreateVoucherDto = {
    id: string;
    type: 'amount' | 'percent';
    discount: number;
}