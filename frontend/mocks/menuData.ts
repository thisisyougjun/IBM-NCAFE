import { Menu, MenuCategory } from '@/types';

// 카테고리 목업 데이터
export const mockCategories: MenuCategory[] = [
    { id: '1', korName: '커피', engName: 'Coffee', icon: '☕', sortOrder: 0 },
    { id: '2', korName: '음료', engName: 'Beverage', icon: '🥤', sortOrder: 1 },
    { id: '3', korName: '티', engName: 'Tea', icon: '🍵', sortOrder: 2 },
    { id: '4', korName: '디저트', engName: 'Dessert', icon: '🍰', sortOrder: 3 },
    { id: '5', korName: '베이커리', engName: 'Bakery', icon: '🥐', sortOrder: 4 },
];

// 메뉴 목업 데이터
export const mockMenus: Menu[] = [
    {
        id: '1',
        korName: '아메리카노',
        engName: 'Americano',
        description: '진한 에스프레소와 물의 완벽한 조화. 깔끔하고 깊은 맛을 느낄 수 있습니다.',
        price: 4500,
        category: mockCategories[0],
        images: [
            { id: '1-1', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop', isPrimary: true, sortOrder: 0 },
        ],
        isAvailable: true,
        isSoldOut: false,
        sortOrder: 0,
        options: [
            {
                id: 'size',
                name: '사이즈',
                type: 'radio',
                required: true,
                items: [
                    { id: 'regular', name: 'Regular', priceDelta: 0 },
                    { id: 'large', name: 'Large', priceDelta: 500 },
                ],
            },
            {
                id: 'shot',
                name: '샷 추가',
                type: 'checkbox',
                required: false,
                items: [
                    { id: 'extra-shot', name: '샷 추가', priceDelta: 500 },
                ],
            },
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: '2',
        korName: '카페 라떼',
        engName: 'Cafe Latte',
        description: '부드러운 우유와 에스프레소의 조화. 고소하고 부드러운 맛이 특징입니다.',
        price: 5000,
        category: mockCategories[0],
        images: [
            { id: '2-1', url: 'https://images.unsplash.com/photo-1561882468-4853373ea92f?q=80&w=800&auto=format&fit=crop', isPrimary: true, sortOrder: 0 },
        ],
        isAvailable: true,
        isSoldOut: false,
        sortOrder: 1,
        options: [
            {
                id: 'size',
                name: '사이즈',
                type: 'radio',
                required: true,
                items: [
                    { id: 'regular', name: 'Regular', priceDelta: 0 },
                    { id: 'large', name: 'Large', priceDelta: 500 },
                ],
            },
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: '3',
        korName: '카푸치노',
        engName: 'Cappuccino',
        description: '풍성한 우유 거품과 에스프레소의 조화. 부드럽고 크리미한 맛을 즐기세요.',
        price: 5500,
        category: mockCategories[0],
        images: [
            { id: '3-1', url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=800&auto=format&fit=crop', isPrimary: true, sortOrder: 0 },
        ],
        isAvailable: true,
        isSoldOut: true,
        sortOrder: 2,
        options: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: '4',
        korName: '바닐라 라떼',
        engName: 'Vanilla Latte',
        description: '달콤한 바닐라 시럽과 에스프레소, 우유의 조화.',
        price: 5500,
        category: mockCategories[0],
        images: [
            { id: '4-1', url: 'https://images.unsplash.com/photo-1570968992193-96ab70c6524b?q=80&w=800&auto=format&fit=crop', isPrimary: true, sortOrder: 0 },
        ],
        isAvailable: true,
        isSoldOut: false,
        sortOrder: 3,
        options: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: '5',
        korName: '카라멜 마끼아또',
        engName: 'Caramel Macchiato',
        description: '달콤한 카라멜과 에스프레소, 우유의 환상적인 조화.',
        price: 6000,
        category: mockCategories[0],
        images: [
            { id: '5-1', url: 'https://images.unsplash.com/photo-1485808191679-5f8c7c8606af?q=80&w=800&auto=format&fit=crop', isPrimary: true, sortOrder: 0 },
        ],
        isAvailable: true,
        isSoldOut: false,
        sortOrder: 4,
        options: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: '6',
        korName: '딸기 스무디',
        engName: 'Strawberry Smoothie',
        description: '신선한 딸기로 만든 달콤하고 상큼한 스무디.',
        price: 6000,
        category: mockCategories[1],
        images: [
            { id: '6-1', url: 'https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?q=80&w=800&auto=format&fit=crop', isPrimary: true, sortOrder: 0 },
        ],
        isAvailable: true,
        isSoldOut: false,
        sortOrder: 0,
        options: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: '7',
        korName: '레몬에이드',
        engName: 'Lemonade',
        description: '상큼한 레몬과 탄산수의 청량한 만남.',
        price: 5500,
        category: mockCategories[1],
        images: [
            { id: '7-1', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop', isPrimary: true, sortOrder: 0 },
        ],
        isAvailable: true,
        isSoldOut: false,
        sortOrder: 1,
        options: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: '8',
        korName: '얼그레이',
        engName: 'Earl Grey',
        description: '베르가못 향이 은은하게 퍼지는 클래식 홍차.',
        price: 5000,
        category: mockCategories[2],
        images: [
            { id: '8-1', url: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?q=80&w=800&auto=format&fit=crop', isPrimary: true, sortOrder: 0 },
        ],
        isAvailable: true,
        isSoldOut: false,
        sortOrder: 0,
        options: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: '9',
        korName: '티라미수',
        engName: 'Tiramisu',
        description: '에스프레소에 적신 스펀지와 마스카포네 크림의 이탈리안 디저트.',
        price: 7000,
        category: mockCategories[3],
        images: [
            { id: '9-1', url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=800&auto=format&fit=crop', isPrimary: true, sortOrder: 0 },
        ],
        isAvailable: true,
        isSoldOut: false,
        sortOrder: 0,
        options: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: '10',
        korName: '크루아상',
        engName: 'Croissant',
        description: '바삭하고 버터향 가득한 프랑스 정통 크루아상.',
        price: 4000,
        category: mockCategories[4],
        images: [
            { id: '10-1', url: 'https://images.unsplash.com/photo-1555507036-ab1f40388085?q=80&w=800&auto=format&fit=crop', isPrimary: true, sortOrder: 0 },
        ],
        isAvailable: true,
        isSoldOut: false,
        sortOrder: 0,
        options: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
];

// 카테고리별 메뉴 필터 함수
export function getMenusByCategory(categoryId: string | null): Menu[] {
    if (!categoryId || categoryId === 'all') {
        return mockMenus;
    }
    return mockMenus.filter(menu => menu.category.id === categoryId);
}

// ID로 메뉴 찾기
export function getMenuById(id: string): Menu | undefined {
    return mockMenus.find(menu => menu.id === id);
}
