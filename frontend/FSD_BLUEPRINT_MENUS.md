# FSD (Feature-Sliced Design) Blueprint for NCafe Menu Management

This blueprint outlines how to restructure the existing Menu Management feature (`app/admin/menus`) according to FSD principles.

## 1. Overview of FSD Layers

The application will be divided into the following layers (from top to bottom):

1.  **App**: Global settings, providers, router configuration.
2.  **Pages**: Composition of Widgets and Features for specific routes.
3.  **Widgets**: Standalone UI blocks combining multiple Features and Entities (e.g., Header + List).
4.  **Features**: User interactions (e.g., Search, Filter, Add to Cart).
5.  **Entities**: Business domain models (e.g., Menu, Category).
6.  **Shared**: Reusable primitives (e.g., UI Kit, basic hooks, API client).

## 2. Proposed Directory Structure

```
frontend/
├── app/                        # [Layer: App] Next.js App Router
│   ├── (public)/
│   └── admin/
│       └── menus/
│           ├── page.tsx        # Entry point for /admin/menus
│           └── [id]/page.tsx   # Entry point for /admin/menus/[id]
│
├── src/
│   ├── pages/                  # [Layer: Pages] Component composition
│   │   └── admin/
│   │       ├── MenuListPage/   # Logic for the main list page
│   │       └── MenuEditPage/   # Logic for the edit page
│   │
│   ├── widgets/                # [Layer: Widgets] Large composed blocks
│   │   └── MenuManagement/
│   │       ├── ui/
│   │       │   ├── MenuBoard.tsx       # Combines Filter + List + Pagination
│   │       │   └── MenuPageHeader.tsx  # Header with stats and Add button
│   │       └── index.ts
│   │
│   ├── features/               # [Layer: Features] User interactions
│   │   ├── menu-search/        # Searching menus
│   │   │   ├── ui/SearchInput.tsx
│   │   │   └── model/useMenuSearch.ts
│   │   │
│   │   ├── menu-filter/        # Filtering by category
│   │   │   ├── ui/CategoryTabs.tsx
│   │   │   └── model/useCategoryFilter.ts
│   │   │
│   │   ├── menu-pagination/    # Pagination logic
│   │   │   ├── ui/PaginationControls.tsx
│   │   │   └── model/useMenuPagination.ts
│   │   │
│   │   └── menu-actions/       # Delete, Toggle SoldOut
│   │       ├── ui/DeleteButton.tsx
│   │       └── model/useMenuActions.ts
│   │
│   ├── entities/               # [Layer: Entities] Domain logic & UI
│   │   ├── menu/
│   │   │   ├── ui/
│   │   │   │   ├── MenuCard.tsx       # Smart component for displaying menu
│   │   │   │   └── MenuGrid.tsx       # Grid layout for cards
│   │   │   ├── model/
│   │   │   │   ├── types.ts           # Menu interface
│   │   │   │   └── store.ts           # Global state if needed
│   │   │   └── api/
│   │   │       └── menuApi.ts         # Fetch, Update, Delete API calls
│   │   │
│   │   └── category/
│   │       ├── model/types.ts
│   │       └── api/categoryApi.ts
│   │
│   └── shared/                 # [Layer: Shared]
│       ├── ui/
│       │   ├── Button/
│       │   ├── Input/
│       │   └── Modal/
│       ├── api/                # Base axios/fetch instance
│       └── lib/                # Utils
```

## 3. Implementation Details

### A. Layers Breakdown

#### 1. Entities (`src/entities`)
*Focus*: "What is a Menu?"
*   `entities/menu/ui/MenuCard.tsx`: Displays menu image, name, price, and status labels. Does **not** contain complex logic like "Delete API call" directly, but accepts handlers or uses feature hooks if strictly coupled.
*   `entities/menu/api/menuApi.ts`: Pure functions to fetch/mutate data.
    ```typescript
    export const getMenus = (params: MenuFilterParams) => fetch(...)
    ```

#### 2. Features (`src/features`)
*Focus*: "What can the user do with a Menu?"
*   `features/menu-filter`: Manages the `selectedCategory` state.
*   `features/menu-search`: Manages the `searchQuery` state.
*   `features/menu-actions`: Contains the logic for `handleDelete` and `handleToggleSoldOut`.

#### 3. Widgets (`src/widgets`)
*Focus*: "How do we present these features together?"
*   `widgets/MenuManagement/ui/MenuBoard.tsx`:
    *   Imports `CategoryTabs` (Feature)
    *   Imports `MenuGrid` (Entity)
    *   Connects `useMenuSearch` and `useCategoryFilter` to the `MenuGrid`.
    *   This is where the "Glue Code" lives.

#### 4. Pages (`src/pages`)
*Focus*: "Construct the route info"
*   `pages/admin/MenuListPage/index.tsx`:
    *   Renders `<MenuPageHeader />` (Widget)
    *   Renders `<MenuBoard />` (Widget)

### B. Dependency Rules (Critical)

1.  **Downward Direction Only**:
    *   `App` -> `Pages` -> `Widgets` -> `Features` -> `Entities` -> `Shared`
2.  **No Sideways Imports**:
    *   A Feature cannot import another Feature directly (use Widgets or Pages to compose them).
    *   An Entity cannot import another Entity (use Cross-Entity logic in Features).

## 4. Migration Steps (If applying to current project)

1.  **Setup Shared**: Ensure generic UI components (Button, Pagination) are in `shared/ui`.
2.  **Extract Entities**: Move `Menu` type definitions and basic `MenuCard` UI to `entities/menu`. Move `Category` types to `entities/category`.
3.  **Define Features**:
    *   Extract filtering logic from `MenuList` into `features/menu-filter`.
    *   Extract search logic into `features/menu-search`.
4.  **Compose Widgets**: Create `widgets/MenuManagement` to replace the current `MenuList` container logic.
5.  **Refactor Page**: The `app/admin/menus/page.tsx` should become very thin, just importing the Page component or Widget.
