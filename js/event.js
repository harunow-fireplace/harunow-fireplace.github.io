$(function onDocReady() {
    $('[data-bs-toggle="tooltip"]').tooltip();
    $('#rsvpForm').submit(handleRSVP);
    $('.preOrderForm').submit(handlePreOrder);
    $('#quizForm').submit(handleQuiz);



    var $scrollLeft = $('#scrollLeft');
    var $scrollRight = $('#scrollRight');
    var $rowInner = $('.gallery-row');

    // Get the width of a tile and the margin between tiles
    var tileWidth = $('.tile').outerWidth(true); // Includes margin

    $scrollLeft.on('click', function () {
        var currentScroll = $rowInner.scrollLeft();
        var newScroll = Math.max(0, currentScroll - tileWidth); // Ensure it doesn’t scroll past the start
        $rowInner.animate({
            scrollLeft: newScroll
        }, 450);
    });

    $scrollRight.on('click', function () {
        var currentScroll = $rowInner.scrollLeft();
        var maxScroll = $rowInner.prop('scrollWidth') - $rowInner.width();
        var newScroll = Math.min(maxScroll, currentScroll + tileWidth); // Ensure it doesn’t scroll past the end
        $rowInner.animate({
            scrollLeft: newScroll
        }, 450);
    });


});


/* Set rates + misc */
var fadeTime = 300;

$('#button-minus1, #button-plus1').on('click', function () {
    var $input = $('#quantity1');
    var value = parseInt($input.val(), 10);

    if ($(this).attr('id') === 'button-minus1' && value > 1) {
        $input.val(value - 1);
    } else if ($(this).attr('id') === 'button-plus1') {
        $input.val(value + 1);
    }
});


$('.size-picker div').on('click', function () {
    $(this).siblings().removeClass('selected');
    $(this).addClass('selected');

    // Get the data-size attribute of the clicked size option
    var selectedSize = $(this).attr('data-size');

    // Set the value of the hidden input field to the selected size
    $('#selected-size').val(selectedSize);
});

// Color picker logic
$('.color-picker div').on('click', function () {
    var selectedColor = $(this).data('color');
    $('#selected-color').val(selectedColor);
    $(this).siblings().removeClass('selected');
    $(this).addClass('selected');
});

// Handle click event for each element with the class 'copy-address'
$('.copy-address').on('click', function () {
    // Get the current clicked element
    var $this = $(this);

    // Get the text to copy from the clicked element
    var textToCopy = $this.text().trim();

    // Use the Clipboard API to copy text
    navigator.clipboard.writeText(textToCopy).then(function () {
        // Success callback
        var tooltip = bootstrap.Tooltip.getInstance($this[0]); // Get the tooltip instance for the clicked element

        if (tooltip) {
            tooltip.setContent({ '.tooltip-inner': 'Copied!' }); // Update tooltip content
            tooltip.show(); // Show the tooltip
        }

        // Update the icon within the clicked element
        $this.find('#copy-icon').html(`
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16">
                <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/>
            </svg>
        `);

        // Change icon color to green
        $this.css('color', '#6A8D4D');

        // Revert changes after 2 seconds
        setTimeout(function () {
            if (tooltip) {
                tooltip.hide(); // Hide the tooltip
                tooltip.setContent({ '.tooltip-inner': 'Copy' }); // Reset tooltip content
                tooltip.show(); // Show the tooltip again to reflect the change
            }

            // Reset the icon back to the original
            $this.find('#copy-icon').html(`
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                        fill="currentColor" class="bi bi-copy" viewBox="0 0 16 16">
                        <path fill-rule="evenodd"
                            d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z" />
                    </svg>
            `);

            // Reset color
            $this.css('color', '');
        }, 2000); // 2-second delay

    }).catch(function (err) {
        // Error callback
        console.error('Failed to copy text: ', err);
    });
});



let orderName = '';
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

        $('#submit-registration').prop('disabled', true);
        const spanElement = $('<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>');
        $('#submit-registration').prepend(spanElement);

        var form = $('#bookingForm');
        var loader = $('#loader');
        var thankyou = $('#thankyou');
        // Hide form
        form.hide();
        // Show loader
        loader.show();
        email = $('#inputEmail').val();
        orderName = $('#inputName').val();
        $.ajax({
            method: 'POST',
            url: 'https://jt5jm66qaa.execute-api.ap-southeast-2.amazonaws.com/prod/RSVP',
            data: JSON.stringify({
                email: email,
                name: orderName,
                adults: $('#inputAdults').val(),
                kids: $('#inputKids').val(),
                seniors: $('#inputSeniors').val(),
                referal: $('#referalInput').val()
            }),
            contentType: 'application/json',
            success: function (response) {
                loader.hide();
                thankyou.show();
                $('#checkoutName').val(orderName);
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
                } else {
                    showToast('Aw man, if the problem continues please contact fireplaceschool@gmail.com ' + jqXHR.status, 'text-bg-danger');

                }
            },
            complete: function () {
                spanElement.remove();
                $('#submit-registration').prop('disabled', false);
            }
        });

    }

    // Add Bootstrap validation classes
    this.classList.add('was-validated');

}

let noOfProducts = 0;
let ordersMap = {};
function addOrUpdateProduct(product, quantity) {
    // Check if the product exists in the ordersMap
    if (!ordersMap[product]) {
        // If the product does not exist, initialize it with the provided quantity
        ordersMap[product] = 0;
    }
    // Update the product quantity
    ordersMap[product] += quantity;
}

function handlePreOrder(event) {
    if (this.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
    } else {
        event.preventDefault(); // Prevent form submission
        
        // Get the form that triggered the event
        var $form = $(event.target);

        // Find the button with class 'add-button' within the form
        var $button = $form.find('.add-button');

        // Find the input with name 'product' within the form and get its value
        var product = $form.find('input[name="product"]').val();

        // Log the value
        if (product === 'T-shirt') {
            var sizeSelected = $('#selected-size').val() !== '';
            var colorSelected = $('#selected-color').val() !== '';
            if (sizeSelected && colorSelected) {
                $("#shirtFeedback").hide();
                let size = $('#selected-size').val();
                let color = $('#selected-color').val();
                product = product + "-" + size + "-" + color;

                // Clear all form fields except hidden inputs
                $('#selected-size').val('');
                $('#selected-color').val('');

                // Remove 'selected' class from size and color pickers
                $form.find('.size-picker div').removeClass('selected');
                $form.find('.color-picker div').removeClass('selected');
            } else {
                // Alert the user or provide feedback if size or color is not selected
                $("#shirtFeedback").show();
                return;
            }
        }

        addOrUpdateProduct(product, 1);

        if (!$button.hasClass('loading')) {
            $button.addClass('loading');

            // Remove the 'loading' class after the animation duration
            setTimeout(() => $button.removeClass('loading'), 3700);
        }
        noOfProducts += 1;
        $(".noOfProducts").text(noOfProducts);
        $(".noOfProducts").show();
        $("#cart").empty();
        addToCart();
        $("#total-checkout").show();
        recalculateCart();
    }

    // Add Bootstrap validation classes
    this.classList.add('was-validated');

}
//Shirt, cap, mug, bag , 30, 40, 20
let prices = {
    "T-shirt": 50,
    "Cap": 30,
    "Mug": 40,
    "Tote-bag": 20
}

function addToCart() {
    $('#preorder-thankyou').hide();
    let cart = '';

    if (ordersMap) {
        $('#cart-alert').hide();
        $('#cart').show();

    }

    Object.entries(ordersMap).forEach(function ([key, value]) {

        let price;
        let product = key;
        if (key.includes("T-shirt")) {
            product = key.substring(0, 7);
            price = prices["T-shirt"] * value;
        } else {
            price = prices[key] * value;
        }

        let item = `<div class="product row border-bottom py-2">
                        <div class="col-5">
                            <div class="product-title">I AM ${product}</div>
                            ${product === "T-shirt" ? `<p class="product-description small">${key.substring(8)}</p>` : ``}
                        </div>
                        <div class="col-3 text-center">
                            <input type="number" class="product-quantity form-control form-control-sm" value="${value}" min="1">
                        </div>
                        <div class="col-1 text-center">
                            <button class="btn btn-danger btn-sm remove-product">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                                    <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                                  </svg>
                            </button>
                        </div>
                        <div class="product-total col-3 text-center">${price}</div>
                    </div>`;

        cart += item;
    });

    $('#cart').html(cart);

    // Re-bind events
    bindEvents();

}



function bindEvents() {
    /* Assign actions */
    $('#cart').on('change', '.product-quantity', function () {
        updateQuantity(this);
    });

    $('#cart').on('click', '.remove-product', function () {
        removeItem(this);
    });
}

/* Recalculate cart */
function recalculateCart() {
    var total = 0;
    var numberOfItems = 0;
    /* Sum up row totals */
    $('.product').each(function () {
        total += parseInt($(this).find('.product-total').text());
    });

    /* Update totals display */
    $('.totals-value').fadeOut(fadeTime, function () {
        $('#cart-total').html(total);
        if (total == 0) {
            $('#total-checkout').fadeOut(fadeTime);
            $('#cart-alert').fadeIn(fadeTime);

        } else {
            $('#total-checkout').fadeIn(fadeTime);
        }
        $('.totals-value').fadeIn(fadeTime);
    });
}

function updateCartTotal() {
    noOfProducts = 0;
    console.log(ordersMap)
    Object.entries(ordersMap).forEach(function ([key, value]) {
        noOfProducts += value;
    });
    $(".noOfProducts").text(noOfProducts);
    if (noOfProducts == 0) {
        $(".noOfProducts").hide();
    }
}
/* Update quantity */
function updateQuantity(quantityInput) {
    /* Calculate line price */
    var productRow = $(quantityInput).closest('.product');
    var item = productRow.find('.product-title').text().replace('I AM ', '');
    var price = prices[item.trim()] || prices["T-shirt"]; // Default to T-shirt price if item is not found
    var quantity = parseInt($(quantityInput).val(), 10);
    var linePrice = price * quantity;

    if (item === "T-shirt") {
        item = item + "-" + productRow.find('.product-description').text();
    }

    ordersMap[item] = quantity;

    /* Update line price display and recalc cart totals */
    productRow.find('.product-total').each(function () {
        $(this).fadeOut(fadeTime, function () {
            $(this).text(linePrice);
            recalculateCart();
            $(this).fadeIn(fadeTime);
        });
    });
    updateCartTotal();
}

/* Remove item from cart */
function removeItem(removeButton) {
    var productRow = $(removeButton).closest('.product');
    var item = productRow.find('.product-title').text().replace('I AM ', '');

    if (item === "T-shirt") {
        item = item + "-" + productRow.find('.product-description').text();
    }

    delete ordersMap[item];

    productRow.fadeOut(fadeTime, function () {
        productRow.remove();
        recalculateCart();
    });
    updateCartTotal();
}

$('.product-link').on('click', function (e) {
    e.preventDefault(); // Prevent default link behavior if necessary

    var parentId = $(this).parent().attr('id'); // Get the ID of the <li> element
    var path = '../event/images/' + parentId + '.png'; // Construct the path

    // Determine the product ID based on the parent ID
    var product = '';
    if (parentId.includes("shirt")) {
        product = '#product-1';
    } else {
        product = '#product-3';
    }

    // Apply the CSS styles
    var element = document.querySelector('.section-products ' + product + ' .part-1');
    if (element) {
        element.style.setProperty('--background-image', 'url("' + path + '")');
        element.style.transition = 'all 0.3s';
    }

    // Adding the CSS for ::before pseudo-element
    var style = document.createElement('style');
    style.innerHTML = `
    .section-products ${product} .part-1::before {
        content: '';
        background: var(--background-image) no-repeat center center;
        background-size: cover;
    }
`;
    document.head.appendChild(style);
});

$('.checkout').on('click', function (e) {
    e.preventDefault();
    $('#checkoutFeedback').addClass('hidden');

    if ($('#checkoutName').val() === '') {
        $('#checkoutFeedback').removeClass('hidden');
        return;
    }

    $('#submit-checkout').prop('disabled', true);
    const spanElement = $('<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>');
    $('#submit-checkout').prepend(spanElement);

    ordersMap["name"] = $('#checkoutName').val();
    // Ensure ordersMap is serialized to JSON
    let ordersMapJson = JSON.stringify(ordersMap);

    $.ajax({
        method: 'POST',
        url: 'https://jt5jm66qaa.execute-api.ap-southeast-2.amazonaws.com/prod/order', // Ensure this URL is correct
        contentType: 'application/json',
        data: ordersMapJson, // Use the serialized JSON string
        success: function (response) {
            let orderNo = response.orderNo;
            if (orderNo < 10) {
                orderNo = `00${orderNo}`;
            } else if (orderNo < 100) {
                orderNo = `0${orderNo}`;
            }

            // Create the 5-digit number with the orderNo at the end
            orderNo = `10${orderNo}`;

            // Fade out elements and reset states
            $('#cart').fadeOut(fadeTime);
            $('#total-checkout').fadeOut(fadeTime);
            $('#preorder-thankyou').text("Thank you order #" + orderNo);
            $('#preorder-thankyou').fadeIn(fadeTime);

            // Clear ordersMap and update product count
            ordersMap = {}; // Reset ordersMap to an empty object
            noOfProducts = 0; // Reset the number of products
            $(".noOfProducts").hide(); // Hide product count display

            showToast('Your pre-order has been added!', 'text-bg-success');

            confetti({
                particleCount: 150,
                spread: 180,
                origin: { x: 0, y: 0.6 }, // Top left corner
                zIndex: 9999
            });

            confetti({
                particleCount: 150,
                spread: 180,
                origin: { x: 1, y: 0.6 }, // Top right corner
                zIndex: 9999
            });
        },
        error: function (xhr, status, error) {
            showToast('Aw man, if the problem continues please contact fireplaceschool@gmail.com ', 'text-bg-danger');
        },
        complete: function () {
            spanElement.remove();
            $('#submit-checkout').prop('disabled', false);
        }
    });
});


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

let currentStep = 1;
const totalSteps = 11;

function updateProgressBar() {
    const progress = (currentStep / totalSteps) * 100;
    $('#progressBar').css('width', progress + '%').attr('aria-valuenow', progress);
}

$(".next").click(function () {
    if (currentStep == 1 && $('#question1').val() === '') {
        $('#quizFeedback').removeClass('hidden');
        return;
    } else {
        $('#quizFeedback').addClass('hidden');
    }
    if (currentStep < totalSteps) {
        $(`.step-${currentStep}`).removeClass("active");
        currentStep++;
        $(`.step-${currentStep}`).addClass("active");
        updateProgressBar();
    }
});

$(".prev").click(function () {
    if (currentStep > 1) {
        $(`.step-${currentStep}`).removeClass("active");
        currentStep--;
        $(`.step-${currentStep}`).addClass("active");
        updateProgressBar();
    }
});

updateProgressBar();

function handleQuiz(event) {
    event.preventDefault();

    $('#submit-quiz').prop('disabled', true);
    const spanElement = $('<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>');
    $('#submit-quiz').prepend(spanElement);
    $('#previousButton').prop('disabled', true);

    let question1 = $('input[name="question2"]:checked').val() || '';
    let question2 = $('input[name="question3"]:checked').map(function () {
        return $(this).next('label').text().trim() || '';
    }).get();
    let question3 = $('input[name="question4"]:checked').val() || '';
    let question4 = $('input[name="question5"]:checked').val() || '';
    let question5 = $('input[name="question6"]:checked').val() || '';
    let question6 = $('input[name="question7"]:checked').val() || '';
    let question7 = $('input[name="question8"]:checked').val() || '';
    let question8 = $('input[name="question9"]:checked').val() || '';
    let question9 = $('input[name="question10"]:checked').val() || '';
    let question10 = $('input[name="question11"]:checked').val() || '';
    let name = $('#question1').val() || '';

    $.ajax({
        method: 'POST',
        url: 'https://jt5jm66qaa.execute-api.ap-southeast-2.amazonaws.com/prod/quiz',
        data: JSON.stringify({
            name: name,
            question1: question1,
            question2: question2, // This will be an array
            question3: question3,
            question4: question4,
            question5: question5,
            question6: question6,
            question7: question7,
            question8: question8,
            question9: question9,
            question10: question10
        }),
        contentType: 'application/json',
        success: function (response) {
            $('#quiz').hide();
            $('#quiz-thankyou').show();

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
            showToast('Aw man, if the problem continues please contact fireplaceschool@gmail.com ' + jqXHR.status, 'text-bg-danger');
        },
        complete: function () {
            spanElement.remove();
            $('#submit-quiz').prop('disabled', false);
            $('#previousButton').prop('disabled', true);
        }
    });


}