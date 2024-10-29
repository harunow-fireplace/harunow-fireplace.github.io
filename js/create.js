/*global Harunow _config*/

var Harunow = window.Harunow || {};
Harunow.map = Harunow.map || {};

(function groupScopeWrapper($) {
    const userId = Harunow.UserId;
    const username = Harunow.Username;
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


    // Create a table element
    var table = $('<table>').addClass('table');

    // Initial row and column counts
    var rowCount = 1;
    var colCount = 2;

    // 2D array to store the table data
    var names = [];
    var tableData = [];
    var total = [];

    // Register click handler for #request button
    $(function onDocReady() {
        getUser();
        let selected = $("#createOptions").val();
        setVisibility(selected);

        // Initialize the tableData array with empty values
        initializeTableData(selected);
        updateTable();

        // Create the buttons
        var columnButton = $('<button class="btn btn-secondary mx-2">').text('Add Column').click(increaseColumn);
        var rowButton = $('<button class="btn btn-secondary px-4 mx-2">').text('Add Row').click(increaseRow);

        // Append the table and buttons to the document body
        $('#table').append(table, rowButton, columnButton);
        
    });

    function getUser() {
        $.ajax({
            method: 'GET',
            url: _config.api.invokeUrl + '/users/' + username,
            headers: {
                Authorization: authToken,
            },
            contentType: 'application/json',
            success: function (response) {
                if (response.userType !== "teacher") {
                    window.location.href = '/';
                }
                userType = response.userType;
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting user: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                console.log('An error occured when requesting user:\n' + jqXHR.responseText);
            }
        });
    }

    function setVisibility(selected) {

        if (selected == "notes") {
            $("#descriptionArea").hide();
            $("#tableArea").hide();
            $("#graphPreview").hide();
            $("#pollPreview").hide();
            $("#notesPreview").show();
            $("#listArea").show();
            $("#tagPreview").hide();
        } else if (selected == "poll") {
            $("#descriptionArea").show();
            $("#tableArea").hide();
            $("#graphPreview").hide();
            $("#pollPreview").show();
            $("#notesPreview").hide();
            $("#listArea").show();
            $("#tagPreview").hide();
        } if (selected == "graph") {
            $("#descriptionArea").hide();
            $("#tableArea").show();
            $("#graphPreview").show();
            $("#pollPreview").hide();
            $("#notesPreview").hide();
            $("#listArea").hide();
            $("#tagPreview").hide();
        }if (selected == "tag") {
            $("#descriptionArea").hide();
            $("#tableArea").hide();
            $("#graphPreview").hide();
            $("#pollPreview").hide();
            $("#notesPreview").hide();
            $("#listArea").hide();
            $("#tagPreview").show();
        }
    }

    $('#titleInput').on('input', function () {
        var title = $(this).val();
        $('.card-title').text(title);

        $('.badge').text(title);
    });

    $('#descriptionInput').on('input', function () {
        var description = $(this).val();
        $('#pollDescription').text(description);
    });

    $('#createOptions').on('change', function () {
        let selected = $("#createOptions").val();

        setVisibility(selected);

    });

    function createGraph() {
        var list = $("#chartPreview");
        list.empty();
        let highestCount = -Infinity;

        for (let i = 0; i < total.length; i++) {
            const currentTotal = parseInt(total[i], 10);
            if (!isNaN(currentTotal) && currentTotal > highestCount) {
                highestCount = currentTotal;
            }
        }
        for (let i = 0; i < total.length; i++) {
            var percentage = total[i] / highestCount * 100;
            var listItem = $(`<li>
            <span id="option0" style="height:${percentage}%" name="${names[i]}" title="${total[i]}" >`);

            list.append(listItem);
        }
    }

    // Function to update the table structure
    function updateTable() {
        // Clear the existing table structure
        table.empty();
        var row = $('<tr>');
        for (var j = 0; j < colCount; j++) {
            let col = $(`<td id="n${j}"><input class="form-control text-center" type="text" placeholder="Name/Title" aria-label="Example - name of group" value="${names[j]}">`);
            row.append(col);

        }
        table.append(row);

        for (var i = 0; i < rowCount; i++) {
            var row = $('<tr>');
            for (var j = 0; j < colCount; j++) {
                var col = $(`<td id=${i}${j}><input class="form-control text-center" type="text" placeholder="0" aria-label="Enter number" value="${tableData[i][j]}">`);

                row.append(col);
            }
            table.append(row);
        }
        var row = $('<tr id="totalRow">');

        for (var j = 0; j < colCount; j++) {
            let col = $(`<td><input id="t${j}" class="form-control text-center" type="text" placeholder="Total" aria-label="Sum of rows" disabled>`);

            row.append(col);
        }
        table.append(row);

        // Add input event listeners to the input elements in the table
        $('#table').on('input', 'input', function () {
            var cellId = $(this).parent().attr('id');
            var rowIndex = cellId.charAt(0);
            var colIndex = parseInt(cellId.charAt(1));

            var newValue = $(this).val();

            if (rowIndex === "n") {
                names[colIndex] = newValue;
            } else {
                if (!isNaN(newValue)) {
                    tableData[rowIndex][colIndex] = parseInt(newValue);
                } else {
                    // Handle cases where newValue is not a valid number (e.g., empty input or non-numeric input)
                    tableData[rowIndex][colIndex] = 0;
                }
            }

            updateTotal();
        });
    }

    // Function to update the total row
    function updateTotal() {
        for (var j = 0; j < colCount; j++) {
            total[j] = 0;
            for (var i = 0; i < rowCount; i++) {
                total[j] += parseInt(tableData[i][j]);
            }
        }

        var totalRow = $('#totalRow');

        for (var j = 0; j < colCount; j++) {
            totalRow.find(`td input#t${j}`).val(total[j]);
        }

        // Update the graph with the new totals
        createGraph();
    }

    // Function to handle increasing the column count
    function increaseColumn() {
        // If the colCount is already 2, return as we don't want to exceed 2 columns
        if (colCount > 4) {
            return;
        }
        names[colCount] = "Group " + (colCount);

        // Increase the colCount by 1
        colCount++;
        // Update the data in each existing row with an empty string for the new column
        for (var i = 0; i < rowCount; i++) {
            tableData[i].push(0);
        }
        // Update the table structure with the new column
        updateTable();
    }

    // Function to handle increasing the row count
    function increaseRow() {
        // Increase the rowCount by 1
        rowCount++;

        // Initialize a new array to represent the new row data
        var newRowData = [];
        for (var j = 0; j < colCount; j++) {
            newRowData.push(0);
        }

        // Add the new row data to the end of the tableData array
        tableData.push(newRowData);

        // Update the table structure with the new row
        updateTable();
    }

    function initializeTableData() {
        for (let i = 0; i < rowCount; i++) {
            let row = [];
            for (let j = 0; j < colCount; j++) {
                if (i == 0) {
                    names[j] = "Group " + j;
                }
                row.push(0);
            }
            tableData.push(row);
        }
    }
    var itemsList = [];

    $("#addItem").on('click', function () {
        // Get table
        var table = $("#list");

        var row = $(`<tr><td><input class="form-control text-center item-input" type="text"></td></tr>`);

        // Append the row to the table
        table.append(row);

        // Find the input field within the newly added row
        var inputField = row.find(".item-input");

        // Add an "input" event listener to the input field
        inputField.on("input", function () {
            // When the input value changes, add/update the value in the itemsList array
            var value = $(this).val();
            var rowIndex = $(this).closest("tr").index();
            itemsList[rowIndex] = value;

            setPreview(itemsList);
        });
    });

    function setPreview(listItems) {
        $("#notesList").empty();
        $("#pollCard").empty();

        let selected = $("#createOptions").val();
        let list = "";

        for (let i = 0; i < listItems.length; i++) {
            //row for notes
            let item;
            if (selected == "notes") {
                item = `<tr>
                    <th scope="row" class="icon-width"><i class="bi bi-stars icon-yellow"></i></th>
                    <td>${listItems[i]}</td>
                </tr>`;
            } else if (selected == "poll") {
                item = `<div class="form-check">
                <input class="form-check-input" type="radio" name="optionsRadios" id="option-${i}"
                    value="${listItems[i]}">
                <label class="form-check-label" for="option-${i}">${listItems[i]}</label>
            </div>`;
            }
            list += item;
        }

        if (selected == "notes") {
            $("#notesList").append(list);
        } else if (selected == "poll") {
            $("#pollCard").append(list);
        }
    }

    $("#saveButton").on('click', function () {
        let selected = $("#createOptions").val();
        let title = $("#titleInput");
        let item = {};
        if (!validateField(title.val(), title)) {
            return;
        }
        item.title = title.val();
        if (selected == "graph") {
            item.groups = names;
            item.data = tableData;
            item.totals = total;
            addGraph(item, "bar chart")

        } else if (selected == "notes") {
            item.list = itemsList;
            addList(item, selected)
        }
        else if (selected == "poll") {
            let description = $("#descriptionInput");
            if (!validateField(description.val(), description)) {
                return;
            }
            item.description = description.val();
            item.options = itemsList;
            addPoll(item);
        }
        else if (selected == "tag") {
            if (!validateField(title.val(), title)) {
                return;
            }
            if ($('.badge.selected').length > 0) {
                item.color = $('.badge.selected').attr('id');
            } else {
                item.color = "text-bg-blue";
            }
           
            console.log(item.color);
            addTag(item);
        }
    });

    function addTag(item) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/group/details',
            headers: {
                Authorization: authToken,
            },
            data: JSON.stringify({
                type: "new",
                title: item.title,
                color: item.color,
                userType: userType,
            }),
            contentType: 'application/json',
            success: function (response) {
                console.log(response);
                window.location.href = '/';
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                showToast(jqXHR.responseText, 'text-bg-danger', 'An error occured when creating tag');
            },
        });
    }

    function addPoll(item) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/poll',
            headers: {
                Authorization: authToken,
            },
            data: JSON.stringify({
                type: "new",
                title: item.title,
                content: item.description,
                userType: userType,
                options: item.options
            }),
            contentType: 'application/json',
            success: function (response) {
                //add vote to poll.votes
                console.log(response);
                window.location.href = '/';
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                showToast(jqXHR.responseText, 'text-bg-danger', 'An error occured when creating poll');
            },
        });
    }

    function addGraph(item, type) {
        console.log(item);
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/records',
            headers: {
                Authorization: authToken,
            },
            data: JSON.stringify({
                type: type,
                title: item.title,
                userType: userType,
                groups: item.groups,
                data: item.data,
                totals: item.totals
            }),
            contentType: 'application/json',
            success: function (response) {
                //add vote to poll.votes
                console.log(response);
                window.location.href = '/';
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                showToast(jqXHR.responseText, 'text-bg-danger', 'An error occured when creating poll');
            },
        });
    }

    function addList(item, type) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/list',
            headers: {
                Authorization: authToken,
            },
            data: JSON.stringify({
                type: type,
                title: item.title,
                userType: userType,
                list: item.list
            }),
            contentType: 'application/json',
            success: function (response) {
                //add vote to poll.votes
                console.log(response);
                window.location.href = '/';
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                showToast(jqXHR.responseText, 'text-bg-danger', 'An error occured when creating poll');
            },
        });
    }

    $('#multiplefileupload').on('change', function (event) {
        const files = event.target.files;
        const $fileDisplay = $('#fileDisplay'); // Cache the file display element

        // Clear any previous content in the file display element
        $fileDisplay.empty();

        $.each(files, function (index, file) {
            const reader = new FileReader();

            reader.onload = function (e) {
                // Create an image element
                const img = $('<img>').attr('src', e.target.result);

                // Append the image element to the file display element
                $fileDisplay.append(img);
            };

            reader.readAsDataURL(file);
        });

    });

    // Add event listener to the button that adds post
    $('#addAlbum').on('click', async function (event) {
        event.preventDefault();
        console.log("here");

        let files = $('#fileDisplay img');
        $.each(files, async function (index, file) {
            console.log(file);
            try {
                await adjustImageAndUpload(file, index);
            } catch (error) {
                console.error('Error uploading and resizing image:', error);
            }
        });
    });

    $('.badge').click(function() {
        // Remove 'selected' class from all badges
        $('.badge').removeClass('selected');
        
        // Add 'selected' class to the clicked badge
        $(this).addClass('selected');
    });

    async function adjustImageAndUpload(img, index) {
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
    
        // Extract the file extension from the name
        const filename = $('#multiplefileupload')[0].files[index].name;
        const fileExtension = filename.split('.').pop();
        const fileType = `image/${fileExtension}`;
    
        // Convert the canvas content to a Blob
        try {
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
            const fileLocation = await Harunow.uploadToS3(resizedFile);
            console.log(filename);
            return fileLocation;
        } catch (error) {
            console.error('Error uploading and resizing image:', error);
            throw error;
        }
    }
    

}(jQuery));
