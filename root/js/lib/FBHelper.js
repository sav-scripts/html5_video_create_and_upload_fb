(function(){




    var _p = window.FBHelper = {};

    var _appId;
    var _defaultScope = ["public_profile"];

    _p.uid = null;
    _p.uname = null;

    _p.init = function(appId, cb, logLoginStatus)
    {
        _appId = appId;

        window.fbAsyncInit = function()
        {
            FB.init({
                appId      : appId,
                cookie     : true,

                xfbml      : true,
                version    : 'v2.4'
            });

            if(logLoginStatus)
            {

                FB.getLoginStatus(function(response) {
                    statusChangeCallback(response);
                });
            }

            if(cb) cb.apply();
        };

        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/zh_TW/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    };

    _p.login = function(scope, cb_yes, cb_no)
    {
        if(!scope) scope = _defaultScope;
        FB.login(function (response)
        {
            if (response.authResponse)
            {
                _p.uid = response.authResponse.userID;

                if(response.status == "connected")
                {
                    if(cb_yes != null) cb_yes.apply(null, [response.authResponse]);
                }
                else
                {
                    if(cb_no != null) cb_no.apply(null, [{action:"login", response:response, type:response.status, message:"not connected"}]);
                }
            } else {
                if(cb_no != null) cb_no.apply(null, [{action:"login", response:response, type:response.status, message:"user cancel login"}]);
            }
        }, {
            scope: scope
        });
    };

    _p.getPublicProfile = function(cb)
    {
        FB.api('/me', function(response)
        {
            _p.uname = response.name;
            cb.apply(null, [response]);
        });
    };


    // This is called with the results from from FB.getLoginStatus().
    function statusChangeCallback(response)
    {
        console.log('statusChangeCallback');
        console.log(response);
        if (response.status === 'connected') {
            console.log("connected");
        } else if (response.status === 'not_authorized') {
            console.log("not authorized");
        } else {
            console.log("not login");
        }
    }

// This function is called when someone finishes with the Login
// Button.  See the onlogin handler attached to it in the sample
// code below.
    function checkLoginState() {
        FB.getLoginStatus(function(response) {
            statusChangeCallback(response);
        });
    }


// Here we run a very simple test of the Graph API after login is
// successful.  See statusChangeCallback() for when this call is made.
    function testAPI() {
        console.log('Welcome!  Fetching your information.... ');
        FB.api('/me', function(response) {
            console.log('Successful login for: ' + response.name);
            document.getElementById('status').innerHTML =
                'Thanks for logging in, ' + response.name + '!';
        });
    }



}());








