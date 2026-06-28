using System.ComponentModel.DataAnnotations;

namespace ArquaBilling.Api.DTOs.Payments;

public class VoidPaymentRequest
{
    [MaxLength(500)]
    public string? VoidReason { get; set; }
}
