import { headers } from "next/headers";
import { CreateProductDto, CreateVoucherDto } from "./interface";

const token = process.env.NEXT_PUBLIC_TOKEN;

export class ArticleOperation {
    private baseUrl: string;

    constructor() {
        this.baseUrl = (process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3000") + '/article';
    }

    async uploadImage(image: File) {
        const api = `${this.baseUrl}/upload-image`;

        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await fetch(api, {
                method: 'POST',
                body: formData
            }
            );

            if (!response.ok) {
                throw new Error(`Upload failed with status: ${response.status}`);
            }

            const result = await response.json();
            return {
                success: true,
                message: "Success",
                data: result.url
            };
        } catch (error) {
            console.error('Image upload error:', error);
            return {
                success: false,
                message: "Failed",
                data: null
            };
        }
    }

    async create(title: string, content: string, shortDescription: string, images: string[], category: string) {
        try {
            const articleData = {
                title,
                content,
                shortDescription,
                images,
                category
            };

            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + token
                },
                body: JSON.stringify(articleData),
            });

            if (!response.ok) {
                throw new Error(`Create article failed with status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Article created successfully:', result);
            return {
                success: true,
                message: "Success",
                data: result
            };
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            };
        }
    }

    async getAll() {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Get article failed with status: ${response.status}`);
            }

            const result = await response.json();
            return {
                success: true,
                message: result.message,
                data: result.data
            };
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            };
        }
    }

    async getAllCategories() {
        try {
            const response = await fetch(this.baseUrl + "/categories", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Get article failed with status: ${response.status}`);
            }

            const result = await response.json();
            return {
                success: true,
                message: result.message,
                data: result.data
            };
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            };
        }
    }
}

export class CustomerOperation {
    private baseUrl: string;

    constructor() {
        this.baseUrl = (process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3000") + '/customer';
    }

    async getAll() {
        try {
            const response = await fetch(this.baseUrl + '/all', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + token
                },
            });

            if (!response.ok) {
                throw new Error(`Get article failed with status: ${response.status}`);
            }

            const result = await response.json();
            return {
                success: true,
                message: result.message,
                data: result.data
            };
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            };
        }
    }

}

export class ProductOperation {
    private baseUrl: string;

    constructor() {
        this.baseUrl = (process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3000") + '/product';
    }

    async getById(id: string) {
        try {
            const response = await fetch(this.baseUrl + '/' + id, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message);
            }
            return {
                success: true,
                message: result.message,
                data: result.data
            };
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            };
        }
    }

    async getAll() {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Get products failed with status: ${response.status}`);
            }

            const result = await response.json();
            return {
                success: true,
                message: result.message,
                data: result.data
            };
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            };
        }
    }

    async uploadImage(image: File) {
        const api = `${this.baseUrl}/upload-image`;

        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await fetch(api, {
                method: 'POST',
                body: formData
            }
            );

            if (!response.ok) {
                throw new Error(`Upload failed with status: ${response.status}`);
            }

            const result = await response.json();
            return {
                success: true,
                message: "Success",
                data: result.url
            };
        } catch (error) {
            console.error('Image upload error:', error);
            return {
                success: false,
                message: "Failed",
                data: null
            };
        }
    }

    async create(dto: CreateProductDto) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + token
                },
                body: JSON.stringify(dto),
            });

            if (!response.ok) {
                throw new Error(`Create article failed with status: ${response.status}`);
            }

            const result = await response.json();
            return {
                success: true,
                message: result.message,
                data: result
            };
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            };
        }
    }

    async update(id: string, dto: CreateProductDto) {
        try {
            const response = await fetch(this.baseUrl + '/' + id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + token
                },
                body: JSON.stringify(dto),
            });

            if (!response.ok) {
                throw new Error(`Create article failed with status: ${response.status}`);
            }

            const result = await response.json();
            return {
                success: true,
                message: result.message,
                data: result
            };
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            };
        }
    }

    async getCategory() {
        try {
            const response = await fetch(this.baseUrl + '/categories/all', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Get article failed with status: ${response.status}`);
            }

            const result = await response.json();
            return {
                success: result.success,
                message: result.message,
                data: result.data
            };
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            };
        }
    }
}

export class OrderOperation {
    private baseUrl: string;

    constructor() {
        this.baseUrl = (process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3000") + '/order';
    }

    async getAll() {
        try {
            const response = await fetch(this.baseUrl + '/getAll', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + token
                },
            });

            if (!response.ok) {
                throw new Error(`Get article failed with status: ${response.status}`);
            }

            const result = await response.json();
            return {
                success: true,
                message: result.message,
                data: result.data
            };
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            };
        }
    }
}

export class VoucherOperation {
    private baseUrl: string;

    constructor() {
        this.baseUrl = (process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3000") + '/voucher';
    }

    async getAll() {
        try {
            const response = await fetch(this.baseUrl + '/all', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + token
                },
            });

            if (!response.ok) {
                throw new Error(`Get article failed with status: ${response.status}`);
            }

            const result = await response.json();
            return {
                success: true,
                message: result.message,
                data: result.data
            };
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            };
        }
    }

    async create(dto: CreateVoucherDto) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + token
                },
                body: JSON.stringify(dto),
            });

            if (!response.ok) {
                throw new Error(`Get article failed with status: ${response.status}`);
            }

            const result = await response.json();
            return {
                success: true,
                message: result.message,
                data: result.data
            };
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            };
        }
    }

    async delete(id: string) {
        try {
            const response = await fetch(this.baseUrl + '/' + id, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + token
                },
            });

            if (!response.ok) {
                throw new Error(`Get article failed with status: ${response.status}`);
            }

            const result = await response.json();
            return {
                success: true,
                message: result.message,
                data: result.data
            };
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            };
        }
    }
}