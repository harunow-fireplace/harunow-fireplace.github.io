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

    function getSchoolAlbum() {
        $.ajax({
            method: 'GET',
            url: _config.api.invokeUrl + '/album',
            headers: {
                Authorization: authToken,
            },
            contentType: 'application/json',
            success: function (response) {
                createAlbum(response.albums);
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error getting school pictures: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
            },
            complete: function () {
                $('#loadingPosts').hide();
                $("#loadButton").hide();
            }
        });
    }

    // Register click handler for #request button
    $(async function onDocReady() {
        // Get the query string from the current URL
        var queryString = window.location.search;

        // Create a URLSearchParams object to parse the query string
        var searchParams = new URLSearchParams(queryString);

        // Check if the "paramName" parameter exists in the query string
        if (searchParams.has("key")) {
            var paramValue = searchParams.get("key");
            //getAlbumPictures(paramValue);
            getAlbum(paramValue);
        } else {
            // The parameter does not exist in the query string
            getSchoolAlbum();
        }

    });


    function createAlbum(albums) {
        $.each(albums, function (index, album) {
            Harunow.downloadFromS3(album.cover)
                .then(function (imageUrl) {
                    let albumCard = `<div class="col-sm-6 col-lg-4 mb-4 ">
                    <a href="/album/index.html?key=${album.key}">
                        <div class="card shadow-sm text-light d-flex flex-column">
                            <img src="${imageUrl}" class="card-img" alt="${album.title}">
                            <div class="card-img-overlay d-flex flex-column justify-content-end">
                                <h5 class="card-title">${album.title}</h5>
                                <div class="card-text mb-0"> <!-- Use 'mt-auto' to align content at the bottom -->
                                    <small></small>
                                </div>
                            </div>
                        </div>
                    </a>
                </div>`;
                    let $albumCard = $(albumCard);
                    $grid.append($albumCard).masonry('appended', $albumCard);
                    $grid.masonry();

                })
                .catch(function (error) {
                    console.error('Error downloading image:', error);
                });



        });
    }

    let photos = []; // Initialize an empty array for photos
    let initialLoadComplete = false;

    // Keep track of loaded picture keys
    const loadedPictureKeys = new Set();

    function getAlbum(key){
        $.ajax({
            method: 'GET',
            url: _config.api.invokeUrl + '/album/pictures?key=' + key,
            headers: {
                Authorization: authToken,
            },
            contentType: 'application/json',
            success: function (response) {
                photos = response.slice(1);
                loadMorePictures();
                // Mark the initial load as complete
                initialLoadComplete = true;
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error getting school pictures: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
            },
            complete: function () {
            }
        });
    }

    let totalCount = 0; // Total count of loaded pictures

    let currentIndex = 0; // Initialize the current index
    $(document).on('click', '.btn', function () {
        const imgSrc = $(this).closest('button').find('img').attr('src');
        const index = $(this).closest('button').find('img').data('index');
        currentIndex = index;

        $('#largeImage').attr('src', imgSrc);
        //$("#img_no").value = index;
    });

    // Handle Next button click
    $(document).on('click', '#nextButton', function () {
        // Move to the next image (circular)
        currentIndex = (currentIndex + 1) % loadedCount;

        // Get the source of the next image
        let src = $(`#img-${currentIndex}`).attr('src');

        // Update the large image
        $('#largeImage').attr('src', src);

        // Check if we've reached the end of the loaded pictures
        if (currentIndex === loadedCount - 1 && currentIndex < photos.length - 1) {
            // Load more pictures when we reach the end (if more are available)
            loadMorePictures();
        }
    });

    // Handle Next button click
    $(document).on('click', '#prevButton', function () {
        currentIndex = (currentIndex - 1 + totalCount) % totalCount; // Move to the previous image (circular)
        let src = $(`#img-${currentIndex}`).attr('src');
        $('#largeImage').attr('src', src);
    });

    $('.logoutButton').on('click', function () {
        Harunow.signOut(); // Call the Harunow.signout function
        window.location.href = '/login'; // Redirect to the login page
    });

    let loading = false; // Track if loading is in progress
    const batchSize = 9; // Number of pictures to load in each batch
    let loadedCount = 0;
    function loadMorePictures() {
        if (!loading) {
            loading = true;

            const startIndex = totalCount;
            const endIndex = startIndex + batchSize;

            const photosToLoad = photos
                .slice(startIndex, endIndex);
            // Check if there are more photos to load
            if (photosToLoad.length > 0) {
                photosToLoad.forEach((photo, index) => {
                    Harunow.downloadFromS3(photo)
                        .then(function (photoUrl) {
                            let image = `<div class="col-sm-6 col-lg-4 mb-4"><button type="button" class="btn" data-bs-toggle="modal" data-bs-target="#exampleModal"><img class="img-thumbnail" id="img-${loadedCount}" data-index="${loadedCount}" src="${photoUrl}" alt="${photo}" /></button></div>`;
                            let $image = $(image);
                            loadedCount++;
                            loadedPictureKeys.add(photo); // Add the loaded photo key
                            $grid.append($image).masonry('appended', $image);
                            $grid.masonry();
                        })
                        .catch(function (error) {
                            console.error('Error downloading image:', error);
                        });
                });

                totalCount += photosToLoad.length;
            } else {
                // No more photos to load
                console.log('No more photos to load.');
            }
            // Hide the loading icon when loading is complete

            loading = false; // Reset the loading flag
        }
    }


    let scrollTimeout;

    window.addEventListener('scroll', function () {
        clearTimeout(scrollTimeout);
        // Show the loading icon
        scrollTimeout = setTimeout(function () {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
                loadMorePictures();
            }
        }, 100); // Adjust the debounce delay as needed
        // Show the loading icon
    });




}(jQuery));

