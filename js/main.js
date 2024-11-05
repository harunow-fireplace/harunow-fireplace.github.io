/*global Harunow _config*/

var Harunow = window.Harunow || {};
Harunow.map = Harunow.map || {};

(function groupScopeWrapper($) {
    const userId = Harunow.UserId;
    const username = Harunow.Username;
    let group = Harunow.Group;
    var $grid = $('.grid').masonry();
    let polls;
    let posts;
    let userType;
    // store holidays
    let holidays = {};

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

    function getSchool() {
        $.ajax({
            method: 'GET',
            url: _config.api.invokeUrl + '/group',
            headers: {
                Authorization: authToken,
            },
            contentType: 'application/json',
            success: async function (response) {
                
                userType = response.user.userType;

                if (response.school.holidays) {
                    holidays = response.school.holidays;
                    renderCalendar(holidays);
                }else{
                    renderCalendar([]);
                }
                $('[data-toggle="tooltip"]').tooltip();
                additionalNav(userType);

                if (!response.user.isApproved) {
                    //loadSetup("waiting-request", `Hmmm, looks like you need to wait for your school to approve your request`);
                    //$("#loadButton").hide();
                    let infoCard = createAlertCard();
                    let $infoCard = $(infoCard);
                    $grid.append($infoCard).masonry('appended', $infoCard);
                    $grid.masonry();
                    return;
                }
                if (userType == "parent") {
                    $("#menu").hide();
                    $("#logout").show();
                } else {
                    $("#logout").hide();
                    $("#menu").show();
                }
                setKeyInfo("alert-info", "Invite students and teachers to join with the key: <b>" + group + "</b>");
                $('#scroll-nav').show();

                let activityCard = createActivityCard(response.posts);
                let $activityCard = $(activityCard);
                $grid.append($activityCard).masonry('prepended', $activityCard);
                $grid.masonry();
                addPost();

                if (response.posts && response.posts.length == 0 && !response.school.poll && !response.school.notes) {
                    addNoPostsNote();
                }
                if (response.poll.length > 0) {
                    polls = response.poll;
                    for (let i = 0; i < polls.length; i++) {
                        createPollCard(polls[i], i, username, userType);
                    }
                    handlePollAction();
                    $(".pollCard").append(`<ul class="list-group list-group-flush align-items-center">
                        <li class="list-group-item"><a href="/votes/" class="link-primary link-offset-2 link-underline-opacity-0 link-underline-opacity-100-hover">VIEW ALL POLLS</a></li>
                    </ul>`);
                    $grid.masonry();
                }

                if (response.albums && response.albums.length > 0) {
                    let albumCard = await createAlbumCard(response.albums);
                    let $albumCard = $(albumCard);
                    $grid.append($albumCard).masonry('appended', $albumCard);
                    $grid.masonry();
                }
                // getTableRecord();

                if (response.notes) {
                    let note = createNote(response.notes[0], username);
                    let $note = $(note);
                    $grid.append($note).masonry('prepended', $note);
                    $grid.masonry();
                }

               
                console.log(response)
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                console.log('An error occured when requesting your unicorn:\n' + jqXHR.responseText);
            },
            complete: function (response) {
                setWelcomeMessage(username, group);
                $("#loadButton").hide();
            }
        });
    }

    function handlePollAction() {
        $('.grid').on('click', '.submitVote', function (event) {
            event.preventDefault();
            // Get the value of the clicked button
            var id = $(this).val();
            var pollId = this.id;
            var selectedValue = $(`input[name=optionsRadios-${pollId}]:checked`).val();
            console.log(selectedValue)
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
                    const $pollCard = $closeButton.closest('.col-lg-4');
                    const $grid = $pollCard.parent().masonry();
                    $grid.masonry('remove', $pollCard).masonry('layout');
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

        getSchool();

        $('#fileInput').on('change', function (event) {
            const files = event.target.files;

            // Get the number of selected files
            const numFiles = files.length;

            // Check if the number of selected files exceeds the limit (10)
            if ((userType == "student" && numFiles > 5) || (userType == "teacher" && numFiles > 10)) {
                alert('You can only select up to 10 files.');
                $('#fileDisplay').empty();

                // Clear the file input
                $(this).val('');
                return;
            }

            // Clear any previous content in the file display element
            $('#fileDisplay').empty();

            // Loop through each selected file
            for (let i = 0; i < numFiles; i++) {
                const file = files[i];

                // Check if the selected file is an image
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();

                    reader.onload = function (e) {
                        let div = $('<div>').addClass('col-sm-3');

                        // Create an image element with the "img-thumbnail" class
                        const img = $('<img>').attr('src', e.target.result).addClass('img-thumbnail img-file-display');
                        div.append(img);
                        // Append the image element to the file display element
                        $('#fileDisplay').append(div);
                    };

                    reader.readAsDataURL(file);
                } else {
                    // Display an error message for non-image files
                    $('#fileDisplay').text('Selected file is not an image.');

                }
            }
        });


    });

    function createActivityCard(posts) {
        let activityCard = `<div class="col-sm-6 col-lg-4 mb-4">
                <div class="card text-center mb-3">
                <div class="card-header">Our Activity</div>
                <div class="card-body">
                    <h2 class="card-title text-purple">${posts.length} POSTS</h2>
                    <p class="card-text">THIS MONTH</p>
                    ${userType !== "parent" ? `<a href="#" class="btn btn-bd-primary" data-bs-toggle="modal" data-bs-target="#postModal"><i class="bi bi-plus-square me-2 mb-2"></i>Add Post</a>` : ""}
                </div>
                <div class="card-footer bg-transparent">
                <a href="/posts/" class="link-purple link-offset-2 link-underline-opacity-0 link-underline-opacity-100-hover">VIEW ALL POSTS</a>
                </div>
                </div>
            </div>`;
        return activityCard;
    }

    async function createAlbumCard(albums) {
        let card = `<div class="col-sm-6 col-lg-4 mb-4">
            <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Latest Album</h5>
                  <div class="row row-cols-3 row-cols-lg-3">`;

        // Create an array of promises for downloading album cover images
        const downloadPromises = albums.map(async (album) => {
            try {
                const imageUrl = await Harunow.downloadFromS3(album.cover);
                return `<div class="col mb-4">
                <a href="/album/index.html?key=${album.key}">
                  <div class="thumbnail">
                    <img src="${imageUrl}" alt="${album.title}" class="img-thumbnail">
                  </div>
                </a>
                <p class="card-text">${album.title}</p>
              </div>`;
            } catch (error) {
                console.error('Error downloading album cover:', error);
                return ''; // Return an empty string if there's an error
            }
        });

        // Wait for all download promises to complete
        const albumCards = await Promise.all(downloadPromises);

        // Concatenate the album cards to the card string
        card += albumCards.join('');

        card += `</div>
                </div>
                </div>
            </div>`;

        return card;
    }

    function addPost() {
        $('#addPost').on('click', async function (event) {
            event.preventDefault();

            $(this).prop('disabled', true);
            const spanElement = $('<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>');
            $(this).prepend(spanElement);

            let inputTitle = $("#titleInput");
            let inputContent = $("#contentInput");

            const title = inputTitle.val();
            const content = inputContent.val();

            const privatePost = $("#privateChecked").prop("checked");
            inputTitle.removeClass("is-invalid");
            inputContent.removeClass("is-invalid");

            if (!validateField(title, inputTitle) || !validateField(content, inputContent)) {
                spanElement.remove();
                $('#addPost').prop('disabled', false);
                return;
            }
            let postData = {
                type: 'new',
                title: title,
                content: content,
                user: {
                    userId: userId,
                    userType: 'student'
                },
                images: [],
                private: privatePost,
                published: true,
            };

            // Get the image element from fileDisplay
            // Get all image elements from fileDisplay
            let imgElements = $('#fileDisplay').find('img');
            let multiple = imgElements.length > 1;


            // Create an array of promises for each image
            const promises = [];

            imgElements.each(function () {
                const img = $(this)[0];

                if (img) {
                    const promise = adjustImageAndUpload(img, multiple, title)
                        .then((adjustedImg) => {
                            postData.images.push(adjustedImg);
                        })
                        .catch((error) => {
                            console.error('Error uploading and resizing image:', error);
                        });

                    promises.push(promise);
                }
            });
            // Wait for all promises to resolve before continuing
            Promise.all(promises)
            .then(() => {
                // Continue with your logic here
                $.ajax({
                method: 'POST',
                url: _config.api.invokeUrl + '/posts',
                headers: {
                    Authorization: authToken,
                },
                data: JSON.stringify(postData),
                contentType: 'application/json',
                success: function (response) {
                    window.location.href = '/posts/'; // Redirect to the login page

                },
                error: function ajaxError(jqXHR, textStatus, errorThrown) {
                    console.error('Error adding post: ', textStatus, ', Details: ', errorThrown);
                    console.error('Response: ', jqXHR.responseText);
                    console.log('An error occured when adding post:\n' + jqXHR.responseText);
                },
                complete: function () {
                    spanElement.remove();
                    $('#addPost').prop('disabled', false);
                }
            });
            })
            .catch((error) => {
                console.error('Error uploading and resizing images:', error);
            });
        });
    }

    function setKeyInfo(type, text) {
        $('#keyInfo').addClass(type);
        $('#keyInfo').html(text);
        $('#keyInfo').show();
    }


    function loadSetup(type, text) {
        //addSchoolButton();
        $('#loadingPosts').hide();
        addNoPostsNote();
        if (type == "waiting-request") {
            setKeyInfo("alert-warning", text);
        }
    }

    $('.logoutButton').on('click', function () {
        Harunow.signOut(); // Call the Harunow.signout function
        window.location.href = '/login'; // Redirect to the login page
    });


    async function adjustImageAndUpload(img) {
        // Define the maximum width and height for the resized image
        const maxWidth = 1600;
        const maxHeight = 1200;

        // Calculate the new dimensions while maintaining the aspect ratio
        let width = img.naturalWidth;
        let height = img.naturalHeight;

        if (width > maxWidth || height > maxHeight) {
            const aspectRatio = width / height;

            if (width > maxWidth) {
                width = maxWidth;
                height = width / aspectRatio;
            }

            if (height > maxHeight) {
                height = maxHeight;
                width = height * aspectRatio;
            }
        }

        // Create a canvas element to draw the resized image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = width;
        canvas.height = height;

        // Draw the resized image onto the canvas
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        // Get the original file name and type from the input file
        const file = $('#fileInput')[0].files[0];
        const fileType = file.type;
        // Convert the canvas content to a Blob

        try {
            // Convert the canvas content to a Blob
            let resizedFile = await new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    let resizedFileName;
                    if (multiple) {
                        resizedFileName = title + "/" + createUuid() + '.' + fileType.split('/')[1];

                    } else {
                        resizedFileName = createUuid() + '.' + fileType.split('/')[1];
                    }
                    const resizedFile = new File([blob], resizedFileName, { type: fileType });
                    resolve(resizedFile);
                }, fileType, 0.8);
            });

            // Upload the resized file to S3
            fileLocation = await Harunow.uploadToS3(resizedFile);
            return fileLocation;

        } catch (error) {
            console.error('Error uploading and resizing image:', error);
            throw error;
        }

    };

    function createUuid() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);;
    }


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
                    createGraph(response[0]);
                }
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                console.log('An error occured when requesting records:\n' + jqXHR.responseText);
            }
        });
    }

    function createGraph(data) {
        //let colTotal = calculateTotal(data.data);
        let highestTotal = -Infinity;

        $.each(data.totals, function (index, item) {
            const currentTotal = item;
            if (currentTotal > highestTotal) {
                highestTotal = currentTotal;
            }
        });

        let chart = `<div class="col-sm-12 col-md-6 mb-4">
        <div class="card border-info">
            <div class="card-body pb-5">
            <div class="row">
                <div class="col">
                    <h5 class="card-title">${data.title}</h5>
                </div>
                ${username == data.createdBy ? `<div class="col-auto">
                <div class="btn-group" role="group" aria-label="Actions buttons">
                    <button type="button" class="btn btn-sm btn-outline-secondary">
                        <i class="bi bi-trash3"></i>
                    </button>
                    </div>
                </div>` : ``}
            </div>
            <ul class="chart container">`;

        $.each(data.totals, function (index, item) {

            var percentage = item / highestTotal * 100;

            var listItem = `<li>
            <span style="height:${percentage}%; ${data.colors && data.colors[index] ? `background:${data.colors[index]};` : `;`}" name="${data.groups[index]}" data-bs-toggle="tooltip" data-bs-title="${item}" class="opacity-75"/></li>`;
            chart += (listItem);
        });
        let date = toLocalDateTime(data.createdAt);
        chart += `</ul>
          </div>
          <div class="card-footer bg-transparent">
                <a href="/teams/" class="link-offset-2 link-underline link-underline-opacity-0">More details</a>
            </div>
        </div>
      </div>`;


        let $chart = $(chart);
        $grid.append($chart).masonry('prepended', $chart);
        $grid.masonry();
        // Initialize tooltips for the new elements
        $('[data-bs-toggle="tooltip"]').tooltip();
    }


    function adjustCardHeight() {
        const $infoCard = $('#notes #infoCard');
        const $cardBody = $infoCard.find('.card-body');

        // Calculate the content height
        const contentHeight = $cardBody.height() + 50;

        // Set the card height
        $infoCard.css('height', contentHeight);
    }



}(jQuery));
