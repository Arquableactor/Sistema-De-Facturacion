# Modelo de Base de Datos

Modelo de datos del sistema de facturación y garantías (backend `ArquaBilling.Api`,
EF Core 8 + PostgreSQL/Npgsql). Esta es la referencia de entidades, tipos, relaciones,
borrados e índices. La configuración vive en `Data/AppDbContext.cs` (Fluent API) y la
primera migración en `Migrations/*_InitialCreate.cs`.

## Convenciones generales

- **PK:** cada entidad tiene `int Id` autoincremental (identity).
- **Dinero y cantidades:** todos los `decimal` usan precisión **(18, 2)**. Nunca `float`/`double`.
- **Fechas:** `DateTime` → columna `timestamp with time zone`. Npgsql 8 espera valores en **UTC**.
- **Tipos cerrados (enums):** se guardan como **texto** en la DB (`varchar(20)`), no como número.
- **Nullabilidad:** definida por la anotación C# (`string` = NOT NULL, `string?` = nullable).

## Enums

| Enum | Valores |
|---|---|
| `UserRole` | Admin, Sales, Technician |
| `InvoiceStatus` | Draft, Issued, PartiallyPaid, Paid, Cancelled |
| `WarrantyStatus` | Active, Expired, Void |
| `WarrantyItemStatus` | Active, Expired, Void |
| `PaymentMethod` | Cash, Transfer, Card, Check, Other |
| `DocumentType` | Cedula, Rnc, Passport |

## Entidades

Leyenda: **R** = requerido (NOT NULL) · **N** = opcional (nullable) · `[n]` = longitud máxima.

### User
| Campo | Tipo | R/N | Notas |
|---|---|---|---|
| Id | int | R | PK |
| FullName | string | R | [200] |
| Email | string | R | [256], **único** |
| PasswordHash | string | R | |
| Role | `UserRole` | R | texto |
| IsActive | bool | R | |
| CreatedAt | DateTime | R | UTC |

### Client
| Campo | Tipo | R/N | Notas |
|---|---|---|---|
| Id | int | R | PK |
| Name | string | R | [200] |
| DocumentType | `DocumentType` | R | texto |
| DocumentNumber | string | R | [30] |
| Phone | string | R | [30] |
| Email | string | N | [256] |
| InstallationAddress | string | R | [300] |
| CreatedAt | DateTime | R | UTC |
| IsActive | bool | R | |

### Product
| Campo | Tipo | R/N | Notas |
|---|---|---|---|
| Id | int | R | PK |
| Name | string | R | [200] |
| Code | string | R | [50], **único** |
| Barcode | string | N | [50] |
| Description | string | N | [500] |
| Price | decimal | R | (18,2) |
| WarrantyMonths | int | R | meses de garantía base |
| IsSerialized | bool | R | maneja números de serie |
| IsActive | bool | R | |
| CreatedAt | DateTime | R | UTC |

### Invoice
| Campo | Tipo | R/N | Notas |
|---|---|---|---|
| Id | int | R | PK |
| InvoiceNumber | string | R | [30], **único** |
| NCF | string | N | [19], **único filtrado** (permite varios nulos) |
| ClientId | int | R | FK → Client |
| UserId | int | R | FK → User |
| Date | DateTime | R | UTC |
| Subtotal | decimal | R | (18,2) |
| Itbis | decimal | R | (18,2) |
| Discount | decimal | R | (18,2) |
| Total | decimal | R | (18,2) |
| PaidAmount | decimal | R | (18,2) |
| Balance | decimal | R | (18,2) |
| Status | `InvoiceStatus` | R | texto |
| Notes | string | N | [1000] |
| CreatedAt | DateTime | R | UTC |

### InvoiceItem
| Campo | Tipo | R/N | Notas |
|---|---|---|---|
| Id | int | R | PK |
| InvoiceId | int | R | FK → Invoice |
| ProductId | int | R | FK → Product |
| Description | string | N | [500] |
| Quantity | decimal | R | (18,2) — permite cantidades fraccionadas |
| UnitPrice | decimal | R | (18,2) |
| Discount | decimal | R | (18,2) |
| Itbis | decimal | R | (18,2) |
| LineTotal | decimal | R | (18,2) |
| SerialNumber | string | N | [100] |

### Payment
| Campo | Tipo | R/N | Notas |
|---|---|---|---|
| Id | int | R | PK |
| InvoiceId | int | R | FK → Invoice |
| Amount | decimal | R | (18,2) |
| PaymentMethod | `PaymentMethod` | R | texto |
| Reference | string | N | [100] — p. ej. efectivo no lleva referencia |
| PaidAt | DateTime | R | UTC |
| Notes | string | N | [1000] |
| CreatedAt | DateTime | R | UTC |

### Warranty
| Campo | Tipo | R/N | Notas |
|---|---|---|---|
| Id | int | R | PK |
| InvoiceId | int | R | FK → Invoice |
| ClientId | int | R | FK → Client |
| WarrantyNumber | string | R | [30], **único** |
| StartDate | DateTime | R | UTC |
| EndDate | DateTime | R | UTC |
| Status | `WarrantyStatus` | R | texto |
| Notes | string | N | [1000] |
| CreatedAt | DateTime | R | UTC |

### WarrantyItem
| Campo | Tipo | R/N | Notas |
|---|---|---|---|
| Id | int | R | PK |
| WarrantyId | int | R | FK → Warranty |
| ProductId | int | R | FK → Product |
| ProductName | string | R | [200] — copia del nombre al emitir |
| SerialNumber | string | N | [100] |
| WarrantyMonths | int | R | |
| StartDate | DateTime | R | UTC |
| EndDate | DateTime | R | UTC |
| Status | `WarrantyItemStatus` | R | texto |

### NcfSequence
Control de secuencias de NCF (comprobantes fiscales). Sin relaciones.
| Campo | Tipo | R/N | Notas |
|---|---|---|---|
| Id | int | R | PK |
| Type | string | R | [10] — prefijo NCF, p. ej. "B01" |
| CurrentNumber | int | R | siguiente número a usar |
| MaxNumber | int | R | tope de la secuencia |
| IsActive | bool | R | |
| CreatedAt | DateTime | R | UTC |

### AuditLog
Registro histórico de acciones. Sin relaciones; `UserId` es un `int?` **sin FK** a User
(se conserva aunque el usuario se elimine).
| Campo | Tipo | R/N | Notas |
|---|---|---|---|
| Id | int | R | PK |
| UserId | int | N | sin FK |
| Action | string | R | [100] |
| Entity | string | R | [100] |
| EntityId | int | R | id de la entidad afectada |
| Timestamp | DateTime | R | UTC |
| Details | string | N | texto largo (sin límite) |

## Relaciones y borrados (DeleteBehavior)

| Relación | Cardinalidad | Borrado | Motivo |
|---|---|---|---|
| Client → Invoice | 1—* | **Restrict** | No borrar un cliente con facturas |
| User → Invoice | 1—* | **Restrict** | No borrar un usuario con facturas |
| Invoice → InvoiceItem | 1—* | **Cascade** | Las líneas pertenecen a la factura |
| Invoice → Payment | 1—* | **Cascade** | Los pagos pertenecen a la factura |
| Invoice → Warranty | 1—* | **Restrict** | La garantía sobrevive a la factura |
| Client → Warranty | 1—* | **Restrict** | No borrar un cliente con garantías |
| Warranty → WarrantyItem | 1—* | **Cascade** | Los ítems pertenecen a la garantía |
| Product → InvoiceItem | 1—* | **Restrict** | No borrar un producto facturado |
| Product → WarrantyItem | 1—* | **Restrict** | No borrar un producto en garantía |

## Índices únicos

| Entidad | Columna | Tipo |
|---|---|---|
| User | Email | único |
| Product | Code | único |
| Invoice | InvoiceNumber | único |
| Invoice | NCF | único **filtrado** (`WHERE NCF IS NOT NULL`, permite varios nulos) |
| Warranty | WarrantyNumber | único |

## Migración

- Primera migración: `Migrations/<timestamp>_InitialCreate.cs` (+ `.Designer.cs` y `AppDbContextModelSnapshot.cs`).
- Generada con `dotnet ef migrations add InitialCreate`. **Aún no aplicada** a ninguna base de datos.
- Para aplicarla en el futuro (cuando exista PostgreSQL y una cadena de conexión real):
  `dotnet ef database update`.
