# ape-facturacion-garantias

Sistema de **facturación y garantías** para una empresa de paneles solares.

Monorepo con tres aplicaciones:

| Carpeta     | Stack                         | Estado          |
|-------------|-------------------------------|-----------------|
| `backend/`  | ASP.NET Core Web API (.NET 8) | Esqueleto inicial |
| `web/`      | React (pendiente)             | Vacío           |
| `mobile/`   | Flutter (pendiente)           | Vacío           |
| `docs/`     | Documentación del proyecto    | Stubs           |

## Estructura

```
ape-facturacion-garantias/
├── backend/ArquaBilling.Api/   # API REST (.NET 8)
├── web/                        # App web React (próximamente)
├── mobile/                     # App móvil Flutter (próximamente)
├── docs/                       # Propuesta, requerimientos, modelo de datos, manual
├── ArquaBilling.sln            # Solución .NET
├── .gitignore
└── README.md
```

## Backend

- **Framework:** ASP.NET Core Web API sobre **.NET 8 (LTS)**.
- **Base de datos:** PostgreSQL vía Entity Framework Core + Npgsql (sin configurar aún).
- **Autenticación:** JWT (pendiente).
- **Documentación de API:** Swagger / OpenAPI (Swashbuckle).

> Estado actual: solo el esqueleto. Las clases son *stubs* con `// TODO`; el
> proyecto **compila** pero todavía no tiene lógica de negocio ni endpoints.

### Compilar

```bash
cd backend/ArquaBilling.Api
dotnet build
```

### Próximos pasos

1. Definir el modelo de datos en `docs/modelo-base-datos.md` y las entidades.
2. Configurar `AppDbContext`, la cadena de conexión y la primera migración EF.
3. Implementar servicios, interfaces y endpoints por módulo.
