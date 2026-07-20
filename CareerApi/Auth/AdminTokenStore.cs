using System.Collections.Concurrent;

namespace CareerApi.Auth;

public static class AdminTokenStore
{
    private static readonly ConcurrentDictionary<string, DateTime> Tokens = new();
    private static readonly TimeSpan SessionLifetime = TimeSpan.FromHours(8);

    public static string IssueToken()
    {
        var token = Guid.NewGuid().ToString("N");
        Tokens[token] = DateTime.UtcNow.Add(SessionLifetime);
        return token;
    }

    public static bool IsValid(string? token)
    {
        if (string.IsNullOrWhiteSpace(token)) return false;
        if (!Tokens.TryGetValue(token, out var expiresAt)) return false;
        if (expiresAt < DateTime.UtcNow)
        {
            Tokens.TryRemove(token, out _);
            return false;
        }
        return true;
    }

    public static void Revoke(string? token)
    {
        if (!string.IsNullOrWhiteSpace(token))
        {
            Tokens.TryRemove(token, out _);
        }
    }
}
