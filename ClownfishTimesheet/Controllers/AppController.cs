using System.Web.Mvc;

namespace Timesheet.Controllers
{
    public class AppController : Controller
    {
        public ActionResult Index(string returnUrl)
        {
            ViewBag.ReturnUrl = returnUrl;
            return View();
        }
    }
}