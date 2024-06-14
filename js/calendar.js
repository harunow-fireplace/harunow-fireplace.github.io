var $grid = $('.grid').masonry();

const daysTag = document.querySelector(".cal-days"),
    currentDate = document.querySelector(".current-date"),
    prevNextIcon = document.querySelectorAll(".cal-btn");

// getting new date, current year and month
let date = new Date(),
    currYear = date.getFullYear(),
    currMonth = date.getMonth();

// storing full name of all months in array
const months = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];

let h;
function renderCalendar(holidays) {
    h = holidays;
    let firstDayofMonth = new Date(currYear, currMonth, 1).getDay(), // getting first day of month
        lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate(), // getting last date of month
        lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay(), // getting last day of month
        lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate(); // getting last date of previous month

    let m = parseInt(currMonth) + 1;

    let liTag = "";

    for (let i = firstDayofMonth; i > 0; i--) { // creating li of previous month last days
        let j = lastDateofLastMonth - i + 1
        let aDate = j + "/" + (m - 1) + "/" + currYear;

        if (holidays[aDate] && holidays[aDate][0] == 1) {
            isActive = "public";
        } else if (holidays[aDate] && holidays[aDate][0] == 2) {
            isActive = "holiday";
        } else if (holidays[aDate] && holidays[aDate][0] == 3) {
            isActive = "changeable";
        }else {
            isActive = "inactive";
        }
        liTag += `<button class="btn cal-btn" disabled="" type="button">${lastDateofLastMonth - i + 1}</button>`;
        //liTag += `<li class="${isActive}">${lastDateofLastMonth - i + 1}</li>`;
    }
    for (let i = 1; i <= lastDateofMonth; i++) { // creating li of all days of current month
        // adding active class to li if the current day, month, and year matched
        //check if its today

        let isDate = i + "/" + m + "/" + currYear;

        let isActive = "";

        if (holidays[isDate] && holidays[isDate][0] == 1) {
            isActive = "public";
            liTag += `<button class="btn cal-btn ${isActive}" type="button" ${holidays[isDate][1] ? `data-toggle="tooltip" data-placement="right" title="${holidays[isDate][1]}" data-value="${isDate}"` : "" }>${i}</button>`;

            //liTag += `<li class="${isActive}" data-toggle="tooltip" data-placement="right" title="${holidays[isDate]}" data-value="${isDate}">${i}</li>`;
        }
        else if (holidays[isDate] && holidays[isDate][0] == 2) {
            isActive = "holiday";
            liTag += `<button class="btn cal-btn ${isActive}" type="button">${i}</button>`;

            //liTag += `<li class="${isActive}" data-toggle="tooltip" data-placement="right" title="${holidays[isDate]}" data-value="${isDate}">${i}</li>`;
        }
        else if (holidays[isDate] && holidays[isDate][0] == 3) {
            isActive = "changeable";
            liTag += `<button class="btn cal-btn ${isActive}" type="button">${i}</button>`;

            //liTag += `<li class="${isActive}" data-toggle="tooltip" data-placement="right" title="${holidays[isDate]}" data-value="${isDate}">${i}</li>`;
        }
        else if (i === date.getDate() && currMonth === new Date().getMonth()
            && currYear === new Date().getFullYear()) {
            isActive = "active";
            liTag += `<button class="btn cal-btn ${isActive}" type="button" data-toggle="tooltip" data-placement="right" title="Today" data-value="${isDate}">${i}</button>`;

            //liTag += `<li class="${isActive}" data-toggle="tooltip" data-placement="right" title="Today" data-value="${isDate}">${i}</li>`;

        } else {
            isActive = "";
            liTag += `<button class="btn cal-btn ${isActive}" type="button">${i}</button>`;

            //liTag += `<li class="${isActive}" data-value="${isDate}">${i}</li>`;

        }
        /* 
                isActive += i === date.getDate() && currMonth === new Date().getMonth()
                    && currYear === new Date().getFullYear() ? " active" : "";
        
                 */
    }

    for (let i = lastDayofMonth; i < 6; i++) { // creating li of next month first days
        console.log(i - lastDayofMonth + 1);
        liTag += `<button class="btn cal-btn" disabled="" type="button">${i - lastDayofMonth + 1}</button>`;

        //liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`
    }
    currentDate.innerText = `${months[currMonth]} ${currYear}`;
    daysTag.innerHTML = liTag;

}


prevNextIcon.forEach(icon => { // getting prev and next icons
    icon.addEventListener("click", () => { // adding click event on both icons
        // if clicked icon is previous icon then decrement current month by 1 else increment it by 1
        currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1;

        if (currMonth < 0 || currMonth > 11) { // if current month is less than 0 or greater than 11
            // creating a new date of current year & month and pass it as date value
            date = new Date(currYear, currMonth, new Date().getDate());
            currYear = date.getFullYear(); // updating current year with new date year
            currMonth = date.getMonth(); // updating current month with new date month
        } else {
            date = new Date(); // pass the current date as date value
        }
        renderCalendar(h); // calling renderCalendar function
        $('[data-toggle="tooltip"]').tooltip();
        $grid.masonry();

    });
});