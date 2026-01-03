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


class PetCard {
    constructor(petInfo, element) {
        this.petInfo;
        this.element;

        this.createElement();
    }

    createElement() {
        const divElement = document.createElement("div");
        divElement.classList.add("pet-card bg-light bevel-border-1 overflow-hidden")
        divElement.innerHTML = `
         <!--Pet Name-->
        <h3 class="pet-name text-center bg-green-1 p-2 text-white">${this.petInfo.name}</h3>

        <div class="jumbotron p-2 w-100">

            <!--Pet Image-->
            <div class="container-fluid d-flex justify-content-center mb-4">
                <div class="pet-img">
                    <img src="${this.petInfo.img}" class="img-fluid" alt="Snowy">
                </div>
            </div>

            <!--Pet info-->
            <div class="container-fluid text-start text-lg-center">
                <div class="row mb-1">
                    <div class="col-xl-6 col-md-12 pet-label"><strong>Species:</strong>
                        ${this.petInfo.species}</div>
                    <div class="col-xl-6  col-sm-12 pet-label"><strong>Age:</strong>
                        ${this.petInfo.age}
                    </div>
                    <div class="col-xl-6  col-md-12 pet-label"><strong>Gender:</strong>
                        ${this.PetInfo.gender}</div>
                    <div class="col-xl-6  col-md-12 pet-label"><strong>Color:</strong>
                        ${this.petInfo.color}</div>
                </div>
            </div>

        </div>

        <!--Contact-->
        <div class="container-fluid mt-3 bg-green-3 p-0">
            <h5 class="p-2 bg-green-1 text-white text-center">Contact</h5>

            <div class="text-center mb-1"><i class="fa-solid fa-phone"></i>: 000-0000000
            </div>

            <div
                class="d-flex justify-content-center align-items-center p-3 social-font">
                <i class="fa-brands fa-facebook fa-xl mx-2"></i>
                <i class="fa-brands fa-youtube fa-xl mx-2"></i>
                <i class="fa-brands fa-instagram fa-xl mx-2"></i>
                <i class="fa-brands fa-tiktok fa-xl mx-2"></i>
                <i class="fa-brands fa-twitter fa-xl mx-2"></i>
                <i class="fa-regular fa-map fa-xl mx-2"
                    onclick="openMapModal('5.352468, 103.099591')"></i>
            </div>
        </div>
        `

        this.element.appendChild(divElement);
    }
}


class PetInfo {
    constructor(name, species, age, gender, color, img) {
        this.name = name;
        this.species = species;
        this.age = age;
        this.gender = gender;
        this.color = color;
        this.img = img;
    }
}

//Functions that should be run on homepage
function homepageEvent(page) {
    if (page === "index.html") {
        //showUpcomingPetEvent();
        messageCycle(page);
        addCloseMapEvent();

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

function showSlideShowPet(page) {
    if (page === "index.html") {
        
    }
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
function addCloseMapEvent(page) {
    document.getElementById('mapModal').addEventListener('hidden.bs.modal', function () {
        document.getElementById('mapFrame').src = "";
    })
}

document.addEventListener("DOMContentLoaded", function () {
    const page = window.location.pathname.split("/").pop();
    homepageEvent(page);
    eventPage(page);
});


// event.html
// data object(stores event details)
const allEvents = [
    {
        id: "e1",
        title: "Golden Meetup",
        img: "images/poster7.png",
        date: "Oct 25, 2026",
        location: "Central Park",
        description: "A wonderful gathering for Golden Retrievers and their owners. Activities include a fetch competition and professional pet photography."
    },
    {
        id: "e2",
        title: "Cat Expo",
        img: "images/poster2.png",
        date: "Nov 05, 2026",
        location: "Convention Center",
        description: "Explore the latest in feline care, from organic treats to high-tech toys. Featuring a guest lecture on cat behavior."
    },
    {
        id: "e3",
        title: "Rabbit Hop",
        img: "images/poster3.png",
        date: "Nov 12, 2026",
        location: "Community Garden",
        description: "Bring your bunnies for a fun hopping course! Experts will be on site to discuss rabbit nutrition and dental health."
    },

    { id: "e4", title: "Puppy Yoga", img: "images/poster4.png", date: "Dec 01, 2026", location: "Yoga Studio", description: "Relax with your puppy in this beginner-friendly yoga session." },
    { id: "e5", title: "Bird Workshop", img: "images/poster5.jpg", date: "Dec 05, 2026", location: "Avian Center", description: "Learn about the social needs of parrots and cockatiels." },
    { id: "e6", title: "Hamster Race", img: "images/poster6.jpg", date: "Dec 10, 2026", location: "Pet Store", description: "The fastest hamsters in the city compete for prizes!" },
    { id: "e7", title: "Kitten Care", img: "images/poster1.png", date: "Dec 15, 2026", location: "Rescue Shelter", description: "A workshop for new kitten owners covering vaccines and weaning." },
    { id: "e8", title: "Dog Hike", img: "images/poster8.png", date: "Jan 05, 2026", location: "Blue Hills", description: "A group hiking event for energetic dogs and their humans." },
    { id: "e9", title: "Snake Safety", img: "images/poster9.png", date: "Jan 10, 2026", location: "Zoo Hall", description: "Learn how to safely handle and house exotic pet snakes." },
    { id: "e10", title: "Fish Breeding", img: "images/poster10.png", date: "Jan 15, 2026", location: "Aquarium", description: "Technical tips for breeding freshwater tropical fish." },
    { id: "e11", title: "Pet Adoption", img: "images/poster11.png", date: "Feb 01, 2026", location: "Main Square", description: "Find your new best friend at our monthly adoption fair." },
    { id: "e12", title: "Vet Q&A", img: "images/poster12.png", date: "Feb 10, 2026", location: "Online", description: "Ask our resident veterinarian anything about pet health." }
];

/*
 * This function loops through the array and builds the 12 cards in HTML.
 */
function displayEvents() {
    const container = document.getElementById('event-container');
    let htmlContent = ""; // Start with an empty text string

    // For each object in the 'allEvents' array...
    allEvents.forEach(event => {
        // ...add a Bootstrap column with the card structure
        htmlContent += `
            <div class="col-md-4 mb-4">
                <div class="event-card text-center" onclick="openEvent('${event.id}')">
                    <div class="event-img-container border">
                        <img src="${event.img}" alt="${event.title}">
                    </div>
                    <h4 class="mt-3 fw-bold">${event.title}</h4>
                    <div class="title-underline"></div> </div>
            </div>
        `;
    });

    // Put the generated cards into the HTML container
    container.innerHTML = htmlContent;
}

// tips
//This function triggers when a card is clicked.
//It finds the right description and "injects" it into the Modal.

function openEvent(eventId) {
    // 1. Find the specific event data using the unique ID
    const event = allEvents.find(e => e.id === eventId);

    // 2. Reference the modal area from your HTML
    const modalArea = document.getElementById('modal-content-area');

    if (event) {
        // 3. Build the layout inside the modal (matches Sketch 2)
        modalArea.innerHTML = `
            <div class="modal-header border-0">
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-4">
                <div class="row">
                    <div class="col-md-6 text-center">
                        <img src="${event.img}" class="img-fluid rounded border shadow-sm mb-3">
                        <div class="text-start ms-2">
                            <h6>Social</h6>
                            <div class="d-flex gap-3 social-icons">
                                <i class="fa-brands fa-facebook"></i>
                                <i class="fa-brands fa-instagram"></i>
                                <i class="fa-brands fa-twitter"></i>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h2 class="fw-bold">${event.title}</h2>
                        <p class="text-primary mb-1"><strong>Date:</strong> ${event.date}</p>
                        <p class="text-muted"><strong>Location:</strong> ${event.location}</p>
                        <hr>
                        <h5 class="fw-bold">Description</h5>
                        <p class="text-secondary">${event.description}</p>
                        
                        <div class="mt-5 p-3 bg-light border rounded">
                            <small class="fw-bold text-uppercase">Registration</small>
                            <p class="mb-0 small">Visit the links on the left to sign up.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 4. Use Bootstrap's Modal command to show the popup
        const myModal = new bootstrap.Modal(document.getElementById('eventModal'));
        myModal.show();
    }
}