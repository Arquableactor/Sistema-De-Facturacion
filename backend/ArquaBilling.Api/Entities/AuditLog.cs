namespace ArquaBilling.Api.Entities;

public class AuditLog
{
    public int Id { get; set; }
    public int? UserId { get; set; } // Sin FK a User (registro histórico)
    public string Action { get; set; } = null!;
    public string Entity { get; set; } = null!;
    public int EntityId { get; set; }
    public DateTime Timestamp { get; set; }
    public string? Details { get; set; }
}
