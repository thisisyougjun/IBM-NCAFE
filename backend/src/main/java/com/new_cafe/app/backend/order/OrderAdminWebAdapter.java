package com.new_cafe.app.backend.order;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * 관리자 주문 대시보드용 API
 * - 경로: /admin/orders
 * - 주문 요약, 목록 조회, 상태 변경
 */
@RestController
@RequestMapping("/admin/orders")
@RequiredArgsConstructor
public class OrderAdminWebAdapter {

    private static final Set<String> ALLOWED_STATUSES = Set.of(
            "PENDING", "CONFIRMED", "PREPARING", "READY", "COMPLETED", "CANCELLED"
    );

    private final JdbcTemplate jdbcTemplate;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getOrderSummary() {
        Map<String, Object> totals = jdbcTemplate.queryForMap(
                """
                SELECT
                    COUNT(*) AS total_orders,
                    COALESCE(SUM(total_amount), 0) AS total_sales,
                    COALESCE(SUM(CASE WHEN created_at::date = CURRENT_DATE THEN total_amount ELSE 0 END), 0) AS today_sales,
                    COALESCE(SUM(CASE WHEN created_at::date = CURRENT_DATE THEN 1 ELSE 0 END), 0) AS today_orders,
                    COALESCE(SUM(CASE WHEN status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'READY') THEN 1 ELSE 0 END), 0) AS active_orders,
                    COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END), 0) AS completed_orders,
                    COALESCE(SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END), 0) AS cancelled_orders
                FROM orders
                """
        );

        List<Map<String, Object>> byStatus = jdbcTemplate.queryForList(
                """
                SELECT status, COUNT(*) AS count
                FROM orders
                GROUP BY status
                ORDER BY status
                """
        );

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("totalOrders", toInt(totals.get("total_orders")));
        response.put("totalSales", toInt(totals.get("total_sales")));
        response.put("todaySales", toInt(totals.get("today_sales")));
        response.put("todayOrders", toInt(totals.get("today_orders")));
        response.put("activeOrders", toInt(totals.get("active_orders")));
        response.put("completedOrders", toInt(totals.get("completed_orders")));
        response.put("cancelledOrders", toInt(totals.get("cancelled_orders")));
        response.put("statusBreakdown", byStatus);

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "30") int limit
    ) {
        int safeLimit = Math.max(1, Math.min(limit, 200));

        StringBuilder sql = new StringBuilder(
                """
                SELECT
                    id,
                    order_number,
                    status,
                    total_amount,
                    payment_status,
                    order_type,
                    customer_name,
                    customer_phone,
                    notes,
                    created_at,
                    updated_at
                FROM orders
                WHERE 1=1
                """
        );

        List<Object> params = new ArrayList<>();

        if (status != null && !status.isBlank()) {
            sql.append(" AND status = ? ");
            params.add(status.trim().toUpperCase());
        }

        if (search != null && !search.isBlank()) {
            sql.append(" AND (order_number ILIKE ? OR customer_name ILIKE ? OR customer_phone ILIKE ?) ");
            String keyword = "%" + search.trim() + "%";
            params.add(keyword);
            params.add(keyword);
            params.add(keyword);
        }

        sql.append(" ORDER BY created_at DESC LIMIT ? ");
        params.add(safeLimit);

        List<Map<String, Object>> orders = jdbcTemplate.queryForList(sql.toString(), params.toArray());

        for (Map<String, Object> order : orders) {
            Long orderId = ((Number) order.get("id")).longValue();
            List<Map<String, Object>> items = jdbcTemplate.queryForList(
                    """
                    SELECT menu_name, quantity, unit_price, subtotal
                    FROM order_items
                    WHERE order_id = ?
                    ORDER BY id
                    """,
                    orderId
            );
            order.put("items", items);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("orders", orders);
        response.put("count", orders.size());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody OrderStatusUpdateRequest request
    ) {
        String rawStatus = request.getStatus();
        if (rawStatus == null || rawStatus.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "status 값이 필요합니다."));
        }

        String nextStatus = rawStatus.trim().toUpperCase();
        if (!ALLOWED_STATUSES.contains(nextStatus)) {
            return ResponseEntity.badRequest().body(Map.of("message", "지원하지 않는 주문 상태입니다."));
        }

        Integer exists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM orders WHERE id = ?",
                Integer.class,
                id
        );
        if (exists == null || exists == 0) {
            return ResponseEntity.notFound().build();
        }

        jdbcTemplate.update(
                """
                UPDATE orders
                SET
                    status = ?,
                    updated_at = NOW(),
                    completed_at = CASE WHEN ? = 'COMPLETED' THEN NOW() ELSE completed_at END,
                    cancelled_at = CASE WHEN ? = 'CANCELLED' THEN NOW() ELSE cancelled_at END
                WHERE id = ?
                """,
                nextStatus, nextStatus, nextStatus, id
        );

        return ResponseEntity.ok(Map.of(
                "id", id,
                "status", nextStatus,
                "message", "주문 상태가 변경되었습니다."
        ));
    }

    private int toInt(Object value) {
        if (value == null) return 0;
        return ((Number) value).intValue();
    }

    @Data
    public static class OrderStatusUpdateRequest {
        private String status;
    }
}

