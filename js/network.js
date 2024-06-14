/*global Harunow _config*/

var Harunow = window.Harunow || {};
Harunow.map = Harunow.map || {};

(function groupScopeWrapper($) {
  var authToken;
  const userId = Harunow.UserId;
  const group = Harunow.Group;

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

  function getUsers() {

    $.ajax({
      method: 'GET',
      url: _config.api.invokeUrl + '/users',
      headers: {
        Authorization: authToken,
      },
      contentType: 'application/json',
      success: function (response) {
        if (response.user.userType == "parent") {
          window.location.href = '/'; // Redirect to the home page
        }
        createTables(response.users);
      },
      error: function ajaxError(jqXHR, textStatus, errorThrown) {
        console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
        console.error('Response: ', jqXHR.responseText);
        console.log('An error occured when requesting your unicorn:\n' + jqXHR.responseText);

        if (jqXHR.status === 404) {
          console.log("no school");
        }

      }
    });
  }

  $('.logoutButton').on('click', function () {
    Harunow.signOut(); // Call the Harunow.signout function
    window.location.href = '/login'; // Redirect to the login page
  });

  // Register click handler for #request button
  $(function onDocReady() {
    if (!userId) {
      //FIX showErrorToast("Aw man, couldn't find token. Please refresh the page");
      return;
    }
    if (!group) {
      window.location.href = '/'; //redirect to dashboard
      return;
    }
    getUsers();
  });

  function createTables(users) {
    $.each(users, function (index, user) {
      //if (user.userId == userId && user.userType == "teacher"){
      if (user.userId == userId && user.userType == "teacher") {
        $("#teacherButton").show();
      } if (user.userId == userId && user.userType == "parent") {
        window.location.href = '/';
      }
      if (user.isApproved) {
        let row = `<tr>
                      <td>${user.username}</td>
                      <td>${user.userType}</td>
                      <td>${user.approvedBy ? user.approvedBy : ""}</td></tr>`;
        $("#usersTable").append(row);
      }
      else if (!user.isApproved) {
        let row = `<tr>
                      <td><input type="checkbox" class="form-check-input row-checkbox" value="${user.username}" /></td>
                      <td>${user.username}</td>
                      <td>${user.userType}</td>
                      </tr>`;
        $("#requestsTable").append(row);
      }
    });
  }

  $('#selectAllCheckbox').on('change', function () {
    const isChecked = $(this).prop('checked');
    $('#requestsTable').find('.row-checkbox').each(function () {
      $(this).prop('checked', isChecked);
    });
  });

  $('#acceptButton').on('click', function () {
    const selectedUsernames = [];

    // Iterate over each checked checkbox
    $('#requestsTable').find('.row-checkbox:checked').each(function () {
      const checkboxId = $(this).attr('value');

      // Add the checkbox ID to the selectedIds array
      selectedUsernames.push(checkboxId);
    });

    // Check if no checkboxes are selected
    if (selectedUsernames.length === 0) {
      showErrorToast('Please select at least one user.');
      return;
    }

    $('.dropdown').removeClass('show');
    $('.dropdown-toggle').dropdown('hide');
    $('#actionButton').prop('disabled', true);
    const spanElement = $('<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>');
    $('#actionButton').prepend(spanElement);

    $.ajax({
      method: 'POST',
      url: _config.api.invokeUrl + '/request',
      headers: {
        Authorization: authToken,
      },
      data: JSON.stringify({
        users: selectedUsernames
      }),
      contentType: 'application/json',
      success: function (response) {
        window.location.href = '/network/';
      },
      error: function ajaxError(jqXHR, textStatus, errorThrown) {
        console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
        console.error('Response: ', jqXHR.responseText);
        console.log('An error occured when requesting your network:\n' + jqXHR.responseText);
      },
      complete: function () {
        spanElement.remove();
        $('#actionButton').prop('disabled', false);
      }
    });

  });

}(jQuery));
