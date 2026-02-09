package com.new_cafe.app.backend.repository;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.new_cafe.app.backend.entity.MenuImage;

@Repository
public class NewMenuImageRepository implements MenuImageRepository {

    private DataSource dataSource;

    public NewMenuImageRepository() {
    }

    @Autowired
    public NewMenuImageRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public List<MenuImage> findAllByMenuId(Long menuId) {
        List<MenuImage> list = new ArrayList<>();
        String sql = "SELECT * FROM menu_images WHERE menu_id = " + menuId + " ORDER BY sort_order ASC";

        try (Connection conn = dataSource.getConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                list.add(MenuImage.builder()
                        .id(rs.getLong("id"))
                        .menuId(rs.getLong("menu_id"))
                        .srcUrl(rs.getString("src_url"))
                        .sortOrder(rs.getInt("sort_order"))
                        .createdAt(rs.getTimestamp("created_at").toLocalDateTime())
                        .build());
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return list;
    }
}
