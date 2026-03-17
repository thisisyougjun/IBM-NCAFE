package com.new_cafe.app.backend.order;

import com.new_cafe.app.backend.user.adapter.out.persistence.UserRepository;
import com.new_cafe.app.backend.user.domain.User;
import jakarta.annotation.PostConstruct;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

/**
 * 고객 주문 생성 API
 * - 경로: /orders
 * - 체크아웃 완료 시 주문/주문항목 저장
 */
@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderWebAdapter {

    private final JdbcTemplate jdbcTemplate;
    private final UserRepository userRepository;

    @PostConstruct
    public void ensureOrderTables() {
        // 배포 환경에서 schema 초기화 누락 시 주문 저장이 500으로 실패하는 문제 방지
        jdbcTemplate.execute(
                """
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
                )
                """
        );

        jdbcTemplate.execute(
                """
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
                )
                """
        );

        jdbcTemplate.execute(
                """
                CREATE TABLE IF NOT EXISTS order_item_options (
                    id BIGSERIAL PRIMARY KEY,
                    order_item_id BIGINT NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
                    option_name VARCHAR(100) NOT NULL,
                    option_value VARCHAR(100) NOT NULL,
                    price_delta INTEGER DEFAULT 0
                )
                """
        );
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> createOrder(
            @RequestBody CreateOrderRequest request,
            Authentication authentication
    ) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다."));
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "주문 항목이 없습니다."));
        }
        if (request.getCustomerName() == null || request.getCustomerName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "고객명을 입력해주세요."));
        }
        if (request.getCustomerPhone() == null || request.getCustomerPhone().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "연락처를 입력해주세요."));
        }

        Optional<User> userOpt = userRepository.findByUsername(authentication.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "사용자 정보를 찾을 수 없습니다."));
        }

        // 장바구니 메뉴가 삭제/비노출/품절 상태인지 사전 검증
        for (OrderItemRequest item : request.getItems()) {
            if (item.getMenuId() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "유효하지 않은 메뉴가 포함되어 있습니다."));
            }
            Map<String, Object> menuRow;
            try {
                menuRow = jdbcTemplate.queryForMap(
                        """
                        SELECT is_available, is_sold_out
                        FROM menus
                        WHERE id = ?
                        """,
                        item.getMenuId()
                );
            } catch (DataAccessException e) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "장바구니의 메뉴가 변경되어 주문할 수 없습니다. 장바구니를 새로고침 해주세요."
                ));
            }

            boolean isAvailable = Boolean.TRUE.equals(menuRow.get("is_available"));
            boolean isSoldOut = Boolean.TRUE.equals(menuRow.get("is_sold_out"));
            if (!isAvailable || isSoldOut) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "품절/비노출 메뉴가 포함되어 주문할 수 없습니다. 장바구니를 확인해주세요."
                ));
            }
        }

        Long userId = userOpt.get().getId();
        String orderType = normalizeOrderType(request.getOrderType());

        String mergedNotes = request.getNotes() == null ? "" : request.getNotes().trim();
        if ("DELIVERY".equals(orderType) && request.getAddress() != null && !request.getAddress().isBlank()) {
            mergedNotes = ("배송지: " + request.getAddress().trim()) + (mergedNotes.isBlank() ? "" : "\n" + mergedNotes);
        }
        final String finalNotes = mergedNotes;

        int totalAmount = request.getItems().stream()
                .mapToInt(item -> {
                    int optionTotal = item.getOptions() == null ? 0 : item.getOptions().stream()
                            .mapToInt(OrderOptionRequest::getPriceDelta)
                            .sum();
                    int unitPrice = item.getPrice() + optionTotal;
                    return unitPrice * item.getQuantity();
                })
                .sum();

        String orderNumber = generateOrderNumber();

        try {
            KeyHolder orderKeyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(
                        """
                        INSERT INTO orders (
                            user_id, order_number, status, total_amount,
                            payment_method, payment_status, order_type,
                            customer_name, customer_phone, notes,
                            created_at, updated_at
                        )
                        VALUES (?, ?, 'PENDING', ?, ?, 'PAID', ?, ?, ?, ?, NOW(), NOW())
                        """,
                        Statement.RETURN_GENERATED_KEYS
                );
                ps.setLong(1, userId);
                ps.setString(2, orderNumber);
                ps.setInt(3, totalAmount);
                ps.setString(4, request.getPaymentMethod() != null ? request.getPaymentMethod() : "CARD");
                ps.setString(5, orderType);
                ps.setString(6, request.getCustomerName().trim());
                ps.setString(7, request.getCustomerPhone().trim());
                ps.setString(8, finalNotes);
                return ps;
            }, orderKeyHolder);

            Number orderIdNumber = orderKeyHolder.getKey();
            if (orderIdNumber == null) {
                return ResponseEntity.internalServerError().body(Map.of("message", "주문 생성에 실패했습니다."));
            }
            Long orderId = orderIdNumber.longValue();

            for (OrderItemRequest item : request.getItems()) {
                int optionTotal = item.getOptions() == null ? 0 : item.getOptions().stream()
                        .mapToInt(OrderOptionRequest::getPriceDelta)
                        .sum();
                int unitPriceWithOptions = item.getPrice() + optionTotal;
                int subtotal = unitPriceWithOptions * item.getQuantity();

                KeyHolder itemKeyHolder = new GeneratedKeyHolder();
                jdbcTemplate.update(connection -> {
                    PreparedStatement ps = connection.prepareStatement(
                            """
                            INSERT INTO order_items (
                                order_id, menu_id, menu_name, menu_category,
                                quantity, unit_price, subtotal, created_at
                            )
                            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
                            """,
                            Statement.RETURN_GENERATED_KEYS
                    );
                    ps.setLong(1, orderId);
                    ps.setLong(2, item.getMenuId());
                    ps.setString(3, item.getMenuName());
                    ps.setString(4, item.getMenuCategory());
                    ps.setInt(5, item.getQuantity());
                    ps.setInt(6, unitPriceWithOptions);
                    ps.setInt(7, subtotal);
                    return ps;
                }, itemKeyHolder);

                Number orderItemIdNumber = itemKeyHolder.getKey();
                if (orderItemIdNumber == null || item.getOptions() == null) continue;
                Long orderItemId = orderItemIdNumber.longValue();

                for (OrderOptionRequest option : item.getOptions()) {
                    jdbcTemplate.update(
                            """
                            INSERT INTO order_item_options (order_item_id, option_name, option_value, price_delta)
                            VALUES (?, ?, ?, ?)
                            """,
                            orderItemId,
                            option.getName(),
                            option.getValue(),
                            option.getPriceDelta()
                    );
                }
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "orderId", orderId,
                    "orderNumber", orderNumber
            ));
        } catch (DataAccessException e) {
            String detail = e.getMostSpecificCause() != null
                    ? e.getMostSpecificCause().getMessage()
                    : e.getMessage();
            return ResponseEntity.internalServerError().body(Map.of(
                    "message", "주문 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
                    "detail", detail == null ? "" : detail
            ));
        }
    }

    private String normalizeOrderType(String orderType) {
        if (orderType == null) return "PICKUP";
        String normalized = orderType.trim().toUpperCase();
        return ("DELIVERY".equals(normalized) ? "DELIVERY" : "PICKUP");
    }

    private String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int suffix = ThreadLocalRandom.current().nextInt(1000, 10000);
        return "ORD-" + timestamp + "-" + suffix;
    }

    @Data
    public static class CreateOrderRequest {
        private String orderType;
        private String paymentMethod;
        private String customerName;
        private String customerPhone;
        private String address;
        private String notes;
        private List<OrderItemRequest> items;
    }

    @Data
    public static class OrderItemRequest {
        private Long menuId;
        private String menuName;
        private String menuCategory;
        private int quantity;
        private int price;
        private List<OrderOptionRequest> options;
    }

    @Data
    public static class OrderOptionRequest {
        private String name;
        private String value;
        private int priceDelta;
    }
}
