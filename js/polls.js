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
        setWelcomeMessage(username);
        if (group) {
            $("#navbarTitle").text(capitalize(group[0]));
        }

        getPoll();
    });
    
    var polls;
    function getPoll() {
        $.ajax({
            method: 'GET',
            url: _config.api.invokeUrl + '/poll',
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
                userType = response.user.userType;
                additionalNav(response.user.userType);
                if (response.poll) {
                    polls = response.poll;
                    for (let i = 0; i < polls.length; i++) {
                        createPollCard(polls[i], i, username, userType);

                    }
                    handlePollAction();
                }
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                console.log('An error occured when requesting polls:\n' + jqXHR.responseText);
            }
        });
    };

    
    $('.logoutButton').on('click', function () {
        Harunow.signOut(); // Call the Harunow.signout function
        window.location.href = '/login'; // Redirect to the login page
    });



function handlePollAction() {
  $('.grid').on('click', '.submitVote', function (event) {
    event.preventDefault();
    // Get the value of the clicked button
    var id = $(this).val();
    var pollId = this.id;
    var selectedValue = $(`input[name=optionsRadios-${pollId}]:checked`).val();
    if (!selectedValue) {
      showToast('None selected', 'text-bg-danger', 'Please select an option');
      return;
    }
    if (!polls[pollId].votes) {
        polls[pollId].votes = {};
    }
    // Add a new vote for a user
    polls[pollId].votes[username] = selectedValue;
    $.ajax({
      method: 'POST',
      url: _config.api.invokeUrl + '/poll',
      headers: {
        Authorization: authToken,
      },
      data: JSON.stringify({
        type: "vote",
        createdAt: id,
        vote: { [username]: selectedValue }
      }),
      contentType: 'application/json',
      success: function (response) {
        //add vote to poll.votes
        showToast("Thank you for your vote", "text-bg-success", "Success");

        $(`#pollCard-${pollId}`).empty();
        polls[pollId].votes[username] = selectedValue;
        userVoted = true;
        $(`#pollCard-${pollId}`).append(createPollOptions(polls[pollId], pollId, username, true));
        $(`#pollHeader-${pollId}`).append(`<span class="badge bg-secondary">Voted</span>`);
        // Initialize tooltips for the new elements
        $('[data-bs-toggle="tooltip"]').tooltip();
      },
      error: function ajaxError(jqXHR, textStatus, errorThrown) {
        showToast(jqXHR.responseText, 'text-bg-danger', 'An error occured when submitting vote');
      },
    });
  });

  $('.grid').on('click', '.revealPoll', function (event) {
    event.preventDefault();
    const $revealButton = $(this);
    // Get the value of the clicked button
    var id = $(this).val();
    let pollId = this.id;
    // Extract the numeric part from the string
    var numericPart = pollId.match(/\d+/)[0];

    // Convert the numeric part to an integer (if needed)
    var numericValue = parseInt(numericPart, 10);

    $(`#pollCard-${pollId}`).empty();
    $(`#pollCard-${pollId}`).append(showPollResults(polls[numericValue].votes));
    $revealButton.removeClass("revealPoll");
    $revealButton.addClass("closePoll");
    $revealButton.text("Close");
    $.ajax({
      method: 'POST',
      url: _config.api.invokeUrl + '/poll',
      headers: {
        Authorization: authToken,
      },
      data: JSON.stringify({
        type: "update",
        id: id,
        attr: "results"
      }),
      contentType: 'application/json',
      success: function (response) {
        //showToast("Thank you this poll has been closed. You can still find the poll results on the polls page", "text-bg-success", "Success");

      },
      error: function ajaxError(jqXHR, textStatus, errorThrown) {
        showToast(jqXHR.responseText, 'text-bg-danger', 'An error occured when submitting vote');
        console.log('Error:', errorThrown);
      },
    });
  });

  $('.grid').on('click', '.closePoll', function (event) {
    event.preventDefault();
    var id = $(this).val();
    console.log(id);
    const $closeButton = $(this);
    // Get the value of the clicked button
    $.ajax({
      method: 'POST',
      url: _config.api.invokeUrl + '/poll',
      headers: {
        Authorization: authToken,
      },
      data: JSON.stringify({
        type: "update",
        id: id,
        attr: "isClosed"
      }),
      contentType: 'application/json',
      success: function (response) {
        showToast("Thank you this poll has been closed. You can still find the poll results on the polls page", "text-bg-success", "Success");
        console.log("closed");

      },
      error: function ajaxError(jqXHR, textStatus, errorThrown) {
        showToast(jqXHR.responseText, 'text-bg-danger', 'An error occured when submitting vote');
        console.log('Error:', errorThrown);
      },
    });
  });
}


}(jQuery));
