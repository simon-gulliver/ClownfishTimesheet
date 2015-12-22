using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Timesheet.Models
{
    public class AuthenticationResponse
    {
        public long lastSynchronisation;
        public string localKey;            // Guid for encryption of sensitive data on client local storage
        public string userKey;          // Guid to authenticate WebAPI calls for the current "session"
        public string version;             // server version
    }
}