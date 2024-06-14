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

    refreshAWSToken = Harunow.refreshAWSToken;

    // Register click handler for #request button
    $(async function onDocReady() {
        if (!userId) {
            showErrorToast("Aw man, couldn't find token. Please refresh the page");
            return;
        }
        if (group) {
            $("#navbarTitle").text(capitalize(group[0]));
        }

        getList();
    });

    function getList() {
        $.ajax({
            method: 'GET',
            url: _config.api.invokeUrl + '/list',
            headers: {
                Authorization: authToken,
            },
            contentType: 'application/json',
            success: function (response) {
                if (!response.user.isApproved) {
                    //loadSetup("waiting-request", `Hmmm, looks like you need to wait for your school to approve your request`);
                    //$("#loadButton").hide();
                    let infoCard = createAlertCard();
                    let $infoCard = $(infoCard);
                    $grid.append($infoCard).masonry('appended', $infoCard);
                    $grid.masonry();
                    return;
                }
                additionalNav(response.user.userType);
                createNotes(response.notes);
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                console.log('An error occured when requesting polls:\n' + jqXHR.responseText);
            }
        });
    };

    function createNotes(response){
        for (let i = 0; i < response.length; i ++){
            let note = createNote(response[i]);
            let $note = $(note);
            $grid.append($note).masonry('appended', $note);
        }
        $grid.masonry();
    }
    

    $('.logoutButton').on('click', function () {
        Harunow.signOut(); // Call the Harunow.signout function
        window.location.href = '/login'; // Redirect to the login page
    });


}(jQuery));
