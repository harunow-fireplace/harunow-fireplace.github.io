/*global Harunow _config*/

var Harunow = window.Harunow || {};
Harunow.map = Harunow.map || {};

(function groupScopeWrapper($) {
    const userId = Harunow.UserId;
    const username = Harunow.Username;
    let group = Harunow.Group;
    var $grid = $('.grid').masonry();
    let userType;
    let groupMembers;
    let records;
    let team;

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

    function getTableRecord() {
        $.ajax({
            method: 'GET',
            url: _config.api.invokeUrl + '/records',
            headers: {
                Authorization: authToken,
            },
            contentType: 'application/json',
            success: function (response) {
                if (response[0]) {
                    records = response;
                    let flipCard = createFlipCard(response[0], 0, userType);
                    $("#teamsRecords").append(flipCard);
                    addFlipCardButtons();
                    modalButton();
                    let graph = graphData(response[0]);
                    $(`#recordGraph-${0}`).append(graph);
                    
                    createUpdates(response[0].updates);
                    console.log(response[0])
                    if (response[0].members){
                        createTeamsTable(response[0].members);
                    }
                    createGroupDropdown(response[0].groups);
                    $('[data-bs-toggle="tooltip"]').tooltip();
                }
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                console.log('An error occured when requesting records:\n' + jqXHR.responseText);
            }
        });
    }

    function createGroupDropdown(groups) {
        for (item in groups) {
            var dropdownItem = `<option value="${groups[item]}">${groups[item]}</option>`;
            $("#groupDropdown").append(dropdownItem);

        }
    }

    function createUpdates(updates) {
        for (item in updates) {
            let members = 0;
            if (updates[item].data && Array.isArray(updates[item].data)){
                members = updates[item].data.slice(0, -1).join(', ') + (updates[item].data.length > 1 ? ', ' : '') + updates[item].data.slice(-1);
            }
            var updateItem = `<a href="#" class="list-group-item list-group-item-action d-flex gap-3 py-3"
            aria-current="true">
            <div class="avatar-container">
                <div class="avatar" style="background-color: ${stringToColor(updates[item].createdBy)}">
                    ${getInitial(updates[item].createdBy)}
                </div>
            </div>
            <div class="d-flex gap-2 w-100 justify-content-between">
                <div>
                    <h6 class="mb-0">${updates[item].createdBy} ${updates[item].updateType === "member" ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-robot" viewBox="0 0 16 16">
                    <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5M3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.6 26.6 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.93.93 0 0 1-.765.935c-.845.147-2.34.346-4.235.346s-3.39-.2-4.235-.346A.93.93 0 0 1 3 9.219zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a25 25 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25 25 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135"/>
                    <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2zM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5"/>
                  </svg>` : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-rocket-takeoff-fill" viewBox="0 0 16 16">
                  <path d="M12.17 9.53c2.307-2.592 3.278-4.684 3.641-6.218.21-.887.214-1.58.16-2.065a3.6 3.6 0 0 0-.108-.563 2 2 0 0 0-.078-.23V.453c-.073-.164-.168-.234-.352-.295a2 2 0 0 0-.16-.045 4 4 0 0 0-.57-.093c-.49-.044-1.19-.03-2.08.188-1.536.374-3.618 1.343-6.161 3.604l-2.4.238h-.006a2.55 2.55 0 0 0-1.524.734L.15 7.17a.512.512 0 0 0 .433.868l1.896-.271c.28-.04.592.013.955.132.232.076.437.16.655.248l.203.083c.196.816.66 1.58 1.275 2.195.613.614 1.376 1.08 2.191 1.277l.082.202c.089.218.173.424.249.657.118.363.172.676.132.956l-.271 1.9a.512.512 0 0 0 .867.433l2.382-2.386c.41-.41.668-.949.732-1.526zm.11-3.699c-.797.8-1.93.961-2.528.362-.598-.6-.436-1.733.361-2.532.798-.799 1.93-.96 2.528-.361s.437 1.732-.36 2.531Z"/>
                  <path d="M5.205 10.787a7.6 7.6 0 0 0 1.804 1.352c-1.118 1.007-4.929 2.028-5.054 1.903-.126-.127.737-4.189 1.839-5.18.346.69.837 1.35 1.411 1.925"/>
                </svg>`} </h6>
                    <p class="mb-0 opacity-75">
                    ${updates[item].updateType === "member" ? `${updates[item].createdBy} added ${members} to ${updates[item].team}` : ""}
                    ${updates[item].updateType === "points" ? `${updates[item].data} points ${updates[item].data > 0 ? " to " : " from "} ${updates[item].team}` : ""}
                    </p>
                </div>
                <small class="opacity-50 text-nowrap">${timeAgo(updates[item].createdAt)}</small>
            </div>
        </a>`;
            $("#updateList").prepend(updateItem);

        }
    }


    function createStudentDropdown(users) {
        let students = groupMembers.filter((student) => {
            return student.userType === "student";
        });
        for (i in students) {
            let studentOption = `<option value="${students[i].username}">${students[i].username}</option>`;
            $("#studentsDropdown").append(studentOption);
        }
    }

    $(async function onDocReady() {
        getTableRecord();
        getUsers();
        
    });


    $('.logoutButton').on('click', function () {
        Harunow.signOut(); // Call the Harunow.signout function
        window.location.href = '/login'; // Redirect to the login page
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
                if (Array.isArray(response.users)) {
                    // Find the user with the specified username
                    const user = response.users.find(user => user.username === username);
                
                    if (user) {
                        // Store userType in a variable for better readability
                        const userType = user.userType;
                
                        if (userType === "student") {
                            // Store team from user object if necessary
                            team = user.team;
                
                            // Perform actions for students
                            addGraphEdit(0);
                            teamEdit();
                        } else{
                            groupMembers = response.users;
                            createStudentDropdown();
                        }
                    } else {
                        console.log("User not found");
                        // Handle case where user is not found
                    }
                } else {
                    console.log("response.users is not an array");
                    // Handle case where response.users is not an array
                }
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                console.log('An error occured when requesting your unicorn:\n' + jqXHR.responseText);
            }
        });
    }

    $("#saveTeams").on('click', function () {

        let recordIndex = $("#saveTeams").val();
        let selectedTeam = $('#groupDropdown').val();

        let selectedStudents = $('#studentsDropdown').val();
        if (Array.isArray(selectedStudents) && selectedStudents.length === 0) {
            showToast('Please select at least 1 user', 'text-bg-danger', 'None selected');
            return;
        }
        updateTeamMember("member", recordIndex, selectedTeam, selectedStudents);

    });

    function updateTeamMember(type, recordIndex, selectedTeam, data) {
        let recordId = records[recordIndex].createdAt;

        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/teams',
            headers: {
                Authorization: authToken,
            },
            data: JSON.stringify({
                updateType: type,
                data: data,
                recordId: recordId,
                team: selectedTeam
            }),
            contentType: 'application/json',
            success: function (response) {
                $('#recordModal').modal('hide');

                showToast('Team members successfully updated', 'text-bg-success', capitalize(response));
                let update = [{
                    dataType: "member",
                    createdBy: username,
                    data: data,
                    team: selectedTeam,
                    createdAt: $.now()
                }];
                createUpdates(update);
                for (let i in data) {
                    records[recordIndex].members[data[i]] = selectedTeam;
                }
                $("#table-container").empty();
                createTeamsTable(records[recordIndex].members);


                $('#studentsDropdown').val(null).trigger('change');


            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                showToast(jqXHR.responseText, 'text-bg-danger', 'An error occured when updating teams');
            },
        });
    }

    function modalButton() {

        $('.addMemberBtn').on('click', function (event) {
            //$("#saveTeams").data('type', 'member');
            $("#teamsModalLabel").text("Add member");

            let index = $('.addMemberBtn').val();
            $("#saveTeams").val(index);
            //$("#pointsDiv").hide();
            //$("#studentsDropdownDiv").show();
            $("#recordModal").modal('show');

            $('#recordModal').on('shown.bs.modal', function () {
                $('.select2').select2({
                    dropdownParent: $('#recordModal') // Specify the modal as the dropdown parent
                });
            });

        });

    }

    function teamEdit() {
        $('.editTeam').on('click', function (event) {
            $('.addPointsBtn').removeAttr('hidden');;
            event.stopPropagation(); // Prevent the click event from propagating to the document
        });

        // Hide the button when clicking outside the input box or the button itself
        /*  $(document).on('click', function (event) {
           if (!$(event.target).closest('#container').length) {
             $('.addPointsBtn').attr('hidden', true);
           }
         }); */

        $('.addPointsBtn').on('click', function (event) {
            $('.addPointsBtn').prop('disabled', true);
            let index = $(this).val(); //record index
            let recordId = records[index].createdAt;
            let points = $("#pointsInput-" + index).val();
            $.ajax({
                method: 'POST',
                url: _config.api.invokeUrl + '/teams',
                headers: {
                    Authorization: authToken,
                },
                data: JSON.stringify({
                    updateType: "points",
                    data: points,
                    recordId: recordId,
                    team: team
                }),
                contentType: 'application/json',
                success: function (response) {
                    let update = [{
                        updateType: "points",
                        createdBy: username,
                        data: points,
                        team: team,
                        createdAt: $.now()
                    }];
                    createUpdates(update);
                    $('.addPointsBtn').prop('disabled', false);
                    $("#pointsInput-" + index).val('');
                    $('.addPointsBtn').attr('hidden', true);
                    $('#recordGraph-0').empty();
                    let graph = graphData(response);
                    $(`#recordGraph-${0}`).append(graph);
                    $('[data-bs-toggle="tooltip"]').tooltip();
                },
                error: function ajaxError(jqXHR, textStatus, errorThrown) {
                    showToast(jqXHR.responseText, 'text-bg-danger', 'An error occured when updating teams');
                },
            });

        });
    }

}(jQuery));
