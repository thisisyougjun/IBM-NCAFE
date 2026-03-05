'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Coffee,
    ShoppingBag,
    Settings,
    Users,
    BarChart3,
    Package
} from 'lucide-react';
import styles from './AdminSidebar.module.css';

const navItems = [
    {
        section: '메인',
        items: [
            { href: '/admin', label: '대시보드', icon: LayoutDashboard },
        ],
    },
    {
        section: '메뉴 관리',
        items: [
            { href: '/admin/menus', label: '메뉴 관리', icon: Coffee },
        ],
    },
    {
        section: '주문 관리',
        items: [
            { href: '/admin/orders', label: '주문 내역', icon: ShoppingBag },
        ],
    },
    {
        section: '기타',
        items: [
            { href: '/admin/settings', label: '설정', icon: Settings },
        ],
    },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/admin') {
            return pathname === '/admin';
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className={styles.sidebar}>
            {/* Logo */}
            <Link href="/order" className={styles.logo} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={styles.logoText}>
                    <span className={styles.logoIcon}>☕</span>
                    NCafe Admin
                </div>
            </Link>

            {/* Navigation */}
            <nav className={styles.nav}>
                {navItems.map((section) => (
                    <div key={section.section} className={styles.navSection}>
                        <div className={styles.navSectionTitle}>{section.section}</div>
                        <ul className={styles.navList}>
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                                        >
                                            <Icon className={styles.navIcon} />
                                            {item.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Footer - Cafe Info */}
            <div className={styles.footer}>
                <div className={styles.cafeInfo}>
                    <div className={styles.cafeAvatar}>🏪</div>
                    <div>
                        <div className={styles.cafeName}>행복한 커피</div>
                        <div className={styles.cafeRole}>사장님</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
