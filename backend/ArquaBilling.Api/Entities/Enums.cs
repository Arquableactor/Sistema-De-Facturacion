namespace ArquaBilling.Api.Entities;

// Tipos cerrados. Se guardan como texto en la base de datos (HasConversion<string>).

public enum UserRole
{
    Admin,
    Sales,
    Technician
}

public enum InvoiceStatus
{
    Draft,
    Issued,
    PartiallyPaid,
    Paid,
    Cancelled
}

public enum WarrantyStatus
{
    Active,
    Expired,
    Void
}

public enum WarrantyItemStatus
{
    Active,
    Expired,
    Void
}

public enum PaymentMethod
{
    Cash,
    Transfer,
    Card,
    Check,
    Other
}

public enum DocumentType
{
    Cedula,
    Rnc,
    Passport
}

// Etapa del proyecto de instalación solar (avance cualitativo; el % de progreso es manual aparte).
public enum ProjectStage
{
    Visita,
    Diseno,
    Permisos,
    Montaje,
    Conexion,
    Finalizado
}

// Categoría del equipo en el catálogo de productos.
public enum EquipmentCategory
{
    PanelSolar,
    Inversor,
    Bateria,
    Estructura,
    Medidor,
    Cableado
}
