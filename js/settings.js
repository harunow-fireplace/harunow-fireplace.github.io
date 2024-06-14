/*global Harunow _config*/

var Harunow = window.Harunow || {};
Harunow.map = Harunow.map || {};

(function groupScopeWrapper($) {
    const userId = Harunow.UserId;
    const username = Harunow.Username;
    let group = Harunow.Group;
    var $grid = $('.grid').masonry();
    let userType;
    Harunow.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            window.location.href = '/login/';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/login/';
    });


    // store holidays
    let holidays = {
        "4/9/2023": ["SPCA"],
    }
    // Register click handler for #request button
    $(async function onDocReady() {
        renderCalendar(holidays);
        $('[data-toggle="tooltip"]').tooltip();

        $("li").on('click', function () {
            var dataValue = $(this).data('value');
            if ($(this).hasClass("holiday")) {
                $(this).removeClass("holiday");
                delete holidays[dataValue]; // Remove the holiday
            } else {
                $(this).addClass("holiday");
                holidays[dataValue] = ["holiday"]; // Mark as a holiday
            }
            
        });
    });



    $('.logoutButton').on('click', function () {
        Harunow.signOut(); // Call the Harunow.signout function
        window.location.href = '/login'; // Redirect to the login page
    });

    $('#savebutton').click(function() {
        // Create an example variable named 'calendar'
        // If 'calendar' element is checked, set the variable value to true, else set it to false
        var calendar;
        if ($('#calendar').is(":checked")) {
            calendar = true;
        } else {
            calendar = false;
        }
    
        var post;
        if ($('#post').is(":checked")) {
            post = true;
        } else {
            post = false;
        }

        var note;
        if ($('#note').is(":checked")) {
            note = true;
        } else {
            note = false;
        }

        var poll;
        if ($('#poll').is(":checked")) {
            poll = true;
        } else {
            poll = false;
        }
        // Now you can use the 'calendar' as needed.
    });

}(jQuery));

