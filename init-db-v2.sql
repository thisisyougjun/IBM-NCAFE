-- =============================================
-- NCAFE Database Schema v2.0
-- 작성일: 2026-03-11
-- 설명: 장바구니 및 주문 시스템을 위한 완전한 DB 스키마
-- =============================================

-- =============================================
-- 1. 사용자 관리
-- =============================================

-- users 테이블
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- refresh_tokens 테이블
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- =============================================
-- 2. 카테고리 및 메뉴 관리 (기존 테이블 개선)
-- =============================================

-- categories 테이블 개선
ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- name 컬럼에 UNIQUE 제약 추가 (이미 있으면 무시)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'categories_name_unique'
    ) THEN
        ALTER TABLE categories ADD CONSTRAINT categories_name_unique UNIQUE (name);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

-- menus 테이블 개선
-- price 컬럼을 그대로 유지합니다 (백엔드 엔티티와 일치)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'menus' AND column_name = 'price'
    ) THEN
        ALTER TABLE menus ADD COLUMN price INTEGER;
    END IF;
END $$;

ALTER TABLE menus ADD COLUMN IF NOT EXISTS is_sold_out BOOLEAN DEFAULT false;
ALTER TABLE menus ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_menus_category_id ON menus(category_id);
CREATE INDEX IF NOT EXISTS idx_menus_is_available ON menus(is_available);
CREATE INDEX IF NOT EXISTS idx_menus_is_sold_out ON menus(is_sold_out);
CREATE INDEX IF NOT EXISTS idx_menus_display_order ON menus(display_order);

-- menu_images 테이블 개선
ALTER TABLE menu_images ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;

-- sort_order -> display_order 컬럼명 변경 (이미 변경되었으면 무시)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'menu_images' AND column_name = 'sort_order'
    ) THEN
        ALTER TABLE menu_images RENAME COLUMN sort_order TO display_order;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_menu_images_menu_id ON menu_images(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_images_is_primary ON menu_images(is_primary);

-- =============================================
-- 3. 메뉴 옵션 시스템
-- =============================================

-- menu_options 테이블 (옵션 그룹)
CREATE TABLE IF NOT EXISTS menu_options (
    id BIGSERIAL PRIMARY KEY,
    menu_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    is_required BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_menu_options_menu_id ON menu_options(menu_id);

-- menu_option_items 테이블 (옵션 항목)
CREATE TABLE IF NOT EXISTS menu_option_items (
    id BIGSERIAL PRIMARY KEY,
    option_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    price_delta INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    FOREIGN KEY (option_id) REFERENCES menu_options(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_menu_option_items_option_id ON menu_option_items(option_id);
CREATE INDEX IF NOT EXISTS idx_menu_option_items_is_available ON menu_option_items(is_available);

-- =============================================
-- 4. 장바구니
-- =============================================

-- cart_items 테이블
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    menu_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_menu_id ON cart_items(menu_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_user_menu ON cart_items(user_id, menu_id);

-- cart_item_options 테이블 (장바구니 항목 옵션)
CREATE TABLE IF NOT EXISTS cart_item_options (
    id BIGSERIAL PRIMARY KEY,
    cart_item_id BIGINT NOT NULL,
    option_item_id BIGINT NOT NULL,
    option_name VARCHAR(100) NOT NULL,
    option_value VARCHAR(100) NOT NULL,
    price_delta INTEGER DEFAULT 0,
    FOREIGN KEY (cart_item_id) REFERENCES cart_items(id) ON DELETE CASCADE,
    FOREIGN KEY (option_item_id) REFERENCES menu_option_items(id)
);

CREATE INDEX IF NOT EXISTS idx_cart_item_options_cart_item_id ON cart_item_options(cart_item_id);

-- =============================================
-- 5. 주문 시스템
-- =============================================

-- orders 테이블
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
    payment_method VARCHAR(20),
    payment_status VARCHAR(20) DEFAULT 'UNPAID',
    order_type VARCHAR(20) DEFAULT 'PICKUP',
    customer_name VARCHAR(100),
    customer_phone VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- order_items 테이블
CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    menu_id BIGINT NOT NULL,
    menu_name VARCHAR(255) NOT NULL,
    menu_category VARCHAR(100),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price INTEGER NOT NULL,
    subtotal INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES menus(id)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_id ON order_items(menu_id);

-- order_item_options 테이블 (주문 항목 옵션)
CREATE TABLE IF NOT EXISTS order_item_options (
    id BIGSERIAL PRIMARY KEY,
    order_item_id BIGINT NOT NULL,
    option_name VARCHAR(100) NOT NULL,
    option_value VARCHAR(100) NOT NULL,
    price_delta INTEGER DEFAULT 0,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_order_item_options_order_item_id ON order_item_options(order_item_id);

-- =============================================
-- 완료
-- =============================================
