-- =============================================
-- 기존 중복 데이터 정리
-- =============================================
DELETE FROM categories WHERE id NOT IN (SELECT MIN(id) FROM categories GROUP BY name);

-- =============================================
-- 카테고리 더미 데이터
-- =============================================
INSERT INTO categories (name)
SELECT '커피' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = '커피');
INSERT INTO categories (name)
SELECT '논커피' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = '논커피');
INSERT INTO categories (name)
SELECT '디저트' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = '디저트');
INSERT INTO categories (name)
SELECT '스무디/주스' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = '스무디/주스');
INSERT INTO categories (name)
SELECT '티' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = '티');

-- =============================================
-- 메뉴 더미 데이터
-- =============================================
-- 커피
INSERT INTO menus (kor_name, eng_name, description, price, category_id, is_available, created_at, updated_at)
SELECT '아메리카노', 'Americano', '깊고 진한 에스프레소에 물을 더해 깔끔한 맛을 즐길 수 있는 커피', 4500,
       (SELECT id FROM categories WHERE name = '커피' LIMIT 1), true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM menus WHERE kor_name = '아메리카노');

INSERT INTO menus (kor_name, eng_name, description, price, category_id, is_available, created_at, updated_at)
SELECT '카페라떼', 'Cafe Latte', '에스프레소와 부드러운 스팀밀크의 조화로운 만남', 5000,
       (SELECT id FROM categories WHERE name = '커피' LIMIT 1), true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM menus WHERE kor_name = '카페라떼');

INSERT INTO menus (kor_name, eng_name, description, price, category_id, is_available, created_at, updated_at)
SELECT '카푸치노', 'Cappuccino', '풍성한 우유 거품과 에스프레소가 어우러진 클래식 커피', 5000,
       (SELECT id FROM categories WHERE name = '커피' LIMIT 1), true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM menus WHERE kor_name = '카푸치노');

INSERT INTO menus (kor_name, eng_name, description, price, category_id, is_available, created_at, updated_at)
SELECT '바닐라 라떼', 'Vanilla Latte', '달콤한 바닐라 시럽과 에스프레소, 스팀밀크의 완벽한 조합', 5500,
       (SELECT id FROM categories WHERE name = '커피' LIMIT 1), true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM menus WHERE kor_name = '바닐라 라떼');

INSERT INTO menus (kor_name, eng_name, description, price, category_id, is_available, created_at, updated_at)
SELECT '카라멜 마키아또', 'Caramel Macchiato', '바닐라 시럽, 스팀밀크, 에스프레소 위에 카라멜 드리즐을 올린 커피', 5500,
       (SELECT id FROM categories WHERE name = '커피' LIMIT 1), true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM menus WHERE kor_name = '카라멜 마키아또');

INSERT INTO menus (kor_name, eng_name, description, price, category_id, is_available, created_at, updated_at)
SELECT '콜드브루', 'Cold Brew', '차갑게 오래 우려내어 부드럽고 깊은 풍미를 느낄 수 있는 커피', 5000,
       (SELECT id FROM categories WHERE name = '커피' LIMIT 1), true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM menus WHERE kor_name = '콜드브루');

-- 논커피
INSERT INTO menus (kor_name, eng_name, description, price, category_id, is_available, created_at, updated_at)
SELECT '초코라떼', 'Chocolate Latte', '진한 초콜릿과 부드러운 우유가 만나 달콤한 한 잔', 5500,
       (SELECT id FROM categories WHERE name = '논커피' LIMIT 1), true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM menus WHERE kor_name = '초코라떼');

INSERT INTO menus (kor_name, eng_name, description, price, category_id, is_available, created_at, updated_at)
SELECT '고구마 라떼', 'Sweet Potato Latte', '달콤한 고구마와 부드러운 우유의 따뜻한 조화', 5500,
       (SELECT id FROM categories WHERE name = '논커피' LIMIT 1), true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM menus WHERE kor_name = '고구마 라떼');

INSERT INTO menus (kor_name, eng_name, description, price, category_id, is_available, created_at, updated_at)
SELECT '딸기 라떼', 'Strawberry Latte', '상큼한 딸기와 부드러운 우유가 어우러진 핑크빛 음료', 6000,
       (SELECT id FROM categories WHERE name = '논커피' LIMIT 1), true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM menus WHERE kor_name = '딸기 라떼');

-- 디저트
INSERT INTO menus (kor_name, eng_name, description, price, category_id, is_available, created_at, updated_at)
SELECT '티라미수 케이크', 'Tiramisu Cake', '마스카포네 크림과 에스프레소가 겹겹이 쌓인 이탈리안 디저트', 6500,
       (SELECT id FROM categories WHERE name = '디저트' LIMIT 1), true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM menus WHERE kor_name = '티라미수 케이크');

INSERT INTO menus (kor_name, eng_name, description, price, category_id, is_available, created_at, updated_at)
SELECT '크로와상', 'Croissant', '버터 풍미가 가득한 바삭한 프랑스식 페이스트리', 4000,
       (SELECT id FROM categories WHERE name = '디저트' LIMIT 1), true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM menus WHERE kor_name = '크로와상');

INSERT INTO menus (kor_name, eng_name, description, price, category_id, is_available, created_at, updated_at)
SELECT '치즈케이크', 'Cheesecake', '부드럽고 진한 크림치즈의 풍미가 입안에 퍼지는 케이크', 6000,
       (SELECT id FROM categories WHERE name = '디저트' LIMIT 1), true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM menus WHERE kor_name = '치즈케이크');

-- 스무디/주스
INSERT INTO menus (kor_name, eng_name, description, price, category_id, is_available, created_at, updated_at)
SELECT '망고 스무디', 'Mango Smoothie', '달콤한 망고를 갈아 만든 시원하고 상큼한 스무디', 6000,
       (SELECT id FROM categories WHERE name = '스무디/주스' LIMIT 1), true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM menus WHERE kor_name = '망고 스무디');

INSERT INTO menus (kor_name, eng_name, description, price, category_id, is_available, created_at, updated_at)
SELECT '오렌지 주스', 'Orange Juice', '신선한 오렌지를 착즙한 100% 생과일 주스', 5500,
       (SELECT id FROM categories WHERE name = '스무디/주스' LIMIT 1), true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM menus WHERE kor_name = '오렌지 주스');

-- 티
INSERT INTO menus (kor_name, eng_name, description, price, category_id, is_available, created_at, updated_at)
SELECT '얼그레이', 'Earl Grey', '베르가못 향이 은은하게 퍼지는 클래식 홍차', 4500,
       (SELECT id FROM categories WHERE name = '티' LIMIT 1), true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM menus WHERE kor_name = '얼그레이');

INSERT INTO menus (kor_name, eng_name, description, price, category_id, is_available, created_at, updated_at)
SELECT '캐모마일', 'Chamomile', '은은한 꽃향과 함께 마음이 편안해지는 허브티', 4500,
       (SELECT id FROM categories WHERE name = '티' LIMIT 1), true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM menus WHERE kor_name = '캐모마일');

INSERT INTO menus (kor_name, eng_name, description, price, category_id, is_available, created_at, updated_at)
SELECT '페퍼민트', 'Peppermint', '상쾌한 민트향으로 기분 전환에 좋은 허브티', 4500,
       (SELECT id FROM categories WHERE name = '티' LIMIT 1), true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM menus WHERE kor_name = '페퍼민트');
