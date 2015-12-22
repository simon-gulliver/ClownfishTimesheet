using System.Collections.Generic;
using System.Reflection;
using System.Web.Mvc;

namespace Timesheet.Controllers
{
    public class ManifestController : Controller
    {
        public ActionResult Manifest()
        {
            // We do not want bundling if in debug mode or if FireFox browser is detected
#if DEBUG
            var debug = true;
#else
           var debug = Request.UserAgent.Contains("Firefox"); // FF on PC won't accept bundled files
#endif
            ViewBag.Version = Assembly.GetAssembly(typeof(AppController)).GetName().Version.ToString();
            var refs = new List<string>();
            if (debug)
            {
                refs.Add("../../Content/Lobster.css");
                refs.Add("../../Content/bootstrap.min.css");
                refs.Add("../../Content/bootstrap-responsive.min.css");
                refs.Add("../../Content/datepicker3.css");
                refs.Add("../../Content/Site.css");

                refs.Add("../../Scripts/jquery-2.1.1.min.js");
                refs.Add("../../Scripts/bootstrap.min.js");
                refs.Add("../../Scripts/bootstrap-datepicker.js");
                refs.Add("../../Scripts/app/aes.js");
                refs.Add("../../Scripts/app/sha3.js");
                refs.Add("../../Scripts/app/crypto.js");
                refs.Add("../../Scripts/app/lang-en.js");
                refs.Add("../../Scripts/app/language.js");
                refs.Add("../../Scripts/app/audiohelper.js");
                refs.Add("../../Scripts/app/timesheet.js");
            }
            else
            {
                refs.Add("../.." + BundleConfig.bundles.ResolveBundleUrl("~/bundles/scripts"));
                refs.Add("../.." + BundleConfig.bundles.ResolveBundleUrl("~/bundles/style"));
            }

            ViewBag.Refs = refs;
            return View();
        }
    }
}