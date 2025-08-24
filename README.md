# 📦 Orders API — Microservicio de Pedidos

Una API REST minimalista para gestionar órdenes de libros, creada con **NestJS**, **Prisma**, y siguiendo arquitectura **Hexagonal + Clean + DDD**.

---

## 📑 Tabla de Contenidos

- [✨ Descripción](#-descripción)
- [🏗️ Arquitectura](#-arquitectura)
  - [Estructura del Proyecto](#estructura-del-proyecto)
  - [Diagrama de Alto Nivel](#diagrama-de-alto-nivel)
- [🧰 Tecnologías](#-tecnologías)
- [⚙️ Requisitos Previos](#️-requisitos-previos)
- [🚀 Instalación & Ejecución](#-instalación--ejecución)
  - [🐳 Docker](#-docker)
- [📝 Endpoints](#-endpoints)
  - [Ejemplos con `curl`](#ejemplos-con-curl)
- [🛠️ Decisiones Técnicas](#-decisiones-técnicas)
- [🔒 Buenas Prácticas REST](#-buenas-prácticas-rest)
- [👨‍💻 Autor](#-autor)
- [📄 Licencia](#-licencia)

---

## ✨ Descripción

Este microservicio permite:

- Crear órdenes
- Listar todas las órdenes

Implementado siguiendo Clean Architecture y DDD, con separación clara entre capas y repositorios desacoplados.

---

## 🏗️ Arquitectura

### Estructura del Proyecto

```
src/
├── domain/               # Entidades y repositorios (contratos)
├── application/          # Casos de uso (use cases)
├── infrastructure/       # Prisma, repositorios concretos
│   └── prisma/           # PrismaService y repos impl.
├── interfaces/           # Controladores y DTOs HTTP
├── modules/              # Módulos Nest (e.g. BookModule)
├── main.ts               # Bootstrap + Swagger + CORS
└── app.module.ts         # Módulo raiz
prisma/
└── schema.prisma         # Esquema DB
└── .env                  # Variables de entorno (Conexion a DB local)
```

### Diagrama de Alto Nivel

#### Arquitectura Hexagonal

```mermaid
flowchart LR
    subgraph Domain["🏛️ Dominio"]
        ENTITY["Order Entity"]
        OPORT["OrderRepository<br/>— Interface"]
        OSTATUS["OrderStatus<br/>enum"]
        EXCEPTIONS["Excepciones<br/>de Dominio"]
    end

    subgraph Application["⚙️ Aplicación (Use Cases)"]
        COUC["CreateOrderUseCase"]
        LOUC["ListOrdersUseCase"]
    end

    subgraph Infrastructure["🔧 Infraestructura"]
        ADAPT["PrismaOrderRepository<br/>— Adaptador"]
        PRISMA["PrismaService"]
        DB[("PostgreSQL<br/>Schema: orders")]
    end

    subgraph Interfaces["🌐 Interfaces (HTTP)"]
        OCTRL["OrderController<br/>@Controller"]
        DTO["DTOs<br/>(CreateOrderDto, ListOrdersDto)"]
    end

    subgraph External["🌍 Servicios Externos"]
        BOOKSAPI["Books Service API<br/>HTTP Client"]
    end

    %% Conexiones Interface → Application
    OCTRL --> DTO
    OCTRL --> COUC
    OCTRL --> LOUC

    %% Conexiones Application → Domain
    COUC --> OPORT
    LOUC --> OPORT

    %% Conexiones Application → External (directa)
    COUC -.HTTP.-> BOOKSAPI

    %% Relaciones Domain
    ENTITY --> OSTATUS
    ENTITY --> EXCEPTIONS
    OPORT --> ENTITY

    %% Conexiones Infrastructure
    OPORT -.implements.-> ADAPT
    ADAPT --> PRISMA
    PRISMA --> DB

    %% Estilos con colores de tecnologías

    %% NestJS - Rojo (#E0234E)
    classDef nestjs fill:#E0234E,stroke:#333,stroke-width:2px,color:#fff
    class OCTRL,DTO nestjs

    %% TypeScript - Azul (#3178C6)
    classDef typescript fill:#3178C6,stroke:#333,stroke-width:2px,color:#fff
    class COUC,LOUC,ENTITY,OPORT,OSTATUS,EXCEPTIONS typescript

    %% Prisma - Verde (#2D3748) con acento verde
    classDef prisma fill:#2D3748,stroke:#16A085,stroke-width:3px,color:#fff
    class ADAPT,PRISMA prisma

    %% PostgreSQL - Azul marino (#336791)
    classDef postgresql fill:#336791,stroke:#333,stroke-width:2px,color:#fff
    class DB postgresql

    %% HTTP/External - Naranja (#FF6B35)
    classDef external fill:#FF6B35,stroke:#333,stroke-width:2px,color:#fff
    class BOOKSAPI external

    %% Capas con colores suaves
    classDef domainLayer fill:#F8F9FA,stroke:#6C757D,stroke-width:2px
    classDef appLayer fill:#E3F2FD,stroke:#1976D2,stroke-width:2px
    classDef infraLayer fill:#F3E5F5,stroke:#7B1FA2,stroke-width:2px
    classDef interfaceLayer fill:#E8F5E8,stroke:#388E3C,stroke-width:2px
    classDef externalLayer fill:#FFF3E0,stroke:#F57C00,stroke-width:2px
```

---

#### 📋 Listar Todas las Órdenes (GET /orders)

```mermaid
sequenceDiagram
    autonumber
    participant Client as 📱 Client (HTTP)
    participant Controller as 🎯 OrderController
    participant UseCase as ⚙️ ListOrdersUseCase
    participant RepoPort as 🔌 OrderRepository<br/>(Puerto)
    participant Repo as 🔧 PrismaOrderRepository<br/>(Adaptador)
    participant Prisma as 🟢 PrismaService
    participant DB as 🐘 PostgreSQL<br/>(schema: orders)

    Client->>Controller: GET /orders
    Controller->>UseCase: execute()
    UseCase->>RepoPort: findAll()
    RepoPort->>Repo: delega implementación
    Repo->>Prisma: prisma.order.findMany()
    Prisma->>DB: SELECT ... FROM orders.order

    alt ✅ órdenes encontradas
        DB-->>Prisma: rows[]
        Prisma-->>Repo: records[]
        Repo-->>RepoPort: Order[].restore(records)
        RepoPort-->>UseCase: Order[]
        UseCase-->>Controller: Order[]
        Controller-->>Client: 200 OK (OrderDto[])
    else ❌ no hay órdenes
        DB-->>Prisma: []
        Prisma-->>Repo: []
        Repo-->>RepoPort: []
        RepoPort-->>UseCase: []
        UseCase-->>Controller: OrdersNotFoundError()
        Controller-->>Client: 404 Not Found<br/>{"code": "ORDERS_NOT_FOUND"}
    end
```

---

#### 🔄 Crear Orden (POST /orders)

```mermaid
sequenceDiagram
    autonumber
    participant Client as 📱 Client (HTTP)
    participant Controller as 🎯 OrderController
    participant Dto as 📋 CreateOrderDto
    participant UseCase as ⚙️ CreateOrderUseCase
    participant BooksClient as 🔌 BooksService<br/>(Puerto)
    participant BooksHTTP as 🌐 BooksHttpClient<br/>(Adaptador)
    participant OrderRepoPort as 🔌 OrderRepository<br/>(Puerto)
    participant OrderRepo as 🔧 PrismaOrderRepository<br/>(Adaptador)
    participant Prisma as 🟢 PrismaService
    participant DB as 🐘 PostgreSQL<br/>(schema: orders)
    participant BooksAPI as 📚 Books Service API

    Client->>Controller: POST /orders<br/>{bookId, quantity}
    Controller->>Dto: plainToInstance(CreateOrderDto, body)

    alt ❌ DTO inválido
        Dto-->>Controller: InvalidOrderDataError(field, reason)
        Controller-->>Client: 400 Bad Request<br/>{"code": "INVALID_ORDER_DATA"}
    else ✅ DTO válido
        Dto-->>Controller: CreateOrderDto
        Controller->>UseCase: execute(dto)

        Note over UseCase, BooksAPI: Validación de libro
        UseCase->>BooksClient: getBookById(bookId)
        BooksClient->>BooksHTTP: delega implementación
        BooksHTTP->>BooksAPI: GET /books/:id

        alt ❌ Libro no encontrado
            BooksAPI-->>BooksHTTP: 404 Not Found
            BooksHTTP-->>BooksClient: BookNotFoundError(bookId)
            BooksClient-->>UseCase: BookNotFoundError
            UseCase-->>Controller: BookNotFoundError
            Controller-->>Client: 404 Not Found<br/>{"code": "BOOK_NOT_FOUND"}

        else ❌ Servicio no disponible
            BooksAPI-->>BooksHTTP: 503 Service Unavailable
            BooksHTTP-->>BooksClient: BooksServiceUnavailableError()
            BooksClient-->>UseCase: BooksServiceUnavailableError
            UseCase-->>Controller: BooksServiceUnavailableError
            Controller-->>Client: 503 Service Unavailable<br/>{"code": "BOOKS_SERVICE_UNAVAILABLE"}

        else ❌ Timeout
            BooksAPI-->>BooksHTTP: Timeout
            BooksHTTP-->>BooksClient: BooksServiceTimeoutError()
            BooksClient-->>UseCase: BooksServiceTimeoutError
            UseCase-->>Controller: BooksServiceTimeoutError
            Controller-->>Client: 504 Gateway Timeout<br/>{"code": "BOOKS_SERVICE_TIMEOUT"}

        else ✅ Libro encontrado
            BooksAPI-->>BooksHTTP: 200 OK (BookResponseDto)
            BooksHTTP-->>BooksClient: BookResponseDto
            BooksClient-->>UseCase: BookResponseDto

            Note over UseCase: Validaciones de negocio
            UseCase->>UseCase: Validar quantity > 0

            alt ❌ Cantidad inválida
                UseCase-->>Controller: InvalidQuantityError(quantity)
                Controller-->>Client: 400 Bad Request<br/>{"code": "INVALID_QUANTITY"}
            else ❌ Stock insuficiente
                UseCase->>UseCase: Verificar stock disponible
                UseCase-->>Controller: InsufficientStockError(available, requested)
                Controller-->>Client: 400 Bad Request<br/>{"code": "INSUFFICIENT_STOCK"}
            else ✅ Validaciones pasaron
                UseCase->>UseCase: Calcula total (price * quantity)
                UseCase->>UseCase: Crea Order Entity<br/>(Factory + UUID + OrderStatus.PENDING)

                Note over UseCase, DB: Persistencia
                UseCase->>OrderRepoPort: save(order)
                OrderRepoPort->>OrderRepo: delega implementación
                OrderRepo->>Prisma: prisma.order.create(data)
                Prisma->>DB: INSERT INTO orders.order (...)
                DB-->>Prisma: row
                Prisma-->>OrderRepo: record
                OrderRepo-->>OrderRepoPort: Order restaurada
                OrderRepoPort-->>UseCase: Order
                UseCase-->>Controller: Order
                Controller-->>Client: 201 Created (OrderDto)
            end
        end
    end
```

---

## 🧰 Tecnologías

| Categoría         | Tecnología                  |
| ----------------- | --------------------------- |
| Framework         | NestJS                      |
| Lenguaje          | TypeScript                  |
| ORM               | Prisma                      |
| DB                | PostgreSQL                  |
| Documentación     | Swagger (`@nestjs/swagger`) |
| CORS & Validación | `ValidationPipe`, CORS      |
| UUID Generation   | `uuid`                      |
| Axios HTTP Client | `axios`                     |

---

## ⚙️ Requisitos Previos

- Node.js v22
- npm o yarn
- PostgreSQL 17
- Docker
- Postman (opcional)

---

## 🚀 Instalación & Ejecución

1. Clona el repositorio y entra al directorio:

```bash
git clone git@github.com:SebastianBC09/orders-microservice.git
cd books-service
```

2. Instala dependencias:

```bash
npm install
```

3. Crea tu `.env` basado en `.env.example`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?schema=orders"
PORT=3000
```

4. Inicializa Prisma:

```bash
npx prisma migrate dev --name init
"Si no se generan los tipos, ejecutar"
npx prisma generate
```

5. Levanta el servidor:

```bash
npm run start:dev
```

6. Accede a Swagger en: `http://localhost:3001/api/docs`

### 🐳 Docker

Si por el contrario quieres ejecutar todos los servicios en contenedores, puedes usar Docker.

```bash
docker-compose build
docker-compose up -d
```

---

## 📝 Endpoints

| Método | Ruta      | Descripción             | Estado HTTP                                                               |
| ------ | --------- | ----------------------- | ------------------------------------------------------------------------- |
| GET    | `/orders` | Lista todas las órdenes | 200 OK / 404 Not Found / 500 Internal Server Error                        |
| POST   | `/orders` | Crea una nueva orden    | 201 Created / 400 Bad Request / 404 Not Found / 500 Internal Server Error |

### Ejemplos con `curl`

#### Crear una orden

```bash
curl -X POST http://localhost:3001/orders \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": "uuid-del-libro",
    "quantity": 2,
  }'
```

#### Obtener todas las órdenes

```bash
curl -X GET http://localhost:3001/orders \
  -H 'accept: */*'
```

## 🛠️ Decisiones Técnicas

- **UUID v4** como ID, generada en dominios (via `uuid` lib)
- **Factory Methods**:
  - `Order.create()` para nuevo
  - `Order.restore()` para rehidratar desde DB
- **Token de inyección**: usar `Symbol('ORDER_REPOSITORY')` para desacoplar interfaz y repo
- **PrismaService global** para compartir conexión en varios módulos
- **Swagger + ValidationPipe** para inputs claros y seguros
- **Axios** para llamadas HTTP a otros microservicios (e.g., Books Service)

---

## 🔒 Buenas Prácticas REST

- DTOs validados y transformados automáticamente
- CORS habilitado globalmente
- Códigos HTTP adecuados (`201`, `400`, `404`)
- Arquitectura desacoplada, fácil de testear y escalar

---

## 👨‍💻 Autor

**Sebastian Ballen C** - _FullStack Developer_

- LinkedIn: [Sebastian B.](https://www.linkedin.com/in/sebastianballencastaneda-softwaredeveloper)
- Email: sebastian.ballenc@gmail.com

---

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - vea el archivo [LICENSE](LICENSE) para más detalles.

---

⭐️ **Si te resulta útil este proyecto, ¡no olvides darle una estrella en GitHub!** ⭐️

```

```
