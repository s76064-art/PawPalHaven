
class SlideShow {
    constructor(selector, interval) {
        this.container = document.querySelector(selector);
        this.slides = this.container.querySelector(".slides");
        this.itemSlides = this.slides.querySelectorAll(".slide");
        this.dotContainer = this.container.querySelector(".dots")
        this.interval = interval || 5000; //Default 5 seconds

        this.index = 0;

        this.makeDots();
        this.addSwipeSupport();
        this.startAutoSlide();
    }

    makeDots() {
        this.itemSlides.forEach((_, i) => {
            const dot = document.createElement("span");
            if (i === 0) { dot.classList.add("active"); }
            dot.addEventListener("click", () => this.goToSlide(i));
            this.dotContainer.appendChild(dot);
        });
    }

    updateDots() {
        this.dotContainer.querySelectorAll("span").forEach((dot, i) => {
            dot.classList.toggle("active", i === this.index);
        });
    }

    goToSlide(i) {
        this.index = i;
        this.slides.style.transform = `translateX(${-i * 100}%)`;
        this.updateDots();
    }

    startAutoSlide() {
        setInterval(() => {
            this.index = (this.index + 1) % this.itemSlides.length;
            this.goToSlide(this.index);
        }, this.interval);
    }

    addSwipeSupport() {
        let startX = 0;

        this.slides.addEventListener('touchstart', e => {
            startX = e.touches[0].clientX;
        });

        this.slides.addEventListener('touchend', e => {
            let endX = e.changedTouches[0].clientX;

            if (endX < startX - 50) this.next();
            if (endX > startX + 50) this.prev();
        });
    }

    next() {
        this.index = (this.index + 1) % this.slideItems.length;
        this.goToSlide(this.index);
    }

    prev() {
        this.index = (this.index - 1 + this.slideItems.length) % this.slideItems.length;
        this.goToSlide(this.index);
    }
}

//Functions that should be run on homepage
function homepageEvent(page) {
    if (page === "index.html") {
        //showUpcomingPetEvent();
        messageCycle(page);

        //Start slide show
        new SlideShow(".event-slider", 10000);

        new SlideShow(".pet-slider", 5000);

    }
}

//Functions that should be run on event page
function eventPage(page) {
    if (page === "event.html") {
        displayEvents();
    }
}


document.addEventListener("DOMContentLoaded", function () {
    const page = window.location.pathname.split("/").pop();

    homepageEvent(page);
    eventPage(page);
});


function messageCycle() {
    let messages = [
        ["Pets brings joy to the world", "Adopt one now"],
        ["This is a test message", "Small text"]
    ];

    let messageContainer = document.getElementById("message");
    let currentIndex = 0;

    // Initial display
    messageContainer.innerHTML = `
        <h2>${messages[currentIndex][0]}</h2>
        <p>${messages[currentIndex][1]}</p>
    `;

    // Change message every 3 seconds (3000ms)
    setInterval(() => {
        currentIndex = (currentIndex + 1) % messages.length;
        messageContainer.innerHTML = `
            <h2>${messages[currentIndex][0]}</h2>
            <p>${messages[currentIndex][1]}</p>
        `;
    }, 3000);
}

function showUpcomingPetEvent() {
    const events = [
        new PetEvent("Happy Pet Event", "Kuala Lumpur", "23 November 2026", "1:00 PM - 5:00 PM", "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Nemo dolorum cumque atque, ad quos voluptate nulla reiciendis nihil tempora praesentium debitis sit eaque iusto obcaecati odio sunt nam, modi impedit? impsump", "", "assets/img/Poster1.png"),
        new PetEvent("Pet Even Ultimate", "Johor Bahru", "6 January 2026", "8:30 AM - 12:00 PM", "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Nemo dolorum cumque atque, ad quos voluptate nulla reiciendis nihil tempora praesentium debitis sit eaque iusto obcaecati odio sunt nam, modi impedit?", "", "assets/img/Poster2.png"),
        new PetEvent("Fur-Day", "Kuala Nerus", "10 February 2026", "2:00 PM - 9:00 PM", "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Nemo dolorum cumque atque, ad quos voluptate nulla reiciendis nihil tempora praesentium debitis sit eaque iusto obcaecati odio sunt nam, modi impedit?", "", "assets/img/Poster3.png"),
    ]


    let carousel = document.getElementById("upcoming-event");
    let indicator = document.getElementById("event-carousel-indicator")

    let text = "";
    let indicatorText = "";
    let index = 0;
    let isActive = "active";

    events.forEach(event => {

        //Slides
        text += `<div class="carousel-item ${isActive} style="height:100vh;">
                            <div class="row align-items-center">

                                <!-- Image Column -->
                                <div class="col-lg-3 col-12">
                                    <img src="${event.poster}" alt="Poster" class="img-fluid">
                                </div>

                                <!-- Info Column -->
                                <div class="col-lg-5 col-12">
                                    <div class="container">
                                        <div class="row">
                                            <h2 class="text-center text-lg-start">${event.eventName}</h2>
                                        </div>
                                        <div class="row">
                                            <div class="datetime">
                                                <p class="text-center text-lg-start">Date: ${event.date}</p>
                                                <p class="text-center text-lg-start">Time: ${event.time}</p>
                                            </div>
                                             <p class="text-center text-lg-start">Location: ${event.location}</p>
                                        </div>
                                        <div class="row">
                                            <p class="text-justify">${event.description}</p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Social Column -->
                                <div class="col-lg-3 col-12 m-3 social-container">
                                    <h3 class="text-center">Follow Us</h3>
                                    <div class="p-3 text-center">
                                        <i class="fa-brands fa-facebook fa-xl"></i>
                                        <i class="fa-brands fa-youtube fa-xl"></i>
                                        <i class="fa-brands fa-instagram fa-xl"></i>
                                        <i class="fa-brands fa-tiktok fa-xl"></i>
                                        <i class="fa-brands fa-twitter fa-xl"></i>
                                        <i class="fa-regular fa-map fa-xl"></i>
                                    </div>
                                </div>

                            </div>
                        </div>`;

        //Indicators
        indicatorText += `<button type="button" data-bs-target="#eventCarousel" data-bs-slide-to=${index} class="${isActive}"></button>`;

        if (isActive === "active") { isActive = ""; }
        index++;
    });

    carousel.innerHTML = text;
    indicator.innerHTML = indicatorText;
}


function PetEvent(eventName, location, date, time, description, social, poster) {
    this.eventName = eventName;
    this.location = location;
    this.date = date;
    this.time = time;
    this.description = description;
    this.social = social;
    this.poster = poster;
}

//Open map
function openMapModal(location) {
    const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`;
    document.getElementById("mapFrame").src = mapUrl;
    const mapModal = new bootstrap.Modal(document.getElementById('mapModal'));
    mapModal.show();
}

//Close map when not use
document.getElementById('mapModal').addEventListener('hidden.bs.modal', function () {
    document.getElementById('mapFrame').src = "";
})

//PET FINDER PART 
function openMap(location) {
    const encodedLocation = encodeURIComponent(location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`, '_blank');
}



































































































































































































































































































