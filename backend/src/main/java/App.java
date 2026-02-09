
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;
import java.util.Scanner;

import com.new_cafe.app.backend.entity.Menu;
import com.new_cafe.app.backend.repository.MenuRepository;
import com.new_cafe.app.backend.repository.NewMenuRepository;

public class App {
    public static void main(String[] args) throws ClassNotFoundException, SQLException {
        System.out.println("Hello World");

        // 사용자한테, 검색어를 입력
        String name = "";
        Scanner sc = new Scanner(System.in, "MS949");
        System.out.println("검색어를 입력하세요 : ");
        name = sc.nextLine();

        MenuRepository menuRepository = new NewMenuRepository();
        List<Menu> menus = menuRepository.findAllByName(name);

        System.out.println(menus);

    }
}