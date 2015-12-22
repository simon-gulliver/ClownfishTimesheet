using System.Net;
using System.Net.Http;
using System.Reflection;
using System.Web.Http;
using Timesheet.Models;
using Newtonsoft.Json.Linq;
using System;

namespace Timesheet.Controllers
{

    public class AuthenticationController : ApiController
    {
        #region Dummy Data (should normally get from database)
        public static string userKey;                                            // updateable key for WebAPI authentication (normally, store in database for each current user session)
        public static DateTime userKeyExpires = DateTime.MinValue;                   
        public static string localKey = Timesheet.Helpers.RandomKey.Create();    // key for local encryption (normally created once for each valid user)
        public static int userId = 1;                                            // permanent user id

        private bool IsPasswordValidated (string password)
        { return password != "x"; }// "x" is the equivalent of a failed username lookup from the database (i.e. x is always bad password!)
        #endregion

        // normally userkey would match to current user key and return the permanent user id
        // it also contain a timestamp to expire the key after (say) 24 hours - forcing a login every day
        public static int GetAuthorisedWebApiUserId (string userKey)
        {
            if (userKey != AuthenticationController.userKey || DateTime.Now > userKeyExpires)
            {
                throw new HttpResponseException(
                    new HttpResponseMessage(HttpStatusCode.Unauthorized));
            }
            return userId;
        }


        [AjaxOnlyWebApi]
        public AuthenticationResponse Post([FromBody]JObject json) 
        {
            dynamic jsonObject = json;
            string username = jsonObject.username;
            string password = jsonObject.password;

            AuthenticationResponse response = null;  
            if (IsPasswordValidated(password))                        
            {
                var version = Assembly.GetAssembly(typeof(AppController)).GetName().Version.ToString();
                userKey = Timesheet.Helpers.RandomKey.Create();
                userKeyExpires = DateTime.Now.AddDays(1);

                response = new AuthenticationResponse()
                {
                    localKey = localKey,                                    // pass back an encryption key for on-device data
                    userKey = userKey,                                      // pass back an authentication token for WebAPI
                    version = version                                       // pass back current software version
                };
            }

            return response;
        }
    }
}