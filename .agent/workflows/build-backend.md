---
description: Build and run the Spring Boot backend
---

## Build

```bash
cd /home/a122899/workspace/IBM-NCAFE/backend
./gradlew --gradle-user-home /tmp/gradle-home --project-cache-dir /tmp/ncafe-proj-cache build
```

## Run (dev)

```bash
cd /home/a122899/workspace/IBM-NCAFE/backend
./gradlew --gradle-user-home /tmp/gradle-home --project-cache-dir /tmp/ncafe-proj-cache bootRun
```

## Note

- .gradle 디렉토리가 root 소유이므로 반드시 --gradle-user-home과 --project-cache-dir 옵션이 필요
- buildDir은 build.gradle에서 /tmp/gradle-build 로 설정되어 있음
