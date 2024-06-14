function showToast(message, type, header) {
  var toast = $("#toastMessage");
  toast.removeClass("text-bg-danger");
  toast.removeClass("text-bg-success");
  toast.addClass(type);
  var toastBody = toast.find(".toast-body");

  // Set the error message
  toastBody.html(message);

  //Set header
  //var toastHeader = $('#toastHeader');
  $('#toastHeader').text(header);

  // Show the toast
  toast.toast("show");
}

function showToastWithHeader(message, type, header) {
  var toast = $("#toastMessage");
  toast.addClass(type);
  var toastBody = toast.find(".toast-body");

  // Set the error message
  toastBody.text(message);

  //Set header
  //var toastHeader = ;
  $('#toastHeader').text(header);

  // Show the toast
  toast.toast("show");
}

function showErrorToast(message) {
  var errorToast = $("#errorToast");
  var toastBody = errorToast.find(".toast-body");

  // Set the error message
  toastBody.text(message);

  // Show the toast
  errorToast.toast("show");

}


function addNoPostsNote() {
  var divElement = $('#noPostsDiv');

  var elem = `<img src="../images/IMG_7671.png" class="harunowImage" alt="bubbles">
    <p>There are no updates.</p>`;

  divElement.append(elem);
}

function setWelcomeMessage(username, group) {
  //ensure username is capitalize
  $("#welcomeMsg").text("Hi, " + capitalize(username) + "!");
  if (group) {
    $("#welcomeMsg").text("Hi, " + capitalize(username) + "! Welcome to " + capitalize(group[0]));
  }
}

function capitalize(text) {
  let capitalize = text.charAt(0).toUpperCase() + text.slice(1);
  return capitalize;
}

function toLocalDateTime(dateStr) {
  let date = new Date(dateStr).toLocaleString('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
  return date;
}

function toLocalDate(dateStr) {
  let date = new Date(dateStr).toLocaleString('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
  return date;
}

function timeAgo(date) {
  const currentDate = new Date();
  const givenDate = new Date(date);

  const timeDifference = currentDate - givenDate;
  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (weeks > 0) {
    return `${weeks} w`;
  } else if (days > 0) {
    return `${days} d`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} `;
  } else if (minutes > 0) {
    return `${minutes} min${minutes > 1 ? 's' : ''}`;
  } else {
    return `${seconds} sec${seconds > 1 ? 's' : ''}`;
  }
}

function createPostCard(item, username, hvImage, index, userType) {
  // Access individual item properties here
  const id = item.createdAt;
  const title = item.title;
  const content = item.content;
  const formattedContent = content.replace(/\n/g, "<br>");
  const authorName = item.createdBy;
  const updatedAt = toLocalDateTime(item.updatedAt);
  // Do something with the item properties
  let postCard = `<div class="col-sm-6 col-lg-4 mb-4 ">
    <div class="card shadow-sm">`

  if (hvImage && hvImage.length == 1) {
    postCard += `<img id="img-${item.id}" class="card-img-top" alt="post image"/>`;
  }
  else if (hvImage && hvImage.length > 1) {
    postCard += `<div id="carousel-${item.id}" class="carousel carousel-dark slide carouselAutoplaying" data-bs-ride="carousel">
    <div class="carousel-inner">`;

    for (let i = 0; i < hvImage.length; i++) {
      if (i == 0) {
        postCard += `<div class="carousel-item active">
        <img id="img-${item.id}-${i}" class="d-block w-100 carousel-image" alt="...">
      </div>`;
      } else {
        postCard += `<div class="carousel-item">
        <img id="img-${item.id}-${i}" class="d-block w-100 carousel-image" alt="...">
      </div>`;
      }
    }
    postCard += `</div>
    <button class="carousel-control-prev post-control-prev" type="button" data-bs-target="#carousel-${item.id}" data-bs-slide="prev">
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Previous</span>
    </button>
    <button class="carousel-control-next post-control-next" type="button" data-bs-target="#carousel-${item.id}" data-bs-slide="next">
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Next</span>
    </button>
  </div>`;
  }
  let postBody = `<div class="card-body">
        <div id="postHeader" class="row">
          <div class="col">
            <h5 id="cardTitle-${index}" class="">${title}</h5>
            <h6 class="card-subtitle mb-2 text-body-secondary">${capitalize(authorName)}</h6>
          </div><div class="col-auto">`;
  postCard += postBody;

  if (authorName == username || userType == "teacher") {
    postCard += `<div class="btn-group" role="group" aria-label="Post actions">`;
  }

  if (authorName == username) {
    postCard += `
        <button type="button" class="editPostButton btn btn-sm btn-outline-secondary" data-bs-toggle="modal"
                data-bs-target="#postModal" value="${index}">
                <i class="bi bi-pencil-square"></i>
            </button>`;
  }
  //add delete button
  if (authorName == username || userType == "teacher") {
    postCard += `<button
    type="button"
    class="btn btn-sm btn-outline-danger"
    data-bs-toggle="modal"
    data-bs-target="#deleteModal-${item.id}">
    <i class="bi bi-trash3"></i>
</button></div>`;
  }

  postCard += `<!-- Modal -->
      <div class="modal fade" id="deleteModal-${item.id}" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="deleteModalLabel">Delete ${title}</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              You sure you want to delete this?
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button id="delete-${id}" value="${item.id}" type="button" class="deletePost btn btn-danger">DELETE</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;


  postCard += `</div>`;
  postCard += `${item.video ? `${content}` : `<p id="cardContent-${index}" class="card-text" value="${content}">${formattedContent}</p>`}`;
  postCard += `<div class="d-flex justify-content-between align-items-center">`;

  let likesCount = item.likes && Object.keys(item.likes).length > 0 ? Object.keys(item.likes).length : "";
  //likes and comments icon
  postCard += `<div class="btn-group" role="group" aria-label="Post activity actions">
          <button type="button" class="likeButton btn btn-sm ${item.likes && item.likes[username] ? "btn-outline-harunow" : "btn-outline-secondary"}" value="${index}"><i class="bi bi-heart-fill"><span id="pl-${index}" class="badge text-dark">${likesCount}</span></i></button>
          <button type="button" class="commentsButton btn btn-sm btn-outline-info" data-bs-toggle="modal"
                data-bs-target="#commentsModal" value="${index}"><i id="ichat-${index}" class="bi bi-chat-right-dots-fill h6"> ${item.comments && item.comments.length > 0 ? `<span id="cc-${index}" class="badge text-dark">${item.comments.length}</span>` : ""}</i>
              </button>
              </div>
           `;

  postCard += `<div class="ms-auto">
                <small id="updatedAt-${index}" class="text-body-secondary">
                  ${updatedAt}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>`;


  return postCard;
}

function validateField(field, inputField) {

  inputField.removeClass("is-invalid");
  //remove any previous validation
  if (field == "") {
    inputField.addClass("is-invalid");

    return false;
  }
  return true;
}


function createPollOptions(poll, pollId, username, userVoted) {
  let options = "";
  $.each(poll.options, function (index, option) {
    // Create an option element
    const optionElement = `<div class="form-check">
<input class="form-check-input" type="radio" name="optionsRadios-${pollId}" id="option-${index}" value="${option}" ${poll.votes && option == poll.votes[username] ? "checked" : ""} ${userVoted ? "disabled" : ""}/>
<label class="form-check-label" for="option-${index}">${option}</label>
</div>`;
    // Append the option element to the options element
    options += optionElement;
  });
  return options;
}

function createPollCard(poll, pollId, username, userType) {
  let userVoted = false;

  if (poll.votes) {
    userVoted = poll.votes[username];
  }
  let createAt = toLocalDate(poll.createdAt);
  let pollCard = `<div class="col-sm-6 col-lg-4 mb-4">
            <div class="pollCard card shadow-sm">
              <div class="card-body pollCard-bg">
                <div class="row">
                  <div class="col">
                    <h5 id="pollHeader-${pollId}">${poll.title} ${userVoted ? `<span class="badge bg-secondary">Voted</span>` : ""}</h5>
                  </div>
                  ${username == poll.createdBy ? `<div class="col-auto">
                  <div class="btn-group" role="group" aria-label="Actions buttons">` : ""}
                  ${!poll.results && username == poll.createdBy ? `<button id="reveal-${pollId}" type="button" class="revealPoll btn btn-sm btn-secondary" value=${poll.createdAt}>
                  Show Results</button>` : ""}
                  ${poll.results && !poll.isClosed ? `<button type="button" class="closePoll btn btn-sm btn-secondary" value=${poll.createdAt}>
                  Close</button>` : ""}
                  ${username == poll.createdBy ? `<button type="button" class="btn btn-sm btn-danger">
                      <i class="bi bi-trash3"></i></button>
                </div></div>` : ``}
                </div>
                <p class="card-text">${poll.content}</p><div id="pollCard-${pollId}">`;
  //if show
  if (poll.results) {

    pollCard += showPollResults(poll.votes, userType);
  } else {
    // Loop through the options array
    pollCard += createPollOptions(poll, pollId, username, userVoted);
    if (userType != "parent" && !userVoted) {
      const pollButton = `<div class="row text-end"><div class="col"><button id="${pollId}" value="${poll.createdAt}" type="button" class="submitVote btn btn-primary">Submit</button></div></div>`;
      pollCard += pollButton;
    }
  }

  const cardFooter = `</div></div>
            <div class="card-footer">
                <small class="text-body-secondary">Created by ${capitalize(poll.createdBy)} @ ${createAt}</small>
            </div>
        </div>
    </div>`;
  pollCard += cardFooter;


  // Append the poll element to the container (e.g., '#pollsContainer')
  const $grid = $('.grid').masonry({
    percentPosition: true,
  });

  var $card = $(pollCard);
  $grid.append($card).masonry('prepended', $card);

  $grid.masonry();
  // Initialize tooltips for the new elements
  $('[data-bs-toggle="tooltip"]').tooltip();

}


function showPollResults(votes, userType) {
  //Create map of votes
  const votesCount = {};

  $.each(votes, function (index, vote) {
    if (votesCount[vote]) {
      votesCount[vote].count += 1;

      votesCount[vote].voters.push(index);;
    } else {
      votesCount[vote] = {
        count: 1,
        voters: [index]
      };
    }
  });
  //Create chart from votes map
  return createPollChart(votesCount, userType);
}

function createPollChart(items, userType) {
  var list;

  let highestCount = -Infinity;

  $.each(items, function (index, item) {
    const currentTotal = item.count;
    if (currentTotal > highestCount) {
      highestCount = currentTotal;
    }
  });
  var list = `<ul class="pollChart container">`;
  $.each(items, function (index, item) {
    var percentage = item.count / highestCount * 100;

    var listItem = `<li>
  <span style="width:${percentage}%" name="${index}" data-bs-toggle="tooltip" data-bs-title="${item.count} ${item.count > 1 ? "votes" : "vote"} ${userType == "teacher" ? item.voters : ""}" class="text-truncate">`;
    list += listItem;
  });
  return list;
}

function additionalNav(userType) {
  if (userType !== "parent") {
    $("#dashboard-nav").append(`<hr><li class="nav-item">
  <a class="nav-link d-flex align-items-center gap-2" href="/network/">
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-badge" viewBox="0 0 16 16">
  <path d="M6.5 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
  <path d="M4.5 0A2.5 2.5 0 0 0 2 2.5V14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2.5A2.5 2.5 0 0 0 11.5 0h-7zM3 2.5A1.5 1.5 0 0 1 4.5 1h7A1.5 1.5 0 0 1 13 2.5v10.795a4.2 4.2 0 0 0-.776-.492C11.392 12.387 10.063 12 8 12s-3.392.387-4.224.803a4.2 4.2 0 0 0-.776.492V2.5z"/>
</svg>
    Network
  </a>
</li>`);
  }
  if (userType == "teacher") {
    $("#dashboard-nav").append(`<hr><h6 id="teacher-tools" class="sidebar-heading d-flex justify-content-between align-items-center px-3 mb-1 text-body-secondary text-uppercase">
        <span>Teacher Tools</span>
        <a class="link-secondary" href="#" aria-label="Create something">
        <svg class="bi"><use xlink:href="#plus-circle"/></svg>
        </a>
    </h6>
    <ul class="nav flex-column mb-auto">
    <li class="nav-item">
    <a class="nav-link d-flex align-items-center gap-2" href="/create/">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-brush" viewBox="0 0 16 16">
    <path d="M15.825.12a.5.5 0 0 1 .132.584c-1.53 3.43-4.743 8.17-7.095 10.64a6.067 6.067 0 0 1-2.373 1.534c-.018.227-.06.538-.16.868-.201.659-.667 1.479-1.708 1.74a8.118 8.118 0 0 1-3.078.132 3.659 3.659 0 0 1-.562-.135 1.382 1.382 0 0 1-.466-.247.714.714 0 0 1-.204-.288.622.622 0 0 1 .004-.443c.095-.245.316-.38.461-.452.394-.197.625-.453.867-.826.095-.144.184-.297.287-.472l.117-.198c.151-.255.326-.54.546-.848.528-.739 1.201-.925 1.746-.896.126.007.243.025.348.048.062-.172.142-.38.238-.608.261-.619.658-1.419 1.187-2.069 2.176-2.67 6.18-6.206 9.117-8.104a.5.5 0 0 1 .596.04zM4.705 11.912a1.23 1.23 0 0 0-.419-.1c-.246-.013-.573.05-.879.479-.197.275-.355.532-.5.777l-.105.177c-.106.181-.213.362-.32.528a3.39 3.39 0 0 1-.76.861c.69.112 1.736.111 2.657-.12.559-.139.843-.569.993-1.06a3.122 3.122 0 0 0 .126-.75l-.793-.792zm1.44.026c.12-.04.277-.1.458-.183a5.068 5.068 0 0 0 1.535-1.1c1.9-1.996 4.412-5.57 6.052-8.631-2.59 1.927-5.566 4.66-7.302 6.792-.442.543-.795 1.243-1.042 1.826-.121.288-.214.54-.275.72v.001l.575.575zm-4.973 3.04.007-.005a.031.031 0 0 1-.007.004zm3.582-3.043.002.001h-.002z"/>
    </svg>
        Create
    </a>
    </li>
    </ul>`);
  }
}

function createNote(notes, username) {
  let createAt = toLocalDate(notes.createdAt);
  let note = `<div class="col-sm-12 col-lg-6 mb-4">
  <div class="card border-warning">
    <div class="card-body">
    <div class="row">
          <div class="col">
              <h5 class="card-title">${notes.title}</h5>
          </div>
          ${username == notes.createdBy ? `<div class="col-auto">
          <div class="btn-group" role="group" aria-label="Actions buttons">
              <button type="button" class="btn btn-sm btn-outline-danger ">
                  <i class="bi bi-trash3"></i>
              </button>
              </div>
          </div>` : ``}
      </div>
      <table class="table">
        <tbody>`;

  $.each(notes.list, function (index, item) {
    let row = `<tr>
          <th scope="row" class="icon-width"><i class="bi bi-stars icon-yellow"></i></th>
          <td>${item}</td>
      </tr>`;
    note += row;
  });

  let noteFooter = `</tbody>
      </table>
    </div>
    <div class="card-footer">
          <small class="text-body-secondary">Created by ${capitalize(notes.createdBy)} @ ${createAt}</small>
      </div>
  </div>
</div>`;

  note += noteFooter;

  return note;
}

function createGraph(data, username) {


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
                  <i class="bi bi-pencil-square"></i>
               </button>
              <button type="button" class="btn btn-sm btn-outline-secondary">
                  <i class="bi bi-trash3"></i>
              </button>
              </div>
          </div>` : ``}
      </div><div>`;

  chart += graphData(data);
  let date = toLocalDateTime(data.createdAt);

  let footer = `</div></div>
    <div class="card-footer">
      <small class="text-body-secondary">Created by ${capitalize(data.createdBy)} @ ${date}</small>
    </div>
  </div>
</div>`;
  chart += footer;
  return chart;
}

function graphData(data) {
  //let colTotal = calculateTotal(data.data);
  let highestTotal = -Infinity;

  $.each(data.totals, function (index, item) {
    const currentTotal = item;
    if (currentTotal > highestTotal) {
      highestTotal = currentTotal;
    }
  });

  let chart = `<ul class="chart container">`;

  $.each(data.totals, function (index, item) {

    var percentage = item / highestTotal * 100;
    var listItem = `<li>
      <span style="height:${percentage}%; ${data.colors && data.colors[index] ? `background:${data.colors[index]};` : `;`}" name="${data.groups[index]}"  data-bs-toggle="tooltip" data-bs-title="${item}" class="opacity-75" /></li>`;
    chart += (listItem);
  });
  chart += `</ul>`;

  return chart;
}

function createAlertCard() {
  return `<div class="col-sm-12 col-lg-8"><div class="alert alert-warning d-flex align-items-center" role="alert">
  <svg class="bi flex-shrink-0 me-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle-fill" viewBox="0 0 16 16">
      <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
      </svg>
  <div>
    Please wait for your request to be approved by the school
  </div>
</div></div>`;
}

function createTeamsTable(teamUsers) {
  const table = $('<table>', { class: 'table table-hover' }).appendTo('#table-container');
  const tbody = $('<tbody>').appendTo(table);

  // Group data by teams
  const groupedData = {};
  Object.entries(teamUsers).forEach(([username, userTeam]) => {
    if (!groupedData[userTeam]) {
      groupedData[userTeam] = [];
    }
    groupedData[userTeam].push(username);
  });

  // Extract unique teams and sort them in ascending order
  const uniqueGroups = Object.keys(groupedData).sort();

  // Create table header with unique teams in ascending order
  const headerRow = $('<tr>').appendTo($('<thead>').appendTo(table));
  uniqueGroups.forEach(group => {
    $('<th>', { scope: 'col' }).text(group).appendTo(headerRow);
  });

  // Calculate the maximum number of users in any team
  const maxUsers = Math.max(...Object.values(groupedData).map(users => users.length));

  // Create table rows
  for (let i = 0; i < maxUsers; i++) {
    const userRow = $('<tr>').appendTo(tbody);

    // Iterate through unique teams and create cells
    uniqueGroups.forEach(group => {
      const usersInGroup = groupedData[group] || [];
      const username = usersInGroup[i] || ''; // Use empty string if no username at the current position
      $('<td>', { class: 'col' }).text(username).appendTo(userRow);
    });
  }
}

function createFlipCard(record, index, userType) {
  let card = `<div class="col-sm-12 col-lg-8 mb-4">
  <div class="flip-card-3D-wrapper">
      <div class="card flip-card shadow-sm" id="infoCard">
          <div class="flip-card-front overflow-auto">
              <div class='card-body' id="record-${index}">
                  <div class="row">
                      <div class="col">
                          <h5 class="card-title">${record.title}</h5>

                      </div>
                      <div class="col-auto">
                          <button class="flip-card-btn-turn-to-back btn btn-primary" value="${index}">More
                              info</button>
                      </div>
                  
                  </div>
                  <div id="recordGraph-${index}"></div>
              </div>
          </div>
          <div class="flip-card-back overflow-auto">
              <div class='card-body'>
                  <div class="row pb-2">
                      <div class="col">
                          <h4 class="text-start">Team Members</h4>
                      </div>
                      <div class="col-auto">
                      ${userType == "teacher" ? `<button type="button" class="addMemberBtn btn btn-secondary" value="${index}">Add
                      member</button>` : ``}
                          <button class="flip-card-btn-turn-to-front btn btn-primary">Back</button>
                      </div>
                  </div>
                  <div class="mx-auto" id="table-container">
                      
                  </div>
                  
              </div>
          </div>
      </div>
  </div>
</div>`;

  return card;
}

function addGraphEdit(recordIndex) {
  let editDiv = `<form class="row">
  <div class="col-auto pt-4">
  <input type="number" id="pointsInput-${recordIndex}" class="editTeam form-control" placeholder="Enter points"/>
  </div>
  <div class="col-auto pt-4">
  <button type="button" class="addPointsBtn btn btn-primary" value=${recordIndex} hidden>Save</button>
  </div>
  </form>`;
  $(`#record-${recordIndex}`).append(editDiv);
}



function addFlipCardButtons() {
  //const flipCardWrapAll = $("#flip-card-wrap-all")

  const cardsWrapper = $(".flip-card-3D-wrapper")
  const cards = $(".flip-card")
  let frontButtons = ""
  let backButtons = ""

  for (let i = 0; i < cardsWrapper.length; i++) {
    frontButtons = cardsWrapper[i].querySelector(".flip-card-btn-turn-to-back")
    frontButtons.style.visibility = "visible"
    frontButtons.onclick = function () {
      cards[i].classList.toggle('do-flip')
    }

    backButtons = cardsWrapper[i].querySelector(".flip-card-btn-turn-to-front")
    backButtons.style.visibility = "visible"
    backButtons.onclick = function () {
      cards[i].classList.toggle('do-flip')
    }
  }
}

