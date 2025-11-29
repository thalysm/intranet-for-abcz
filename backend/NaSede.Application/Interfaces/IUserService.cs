using NaSede.Application.DTOs.Users;

namespace NaSede.Application.Interfaces;

public interface IUserService
{
    Task<UserResponse> CreateUserAsync(CreateUserRequest request);
    Task<UserResponse?> GetUserByIdAsync(Guid id);
    Task<UserResponse?> GetUserByEmailAsync(string email);
}
