using System;

namespace TaskFlow.Api.Models
{
    public enum TokenType
    {
        Confirmation,
        PasswordReset
    }

    public class UserToken
    {
        public int Id { get; set; }
        public required string UserId { get; set; }
        public required string Token { get; set; }
        public DateTime Expiration { get; set; }
        public TokenType Type { get; set; }
    }
}