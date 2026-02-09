// 메뉴 이미지
export interface MenuImage {
  id: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
  file?: File; // 프론트엔드 업로드용
}

// 옵션 아이템
export interface OptionItem {
  id: string;
  name: string;
  priceDelta: number; // 추가 가격 (0이면 무료)
}

// 메뉴 옵션
export interface MenuOption {
  id: string;
  name: string;
  type: 'radio' | 'checkbox';
  required: boolean;
  items: OptionItem[];
}

// 메뉴 카테고리
export interface MenuCategory {
  id: string;
  korName: string;
  engName: string;
  icon?: string;
  sortOrder: number;
}

// 메뉴
export interface Menu {
  id: string;
  korName: string;
  engName: string;
  description: string;
  price: number;
  category: MenuCategory;
  images: MenuImage[];
  isAvailable: boolean;
  isSoldOut: boolean;
  sortOrder: number;
  options: MenuOption[];
  createdAt: Date;
  updatedAt: Date;
}

// 메뉴 생성/수정용 DTO
export interface MenuFormData {
  korName: string;
  engName: string;
  description: string;
  price: number;
  categoryId: string;
  images: MenuImage[];
  isAvailable: boolean;
  isSoldOut: boolean;
  options: MenuOption[];
}
