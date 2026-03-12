-- =============================================
-- NCAFE Database Full Schema v3.0 (Sync with Performance/Production)
-- 작성일: 2026-03-11
-- 설명: 배포 서버와 100% 동일한 17개 테이블 스키마 구성
-- =============================================

-- 0. 확장 설치
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. 사용자 및 권한 관리 (RBAC)
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP -- 호환성을 위해 유지
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 카테고리 및 메뉴
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menus (
    id BIGSERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    kor_name VARCHAR(255) NOT NULL,
    eng_name VARCHAR(255),
    description TEXT,
    price INTEGER NOT NULL,
    is_available BOOLEAN DEFAULT true,
    is_sold_out BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_images (
    id BIGSERIAL PRIMARY KEY,
    menu_id BIGINT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    src_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 메뉴 옵션 시스템
CREATE TABLE IF NOT EXISTS menu_options (
    id BIGSERIAL PRIMARY KEY,
    menu_id BIGINT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    is_required BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS menu_option_items (
    id BIGSERIAL PRIMARY KEY,
    option_id BIGINT NOT NULL REFERENCES menu_options(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price_delta INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true
);

-- 4. 장바구니
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    menu_id BIGINT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, menu_id)
);

CREATE TABLE IF NOT EXISTS cart_item_options (
    id BIGSERIAL PRIMARY KEY,
    cart_item_id BIGINT NOT NULL REFERENCES cart_items(id) ON DELETE CASCADE,
    option_item_id BIGINT NOT NULL REFERENCES menu_option_items(id),
    option_name VARCHAR(100) NOT NULL,
    option_value VARCHAR(100) NOT NULL,
    price_delta INTEGER DEFAULT 0
);

-- 5. 주문 시스템
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
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
    cancelled_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_id BIGINT NOT NULL REFERENCES menus(id),
    menu_name VARCHAR(255) NOT NULL,
    menu_category VARCHAR(100),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price INTEGER NOT NULL,
    subtotal INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_item_options (
    id BIGSERIAL PRIMARY KEY,
    order_item_id BIGINT NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    option_name VARCHAR(100) NOT NULL,
    option_value VARCHAR(100) NOT NULL,
    price_delta INTEGER DEFAULT 0
);

-- 6. RAG (AI)
CREATE TABLE IF NOT EXISTS rag_documents (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    embedding vector(1024),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 및 제약 사항
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_menus_category_id ON menus(category_id);
CREATE INDEX IF NOT EXISTS rag_documents_embedding_idx ON rag_documents USING hnsw (embedding vector_cosine_ops);

-- =============================================
-- 기본 RBAC / 관리자 시드 데이터
-- =============================================

-- 기본 역할 생성
INSERT INTO roles (name) VALUES ('ROLE_USER') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('ROLE_ADMIN') ON CONFLICT (name) DO NOTHING;

-- 기본 관리자 계정 (아이디/비번: admin / admin1234)
-- - 비밀번호는 pgcrypto의 bcrypt(Blowfish)로 해싱 저장
INSERT INTO users (username, email, password, name)
VALUES ('admin', 'admin@ncafe.local', crypt('admin1234', gen_salt('bf')), '관리자')
ON CONFLICT (username) DO NOTHING;

-- 관리자에게 ROLE_ADMIN 부여
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'ROLE_ADMIN'
WHERE u.username = 'admin'
ON CONFLICT DO NOTHING;
