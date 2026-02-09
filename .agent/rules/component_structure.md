---
description: Frontend Component Structure & Naming Conventions
globs: ["frontend/**/*"]
---

# 프론트엔드 컴포넌트 구조 및 네이밍 규칙

이 프로젝트는 Next.js App Router를 기반으로 하며, 다음과 같은 엄격한 컴포넌트 구조 규칙을 따릅니다.

## 1. 디렉토리 구조 및 위치 (Directory Structure)

### 1.1 라우트 구조 (App Router)
- 모든 페이지 라우트는 `frontend/app/` 디렉토리 내에 위치합니다.
- URL 경로와 폴더 구조가 일치해야 합니다. (예: `/admin/menus` -> `app/admin/menus/page.tsx`)

### 1.2 컴포넌트 위치 (Colocation)
- **전역 컴포넌트**: 여러 페이지에서 공통으로 사용되는 컴포넌트는 `frontend/components/`에 위치합니다.
  - 예: `frontend/components/common/Button`
- **지역 컴포넌트**: 특정 페이지나 기능 범위에서만 사용되는 컴포넌트는 해당 라우트 폴더 내의 `_components/` 폴더에 위치합니다.
  - 예: `frontend/app/admin/menus/_components/MenuCard`
  - `_` 접두사를 사용하여 Next.js 라우팅에서 제외됨을 명시합니다.

## 2. 컴포넌트 폴더링 (Component Folder Pattern)

모든 컴포넌트는 개별 폴더를 가지며, 다음과 같은 파일 구성을 따릅니다.

```
ComponentName/
├── ComponentName.tsx        # 컴포넌트 로직 및 JSX
├── ComponentName.module.css # 컴포넌트 전용 스타일 (CSS Modules)
└── index.ts                 # 외부 노출용 (Re-export)
```

- **이유**: 관련 파일의 응집도를 높이고, 유지보수를 용이하게 하며, 깔끔한 import 경로를 제공하기 위함입니다.

## 3. 네이밍 규칙 (Naming Conventions)

- **컴포넌트 이름**: PascalCase (예: `MenuCard`, `UserProfile`)
- **폴더 이름**: 컴포넌트 이름과 동일한 PascalCase (예: `MenuCard/`)
- **지역 컴포넌트 폴더**: `_components` (소문자, 언더스코어 접두사)
- **스타일 파일**: `ComponentName.module.css`
- **인터페이스/타입**: `ComponentProps` (예: `MenuCardProps`)

## 4. 코드 작성 예시

### 4.1 index.ts
```typescript
export { default } from './ComponentName';
```

### 4.2 ComponentName.tsx
```typescript
'use client'; // 필요한 경우

import styles from './ComponentName.module.css';

interface ComponentNameProps {
  title: string;
}

export default function ComponentName({ title }: ComponentNameProps) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
    </div>
  );
}
```

### 4.3 ComponentName.module.css
```css
.container {
  /* ... */
}

.title {
  /* ... */
}
```

## 5. Import 경로

- 컴포넌트 import 시, 폴더명을 통해 `index.ts`를 자동으로 참조하도록 합니다.
- **Good**: `import MenuCard from './_components/MenuCard';`
- **Bad**: `import MenuCard from './_components/MenuCard/MenuCard';`

## 6. 시멘틱 태그 사용
- `div` 남발을 지양하고, 상황에 맞는 HTML5 시멘틱 태그(`main`, `header`, `section`, `article`, `nav` 등)를 적극 사용합니다.
