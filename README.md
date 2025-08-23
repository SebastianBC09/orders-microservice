# 📦 Orders API — Microservicio de Pedidos

Una API REST minimalista para gestionar órdenes de libros, creada con **NestJS**, **Prisma**, y siguiendo arquitectura **Hexagonal + Clean + DDD**.

---

## 📑 Tabla de Contenidos

- [✨ Descripción](#-descripción)
- [🏗️ Arquitectura](#️-arquitectura)
  - [Estructura del Proyecto](#estructura-del-proyecto)
  - [Diagrama de Alto Nivel](#diagrama-de-alto-nivel)
- [🧰 Tecnologías](#-tecnologías)
- [⚙️ Requisitos Previos](#️-requisitos-previos)
- [🚀 Instalación & Ejecución](#-instalación--ejecución)
  - [🐳 Docker](#-docker)
- [📝 Endpoints](#-endpoints)
  - [Ejemplos con `curl`](#ejemplos-con-curl)
- [🛠️ Decisiones Técnicas](#F-decisiones-técnicas)
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

```mermaid
flowchart TB
  subgraph HTTP["HTTP Layer (NestJS)"]
    C[Client] --> Controller[OrderController]
    Controller --> UseCases[Create Order, List All Orders]
  end

  subgraph App["Application Layer"]
    UseCases --> RepoInterface[OrderRepository Interface]
  end

  subgraph Infra["Infrastructure"]
    RepoInterface --> PrismaRepo[PrismaOrderRepository]
    PrismaRepo --> Prisma[PrismaService]
    Prisma --> DB[(PostgreSQL)]
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
   git clone <repo-url>
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
