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

    updateSlide() {
        this.slides = this.container.querySelector(".slides");
        this.itemSlides = this.slides.querySelectorAll(".slide");
        this.dotContainer = this.container.querySelector(".dots")
        this.makeDots();
    }

    makeDots() {
        this.dotContainer.innerHTML = "";
        console.log(this.itemSlides.length);
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
        this.index = (this.index + 1) % this.itemSlides.length;
        this.goToSlide(this.index);
    }

    prev() {
        this.index = (this.index - 1 + this.itemSlides.length) % this.itemSlides.length;
        this.goToSlide(this.index);
    }
}


class PetCard {
    constructor(petInfo) {
        this.petInfo = petInfo;
        this.createElement();
    }

    createElement() {
        const divElement = document.createElement("div");
        divElement.className = "pet-card bg-light bevel-border-1 overflow-hidden";
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
                        ${this.petInfo.gender}</div>
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

        return divElement;
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

        let slideshowPet = new SlideShow(".pet-slider", 5000)
        showSlideShowPet(slideshowPet);

        //Change the size of partion of pets when screen changes
        window.addEventListener("resize", () => {
            showSlideShowPet(slideshowPet);
        });

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

function showSlideShowPet(slideshow) {
    const petSlider = document.querySelector(".pet-slider")
    const slides = petSlider.querySelector(".slides")

    let pets = [new PetInfo("Sunny", "Cat", "3 years old", "Male", "Brown", "assets/img/petAdoptionImages/cat.png"), new PetInfo("Good Boy", "Husky", "2 years old", "Male", "Brown", "assets/img/petAdoptionImages/husky.png"), new PetInfo("Rainbow", "Parrot", "2 years old", "Female", "Colorful", "assets/img/petAdoptionImages/parot.png"), new PetInfo("Sunny", "Cat", "3 years old", "Male", "Brown", "assets/img/petAdoptionImages/cat.png"), new PetInfo("Good Boy", "Husky", "2 years old", "Male", "Brown", "assets/img/petAdoptionImages/husky.png"), new PetInfo("Rainbow", "Parrot", "2 years old", "Female", "Colorful", "assets/img/petAdoptionImages/parot.png")];

    const width = window.innerWidth;
    let partition = 3;
    if (width < 768) {
        partition = 1;
    } else if (width < 992) {
        partition = 2;
    }

    updateSlideShowPet(pets, partition, slides);
    slideshow.updateSlide();
}

function updateSlideShowPet(pets, partition, slides) {
    const pages = Math.floor(pets.length / partition);
    slides.innerHTML = "";

    for (let i = 0; i < pages; i++) {
        // Row or Slide
        let slide = document.createElement("div");
        slide.className = "slide";

        let row = document.createElement("div")
        row.className = "row g-5 justify-content-center p-lg-3 p-0";
        slide.appendChild(row);

        for (let j = 0; j < partition; j++) {
            //Column inside slide or row
            let column = document.createElement("div");
            column.className = "col-md-5 col-sm-6 col-lg-3";

            let index = (i * partition) + j;
            let pet = pets[index];
            let petCard = new PetCard(pet, column);
            column.appendChild(petCard.createElement());

            row.appendChild(column);
        }

        slides.appendChild(slide);
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
const allEvents =
    [
        {
            id: "e1",
            title: "Golden Paws Meetup",
            img: "images/poster7.png",
            date: "Jan 25, 2026",
            location: "Pavilion Bukit Jalil",
            description: "A wonderful gathering for Golden Retrievers and their owners. Activities include a fetch competition and professional pet photography."
        },
        {
            id: "e2",
            title: "Puppy Yoga",
            img: "images/poster13.jpg",
            date: "Jan 20, 2026",
            location: "Sunny Meadows Park, 456 Bark Blvd",
            description: "Stretch, Snuggle & Smile! A beginner-friendly yoga flow with adorable pups. This is a local shelter fundraiser; please bring your own mat and water."
        },
        {
            id: "e3",
            title: "Paws & Whiskers Pet Fest",
            img: "images/poster2.png",
            date: "Oct 14, 2026",
            location: "Green Meadows Park, 1234 Barkside Lane",
            description: "Join us for a day of pet games, adoption meets, and tasty treats! A perfect social event for pets and their people."
        },
        {
            id: "e4",
            title: "Paws & Friends Pet Fest",
            img: "images/poster3.png",
            date: "Aug 12, 2026",
            location: "Sunny Meadow Park, 123 Greenway Drive",
            description: "A fun-filled day of treats and games for pets and their human companions in a beautiful park setting."
        },
        {
            id: "e5",
            title: "Pet Extravaganza",
            img: "images/poster1.png",
            date: "Jan 20, 2025",
            location: "Paws and Claws, Penang, Malaysia",
            description: "A fun-filled day celebrating pets and their people! This event is suitable for all ages and features a variety of pet-centric activities."
        },
        {
            id: "e6",
            title: "Pet Adoption Event",
            img: "images/poster14.png",
            date: "Jun 25, 2023",
            location: "Larana Pet Shop, KTCC Mall, Kuala Terengganu",
            description: "Find your perfect match at our pet adoption event! Meet adorable animals looking for their forever homes."
        },
        {
            id: "e7",
            title: "Dog Health Tips",
            img: "images/poster4.jpg",
            date: "Feb 25, 2026",
            location: "Larana Pet Shop, Jalan Abdul Malik",
            description: "Learn essential tips for your dog's wellbeing, including how to make a pet first aid kit, the importance of play, and pet insurance."
        },
        {
            id: "e8",
            title: "Paw-Some Pet Festival!",
            img: "images/poster6.jpg",
            date: "Oct 26, 2024",
            location: "Sunny Meadows Park",
            description: "A day of fun for furry friends and their humans! Featuring bunny parades, agility courses, free vet checks, and live music."
        },
        {
            id: "e9",
            title: "Celebrate Our Feathered Friends!",
            img: "images/poster8.png",
            date: "May 18, 2024",
            location: "Riverside Park Aviary",
            description: "The 20th annual celebration of birds! Join us at the aviary to learn about different species and enjoy the natural surroundings."
        },
        {
            id: "e10",
            title: "Find Your New Best Friend!",
            img: "images/poster9.jpg",
            date: "Oct 26, 2026",
            location: "Paw Prints Animal Shelter, 51 Jalan Bukit Bintang",
            description: "Come meet adorable, adoptable dogs, cats, and small animals. Features food trucks and fun for all ages!"
        },
        {
            id: "e11",
            title: "Dog Show",
            img: "images/poster10.png",
            date: "Aug 27, 2030",
            location: "MidValley Mall, Johor Bahru",
            description: "Compete in photo competitions, obedience trials, and costume parades. Amazing prizes for 1st, 2nd, and 3rd place winners!"
        },
        {
            id: "e12",
            title: "Pet Model Competition",
            img: "images/poster11.png",
            date: "Jun 21, 2029",
            location: "Kuantan City Hall",
            description: "Does your pet have what it takes to shine? Open to dogs, cats, birds, and bunnies. Cash prizes and trophies for winners."
        },
        {
            id: "e13",
            title: "Vet Q&A Session",
            img: "images/poster12.jpg",
            date: "Dec 10, 2026",
            location: "Happy Paws Clinic, 123 Animal Ave",
            description: "Ask the experts! Topics include pet health, behavior, diet tips, and vaccination prevention with a live Q&A with Dr. Lee."
        }
    ]

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
    <div class="modal-header border-0 pb-0">
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
    </div>
    <div class="modal-body p-4 pt-0">
        <div class="row align-items-center justify-content-center">
            
            <div class="col-md-6 text-center">
                <img src="${event.img}" class="img-fluid rounded border shadow-sm mb-3" 
                     style="max-height: 400px; width: auto; object-fit: contain;">
            </div>

            <div class="col-md-6 text-start">
                <h2 class="fw-bold mb-3">${event.title}</h2>
                <p class="text-primary mb-1">
                    <i class="fa-regular fa-calendar-check me-2"></i><strong>Date:</strong> ${event.date}
                </p>
                <p class="text-muted">
                    <i class="fa-solid fa-location-dot me-2"></i><strong>Location:</strong> ${event.location}
                </p>
                <hr>
                <h5 class="fw-bold">Description</h5>
                <p class="text-secondary mb-4">${event.description}</p>
                
                <div class="social-section pt-2">
                    <h6 class="fw-bold text-uppercase small text-muted mb-3">Share or Follow Us</h6>
                    <div class="d-flex gap-4 social-icons">
                        <a href="#" target="_blank"><i class="fa-brands fa-facebook fa-2x" style="color: #3b5998;"></i></a>
                        <a href="#" target="_blank"><i class="fa-brands fa-instagram fa-2x" style="color: #C13584;"></i></a>
                        <a href="#" target="_blank"><i class="fa-brands fa-twitter fa-2x" style="color: #1DA1F2;"></i></a>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;

function searchEvents() {
    // 1. Get what the user typed in the search bar
    const searchTerm = document.getElementById('eventSearch').value.toLowerCase();
    
    // 2. Filter the allEvents array
    const matchedEvents = allEvents.filter(event => {
        return event.title.toLowerCase().includes(searchTerm) || 
               event.description.toLowerCase().includes(searchTerm);
    });

    // 3. Clear the current cards and show only matched ones
    const container = document.getElementById('event-container');
    let htmlContent = "";

    matchedEvents.forEach(event => {
        htmlContent += `
            <div class="col-md-4 mb-4">
                <div class="event-card text-center" onclick="openEvent('${event.id}')">
                    <div class="event-img-container border">
                        <img src="${event.img}" alt="${event.title}" style="object-fit: contain;">
                    </div>
                    <h4 class="mt-3 fw-bold">${event.title}</h4>
                    <div class="title-underline"></div>
                </div>
            </div>`;
    });

    // 4. Update the page with results or a "Not Found" message
    if (matchedEvents.length === 0) {
        container.innerHTML = '<div class="col-12 text-center mt-5"><h3>No results found.</h3></div>';
    } else {
        container.innerHTML = htmlContent;
    }
}

        // 4. Use Bootstrap's Modal command to show the popup
        const myModal = new bootstrap.Modal(document.getElementById('eventModal'));
        myModal.show();
    }
}