"use client";

import { useEffect, useState } from "react";

export default function CategoryList({ x, onCategoryChange }) {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const response = await fetch("http://localhost:8080/admin/categories");
            const data = await response.json();
            setCategories(data);
        };

        fetchCategories();
    }, []);

    const handleCategoryChange = (category) => {
        onCategoryChange(category);
        console.log("handleCategoryChange", category);
    };

    return (
        <section>
            <h1>카테고리 블록 {x}</h1>
            <div>
                <button onClick={() => handleCategoryChange(null)}>전체</button>
                {categories.map((category) => (
                    <button key={category.id} onClick={() => handleCategoryChange(category)}>{category.name}</button>
                ))}
            </div>
        </section>
    );
}
