/*global Harunow _config*/

var Harunow = window.Harunow || {};
Harunow.map = Harunow.map || {};

(function groupScopeWrapper($) {
    const post_per_load = 6;
    const userId = Harunow.UserId;
    const username = Harunow.Username;
    const group = Harunow.Group;
    var $grid = $('.grid').masonry();
    let userType;
    let posts;

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


    function addNoPostsNote() {
        var divElement = $('#noPostsDiv');

        var elem = `<img src="../images/IMG_7671.png" class="HarunowImage" alt="bubbles">
        <p>There are no updates</p>`;

        divElement.append(elem);
    }

    function validateField(field, inputField) {

        //remove any previous validation
        if (field == "") {
            inputField.addClass("is-invalid");

            return false;
        }

        return true;
    }

    function showErrorToast(message) {
        var errorToast = $("#errorToast");
        var toastBody = errorToast.find(".toast-body");

        // Set the error message
        toastBody.text(message);

        // Show the toast
        errorToast.toast("show");
    }

    function getSchoolPosts() {
        $.ajax({
            method: 'GET',
            url: _config.api.invokeUrl + '/posts',
            headers: {
                Authorization: authToken,
            },
            contentType: 'application/json',
            success: function (response) {
                userType = response.user.userType;
                if (!response.user.isApproved) {
                    //loadSetup("waiting-request", `Hmmm, looks like you need to wait for your school to approve your request`);
                    //$("#loadButton").hide();
                    let infoCard = createAlertCard();
                    let $infoCard = $(infoCard);
                    $grid.append($infoCard).masonry('appended', $infoCard);
                    $grid.masonry();
                    return;
                }

                addPostButton();
                additionalNav(response.user.userType);
                posts = response.posts;
                createPostCards(response.posts, username, userId, group);
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error getting school posts: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
            },
            complete: function () {
                $('#loadingPosts').hide();
                $("#loadButton").hide();
            }
        });
    }

    $('.logoutButton').on('click', function () {
        Harunow.signOut(); // Call the Harunow.signout function
        window.location.href = '/login'; // Redirect to the login page
    });

    // Register click handler for #request button
    $(function onDocReady() {
        getSchoolPosts();

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


    // Track whether more posts can be loaded
    let canLoadMore = true;

    // Track the current page of loaded posts
    let currentPage = 1;

    // Flag to prevent multiple simultaneous load more requests
    let loadingMore = false;

    // Function to handle scroll events
    function handleScroll() {
        // Check if the user has scrolled to the bottom of the page
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200) {
            // Load more posts if more can be loaded and not already loading
            if (canLoadMore && !loadingMore) {
                console.log("canLoadMore" + canLoadMore + "loadingMore" + loadingMore)
                loadingMore = true;
                loadMorePosts();
                loadingMore = false;
            }
        }
    }

    // Attach the scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Function to load more posts
    function loadMorePosts() {
        // Your loading logic goes here
        // Increment currentPage and call your function to fetch and display more posts
        currentPage++;
        fetchMorePosts();
    }

    // Your existing function modified to fetch and append more posts
    function createPostCards(results, username, userId, group) {
        const $grid = $('.grid').masonry({
            percentPosition: true,
        });

        const maxPosts = Math.min(results.length, currentPage * post_per_load); // Limit to 10 posts per page
        const items = results.slice((currentPage - 1) * post_per_load, maxPosts); // Get posts for the current page

        var postCard;
        let postIndex = (currentPage - 1) * post_per_load;

        for (let i = 0; i < maxPosts; i++) {
            const item = items[i];
            if (!item) {
                // Skip processing if item is undefined
                continue;
            }
            postCard = createPostCard(item, username, item.images, postIndex, userType);
            let $postCard = $(postCard);
            $grid.append($postCard).masonry('appended', $postCard);

            if (item.images && item.images.length == 1) {
                Harunow.downloadFromS3(item.images[0])
                    .then(function (imageUrl) {
                        if (imageUrl == "") {
                            $(`#img-${item.id}`).remove(); // TODO: Remove till can find placeholder

                        } else {
                            $(`#img-${item.id}`).attr("src", imageUrl);
                        }
                        $grid.imagesLoaded().progress(function () {
                            $grid.masonry('layout');
                        });
                    })
                    .catch(function (error) {
                        console.error('Error downloading image:', error);
                    });
            } else if (item.images && item.images.length > 1) {
                for (let i = 0; i < item.images.length; i++) {
                    Harunow.downloadFromS3(item.images[i])
                        .then(function (imageUrl) {
                            if (imageUrl == "") {
                                $(`#img-${item.id}-${i}`).remove(); // TODO: Remove till can find placeholder

                            } else {
                                $(`#img-${item.id}-${i}`).attr("src", imageUrl);
                            }
                            $grid.imagesLoaded().progress(function () {
                                $grid.masonry('layout');
                            });
                        })
                        .catch(function (error) {
                            console.error('Error downloading image:', error);
                        });
                }
            }
            postIndex++;
        }

        $grid.masonry();

        handleEditDeletePost(group, userId);

        // Check if there are more posts available
        if (results.length <= currentPage * post_per_load) {
            canLoadMore = false;
        }
    }

    // Function to fetch more posts from the server
    function fetchMorePosts() {
        // Your logic to fetch more posts (e.g., AJAX request)
        // Once you receive the new posts data, call createPostCards with the new results
        // For demonstration, let's assume newResults is an array of post objects
        // Fetch new results using your method
        createPostCards(posts, username, userId, group);
    }



    function addPostButton() {

        if (userType == "parent") {
            return;
        }
        var divElement = $('#postAction');

        var buttonElement = $('<button>');
        buttonElement.text('Add Post');
        buttonElement.attr('id', 'addPostButton');
        buttonElement.attr('data-bs-toggle', 'modal');
        buttonElement.attr('data-bs-target', '#postModal');
        buttonElement.attr('class', 'btn btn-bd-primary py-2 d-flex align-items-center')
        buttonElement.prepend(`<i class="bi bi-plus-square me-2 mb-2"></i>`);
        divElement.append(buttonElement);

        //Update post modal
        $('#addPostButton').on('click', function (event) {
            //Clear values
            $("#postModalFooter").empty();
            $("#fileDisplay").empty();
            $("#titleInput").val("");
            $("#contentInput").val("");

            $("#fileDisplay").show();
            $("#fileInput").show();
            $("#postModalTitle").text('Add Post');

            var postButton = $('<button>');
            postButton.attr('id', 'addPost');
            postButton.attr('class', 'btn btn-primary');
            postButton.text("Add")
            $("#postModalFooter").append(postButton);

            // Add event listener to the button that adds post
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
                        userType: userType
                    },
                    images: [],
                    private: privatePost
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
                                console.log(response.item)
                                posts.push(response.item);
                                $('#postModal').modal('hide');
                                $("#titleInput").val("");
                                $("#contentInput").val("");
                                //Add card
                                let postCard = createPostCard(posts[posts.length - 1], username, posts[posts.length - 1].images, posts.length - 1, userType);
                                let $postCard = $(postCard);
                                $grid.append($postCard).masonry('prepended', $postCard);
                                if (response.item.images && response.item.images.length == 1) {
                                    Harunow.downloadFromS3(response.item.images[0])
                                        .then(function (imageUrl) {
                                            $(`#img-${response.item.id}`).attr("src", imageUrl);
                                            $grid.imagesLoaded().progress(function () {
                                                $grid.masonry('layout');
                                            });
                                        })
                                        .catch(function (error) {
                                            console.error('Error downloading image:', error);
                                        });

                                } else if (response.item.images && response.item.images.length > 1) {
                                    for (let i = 0; i < response.item.images.length; i++) {
                                        Harunow.downloadFromS3(response.item.images[i])
                                            .then(function (imageUrl) {
                                                if (imageUrl == "") {
                                                    $(`#img-${response.item.id}-${i}`).remove(); // TODO: Remove till can find placeholder

                                                } else {
                                                    $(`#img-${response.item.id}-${i}`).attr("src", imageUrl);
                                                }
                                                $grid.imagesLoaded().progress(function () {
                                                    $grid.masonry('layout');
                                                });
                                            })
                                            .catch(function (error) {
                                                console.error('Error downloading image:', error);
                                            });
                                    }
                                }
                                handleEditDeletePost(group, userId);
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
        });

    };

    $('.btn-close').on('click', function () {
        $('#postModalFooter').empty();
    });

    async function adjustImageAndUpload(img, multiple, title) {
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

    let editDeletePostLoaded = false;

    function handleEditDeletePost(group, userId) {

        function bindButtonEvents() {
            $('.deletePost').on('click', function (event) {
                event.preventDefault();

                const $deleteButton = $(this);
                $deleteButton.prop('disabled', true);

                const spanElement = $('<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>');
                $deleteButton.prepend(spanElement);

                const targetId = event.target.value;
                let id = event.target.id;
                id = id.replace("delete-", "");
                $.ajax({
                    method: 'POST',
                    url: _config.api.invokeUrl + '/posts',
                    headers: {
                        Authorization: authToken,
                    },
                    data: JSON.stringify({
                        type: "delete",
                        groupKey: group,
                        id: id,
                        userId: userId
                    }),
                    contentType: 'application/json',
                    success: function (response) {
                        $('#deleteModal-' + targetId).modal('hide');

                        // Remove the Masonry card from the grid
                        const $postCard = $deleteButton.closest('.col-lg-4');
                        const $grid = $postCard.parent().masonry();
                        $grid.masonry('remove', $postCard).masonry('layout');
                    },
                    error: function ajaxError(jqXHR, textStatus, errorThrown) {
                        console.error('Error deleting post: ', textStatus, ', Details: ', errorThrown);
                        console.error('Response: ', jqXHR.responseText);
                        showErrorToast('Error deleting post:\n' + jqXHR.responseText);
                    },
                    complete: function () {
                        $deleteButton.prop('disabled', false);
                        spanElement.remove();
                    }
                });
            });



            $('.editPostButton').on('click', function (event) {
                var i = $(this).val();
                $("#fileDisplay").hide();
                $("#fileInput").hide();

                $("#postModalTitle").text('Edit: ' + posts[i].title);
                $("#titleInput").val(posts[i].title);
                $("#contentInput").val(posts[i].content);

                $("#postModalFooter").empty();
                var postButton = $('<button>');
                postButton.attr('id', "edit-" + i);
                postButton.attr('value', posts[i].createdAt);
                postButton.attr('class', 'editPost btn btn-primary');
                postButton.text("Update")
                $("#postModalFooter").append(postButton);

                $('.editPost').on('click', function (event) {
                    event.preventDefault();

                    $(this).prop('disabled', true);
                    const spanElement = $('<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>');
                    $(this).prepend(spanElement);
                    let postId = event.target.id;
                    let postIndex = postId.replace("edit-", "");
                    let id = $(this).val();
                    const title = $("#titleInput").val();
                    const content = $("#contentInput").val();

                    $.ajax({
                        method: 'POST',
                        url: _config.api.invokeUrl + '/posts',
                        headers: {
                            Authorization: authToken,
                        },
                        data: JSON.stringify({
                            type: "edit",
                            id: id,
                            title: title,
                            content: content
                        }),
                        contentType: 'application/json',
                        success: function (response) {
                            const updatedAt = toLocalDateTime(response.item.updatedAt);
                            $('#postModal').modal('hide');
                            //update card
                            $("#cardTitle-" + postIndex).text(title);
                            $("#cardContent-" + postIndex).text(content);
                            $("#updatedAt-" + postIndex).text(updatedAt);

                            //update post var
                            posts[i].title = title;
                            posts[i].content = content;
                            $('#postModalFooter').empty();
                        },
                        error: function ajaxError(jqXHR, textStatus, errorThrown) {
                            console.error('Error editing post: ', textStatus, ', Details: ', errorThrown);
                            console.error('Response: ', jqXHR.responseText);
                            showErrorToast('An error occured when editing post:\n' + jqXHR.responseText);

                        },
                        complete: function () {
                            spanElement.remove();
                            $(this).prop('disabled', false);
                        }
                    });
                });
            });

            $('.commentsButton').on('click', function (event) {
                var index = $(this).val();
                if (userType == "parent") {
                    $("#commentContainer").hide();
                }

                $("#commentsList").empty();
                $("#commentsModalTitle").text('Comments: ' + posts[index].title);

                createComments(posts[index].comments, index);

                //set value of post index to comments button
                $("#addComment").val(index);

                handleDeleteComment();


            });

            $('.likeButton').on('click', function (event) {
                var index = $(this).val();
                let id = posts[index].createdAt;
                console.log(id);
                //like
                if ($(this).hasClass("btn-outline-secondary")) {
                    $(this).removeClass("btn-outline-secondary");
                    $(this).addClass("btn-outline-harunow");
                    addUsernameToLikes(index);
                    //delete holidays[dataValue]; // Remove the holiday
                } else { //unlike
                    $(this).removeClass("btn-outline-harunow");
                    $(this).addClass("btn-outline-secondary");
                    deleteUsernameFromLikes(index);
                    //holidays[dataValue] = ["holiday"]; // Mark as a holiday
                }
                let count = getLikeCount(index) > 0 ? getLikeCount(index) : "";
                $(`#pl-${index}`).text(count);

                $.ajax({
                    method: 'POST',
                    url: _config.api.invokeUrl + '/like',
                    headers: {
                        Authorization: authToken,
                    },
                    data: JSON.stringify({ id: id }),
                    contentType: 'application/json',
                    success: function (response) {
                        console.log(response);
                    },
                    error: function ajaxError(jqXHR, textStatus, errorThrown) {
                        console.error('Error adding like: ', textStatus, ', Details: ', errorThrown);
                        console.error('Response: ', jqXHR.responseText);
                        showErrorToast('An error occured when adding comment:\n' + jqXHR.responseText);

                    },
                    complete: function () {
                        //$("#commentTextarea").val("");
                        //spanElement.remove();
                        //$("#addComment").prop('disabled', false);
                    }
                });

            });

        }
        function unbindButtonEvents() {
            $('.deletePost').off('click');
            $('.editPostButton').off('click');
            $('.commentsButton').off('click');
            $('.likeButton').off('click');
        }

        function loadHandleEditDeletePost() {
            if (!editDeletePostLoaded) {
                bindButtonEvents();
                editDeletePostLoaded = true;
            }
        }

        if (currentPage - 1 === 0) {
            loadHandleEditDeletePost();
        } else {
            unbindButtonEvents();
            editDeletePostLoaded = false;
            loadHandleEditDeletePost();
        }
    }

    

    // Add a username to the list
    function addUsernameToLikes(index) {
        if (!posts[index].likes) {
            posts[index].likes = {}; // Create a likes object if it doesn't exist
        }
        posts[index].likes[username] = true; // Add the username to the list
    }

    // Delete a username from the list
    function deleteUsernameFromLikes(index) {
        if (posts[index].likes && posts[index].likes[username]) {
            delete posts[index].likes[username]; // Delete the username from the list
        }
    }

    function getLikeCount(index) {
        if (posts[index].likes) {
            return Object.keys(posts[index].likes).length;
        } else {
            return ""; // If there are no likes, return 0
        }
    }

    function handleDeleteComment() {
        $(".deleteComment").on('click', function (event) {
            let commentId = $(this).attr('commentId');
            let postId = $(this).val();
            let commentIndex = $(this).attr('data-index');
            let postIndex = $(this).attr('index');
            $(this).prop('disabled', true);

            let commentObj = {
                type: "Post",
                postId: postId,
                commentId: commentId
            }
            $.ajax({
                method: 'DELETE',
                url: _config.api.invokeUrl + '/comment',
                headers: {
                    Authorization: authToken,
                },
                data: JSON.stringify(commentObj),
                contentType: 'application/json',
                success: function (response) {
                    $("#comment-" + commentIndex).remove();

                    if (posts[postIndex].comments.length === 0) {
                        $("#cc-" + postIndex).remove();
                    } else {
                        $("#cc-" + postIndex).text($("#cc-" + postIndex).text() - 1);
                    }
                },
                error: function ajaxError(jqXHR, textStatus, errorThrown) {
                    console.error('Error deleting comment: ', textStatus, ', Details: ', errorThrown);
                    console.error('Response: ', jqXHR.responseText);
                    showErrorToast('An error occured when deleting comment:\n' + jqXHR.responseText);

                },
                complete: function () {
                    $(this).prop('disabled', false);
                }
            });


        });
    }

    function createComments(comments, index) {
        if (comments && comments.length > 0) {
            for (let i = 0; i < comments.length; i++) {
                let comment = createComment(comments[i], posts[index].createdAt, index, i);
                $("#commentsList").prepend(comment);
            }
        }
    }

    function createComment(comment, postId, postIndex, commentIndex) {
        let item = `<div id="comment-${commentIndex}" class="list-group-item list-group-item-action">
                    <div class="d-flex w-100 justify-content-between">
                      <h5 class="mt-2">${capitalize(comment.createdBy)}</h5>
                      ${comment.createdBy == username ? `<button type="button" commentId="${comment.createdAt}" value="${postId}" index="${postIndex}" data-index="${commentIndex}" class="deleteComment btn btn-sm btn-outline-danger mt-2">
                      <i class="bi bi-trash3"></i>
                  </button>` : ""}
                    </div>
                    <p class="mb-1">${comment.comment}</p>
                    <small class="text-body-secondary">${toLocalDateTime(comment.createdAt)}</small>
                  </div>`;

        return item;
    }

    $('#addComment').on('click', function (event) {
        var index = $(this).val();
        let id = posts[index].createdAt;
        let comment = $("#commentTextarea").val();

        $(this).prop('disabled', true);
        const spanElement = $('<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>');
        $(this).prepend(spanElement);

        if (!validateField(comment, $("#commentTextarea"))) {
            spanElement.remove();
            $('#addComment').prop('disabled', false);
            return;
        }
        $('#commentTextarea').removeClass("is-invalid");
        let commentObj = {
            type: "Post",
            id: id,
            comment: comment
        }
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/comment',
            headers: {
                Authorization: authToken,
            },
            data: JSON.stringify(commentObj),
            contentType: 'application/json',
            success: function (response) {
                if (!Array.isArray(posts[index].comments)) {
                    // If 'comments' is not an array, initialize it as an empty array
                    posts[index].comments = [];
                }

                //add comments to post
                posts[index].comments.push(response);
                //add to list
                $("#commentsList").prepend(createComment(response, posts[index].createdAt, index, posts[index].comments.length - 1));
                let countText = $("#cc-" + index).text();
                if (countText) {
                    let count = parseInt(countText);
                    $("#cc-" + index).text(count + 1);
                } else {
                    $("#ichat-" + index).append(`<span id="cc-${index}" class="badge text-dark">1</span>`);
                }
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error adding comment: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                showErrorToast('An error occured when adding comment:\n' + jqXHR.responseText);

            },
            complete: function () {
                $("#commentTextarea").val("");
                spanElement.remove();
                $("#addComment").prop('disabled', false);
            }
        });
    });

}(jQuery));
