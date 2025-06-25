using AuthApp.Data;
using AuthApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;

namespace AuthApp.Controllers
{
    [Authorize]
    public class HistoryController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public HistoryController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // GET: History
        public async Task<IActionResult> Index()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var history = await _context.CalculationHistory
                .Where(h => h.UserId == userId)
                .OrderByDescending(h => h.CalculationDate)
                .ToListAsync();

            return View(history);
        }

        // GET: History/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var history = await _context.CalculationHistory
                .FirstOrDefaultAsync(m => m.Id == id && m.UserId == userId);
                
            if (history == null)
            {
                return NotFound();
            }

            return PartialView("_CalculationDetails", history);

        }

        // API endpoint to save calculation history
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> SaveCalculation([FromBody] SaveCalculationRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            var history = new CalculationHistory
            {
                UserId = userId,
                CalculationDate = DateTime.Now,
                InputData = JsonSerializer.Serialize(request.Inputs),
                ResultData = JsonSerializer.Serialize(request.Results),
                Description = request.Description ?? "ERV Wheel Calculation"
            };

            _context.Add(history);
            await _context.SaveChangesAsync();

            return Ok(new { id = history.Id });
        }
    }

    public class SaveCalculationRequest
    {
        public object Inputs { get; set; } = new();
        public object Results { get; set; } = new();
        public string? Description { get; set; }
    }
}