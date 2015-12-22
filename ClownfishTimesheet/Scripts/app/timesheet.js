'use strict';
// localStorage data
/*
localKey	    key to encrypt local storage (created once by the server, identical across all devices) - encrypted by password
loginHash	    hash of last logged-in user+password (authenticates if app is not online) 	
rememberMe	    optional rememberMe setting
userKey	        WebAPI authentication token (updated on last good login, on any device)	- encrypted by password
username	    last logged-in username
version         last logged-in software version

sync            changes being synced - encrypted by localKey
waitingForSync  changes waiting to be synced while server is processing a sync - encrypted by localKey
timesheets      current activities (synced and unsynced) - encrypted by localKey
*/
// sessionStorage data
// loggedIn (if user currently logged in)

$.ajaxSetup({ timeout: 5000 });                                 // iPad Safari timeout can be quite long (looks as if website is dead)
if(!window.console){ window.console = {log: function(){} }; }   // ensure window.console.log function exists

applicationCache.onupdateready = function () {                  // automatically reload page when applicationCache changes
    applicationCache.swapCache();
    window.location.reload();
};

Date.prototype.addDays = function (days) {
    var d = new Date(this.valueOf());
    d.setDate(d.getDate() + days);
    return d;
}

//bootstrap-datepicker.en-GB.js
/**
 * British English translation for bootstrap-datepicker
 * Xavier Dutreilh <xavier@dutreilh.com>
 */
; (function ($) {
    $.fn.datepicker.dates['en-GB'] = {
        days: [], //["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        daysShort: [], //["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        monthsShort: [], //["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        today: "Today",
        clear: "",//"Clear",
        weekStart: 1,
        format: "dd/mm/yyyy"
    };
}(jQuery));

///////////////////////////////////////////////////////////////////////////
// input subroutines (add error class if missing input data)
///////////////////////////////////////////////////////////////////////////
function inputCheck($id, $class) {
    if ($($id).val() == "") {
        $($id).addClass($class);
    }
    else {
        $($id).removeClass($class);
        return $($id).val();
    }
}//end function

///////////////////////////////////////////////////////////////////////////
// event handlers
///////////////////////////////////////////////////////////////////////////
// login page submit
$("button[type='submit']").on("click", function () {
    var $username = inputCheck("#username", "inputerror");
    var $password = inputCheck("#password", "inputerror");
    localStorage.username = $username;            // remember username in case offline access of different user attempted
    localStorage.removeItem('rememberMe');
    if ($("#rememberMe").is(':checked'))
        localStorage.rememberMe = 'y';
    else
        $("#username").val("");

    timesheet.Authenticate($username, $password);
    $("#password").val("");                     // clear the password now (and forever, so it can't be seen in javascript)
    return false;
});

// click logout button
$('#offline').on("click", function () {
    timesheet.OnLogout();
});

// timesheet entry table select using mouse or touch event handlers
$("td").on("click", function (e) {
    var column = $(this).parent().children().index(this);
    if (column === 0) return;                                           // column 0 clicked, no action
    timesheet.colour = $('#activities').css("background-color");
    $(this).css("background-color", timesheet.colour);                  
    $(this).val($('#activities').val());
    timesheetData.FromPage();
    e.stopPropagation();
});

// activities selection dropdown changed
$('#activities').change(function (e) {
    timesheet.UpdateActivityDropdownColour($(this));
});

// force the 'Enter Key' to implicitly click the submit button
$("input").bind("keydown", function (event) {
    var keycode = (event.keyCode ? event.keyCode : (event.which ? event.which : event.charCode));
    if (keycode == 13) {                // keycode for enter key
        $('[name="submit"]').click();   // force the 'Enter Key' to implicitly click the submit button
        return false;
    }
    return true;
});




var timesheetData = {
    rows: null,
    //date: null,
    // Blank all page cells 
    BlankPageCells: function () {
        for (var row = 0; row < 24;row++) {
            for (var col = 1; col < 5;col++)
                $(timesheetData.rows[row].children[col]).css("background-color", timesheet.unselectedColour);
        }
    },
    // Paint cells for a particular day
    ToPage: function (sheet) {
        timesheetData.BlankPageCells();
        for (var i = 0; i < sheet.entries.length; i++) {                // for each entry...
            var timeblock = sheet.entries[i].timeblock;                 //      find next position to colour
            var row = Math.floor(timeblock / 4);                      
            var col = Math.floor(timeblock % 4);
            var colour = timesheet.GetColourFromActivity(sheet.entries[i].activityId);
            $(timesheetData.rows[row].children[col+1]).css("background-color", colour);
        }
        timesheetData.updated = new Date().getTime();
    },

    // Read all TimesheetEntries from the displayed page
    FromPage: function () {
        //if (!timesheetData.dirty) return;
        var newsheet = { when: timesheet.currentDate, entries: [], timestamp: new Date().getTime() };
        
        for (var row = 0; row < 23; row++) {
            for (var col = 1; col < 5; col++) {
                var rgbcolour = $(timesheetData.rows[row].children[col]).css("background-color");
                var colour = timesheet.Rgb2Hex(rgbcolour);

                if (colour != timesheet.unselectedColour) {
                    var timesheetEntry = {
                        activityId: timesheet.GetActivityFromColour(colour),
                        timeblock: (row * 4) + ((col - 1))
                    };
                    newsheet.entries.push(timesheetEntry);
                }
            }
        }
        if (timesheet.currentTimesheet.entries.join('') != newsheet.entries.join('')) {  // if timesheet entries have changed...
            timesheet.currentTimesheet.entries = newsheet.entries;

            // encrypt timesheets in local storage (password is localKey)
            Crypto.EncryptToLocalStorage("timesheets", timesheet.timesheets, timesheet.localKey);
            var diagnostic = Crypto.DecryptFromLocalStorage('timesheets', timesheet.localKey);

            // encrypt sync entries in local storage (password is localKey)
            if (timesheet.isSyncingNow) {
                timesheet.waitingToSync.timesheets.push(newsheet);
                Crypto.EncryptToLocalStorage("waitingToSync", timesheet.waitingToSync, timesheet.localKey);   
            }
            else {
                timesheet.sync.timesheets.push(newsheet);
                Crypto.EncryptToLocalStorage("sync", timesheet.sync, timesheet.localKey);   
                timesheet.Synchronise();
          }

        }
    }
};


///////////////////////////////////////////////////////////////////////////
// main code
///////////////////////////////////////////////////////////////////////////
var timesheet = {
    loggedIn: false,
    localKey: null,
    userKey: null,
    username: null,
    unselectedColour: '#ffffff', // white
    currentColour:    '#ffffff', // white
    currentDate: new Date(),
    currentTimesheet: null,
    isSyncingNow: false,
    lastupdated: 0,
    activities: [],
    timesheets: [],

    sync: { lastServerSyncTime: 0, timesheets: [], activities: [] },
    waitingToSync: [],

    SynchroniseSuccessful: function (sync) {
        if (sync.activities && sync.activities.length > 0) {
            sync.activities.forEach(function (item) {
                timesheet.activities.push(item);
            });
            timesheet.activities.sort(function (a, b) { return a.name - b.name });
            timesheet.LoadActivities();
        }
        if (sync.timesheets.length > 0) {
            sync.timesheets.forEach(function (item) {
                timesheet.timesheets[new Date(timesheet.FormatDate(new Date(item.when)))] = item;
            });
            timesheet.LoadTimesheet(timesheet.currentDate);
        }
        timesheet.sync.lastServerSyncTime = sync.lastServerSyncTime;
        var moreToDo = timesheet.waitingToSync.length > 0;
        timesheet.sync.timesheets = timesheet.waitingToSync;
        timesheet.SynchroniseComplete();
        if (moreToDo)
            timesheet.Synchronise();
    },

    SynchroniseFailed: function () {
        timesheet.sync.timesheets = timesheet.sync.timesheets.concat(timesheet.waitingToSync);
        timesheet.SynchroniseComplete();
    },

    SynchroniseComplete: function () {
        timesheet.isSyncingNow = false;
        timesheet.waitingToSync.length = 0;
        localStorage.removeItem("waitingToSync");
        Crypto.EncryptToLocalStorage("sync", timesheet.sync, timesheet.localKey);   // sync is now encrypted in local storage (password is localKey)
    },

    // initiate Synchronise function using WebAPI
    Synchronise: function () {
        timesheet.isSyncingNow = true;

        $.ajax({
            type: 'POST',
            cache: false,
            contentType: "application/json",
            data: JSON.stringify(timesheet.sync), 
            url: "../api/Synchronise",
        }).done(function (result) {
            $('#offline').attr("src", "../../Images/online.jpg");   // show we are connected
            timesheet.SynchroniseSuccessful(result);
        }).error(function (request, status, error) {
             $('#offline').attr("src", "../../Images/offline.png"); // show we are not connected
            timesheet.SynchroniseFailed();
            if (request.status === 401)                             // unauthorized response forces a new login
                timesheet.OnLogout();
         });
    },

    // main authentication, uses client-side username/password hash if offline 
    Authenticate: function (username, password) {
        username = username.toUpperCase();                          // users can get a bit careless about case when using emails as usernames
        $.ajax({
            type: 'POST',
            cache: false,
            contentType: "application/json",
            data: JSON.stringify({ username: username, password: password }),
            url: "../api/Authentication",
        }).done(function (result) {
            if (!result) {
                alert(langReplace("BadUser"));                                  // note we let the server determine this
                return;                                                         // (otherwise we would not be able to switch users on the client)
            }
            $('#offline').attr("src", "../../Images/online.jpg");               // show online graphic

            timesheet.localKey = result.localKey;
            timesheet.userKey = result.userKey;
            Crypto.EncryptToLocalStorage("localKey", timesheet.localKey, password); // localKey is now encrypted in local storage (password is key)
            Crypto.EncryptToLocalStorage("userKey", timesheet.userKey, password);   // userKey is now encrypted in local storage (password is key)

            localStorage.loginHash = CryptoJS.SHA3(username + password);
            localStorage.version = result.version;

            timesheet.OnGoodLogin(true, password);
            timesheet.Synchronise();

        }).error(function (request, status, error) {
            $('#offline').attr("src", "../../Images/offline.png");
            if (localStorage.username != username) { 
                alert(langReplace("BadUser"));
                return;
            }
            var hash = CryptoJS.SHA3(username + password);
            var authenticated = false;
            try {
                timesheet.localKey = Crypto.DecryptFromLocalStorage("localKey", password);
                timesheet.userKey = Crypto.DecryptFromLocalStorage("userKey", password);
                authenticated = (timesheet.localKey && hash == localStorage.loginHash);
            } catch (c) { alert(langReplace("NoOfflineUser")); } // probably local storage cleared or password changed

            if (authenticated) {
                timesheet.OnGoodLogin(false, password);
            }
        });
    },
    // either online or offline login succeeds
    OnGoodLogin: function (online, password) {
        sessionStorage.loggedIn = true;
        timesheet.LoadFromLocalStorage(password);
        timesheet.sync.userKey = timesheet.userKey;

        // and launch
        $("#loginPage").hide();
        $("#mainPage").show();
    },

    OnLogout: function () {
        sessionStorage.removeItem("loggedIn");
        $("#loginPage").show();
        $("#mainPage").hide();
    },

    LoadFromLocalStorage: function (password) {
        if (timesheet.sync) return;                   // diagnostic !!!!!!!

        var sync = Crypto.DecryptFromLocalStorage('sync', timesheet.localKey);
        if (sync) timesheet.sync = sync;
        // in case we died in a previous session while a sync was outstanding
        sync = Crypto.DecryptFromLocalStorage('waitingToSync', timesheet.localKey);
        if (sync) {
            timesheet.sync = timesheet.sync.concat(sync);
            timesheet.SynchroniseComplete();
        }

        var timesheets = Crypto.DecryptFromLocalStorage('timesheets', timesheet.localKey);
        if (timesheets) timesheet.timesheets = timesheets;
        var activities = localStorage.getItem(activities);
        if (activities)  timesheet.activities = Json.parse(activities);

        timesheet.LoadActivities();
        timesheet.LoadTimesheet(new Date(timesheet.FormatDate(new Date()))); // always start from today
    },

    FormatDate: function (now) {    // return dd/MM/yyyy 00:00:00 (parseable using new Date(x))
        return  now.getDate() + '/' + (now.getMonth() + 1) + '/' + now.getFullYear();
    },

    LoadTimesheet: function (today) {
        timesheet.currentDate = today;
        timesheet.currentTimesheet = timesheet.timesheets[today];
        if (!timesheet.currentTimesheet) {                                                       // if no values set for day, create empty default
            timesheet.currentTimesheet = { id: new Date().getTime(), when: today, entries: [] }; // today.setHours(0, 0, 0, 0); ????
            timesheet.timesheets[today] = timesheet.currentTimesheet;
        }
        timesheetData.ToPage(timesheet.currentTimesheet);
    },

    LoadActivities: function () {
        var mySelect = $('#activities');
        mySelect.empty();
        // now add synchronised activities (all values are sent, not just updated ones)
        timesheet.activities.forEach(
            function (item) {
                if (!item.deleted) {
                    mySelect.append($('<option></option>').val(item.id).html(item.name).css('backgroundColor', item.colour));
                }
            });
        // add an "unselected" option (value 0) to unset cells
        mySelect.append($('<option></option>').val(0).html('unselected').css('backgroundColor', timesheet.unselectedColour).css('color', 'black'));
        //mySelect.val("0");

        timesheet.UpdateActivityDropdownColour(mySelect);
    },

    UpdateActivityDropdownColour: function (me) {
        timesheet.currentColour = $('#activities :selected').css('backgroundColor');
        me.css('backgroundColor', timesheet.currentColour);
    },


    Rgb2Hex: function (rgb) {
        if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;            // some browsers return #xxxxxx 

        rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);    // otherwise convert rgb(xx, yy, zz) to above format
        function hex(x) {
            return ("0" + parseInt(x).toString(16)).slice(-2);
        }
        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    },

    GetActivityFromColour: function (colour) {
        for (var i = 0; i < timesheet.activities.length; i++)
            if (timesheet.activities[i].colour === colour)
                return timesheet.activities[i].id;
        return 0;
    },
    GetColourFromActivity: function (activity) {
        for (var i = 0; i < timesheet.activities.length; i++)
            if (timesheet.activities[i].id === activity)
                return timesheet.activities[i].colour;
        return timesheet.unselectedColour;
    },

};
///////////////////////////////////////////////////////////////////////////
// if multiple HTML pages exist, you may need initialisers when loaded
// (here a single all-purpose initializer is called from $(document).ready)
///////////////////////////////////////////////////////////////////////////
$(document).ready(function () {
    $('.date').val(timesheet.FormatDate(new Date()));

    if (localStorage.rememberMe) {
        $("#rememberMe").prop('checked', true);
        $("#username").val(localStorage.username);
    }

    $("#password").focus();

    if (localStorage.version)
        $("#version").text(localStorage.version);

    $('.date').datepicker({
        format: "dd/mm/yyyy",
        language: "en-GB",
        startDate: new Date().addDays(-20),  // just ensuring not too much data around in the demo version
        endDate: "0",
        todayBtn: false,
        autoclose: true,
        todayHighlight: true
    }).on("changeDate", function (e) {
        timesheet.LoadTimesheet($('.date').datepicker('getDate'));
    });

    timesheetData.rows = $('table#schedule').find('tbody').find('tr'); // cache table rows
});


