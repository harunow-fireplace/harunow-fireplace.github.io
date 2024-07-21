$(function onDocReady() {
    $('[data-bs-toggle="tooltip"]').tooltip();
    $('#rsvpForm').submit(handleRSVP);

    var $scrollLeft = $('#scrollLeft');
  var $scrollRight = $('#scrollRight');
  var $rowInner = $('.gallery-row');

  // Get the width of a tile and the margin between tiles
  var tileWidth = $('.tile').outerWidth(true); // Includes margin
  console.log('Tile width:', tileWidth); // Debugging purpose

  $scrollLeft.on('click', function() {
    var currentScroll = $rowInner.scrollLeft();
    var newScroll = Math.max(0, currentScroll - tileWidth); // Ensure it doesn’t scroll past the start
    $rowInner.animate({
      scrollLeft: newScroll
    }, 450);
  });

  $scrollRight.on('click', function() {
    var currentScroll = $rowInner.scrollLeft();
    var maxScroll = $rowInner.prop('scrollWidth') - $rowInner.width();
    var newScroll = Math.min(maxScroll, currentScroll + tileWidth); // Ensure it doesn’t scroll past the end
    $rowInner.animate({
      scrollLeft: newScroll
    }, 450);
  });
    
});

$('#copy-address').on('click', function () {
    // Get the text to copy
    var textToCopy = $('#copy-address').text();

    // Use the Clipboard API to copy text
    navigator.clipboard.writeText(textToCopy).then(function () {
        // Success callback
        var tooltip = bootstrap.Tooltip.getInstance('#copy-address'); // Get the tooltip instance
        tooltip.setContent({ '.tooltip-inner': 'Copied!' }); // Update tooltip content
        tooltip.show(); // Show the tooltip

        $('#copy-icon').html(`
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16">
                <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/>
            </svg>`);

        setTimeout(function () {
            tooltip.hide(); // Hide the tooltip after 2 seconds
            tooltip.setContent({ '.tooltip-inner': 'Copy' }); // Update tooltip content

            $('#copy-icon').html(`
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                        fill="currentColor" class="bi bi-copy" viewBox="0 0 16 16">
                        <path fill-rule="evenodd"
                            d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z" />
                    </svg>
            `);
        }, 2000); // 2-second delay


        $('#copy-address').css('color', '#6A8D4D'); // Change icon color to green
        $('#copy-icon')

    }).catch(function (err) {
        // Error callback
        console.error('Failed to copy text: ', err);
    });
});

function handleRSVP(event) {
    //var username = $('#usernameInputSignin').val();
    //var password = $('#passwordInputSignin').val();
    // Clear previous validation and error messages

    // Check validity of the form
    if (this.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
    } else {
        event.preventDefault(); // Prevent form submission

        var form = $('#bookingForm');
        var loader = $('#loader');
        var thankyou = $('#thankyou');
        // Hide form
        form.hide();
        // Show loader
        loader.show();
        email = $('#inputEmail').val();
        $.ajax({
            method: 'POST',
            url: 'https://jt5jm66qaa.execute-api.ap-southeast-2.amazonaws.com/prod/RSVP',
            data: JSON.stringify({
                email: email,
                name: $('#inputName').val(),
                adults : $('#inputAdults').val(),
                kids : $('#inputKids').val(),
                seniors: $('#inputSeniors').val(),
                referal: $('#referalInput').val()
            }),
            contentType: 'application/json',
            success: function (response) {
                loader.hide();
                thankyou.show();

                showToast('Booking added!', 'text-bg-success');

                confetti({
                    particleCount: 150,
                    spread: 180,
                    origin: { x: 0, y: 0.6 } // Top left corner
                });

                confetti({
                    particleCount: 150,
                    spread: 180,
                    origin: { x: 1, y: 0.6 } // Top right corner
                });
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                form.show();
                loader.hide();
                console.log(jqXHR)
                if (jqXHR.status === 409) {
                    showToast('Ay, try a different email if you need another booking or contact fireplaceschool@gmail.com', 'text-bg-warning');

                    $('#email-feedback').text(email + ' is already used in a booking').show();
                } else{
                    showToast('Aw man, if the problem continues please contact fireplaceschool@gmail.com ' + jqXHR.status, 'text-bg-danger');

                }
            },
        });

    }

    // Add Bootstrap validation classes
    this.classList.add('was-validated');

}

function showToast(message, type) {
    var toast = $("#toastMessage");
    toast.removeClass("text-bg-danger");
    toast.removeClass("text-bg-success");
    toast.removeClass("text-bg-warning");

    
    toast.addClass(type);
    var toastBody = toast.find(".toast-body");
  
    // Set the error message
    toastBody.html(message);
  
  
    // Show the toast
    toast.toast("show");
  }
