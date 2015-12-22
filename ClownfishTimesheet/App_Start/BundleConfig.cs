using System.Web;
using System.Web.Optimization;

namespace Timesheet
{
    public class BundleConfig
    {
#if DEBUG
        private static bool isRelease = false;
#else
        private static bool isRelease = true;
#endif
        // make the bundles publicly visible to enable reading them into the manifest file
        public static BundleCollection bundles { get; set; }

        public static void RegisterBundles(BundleCollection bundles)
        {
            BundleConfig.bundles = bundles;
            BundleTable.EnableOptimizations = isRelease;
            bundles.Add(new ScriptBundle("~/bundles/scripts").Include(
                        "~/Scripts/jquery-2.1.1.min.js",
                        "~/Scripts/bootstrap.min.js",
                        "~/Scripts/bootstrap-responsive.min.js",
                        "~/Scripts/bootstrap-datepicker.js",
                        "~/Scripts/app/aes.js",
                        "~/Scripts/app/sha3.js",
                        "~/Scripts/app/lang-en.js",
                        "~/Scripts/app/language.js",
                        "~/Scripts/app/crypto.js",
                        "~/Scripts/app/audiohelper.js",
                        "~/Scripts/app/timesheet.js"
                        ));


            bundles.Add(new StyleBundle("~/bundles/style").Include(
                "~/Content/Lobster.css",
                "~/Content/bootstrap.min.css",
                "~/Content/bootstrap-responsive.min.css",
                "~/Content/datepicker3.css",
                "~/Content/Site.css"));
        }

    }
}