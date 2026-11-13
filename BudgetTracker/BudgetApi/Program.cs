using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using BudgetApi.Data;
using BudgetApi.Services;

var builder = WebApplication.CreateBuilder(args is ["--promote-admin", _] ? [] : args);

builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactFrontend", policy =>
        policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is not configured.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connectionString));

builder.Services.AddScoped<BudgetService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var jwt = builder.Configuration.GetSection("Jwt");
var signingKey = jwt["Key"]
    ?? (builder.Environment.IsDevelopment()
        ? Convert.ToHexString(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32))
        : throw new InvalidOperationException("Jwt:Key is not configured."));
builder.Configuration["Jwt:Key"] = signingKey;

if (Encoding.UTF8.GetByteCount(signingKey) < 32)
    throw new InvalidOperationException("Jwt:Key must contain at least 32 bytes.");

var issuer = jwt["Issuer"]
    ?? throw new InvalidOperationException("Jwt:Issuer is not configured.");
var audience = jwt["Audience"]
    ?? throw new InvalidOperationException("Jwt:Audience is not configured.");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = issuer,
            ValidateAudience = true,
            ValidAudience = audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
            NameClaimType = ClaimTypes.NameIdentifier,
            RoleClaimType = ClaimTypes.Role
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Назначение роли выполняется владельцем локального экземпляра через командную строку.
if (args is ["--promote-admin", var email])
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var normalizedEmail = email.Trim().ToLowerInvariant();
    var user = await db.Users.SingleOrDefaultAsync(user => user.Email == normalizedEmail);
    if (user is null)
    {
        Console.Error.WriteLine("Пользователь с таким адресом не найден.");
        Environment.ExitCode = 1;
        return;
    }

    user.Role = "Admin";
    await db.SaveChangesAsync();
    Console.WriteLine("Роль администратора назначена.");
    return;
}

// Создаём схему SQLite при первом запуске.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
    if (app.Environment.IsDevelopment() &&
        !await db.Users.AnyAsync(user => user.Email == "admin"))
    {
        var admin = new BudgetApi.Models.AppUser
        {
            Email = "admin",
            Username = "admin",
            Role = "Admin"
        };
        var hasher = new Microsoft.AspNetCore.Identity.PasswordHasher<BudgetApi.Models.AppUser>();
        admin.PasswordHash = hasher.HashPassword(admin, "password");
        db.Users.Add(admin);
        await db.SaveChangesAsync();
    }
}

app.UseCors("ReactFrontend");

if (!app.Environment.IsDevelopment())
    app.UseHttpsRedirection();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
