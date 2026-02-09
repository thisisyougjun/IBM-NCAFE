'use client';

import Link from 'next/link';
import styles from './AdminFooter.module.css';

export default function AdminFooter() {
    return (
        <footer className={styles.footer}>
            <div className={styles.content}>
                <p className={styles.copyright}>
                    &copy; {new Date().getFullYear()} NCafe Admin. All rights reserved.
                </p>
                <div className={styles.links}>
                    <Link href="#" className={styles.link}>이용약관</Link>
                    <Link href="#" className={styles.link}>개인정보처리방침</Link>
                    <Link href="#" className={styles.link}>고객센터</Link>
                </div>
            </div>
        </footer>
    );
}
