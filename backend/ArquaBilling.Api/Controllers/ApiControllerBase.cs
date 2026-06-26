using ArquaBilling.Api.Common;
using Microsoft.AspNetCore.Mvc;

namespace ArquaBilling.Api.Controllers;

// Base de todos los controllers de la API. Centraliza el mapeo de errores de
// negocio (ServiceResult) al código HTTP + envelope de error. Los módulos
// (Products, Invoices, ...) heredarán de aquí para no repetir el mapeo.
[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    protected IActionResult MapError(ServiceResult result) => result.Status switch
    {
        ResultStatus.NotFound => NotFound(new ErrorResponse(result.Error ?? "No encontrado.")),
        ResultStatus.Conflict => Conflict(new ErrorResponse(result.Error ?? "Conflicto.")),
        _ => StatusCode(StatusCodes.Status500InternalServerError, new ErrorResponse("Error interno."))
    };
}
