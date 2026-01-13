//Gloabal vars
let pawpalHavenDB;


//Classes

// Local Database
class Database {
    constructor(dbName, dbVersion) {
        this.dbName = dbName;
        this.version = dbVersion;
        this.db = null;
    }

    async openDB() {
        return new Promise((resolve, reject) => {
            //Open db
            const request = indexedDB.open(this.dbName, this.version);

            //Create/Retrieve table
            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                if (!db.objectStoreNames.contains("user"))
                    db.createObjectStore("user", { keyPath: "userId" });
                if (!db.objectStoreNames.contains("pet"))
                    db.createObjectStore("pet", { keyPath: "petId" });
                if (!db.objectStoreNames.contains("event"))
                    db.createObjectStore("event", { keyPath: "eventId" });
                if (!db.objectStoreNames.contains("social"))
                    db.createObjectStore("social", { keyPath: "socialId" });
                if (!db.objectStoreNames.contains("address"))
                    db.createObjectStore("address", { keyPath: "addressId" });
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            request.onerror = (e) => reject(e.target.error);
        });
    }

    //Add
    async add(storeName, obj) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, "readwrite");
            const store = tx.objectStore(storeName);
            const request = store.add(obj);
            request.onsuccess = () => resolve(true);
            request.onerror = (e) => reject(e.target.error);
        });
    }

    //Delete
    async deleteById(storeName, id) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, "readwrite");
            const store = tx.objectStore(storeName);

            const request = store.delete(id);
            request.onsuccess = () => resolve(true);
            request.onerror = (e) => reject(e.target.error);
        });
    }

    //Retrieve
    async get(storeName, key) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, "readonly");
            const store = tx.objectStore(storeName);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
    }

    //Retrieve all data by storename
    async getAllDataByStoreName(storename) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storename, "readonly");
            const store = tx.objectStore(storename);

            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
    }

}


//Main data
class User {
    static users = [];

    constructor(userId, fullName, phone, email, password, social, pets, lostPets, events) {
        this.userId = userId;
        this.name = fullName;
        this.phone = phone;
        this.email = email;
        this.password = password;
        this.social = social || null;
        this.pets = pets || [];
        this.lostPets = lostPets || [];
        this.events = events || [];

    }

    static create(userId, fullName, phone, email, password, social, pets, lostPets, events) {
        //Check if email already exist
        if (User.users.find(u => u.email === email)) {
            return false;
        }

        //Generate id
        const id = userId || generateId("U");

        //Reject user creation
        if (id === null) {
            console.log("Unable to create user");
            return null;
        }

        //Create user
        const user = new User(id, fullName, phone, email, password, social, pets, lostPets, events);
        const status = pawpalHavenDB.add("user", user);
        console.log(status);
        User.users.push(user);
        return user;
    }

    static login(email, password) {
        const user = User.users.find(u => u.email === email && u.password === password);
        if (!user) {
            console.log("Failed");
            return false;
        }

        sessionStorage.setItem("loggedInUser", JSON.stringify(user));
        window.location.href = "index.html";
        console.log("Success");
        return true;
    }

    static logout() {
        sessionStorage.removeItem("loggedInUser");
    }

    static register(email, password, fullName, phone) {
        const user = User.create(null, fullName, phone, email, password, null, null, null, null);
        if (user === null) {
            return {
                message: "Unable to create user",
                isValid: null,
                redirect: null
            }
        } else if (user === false) {
            return {
                message: "Email already exist",
                isValid: false,
                redirect: false
            }
        }

        console.log("Success");
        sessionStorage.setItem("loggedInUser", JSON.stringify(user));
        return {
            message: "Register Success",
            isValid: true,
            redirect: "index.html"
        };
    }

    static getCurrentUser() {
        const userData = sessionStorage.getItem("loggedInUser");
        return userData ? JSON.parse(userData) : null;
    }
}

class Pet {
    static pets = [];
    constructor(petId, petName, species, age, gender, description, address, image) {
        this.petId = petId;
        this.name = petName;
        this.species = species;
        this.age = age;
        this.gender = gender;
        this.description = description;
        this.address = address;
        this.image = image;

    }

    static create(petId, petName, species, age, gender, description, address, image) {
        const id = petId || generateId("P");

        if (id === null) {
            console.log("Unable to create event");
            return null;
        }

        const pet = new Pet(id, petName, species, age, gender, description, address, image);
        Pet.pets.push(pet);
        return pet;
    }
}

class MyPetEvent {
    static events = [];
    constructor(eventId, eventName, date, time, description, address, image) {
        this.eventId = eventId;
        this.name = eventName;
        this.date = date;
        this.time = time;
        this.description = description;
        this.address = address;
        this.image = image;
    }

    static create(eventId, eventName, date, time, description, address, image) {
        const id = eventId || generateId("E");

        if (id === null) {
            console.log("Unable to create event");
            return null;
        }

        const event = new MyPetEvent(id, eventName, date, time, description, address, image);
        MyPetEvent.events.push(event);
        return event;
    }
}

class Social {
    static socials = [];
    constructor(socialId, socialLink, othersLink) {
        this.socialId = socialId;
        this.othersLink = othersLink;

        const defaultLinks = {
            Reddit: null,
            Facebook: null,
            Twitter: null,
            Instagram: null,
            LinkedIn: null
        };

        //Merge dictionary
        this.links = Object.assign({}, defaultLinks, socialLink);
    }


    static create(socialId, socialLink, othersLink) {
        const id = socialId || generateId("S");

        if (id === null) {
            console.log("Unable to create social ");
            return null;
        }

        const social = new Social(id, socialLink, othersLink);
        Social.socials.push(social);
        return social;
    }
}

class Address {
    static addresses = [];
    constructor(addressId, longitude, latitude, city, state, country) {
        this.addressId = addressId;
        this.longitude = longitude;
        this.latitude = latitude;
        this.city = city;
        this.state = state;
        this.country = country;
    }

    static create(addressId, longitude, latitude, city, state, country) {
        const id = addressId || generateId('A');

        if (id === null) {
            console.log("Unable to create address ");
            return null;
        }

        const address = new Address(id, longitude, latitude, city, state, country);
        Address.addresses.push(address);
        return address;
    }
}


//Structure class
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

//Generate Id
function generateId(type) {
    switch (type) {
        case 'U': return formatId(type, User.users.length + 1);
        case 'P': return formatId(type, Pet.pets.length + 1);
        case 'E': return formatId(type, Event.events.length + 1);
        case 'S': return formatId(type, Social.socials.length + 1);
        case 'A': return formatId(type, Address.addresses.length + 1);
        default:
            console.log("Unable to generate id using " + type);
            return null;
    }
}

//Format id
function formatId(prefix, number) {
    if (number >= 100) {
        return prefix + number.toString();
    } else if (number >= 10) {
        return prefix + "0" + number.toString();
    } else {
        return prefix + "00" + number.toString();
    }
}


//Protect pages that requires to be logged in
function requireLogin() {
    if (User.getCurrentUser() === null) {
        alert("Login required");
        window.location.href = "index.html";
    }
}

//Update nav bar 
function updateNavbar() {
    const navLoginProfile = document.getElementById("login-profile-nav");
    if (navLoginProfile === null) { return console.log("Missing id"); }

    if (User.getCurrentUser() === null) {
        navLoginProfile.innerHTML = `<a class="nav-link" href="login-registration.html">Login</a>`;
        console.log("Non");
    } else {
        navLoginProfile.innerHTML = `<a class="nav-link" href="profile.html">Profile</a>`;
        console.log("Profile");
    }
}

//Functions that should be run on homepage
function homepageEvent(page) {
    if (page === "index.html") {
        //showUpcomingPetEvent();

        console.log(User.getCurrentUser());

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

//Functions that should be run on login-register page
function loginRegisterPage(page) {
    if (page !== "login-registration.html") { return null; }

    const loginForm = document.getElementById("login-form-container");
    const loginBtn = document.getElementById("login-btn");

    const emailInput = document.getElementById("login-email");
    const passwordInput = document.getElementById("login-password");

    const loginEmailFeedback = document.getElementById("login-email-feedback");
    const loginPasswordFeedback = document.getElementById("login-password-feedback");

    const registerForm = document.getElementById("register-form-container");
    const registerBtn = document.getElementById("register-btn");

    //Register
    const emailRegisterInput = document.getElementById("email-register");
    const passwordRegisterInput = document.getElementById("password-register");
    const fullNameRegisterInput = document.getElementById("full-name");
    const phoneRegisterInput = document.getElementById("phone");

    const registerEmailFeedback = document.getElementById("register-email-feedback");
    const registerPasswordFeedback = document.getElementById("register-password-feedback");
    const registerFullNameFeedback = document.getElementById("register-full-name-feedback");
    const registerPhoneFeedback = document.getElementById("register-phone-feedback");

    //Register form
    registerBtn.addEventListener("click", function () {
        document.querySelectorAll(".login-form-input").forEach(input => input.disabled = true);

        //Enable register 
        loginForm.style.display = "none";
        registerForm.style.display = "block";

        const signinBtn = document.getElementById("sign-in-btn");
        signinBtn.addEventListener("click", function (e) {
            e.preventDefault();

            //Check validity
            let valid = true;
            registerForm.querySelectorAll(".input-group").forEach(group => {
                const input = group.querySelector("input");

                if (!input.checkValidity()) {
                    group.classList.add("invalid-input");

                    const errMessage = input.validationMessage;
                    let feedback;
                    switch (input) {
                        case emailRegisterInput:
                            feedback = registerEmailFeedback;
                            break;
                        case passwordRegisterInput:
                            feedback = registerPasswordFeedback;
                            break;
                        case fullNameRegisterInput:
                            feedback = registerFullNameFeedback;
                            break;
                        case phoneRegisterInput:
                            feedback = registerPhoneFeedback;
                            break;
                    }

                    if (!feedback) { console.log("Unable to validate"); return null }
                    feedback.classList.remove("d-none");
                    feedback.classList.add("d-block");
                    feedback.innerText = errMessage;
                    valid = false;
                }
            })

            if (!valid) { return null; }

            //Get values
            const email = emailRegisterInput.value;
            const password = passwordRegisterInput.value;
            const fullName = fullNameRegisterInput.value;
            const phone = phoneRegisterInput.value;

            //Register
            const success = User.register(email, password, fullName, phone);
            console.log(success.isValid);
            if (success.isValid === false) {
                document.querySelector(".register-email-group").classList.add("invalid-input")
                registerEmailFeedback.classList.remove("d-none");
                registerEmailFeedback.classList.add("d-block");
                console.log(success.message);
                registerEmailFeedback.innerText = success.message;
            } else if (success.isValid === null) {
                alert("Unable to register");
            } else {
                window.location.href = success.redirect;
            }

        })

        //Detect changes in register input
        registerForm.querySelectorAll(".input-group").forEach(group => {
            const input = group.querySelector("input");

            input.addEventListener("input", function () {
                group.classList.remove("invalid-input");
                registerEmailFeedback.classList.add("d-none");
                registerPasswordFeedback.classList.add("d-none");
                registerFullNameFeedback.classList.add("d-none");
                registerPhoneFeedback.classList.add("d-none");
            });

        })

    });

    //Detect login btn clicked
    loginBtn.addEventListener("click", function (e) {
        e.preventDefault();
        console.log("Clicked")

        //Trigger report validity
        let valid = true;
        loginForm.querySelectorAll(".input-group").forEach(group => {
            const input = group.querySelector("input");
            if (!input.checkValidity()) {
                group.classList.add("invalid-input");

                const errMessage = input.validationMessage;
                //Check which input 
                if (input === emailInput) {
                    loginEmailFeedback.classList.remove("d-none");
                    loginEmailFeedback.classList.add("d-block");
                    loginEmailFeedback.innerText = errMessage;
                } else {
                    loginPasswordFeedback.classList.remove("d-none");
                    loginPasswordFeedback.classList.add("d-block");
                    loginPasswordFeedback.innerText = errMessage;
                }

                valid = false;
            }
        });

        if (!valid) return null;

        //Get values
        const email = emailInput.value;
        const password = passwordInput.value;

        const status = User.login(email, password);
        if (status === false) {
            loginForm.querySelectorAll(".input-group").forEach(group => { group.classList.add("invalid-input"); });

            loginEmailFeedback.classList.remove("d-none");
            loginEmailFeedback.classList.add("d-block");
            loginEmailFeedback.innerText = "Wrong email";

            loginPasswordFeedback.classList.remove("d-none");
            loginPasswordFeedback.classList.add("d-block");
            loginPasswordFeedback.innerText = "Wrong password";
        }

        //Detect changes in login input
        loginForm.querySelectorAll(".input-group").forEach(group => {
            const input = group.querySelector("input");

            input.addEventListener("input", function () {
                group.classList.remove("invalid-input");
                loginEmailFeedback.classList.add("d-none");
                loginPasswordFeedback.classList.add("d-none");
            });

        })
    })
}

//Functions that should be run on dashboard
function dashboard(page) {
    if (page === "dashboard.html") {
        requireLogin();
        addChangePageEvent();

        imagePreviewEvent("pet-image");
        imagePreviewEvent("poster-image");
        imagePreviewEvent("lost-pet-image")

        addClickableImageInput("clickable-img-input-pet");
        addClickableImageInput("clickable-img-input-event");
        addClickableImageInput("clickable-img-input-lost-pet");

        addMapPicker("petModal");
        addMapPicker("eventModal");
        addMapPicker("lostPetModal");
    }
}

//Give functionality to side-navbar in dashboard
function addChangePageEvent() {
    const pageLinks = document.querySelectorAll(".a-link");

    pageLinks.forEach(element => {
        const target = element.dataset.target;

        element.addEventListener("click", function () {
            //Hide every single page
            document.querySelectorAll(".dashboard-page").forEach(page => {
                page.style.display = "none";
            });

            //Show the correct page
            console.log(target);
            document.getElementById(target).style.display = "block";

            //Update side-navbar
            pageLinks.forEach(link => link.classList.remove("active"));
            element.classList.add("active");
        });

    });
}

//Upload image preview
function imagePreviewEvent(id) {
    const inputImage = document.getElementById(id);
    inputImage.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            const imgPreview = document.getElementById(inputImage.dataset.target);
            imgPreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

//Trigger file input using image
function addClickableImageInput(id) {
    const img = document.getElementById(id);
    const target = document.getElementById(img.dataset.target);
    img.addEventListener("click", function () {
        target.click();
    });
}


//Add map functionality
function addMapPicker(id) {
    const mapContainer = document.getElementById(id);
    let map, marker;

    mapContainer.addEventListener('shown.bs.modal', function () {


        // Default coordinates (fallback if geolocation fails)
        const defaultLat = 3.1390; // Kuala Lumpur
        const defaultLng = 101.6869;

        if (!map) {
            map = L.map(mapContainer.dataset.target).setView([defaultLat, defaultLng], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }).addTo(map);
        }

        // Try to use user's current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                map.setView([userLat, userLng], 13);

                // Optional: place a marker at current location
                marker = L.marker([userLat, userLng]).addTo(map);

                document.getElementById("latitude").value = userLat;
                document.getElementById("longitude").value = userLng;

                // Optional: reverse geocode user's location
                reverseGeocode(userLat, userLng);
            }, function (err) {
                console.warn("Geolocation failed or denied, using default location", err);
            });
        }

        // Click map to select location
        map.on('click', function (e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;

            if (marker) marker.remove();
            marker = L.marker([lat, lng]).addTo(map);

            document.getElementById("latitude").value = lat;
            document.getElementById("longitude").value = lng;

            reverseGeocode(lat, lng);
        });

        // Fix map display
        setTimeout(() => { map.invalidateSize(); }, 200);
    });

    // Reverse geocode function
    async function reverseGeocode(lat, lng) {
        const apiKey = "3c39795f825d401783a3cf2cd6ceb39e";
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}&no_annotations=0&abbrv=0`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.results.length === 0) return;

            // Pick the most confident result
            const result = data.results.find(r => r.confidence >= 9) || data.results[0];
            const c = result.components;

            document.getElementById("city").value = c.city || c.town || c.village || c.hamlet || "";
            document.getElementById("state").value = c.state || "";
            document.getElementById("country").value = c.country || "";

            console.log("City:", document.getElementById("city").value);
            console.log("State:", document.getElementById("state").value);
            console.log("Country:", document.getElementById("country").value);
        } catch (err) {
            console.error("Reverse geocoding failed", err);
        }
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
    console.log("Trig")
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


document.addEventListener("DOMContentLoaded", async function () {
    //Initialize DB
    pawpalHavenDB = new Database("Test", 1);
    await pawpalHavenDB.openDB();

    User.create(null, "Syamil", "012-3421010", "syamil@gmail.com", "123", null, null, null, null);

    const page = window.location.pathname.split("/").pop();
    updateNavbar();
    homepageEvent(page);
    eventPage(page);
    dashboard(page);
    loginRegisterPage(page);
});




// ------------------------------------------------------------- PET EVENT ------------------------------------------------------------
// event (izani)
// data object(stores event details)
const allEvents =
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
 * This function loops through the array and builds the 13 cards in HTML.
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
 * PART 3: THE POPUP MODAL (Sketch 2) (izani)
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

        // search events (izani)
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





// ----------------------PROFILE----------------------------------
//add social media 
// Function to add multiple social media handles with delete confirmation
// ---------------------- PROFILE ----------------------

// Add social media
function addSocial() {
    const platform = prompt("Enter platform (e.g. Instagram, Facebook):");
    const username = prompt("Enter your @username:");

    if (!platform || !username) return;

    const socialBox = document.getElementById("socialBox");

    // Remove placeholder if exists
    const emptyText = document.getElementById("socialText");
    if (emptyText) {
        emptyText.parentElement.remove();
    }

    // Choose icon
    let iconClass = "fa-share-nodes";
    const p = platform.toLowerCase();

    if (p.includes("instagram")) iconClass = "fa-instagram";
    else if (p.includes("facebook")) iconClass = "fa-facebook";
    else if (p.includes("twitter") || p.includes("x")) iconClass = "fa-x-twitter";
    else if (p.includes("tiktok")) iconClass = "fa-tiktok";
    else if (p.includes("youtube")) iconClass = "fa-youtube";

    const newSocial = document.createElement("div");
    newSocial.className =
        "d-flex align-items-center justify-content-between p-2 mb-2 bg-white rounded border shadow-sm social-item";

    newSocial.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fa-brands ${iconClass} me-3 fs-4 text-success"></i>
            <small><strong>${platform}:</strong> @${username}</small>
        </div>
        <button class="btn btn-sm text-danger border-0" onclick="removeSocialItem(this)">
            <i class="fa-solid fa-trash"></i>
        </button>
    `;

    socialBox.prepend(newSocial);
}

// Remove social media
function removeSocialItem(button) {
    const socialBox = document.getElementById("socialBox");
    button.parentElement.remove();

    const remaining = socialBox.querySelectorAll(".social-item");
    if (remaining.length === 0) {
        const placeholder = document.createElement("div");
        placeholder.className = "d-flex align-items-center mb-2";
        placeholder.innerHTML = `
            <i class="fa-solid fa-circle-nodes me-3 fs-4 text-secondary"></i>
            <span class="text-muted small" id="socialText">No social media connected</span>
        `;
        socialBox.prepend(placeholder);
    }
}

// Toggle edit profile
function toggleEdit() {
    const inputs = document.querySelectorAll(
        '.profile-card input[type="text"], .profile-card input[type="email"]'
    );
    const editBtn = document.getElementById("editBtn");
    const nameDisplay = document.getElementById("displayUserName");

    const isReadOnly = inputs[0].hasAttribute("readonly");

    inputs.forEach(input => {
        input.readOnly = !isReadOnly;
        input.classList.toggle("bg-light", isReadOnly);
    });

    if (isReadOnly) {
        editBtn.textContent = "Save Changes";
        editBtn.className = "btn btn-primary fw-bold rounded-pill py-2 w-100";
    } else {
        nameDisplay.textContent = inputs[0].value;
        editBtn.textContent = "Edit Profile";
        editBtn.className = "btn btn-success fw-bold rounded-pill py-2 w-100";
        alert("Profile saved!");
    }
}



/*pop up adopt pet*/
function showPetDetails(name, species, age, gender, desc, imgPath) {

    document.getElementById('modalPetName').innerText = name;
    document.getElementById('modalPetSpecies').innerText = species;
    document.getElementById('modalPetAge').innerText = age;
    document.getElementById('modalPetGender').innerText = gender;
    document.getElementById('modalPetDesc').innerText = desc;
    document.getElementById('modalPetImg').src = imgPath;
}


/* report lost pet button */
// 1. Handle Sign In (Stays on Pet Finder Page)
document.getElementById('signInForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Close the Modal
    const authModal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
    authModal.hide();

    // Show a success alert (Optional)
    alert("Signed in successfully! Returning to Pet Finder.");
    
    // Page doesn't change, just closes the modal so they can continue looking at pets
});

// 2. Handle Sign Up (Redirects to Profile Page)
document.getElementById('signUpForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Show a success alert
    alert("Account created! Redirecting to your Profile...");

    // Redirect to profile page (Make sure you have profile.html created)
    window.location.href = "profile.html"; 
});