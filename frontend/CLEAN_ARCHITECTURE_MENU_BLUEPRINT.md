# 메뉴 관리 시스템 클린 아키텍처 청사진 (Clean Architecture Blueprint)

이 문서는 Next.js/React 환경에서 **클린 아키텍처(Clean Architecture)** 원칙을 기반으로 메뉴 관리 시스템(`admin/menus`)을 리팩토링하기 위한 구조를 정의합니다.

## 1. 핵심 원칙 (Core Principles)

*   **의존성 규칙 (Dependency Rule)**: 소스 코드의 의존성은 반드시 **안쪽(고수준 정책)**을 향해야 합니다.
    *   저수준 세부사항(UI, DB, 프레임워크)은 고수준 정책(도메인, 유스케이스)에 의존합니다.
    *   반대로 고수준 정책은 저수준 세부사항에 대해 아무것도 몰라야 합니다.
*   **관심사의 분리 (Separation of Concerns)**: UI는 비즈니스 로직과 분리되고, 비즈니스 로직은 데이터 fetching과 분리됩니다.
*   **테스트 용이성 (Testability)**: 비즈니스 로직은 UI, 데이터베이스, 웹 서버 없이 독립적으로 테스트 가능해야 합니다.

## 2. 계층 아키텍처 (Layer Architecture)

코드를 4개의 동심원 계층으로 구성하며, 디렉토리 구조도 이에 맞춰 매핑합니다:

1.  **도메인 엔티티 (Domain Entities)** - *가장 안쪽*
2.  **유스케이스 (Use Cases)** - *애플리케이션 비즈니스 규칙*
3.  **인터페이스 어댑터 (Interface Adapters)** - *프레젠터, 게이트웨이, 컨트롤러*
4.  **프레임워크 & 드라이버 (Frameworks & Drivers)** - *UI, 외부 인터페이스*

## 3. 디렉토리 구조 (Directory Structure)

`src/modules/menu` 아래에 기능을 모듈화하여 구성합니다.

```
frontend/
├── src/
│   ├── modules/
│   │   └── menu/
│   │       ├── domain/                 # [1계층: 도메인 엔티티]
│   │       │   ├── entities/
│   │       │   │   ├── Menu.ts         # 핵심 비즈니스 객체 (순수 TS 클래스/인터페이스)
│   │       │   │   └── MenuOption.ts
│   │       │   ├── repositories/
│   │       │   │   └── IMenuRepository.ts # 데이터 접근을 위한 인터페이스 (DIP 핵심)
│   │       │   └── errors/             # 도메인 특화 에러 정의
│   │       │
│   │       ├── application/            # [2계층: 유스케이스]
│   │       │   ├── usecases/
│   │       │   │   ├── GetMenus.ts     # 메뉴 목록 조회 로직
│   │       │   │   ├── CreateMenu.ts   # 메뉴 생성 로직
│   │       │   │   └── UpdateMenuStatus.ts
│   │       │   └── dtos/               # DTO (계층 간 데이터 전송 객체)
│   │       │       └── CreateMenuDTO.ts
│   │       │
│   │       ├── infrastructure/         # [3계층: 인터페이스 어댑터 (구현체)]
│   │       │   ├── repositories/
│   │       │   │   └── MenuRepositoryImpl.ts # IMenuRepository의 실제 구현 (API 호출)
│   │       │   ├── mappers/            # API 응답 <-> 도메인 엔티티 변환기
│   │       │   │   └── MenuMapper.ts
│   │       │   └── api/                # Axios/Fetch 등 HTTP 클라이언트 세부사항
│   │       │
│   │       └── presentation/           # [3 & 4계층: 프레젠터 & UI]
│   │           ├── components/         # React 컴포넌트 (UI 표현 담당)
│   │           │   ├── MenuList.tsx
│   │           │   ├── MenuCard.tsx
│   │           │   └── MenuForm.tsx
│   │           ├── hooks/              # View Model / 컨트롤러 역할
│   │           │   ├── useMenuViewModel.ts # UI와 유스케이스 연결
│   │           │   └── useMenuController.ts
│   │           └── state/              # 전역 상태 관리 (필요 시, 예: Zustand)
│   │               └── menuStore.ts
│   │
│   └── shared/                         # 공용 커널 (Shared Kernel)
│       ├── core/                       # 기본 클래스 (Entity, ValueObject, Result 등)
│       └── components/                 # 공통 UI 컴포넌트 (Button, Input 등)
```

## 4. 구현 상세 (Implementation Details)

### A. 도메인 계층 (Domain Layer)
**`src/modules/menu/domain/entities/Menu.ts`**
*   순수 TypeScript 클래스 또는 인터페이스입니다.
*   `isValidPrice()`와 같은 핵심 비즈니스 검증 로직을 포함합니다.
*   **중요**: React, Next.js, API 라이브러리에 대한 의존성이 **전혀 없어야** 합니다.

**`src/modules/menu/domain/repositories/IMenuRepository.ts`**
*   리포지토리 인터페이스 정의입니다.
*   *어떻게(How)* 데이터를 가져올지가 아니라, *무엇(What)*이 필요한지만 정의합니다.
    ```typescript
    export interface IMenuRepository {
      getAll(): Promise<Menu[]>;
      create(menu: Menu): Promise<Menu>;
    }
    ```

### B. 애플리케이션 계층 (Application Layer)
**`src/modules/menu/application/usecases/GetMenus.ts`**
*   데이터의 흐름을 제어하고 비즈니스 규칙을 수행합니다.
*   구현체가 아닌 `IMenuRepository` 인터페이스에 의존합니다 (Dependency Injection).
    ```typescript
    export class GetMenusUseCase {
      constructor(private menuRepository: IMenuRepository) {}

      async execute(): Promise<Menu[]> {
        return this.menuRepository.getAll();
      }
    }
    ```

### C. 인프라 계층 (Infrastructure Layer)
**`src/modules/menu/infrastructure/repositories/MenuRepositoryImpl.ts`**
*   `IMenuRepository`를 실제로 구현합니다.
*   `fetch`나 `axios` 같은 구체적인 HTTP 클라이언트를 사용합니다.
*   `MenuMapper`를 사용하여 API의 원본 JSON 데이터를 도메인 엔티티(`Menu`)로 변환하여 반환합니다.

### D. 프레젠테이션 계층 (Presentation Layer)
**`src/modules/menu/presentation/hooks/useMenuViewModel.ts`**
*   **컨트롤러(Controller) 및 프레젠터(Presenter)** 역할을 수행합니다.
*   React 컴포넌트에서 호출되며, 유스케이스(Use Cases)를 실행합니다.
*   로딩(loading), 에러(error), 데이터(data) 등 UI 상태를 관리합니다.
    ```typescript
    export const useMenuViewModel = () => {
      // 실제 앱에서는 DI 컨테이너를 사용하여 의존성을 주입하는 것이 좋습니다.
      const repository = new MenuRepositoryImpl();
      const getMenusUseCase = new GetMenusUseCase(repository);

      const loadMenus = async () => { ... }
      return { menus, loadMenus, loading, error };
    }
    ```

## 5. 도입 효과 (Benefits)

1.  **UI 독립성**: 비즈니스 로직을 건드리지 않고 UI 프레임워크(예: React -> Vue)를 교체할 수 있습니다.
2.  **데이터베이스/API 독립성**: `MenuRepositoryImpl`만 수정하면 UI나 도메인 로직 수정 없이 API를 교체(예: REST -> GraphQL)하거나 테스트용 Mock으로 대체할 수 있습니다.
3.  **테스트 용이성**: `IMenuRepository`를 Mocking하여 `GetMenusUseCase`와 같은 비즈니스 로직을 완벽하게 단위 테스트할 수 있습니다.

## 6. 마이그레이션 전략 (Migration Strategy)

1.  **디렉토리 구조 생성**: `src/modules/menu/...` 폴더 구조를 생성합니다.
2.  **도메인 정의**: 기존 `Menu` 타입을 `domain/entities`로 이동하고, `IMenuRepository` 인터페이스를 정의합니다.
3.  **인프라 구현**: 구체적인 API 호출 로직을 `infrastructure/repositories`로 옮겨 구현합니다.
4.  **유스케이스 생성**: `useEffect`나 거대 컴포넌트 안에 있던 로직을 개별 유스케이스 클래스로 추출합니다.
5.  **컴포넌트 리팩토링**: 컴포넌트는 오직 데이터 표시(View) 역할만 하도록 하고, 로직은 `presentation/hooks`로 위임합니다.
