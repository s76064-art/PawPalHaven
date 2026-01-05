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

        //Close map when not use
        document.getElementById('mapModal').addEventListener('hidden.bs.modal', function () {
            document.getElementById('mapFrame').src = "";
        })

    }
}


//Functions that should be run on event page
function eventPage(page) {
    if (page === "event.html") {
        displayEvents();
    }
}

//Functions that should be run on login-registraion page
function loginRegister(page) {
    if (page === "login-registration.html") {
        const loginForm = document.getElementById("login-form");
        const registerForm = document.getElementById("register-form");
        const registerBtn = document.getElementById("register-btn");

        registerBtn.addEventListener("click", function () {
            document.querySelectorAll(".login-form-input").forEach(input => input.disabled = true);
            loginForm.style.display = "none";
            registerForm.style.display = "block";
        });
    }
}

//Functions that should be run in dashboard
function dashboard(page) {
    if (page === "dashboard.html") {
        document.querySelectorAll('.sidebar .nav-link').forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                const target = this.dataset.target;
                document.querySelectorAll('.dashboard-page').forEach(page => page.style.display = 'none');
                document.getElementById(target).style.display = 'block';
            });
        });
    }
}


document.addEventListener("DOMContentLoaded", function () {
    const page = window.location.pathname.split("/").pop();

    homepageEvent(page);
    eventPage(page);
    loginRegister(page);
    dashboard(page);
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
/**
 * PART 1: THE DATA OBJECT
 * This array acts as your "database". 
 * It stores the details for all 12 events in one place.
 */
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
    // Repeat this pattern to create a total of 12 events (e4, e5... e12)
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

// data object(stores event details)
const allEvent =
    [
        {
            id: "e1",
            title: "Golden Paws Meetup",
            img: "images/poster7.png",
            date: "Jan 25, 2026",
            location: "Pavilion Bukit Jalil",
            description: "A wonderful gathering for Golden Retrievers and their owners. Activities include a fetch competition and professional pet photography.",
            socials: {
                facebook: "https://www.facebook.com/PawsPJ",
                instagram: "https://www.instagram.com/p/DJ1gdxtiMmN/?hl=en",
                twitter: "https://x.com/murniekspo"
            }
        },
        {
            id: "e2",
            title: "Puppy Yoga",
            img: "images/poster13.jpg",
            date: "Jan 20, 2026",
            location: "Sunny Meadows Park, 456 Bark Blvd",
            description: "Stretch, Snuggle & Smile! A beginner-friendly yoga flow with adorable pups. This is a local shelter fundraiser; please bring your own mat and water.",
            socials: {
                facebook: "https://www.facebook.com/bestfriendsanimalsociety",
                instagram: "https://www.instagram.com/p/DQstHsvkqOo/",
                twitter: "https://x.com/murniekspo"
            }
        },
        {
            id: "e3",
            title: "Paws & Whiskers Pet Fest",
            img: "images/poster2.png",
            date: "Oct 14, 2026",
            location: "Green Meadows Park, 1234 Barkside Lane",
            description: "Join us for a day of pet games, adoption meets, and tasty treats! A perfect social event for pets and their people.",
            socials: {
                facebook: "https://www.facebook.com/petexpomy/",
                instagram: "https://www.instagram.com/p/DQstHsvkqOo/",
                twitter: "https://x.com/murniekspo"
            }
        },
        {
            id: "e4",
            title: "Paws & Friends Pet Fest",
            img: "images/poster3.png",
            date: "Aug 12, 2026",
            location: "Sunny Meadow Park, 123 Greenway Drive",
            description: "A fun-filled day of treats and games for pets and their human companions in a beautiful park setting.",
            socials: {
                facebook: "https://www.facebook.com/OhMyPetExpo/",
                instagram: "https://www.instagram.com/ohmypetexpo/?hl=en",
                twitter: "https://x.com/murniekspo"
            }
        },
        {
            id: "e5",
            title: "Pet Extravaganza",
            img: "images/poster1.png",
            date: "Jan 20, 2025",
            location: "Paws and Claws, Penang, Malaysia",
            description: "A fun-filled day celebrating pets and their people! This event is suitable for all ages and features a variety of pet-centric activities.",
            socials: {
                facebook: "https://www.facebook.com/pawwowmalaysia/",
                instagram: "https://www.instagram.com/p/DRbQXDyD8F-/?hl=en",
                twitter: "https://x.com/murniekspo"
            }
        },
        {
            id: "e6",
            title: "Pet Adoption Event",
            img: "images/poster14.png",
            date: "Jun 25, 2023",
            location: "Larana Pet Shop, KTCC Mall, Kuala Terengganu",
            description: "Find your perfect match at our pet adoption event! Meet adorable animals looking for their forever homes.",
            socials: {
                facebook: "https://www.facebook.com/petexpomalaysia/",
                instagram: "https://www.instagram.com/ohmypetexpo/reels/",
                twitter: "https://x.com/murniekspo"
            }
        },
        {
            id: "e7",
            title: "Dog Health Tips",
            img: "images/poster4.jpg",
            date: "Feb 25, 2026",
            location: "Larana Pet Shop, Jalan Abdul Malik",
            description: "Learn essential tips for your dog's wellbeing, including how to make a pet first aid kit, the importance of play, and pet insurance.",
            socials: {
                facebook: "https://www.facebook.com/foodiejohor/posts/pet-expo-malaysia-is-finally-coming-to-johor-bahru-2830-nov-with-250-pet-brands-/1305914298230354/",
                instagram: "https://www.instagram.com/p/DJ1gdxtiMmN/?hl=en",
                twitter: "https://x.com/murniekspo"
            }
        },
        {
            id: "e8",
            title: "Paw-Some Pet Festival!",
            img: "images/poster6.jpg",
            date: "Oct 26, 2024",
            location: "Sunny Meadows Park",
            description: "A day of fun for furry friends and their humans! Featuring bunny parades, agility courses, free vet checks, and live music.",
            socials: {
                facebook: "https://www.facebook.com/mycatexpo/",
                instagram: "https://www.instagram.com/p/DQstHsvkqOo/",
                twitter: "https://x.com/murniekspo"
            }
        },
        {
            id: "e9",
            title: "Celebrate Our Feathered Friends!",
            img: "images/poster8.png",
            date: "May 18, 2024",
            location: "Riverside Park Aviary",
            description: "The 20th annual celebration of birds! Join us at the aviary to learn about different species and enjoy the natural surroundings.",
            socials: {
                facebook: "https://www.facebook.com/PavilionBukitJalil.Mall/posts/the-international-dog-show-pet-fair-has-landed-at-pavilion-bukit-jalil-from-show/1306947908113634/",
                instagram: "https://www.instagram.com/pet_expo/reels/",
                twitter: "https://x.com/murniekspo"
            }
        },
        {
            id: "e10",
            title: "Find Your New Best Friend!",
            img: "images/poster9.jpg",
            date: "Oct 26, 2026",
            location: "Paw Prints Animal Shelter, 51 Jalan Bukit Bintang",
            description: "Come meet adorable, adoptable dogs, cats, and small animals. Features food trucks and fun for all ages!",
            socials: {
                facebook: "https://www.facebook.com/petexpomy/",
                instagram: "https://www.instagram.com/pet_expo/reels/",
                twitter: "https://x.com/murniekspo"
            }
        },
        {
            id: "e11",
            title: "Dog Show",
            img: "images/poster10.png",
            date: "Aug 27, 2030",
            location: "MidValley Mall, Johor Bahru",
            description: "Compete in photo competitions, obedience trials, and costume parades. Amazing prizes for 1st, 2nd, and 3rd place winners!",
            socials: {
                facebook: "https://www.facebook.com/petexpomy/",
                instagram: "https://www.instagram.com/ohmypetexpo/?hl=en",
                twitter: "https://x.com/murniekspo"
            }
        },
        {
            id: "e12",
            title: "Pet Model Competition",
            img: "images/poster11.png",
            date: "Jun 21, 2029",
            location: "Kuantan City Hall",
            description: "Does your pet have what it takes to shine? Open to dogs, cats, birds, and bunnies. Cash prizes and trophies for winners.",
            socials: {
                facebook: "https://www.facebook.com/petexpomy/",
                instagram: "https://www.instagram.com/petexpomalaysia/?hl=en",
                twitter: "https://x.com/murniekspo"
            }
        },
        {
            id: "e13",
            title: "Vet Q&A Session",
            img: "images/poster12.jpg",
            date: "Dec 10, 2026",
            location: "Happy Paws Clinic, 123 Animal Ave",
            description: "Ask the experts! Topics include pet health, behavior, diet tips, and vaccination prevention with a live Q&A with Dr. Lee.",
            socials: {
                facebook: "https://www.facebook.com/petexpomy/",
                instagram: "https://www.instagram.com/petexpomalaysia/?hl=en",
                twitter: "https://x.com/murniekspo"
            }
        }
    ]


/**
 * PART 2: DISPLAYING THE GALLERY (Sketch 1)
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
            </div>
        `;
    });

    // Put the generated cards into the HTML container
    container.innerHTML = htmlContent;
}


/**
 * PART 3: THE POPUP MODAL (Sketch 2)
 * This function triggers when a card is clicked.
 * It finds the right description and "injects" it into the Modal.
 */

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
                        <a href="${event.socials.facebook}" target="_blank"><i class="fa-brands fa-facebook fa-2x" style="color: #3b5998;"></i></a>
                        <a href="${event.socials.instagram}" target="_blank"><i class="fa-brands fa-instagram fa-2x" style="color: #C13584;"></i></a>
                        <a href="${event.socials.twitter}" target="_blank"><i class="fa-brands fa-twitter fa-2x" style="color: #1DA1F2;"></i></a>
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




//--------------------------------------------------- PET FINDER PART (Lynn)------------------------------------------------------------
function openMap(location) {
    const encodedLocation = encodeURIComponent(location);
    // Gunakan backtick (`) di awal dan di hujung, dan masukkan pembolehubah dalam ${ }
    window.open(`https://www.google.com/maps/search/${encodedLocation}`, '_blank');

    // Function to handle the image upload click
    function triggerFileInput() {
        document.getElementById('imageInput').click();
    }

    // Function to preview the image immediately
    function previewImage(event) {
        const reader = new FileReader();
        const imageField = document.getElementById('profilePic');
        reader.onload = function () {
            if (reader.readyState === 2) {
                imageField.src = reader.result;
            }
        }
        if (event.target.files[0]) {
            reader.readAsDataURL(event.target.files[0]);
        }
    }

    //add social media 
    // Function to add multiple social media handles with delete confirmation
    function addSocial() {
        const platform = prompt("Enter platform (e.g. Instagram, Facebook):");
        const username = prompt("Enter your @username:");

        if (platform && username) {
            const socialBox = document.getElementById('socialBox');

            // 1. Remove the "No social media connected" placeholder if it's there
            const emptyText = document.getElementById('socialText');
            if (emptyText) {
                // Removes the entire row containing the "No social media" text
                emptyText.parentElement.remove();
            }
            // 2. Logic to pick the right icon
            let iconClass = "fa-share-nodes"; // Default icon
            const p = platform.toLowerCase();

            if (p.includes("instagram")) iconClass = "fa-instagram";
            else if (p.includes("facebook")) iconClass = "fa-facebook";
            else if (p.includes("twitter") || p.includes("x")) iconClass = "fa-x-twitter";
            else if (p.includes("tiktok")) iconClass = "fa-tiktok";
            else if (p.includes("youtube")) iconClass = "fa-youtube";
            // 3. Create a new div for this specific social handle
            const newSocial = document.createElement('div');
            newSocial.className = "d-flex align-items-center justify-content-between p-2 mb-2 bg-white rounded border shadow-sm w-100 social-item";

            // Use "fa-brands" for social media icons
            newSocial.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fa-brands ${iconClass} me-3 fs-4 text-success"></i>
                <small><strong>${platform}:</strong> @${username}</small>
            </div>
            <button class="btn btn-sm text-danger border-0" 
                    onclick="if(confirm('Are you sure you want to remove this social media link?')) { removeSocialItem(this); }">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
            socialBox.prepend(newSocial);


            // 4. Set the internal HTML with a trash button that asks for confirmation
            newSocial.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fa-solid fa-share-nodes me-2 text-success"></i>
                <small><strong>${platform}:</strong> @${username}</small>
            </div>
            <button class="btn btn-sm text-danger border-0" 
                    onclick="if(confirm('Are you sure you want to remove this social media link?')) { removeSocialItem(this); }">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;

            // 5. Add the new handle to the top of the box
            socialBox.prepend(newSocial);
        }
    }

    // Helper function to handle the removal and reset the empty state if needed
    function removeSocialItem(button) {
        const socialBox = document.getElementById('socialBox');
        // Remove the specific social media row
        button.parentElement.remove();

        // 5. If no items are left, reset back to the "Empty" state
        const remainingItems = socialBox.querySelectorAll('.social-item');
        if (remainingItems.length === 0) {
            // Create the original placeholder structure
            const placeholder = document.createElement('div');
            placeholder.className = "d-flex align-items-center mb-2";
            placeholder.innerHTML = `
            <i class="fa-solid fa-circle-nodes me-3 fs-4 text-secondary"></i>
            <span class="text-muted small" id="socialText">No social media connected</span>
        `;
            // Put the placeholder back at the start of the box
            socialBox.prepend(placeholder);
        }
    }
    // Function to toggle Edit Mode
    function toggleEdit() {
        // We only want to edit text and email inputs
        const inputs = document.querySelectorAll('.profile-card input[type="text"], .profile-card input[type="email"]');
        const editBtn = document.getElementById('editBtn');
        const nameDisplay = document.getElementById('displayUserName');

        if (inputs[0].hasAttribute('readonly')) {
            // --- SWITCH TO EDIT MODE ---
            inputs.forEach(input => {
                input.removeAttribute('readonly');
                input.style.backgroundColor = "#ffffff"; // Force white background
                input.style.border = "1px solid #009200"; // Add green border
            });
            editBtn.innerText = "Save Changes";
            editBtn.className = "btn btn-primary fw-bold rounded-pill py-2 w-100";
        } else {
            // --- SAVE AND LOCK ---
            inputs.forEach(input => {
                input.setAttribute('readonly', true);
                input.style.backgroundColor = ""; // Return to CSS default
                input.style.border = "";
            });

            // Update the big name at the top
            nameDisplay.innerText = inputs[0].value;

            editBtn.innerText = "Edit Profile";
            editBtn.className = "btn btn-success fw-bold rounded-pill py-2 w-100";

            alert("Profile saved!");
        }
    }
}