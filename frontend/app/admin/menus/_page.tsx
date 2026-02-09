'use client';


import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useState, useMemo } from 'react';
import CategoryTabs from './_components/CategoryTabs';
import MenuList from './_components/MenuList';
import MenusPageHeader from './_components/MenusPageHeader';
import { mockMenus, mockCategories } from '@/mocks/menuData';
import { Menu } from '@/types';

export default function MenusPage() {
    // 상태
    const [menus, setMenus] = useState<Menu[]>(mockMenus);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // 필터링된 메뉴 목록
    const filteredMenus = useMemo(() => {
        let result = menus;

        // 카테고리 필터
        if (selectedCategory) {
            result = result.filter(menu => menu.category.id === selectedCategory);
        }

        // 검색 필터
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                menu =>
                    menu.korName.toLowerCase().includes(query) ||
                    menu.engName.toLowerCase().includes(query) ||
                    menu.description.toLowerCase().includes(query)
            );
        }

        return result;
    }, [menus, selectedCategory, searchQuery]);

    // 품절 토글
    const handleToggleSoldOut = (id: string, isSoldOut: boolean) => {
        setMenus(prev =>
            prev.map(menu =>
                menu.id === id ? { ...menu, isSoldOut } : menu
            )
        );
    };

    // 삭제
    const handleDelete = (id: string) => {
        if (window.confirm('정말 이 메뉴를 삭제하시겠습니까?')) {
            setMenus(prev => prev.filter(menu => menu.id !== id));
        }
    };

    // 센서 설정 (드래그 감지 민감도 조절)
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // 드래그 종료 핸들러
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setMenus((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    return (
        <main>
            {/* 페이지 헤더 */}
            <MenusPageHeader
                totalCount={menus.length}
                soldOutCount={menus.filter(m => m.isSoldOut).length}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            {/* 카테고리 탭 */}
            <CategoryTabs
                categories={mockCategories}
                menus={menus}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
            />

            {/* 메뉴 그리드 (드래그 앤 드롭 적용) */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <MenuList
                    menus={filteredMenus}
                    onToggleSoldOut={handleToggleSoldOut}
                    onDelete={handleDelete}
                />
            </DndContext>
        </main>
    );
}
