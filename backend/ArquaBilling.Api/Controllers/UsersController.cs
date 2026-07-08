using System.Security.Claims;
using ArquaBilling.Api.DTOs.Users;
using ArquaBilling.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArquaBilling.Api.Controllers;

// GET raíz (selects) lo usa cualquier autenticado. La GESTIÓN de usuarios (manage /
// crear / editar / reset-password) es SOLO-Admin, protegida a nivel de método con
// [Authorize(Roles="Admin")]. No hay DELETE físico: se desactiva vía PUT (IsActive=false).
[Route("api/[controller]")]
[Authorize]
public class UsersController : ApiControllerBase
{
    private readonly IUserService _service;

    public UsersController(IUserService service)
    {
        _service = service;
    }

    // Lista mínima para poblar selects (ej. responsable de proyecto). Cualquier autenticado.
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool onlyActive = true)
        => Ok(await _service.GetAllAsync(onlyActive));

    // --- Gestión de usuarios (solo Admin) ---

    [HttpGet("manage")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllForManage([FromQuery] bool includeInactive = true)
        => Ok(await _service.GetAllForManageAsync(includeInactive));

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(UserCreateRequest request)
    {
        var result = await _service.CreateAsync(request);
        return result.IsSuccess ? Ok(result.Value) : MapError(result);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, UserUpdateRequest request)
    {
        var currentUserId = GetUserId();
        if (currentUserId is null)
        {
            return Unauthorized();
        }

        var result = await _service.UpdateAsync(id, request, currentUserId.Value);
        return result.IsSuccess ? Ok(result.Value) : MapError(result);
    }

    [HttpPost("{id:int}/reset-password")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ResetPassword(int id, ResetPasswordRequest request)
    {
        var result = await _service.ResetPasswordAsync(id, request.NewPassword);
        return result.IsSuccess ? NoContent() : MapError(result);
    }

    // El id del usuario actual sale del token (claim sub/NameIdentifier), nunca del request.
    private int? GetUserId()
        => int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;
}
