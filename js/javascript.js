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
                if (!db.objectStoreNames.contains("lost-pet"))
                    db.createObjectStore("lost-pet", { keyPath: "petId" });
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

    //Update existing data
    async update(storeName, data) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, "readwrite");
            const store = tx.objectStore(storeName);

            const request = store.put(data);
            request.onsuccess = () => resolve(true);
            request.onerror = (e) => reject(e.target.error);
        });
    }

}


//Main data
class User {
    constructor(userId, fullName, phone, email, password, socialId) {
        this.userId = userId;
        this.name = fullName;
        this.phone = phone;
        this.email = email;
        this.password = password;
        this.socialId = socialId;
        this.petLength = 0;
        this.lostPetLength = 0;
        this.eventLength = 0;
    }

    static async create(userId, fullName, phone, email, password) {
        // Check if email already exists
        const users = await pawpalHavenDB.getAllDataByStoreName("user");
        if (users.find(u => u.email === email)) {
            return false;
        }

        // Generate id (async safe if needed)
        const id = userId || await generateId("U"); // use await if generateId is async

        if (id === null) {
            console.log("Unable to create user");
            return null;
        }

        //Generate social
        const social = await Social.create(null, id);
        if (social === null) {
            console.log("Unable to create user");
            return null;
        }

        // Create a User instance
        const user = new User(id, fullName, phone, email, password, social.socialId);

        // Convert to plain object for IndexedDB
        const plainUser = JSON.parse(JSON.stringify(user));

        // Store in IndexedDB (await!)
        try {
            const status = await pawpalHavenDB.add("user", user);
            sessionStorage.setItem("loggedInUser", plainUser);
        } catch (err) {
            console.error("Failed to add user to DB:", err);
            return null;
        }

        return user;
    }

    //Login
    static async login(email, password) {
        const users = await pawpalHavenDB.getAllDataByStoreName("user");
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
            return false;
        }

        sessionStorage.setItem("loggedInUser", JSON.stringify(user));
        window.location.href = "index.html";
        return true;
    }

    //Logout
    static logout() {
        sessionStorage.removeItem("loggedInUser");
        window.location.href = "index.html";
    }


    //Register
    static async register(email, password, fullName, phone) {
        const user = await User.create(null, fullName, phone, email, password, null, null, null, null);
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

    //Get current logged in user
    static async getCurrentUser() {
        const userData = sessionStorage.getItem("loggedInUser");
        return userData ? JSON.parse(userData) : null;
    }

    //Get image from user.
    static async getImageFromUser(user) {
        const userId = user.userId;

        //find user
        const users = await pawpalHavenDB.getAllDataByStoreName("user");
        const targetUser = users.find(u => u.userId === userId)
        if (!targetUser) { return null; }

        //Return image
        return targetUser.image;
    }

    //Get social media links from user
    static async getSocialFromUser(user) {
        const socialId = user.socialId;

        //find social
        const social = await pawpalHavenDB.getAllDataByStoreName("social");
        const target = social.find(s => s.socialId === socialId)

        //Return social
        return target;
    }


    //Add social media links to user
    static async addSocialMedia(user, link) {
        const social = await User.getSocialFromUser(user);
        if (!social) { return null };

        await Social.addSocial(social, link);
    }


    //Remove social media links from user
    static async removeSocialMedia(user, link) {
        const social = await User.getSocialFromUser(user);
        if (!social) { return null };

        await Social.removeSocial(social, link);
    }

}

class Pet {
    constructor(petId, userId, petName, species, age, gender, description, addressId, image, status) {
        this.petId = petId;
        this.userId = userId;
        this.name = petName;
        this.species = species;
        this.age = age;
        this.gender = gender;
        this.description = description;
        this.addressId = addressId;
        this.image = image;
        this.status = status;
    }

    static async create(petId, userId, petName, species, age, gender, description, image, addressDetails, status) {
        const id = petId || await generateId("P");

        if (id === null) {
            console.log("Unable to create pet");
            return null;
        }

        //Create address
        const address = await Address.create(null, id, addressDetails.longitude, addressDetails.latitude, addressDetails.city, addressDetails.state, addressDetails.country);
        if (address === null) {
            console.log("Unable to create pet");
            return null;
        }

        const pet = new Pet(id, userId, petName, species, age, gender, description, address.addressId, image, status);


        // Store in IndexedDB (await!)
        try {
            let storeName;
            if (status === "adopt") {
                storeName = "pet"
            } else if (status === "lost") {
                storeName = "lost-pet"
            } else {
                console.log("Invalid status. Pet did not save in datastore");
                return null;
            }

            const dbStatus = await pawpalHavenDB.add(storeName, pet);
        } catch (err) {
            console.error("Failed to add pet to DB:", err);
            return null;
        }


        return pet;
    }

    //Add pets
    static async addPet(user, properties) {
        const userId = user.userId;

        const pet = await Pet.create(null, userId, properties.name, properties.species, properties.age, properties.gender, properties.description, properties.image, properties.address, properties.status);

        if (pet === null) {
            console.log("Unable to add pet to user");
        }

        if (properties.status === "adopt") {
            user.petLength += 1;
        } else if (properties.status === "lost") {
            user.lostPetLength += 1;
        }

        await pawpalHavenDB.update("user", user);
    }

    //Remove
    static async removePet(user, pet) {
        let storeName;
        if (pet.status === "adopt") {
            storeName = "pet"
        } else if (pet.status === "lost") {
            storeName = "lost-pet"
        } else {
            console.log("Invalid status. Pet did not remove from  datastore");
            return null;
        }

        //Delete from db
        const dbStatus = await pawpalHavenDB.deleteById(storeName, pet.petId);
        if (!dbStatus) {
            console.log("Unable delete pet from DB");
        }

        //Update and save user
        if (pet.status === "adopt") {
            user.petLength += 1;
        } else if (pet.status === "lost") {
            user.lostPetLength += 1;
        }

        await pawpalHavenDB.update("user", user);
    }

    //Update pet
    static async update(pet) {
        let storeName;
        if (pet.status === "adopt") {
            storeName = "pet"
        } else if (pet.status === "lost") {
            storeName = "lost-pet"
        } else {
            console.log("Invalid status. Pet did not remove from  datastore");
            return null;
        }

        await pawpalHavenDB.update(storeName, pet);
    }
}

class MyPetEvent {
    constructor(eventId, userId, eventName, date, time, description, addressId, image) {
        this.eventId = eventId;
        this.userId = userId
        this.name = eventName;
        this.date = date;
        this.time = time;
        this.description = description;
        this.addressId = addressId;
        this.image = image;
    }

    static async create(eventId, userId, eventName, date, time, description, addressDetails, image) {
        const id = eventId || await generateId("E");

        if (id === null) {
            console.log("Unable to create event");
            return null;
        }

        //Create address
        const address = await Address.create(null, id, addressDetails.longitude, addressDetails.latitude, addressDetails.city, addressDetails.state, addressDetails.country);
        if (address === null) {
            console.log("Unable to create pet");
            return null;
        }
        console.log(address);

        const event = new MyPetEvent(id, userId, eventName, date, time, description, address.addressId, image);


        // Store in IndexedDB (await!)
        try {
            const status = await pawpalHavenDB.add("event", event);
        } catch (err) {
            console.error("Failed to add event to DB:", err);
            return null;
        }
        return event;
    }

    //Add pets
    static async addEvent(user, properties) {
        const userId = user.userId;
        console.log(properties);

        const event = await MyPetEvent.create(null, userId, properties.name, properties.date, properties.time, properties.description, properties.address, properties.image);

        if (event === null) {
            console.log("Unable to add pet to user");
        }

        if (properties.status === "adopt") {
            user.petLength += 1;
        } else if (properties.status === "lost") {
            user.lostPetLength += 1;
        }

        await pawpalHavenDB.update("user", user);
    }
}

class Social {
    static platforms = {
        reddit: {
            icon: "fa-brands fa-reddit",
            solid: "reddit-solid",
            name: "Reddit"
        },
        instagram: {
            icon: "fa-brands fa-instagram",
            solid: "instagram-solid",
            name: "Instagram"
        },
        twitter: {
            icon: "fa-brands fa-x-twitter",
            solid: "twitter-solid",
            name: "Twitter"
        },
        facebook: {
            icon: "fa-brands fa-facebook",
            solid: "facebook-solid",
            name: "Facebook"
        },
        tiktok: {
            icon: "fa-brands fa-tiktok",
            solid: "fa-tiktok-solid",
            name: "TikTok"
        },
        youtube: {
            icon: "fa-brands fa-youtube",
            solid: "youtube-solid",
            name: "Youtube"
        },
        linkedin: {
            icon: "fa-brands fa-linkedin",
            solid: "linkedin-solid",
            name: "LinkedIn"
        },
        github: {
            icon: "fa-brands fa-github",
            solid: "github-solid",
            name: "GitHub"
        }
    };


    constructor(socialId, userId) {
        this.socialId = socialId;
        this.userId = userId;
        this.links = {
            reddit: null,
            facebook: null,
            twitter: null,
            instagram: null,
            linkedIn: null,
            youtube: null,
            tikTok: null,
            gitHub: null,
        };

    }


    static async create(socialId, userId) {
        const id = socialId || await generateId("S");

        if (id === null) {
            console.log("Unable to create social ");
            return null;
        } socialId

        const social = new Social(id, userId);

        // Store in IndexedDB (await!)
        try {
            const status = await pawpalHavenDB.add("social", social);
        } catch (err) {
            console.error("Failed to add social to DB:", err);
            return null;
        }

        return social;
    }

    static async addSocial(social, link) {

        let socialName;
        const lower = link.toLowerCase();
        for (const name in Social.platforms) {
            if (lower.includes(name)) {
                socialName = name;
            }
        }

        if (!socialName) {
            const list = Object.values(social.links);
            socialName = "Social" + list.length;
        }
        console.log(social);
        social.links[socialName] = link;

        //Save
        await pawpalHavenDB.update("social", social);
    }

    static async removeSocial(social, link) {
        const entries = Object.entries(social.links);

        entries.forEach(([key, value]) => {
            if (value === link) {

                // Check if the key is in default platforms
                let isExist = false;
                for (const name in Social.platforms) {
                    if (key.includes(name)) {
                        isExist = true;
                        break;
                    }
                }

                // Delete or null
                if (isExist) {
                    social.links[key] = null;
                } else {
                    delete social.links[key];
                }
            }
        });

        // Save
        await pawpalHavenDB.update("social", social);
    }


    static getSocialIconFromLink(link) {
        const lower = link.toLowerCase();
        for (const key in Social.platforms) {
            if (lower.includes(key)) {
                return Social.platforms[key];
            }
        }

        return { icon: "fa-solid fa-link", solid: "link-solid", name: "Link" };
    }
}

class Address {
    constructor(addressId, belongId, longitude, latitude, city, state, country) {
        this.addressId = addressId;
        this.belongId = belongId;
        this.longitude = longitude;
        this.latitude = latitude;
        this.city = city;
        this.state = state;
        this.country = country;
    }

    static async create(addressId, belongId, longitude, latitude, city, state, country) {
        const id = addressId || await generateId('A');

        if (id === null) {
            console.log("Unable to create address ");
            return null;
        }

        const address = new Address(id, belongId, longitude, latitude, city, state, country);


        // Store in IndexedDB (await!)
        try {
            const status = await pawpalHavenDB.add("address", address);
        } catch (err) {
            console.error("Failed to add address to DB:", err);
            return null;
        }
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
async function generateId(type) {
    let storeName = null;

    switch (type) {
        case 'U': storeName = "user"; break;
        case 'P': storeName = "pet"; break;
        case 'E': storeName = "event"; break;
        case 'S': storeName = "social"; break;
        case 'A': storeName = "address"; break;
        default:
            console.log("Unable to generate id using " + type);
            return null;
    }

    const records = await pawpalHavenDB.getAllDataByStoreName(storeName);
    return formatId(type, records.length + 1);
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
async function requireLogin() {
    if (await User.getCurrentUser() === null) {
        window.location.href = "index.html";
    }
}

//Update nav bar 
async function updateNavbar() {
    const navLoginProfile = document.getElementById("login-profile-nav");
    if (navLoginProfile === null) { return console.log("Missing id"); }

    if (await User.getCurrentUser() === null) {
        navLoginProfile.innerHTML = `<a class="nav-link" href="login-registration.html">Login</a>`;
    } else {
        navLoginProfile.innerHTML = `<a class="nav-link" href="profile.html">Profile</a>`;
    }
}

//Functions that should be run on homepage
async function homepageEvent(page) {
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
        signinBtn.addEventListener("click", async function (e) {
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
            const success = await User.register(email, password, fullName, phone);

            if (success.isValid === false) {
                document.querySelector(".register-email-group").classList.add("invalid-input")
                registerEmailFeedback.classList.remove("d-none");
                registerEmailFeedback.classList.add("d-block");
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
    loginBtn.addEventListener("click", async function (e) {
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

        const status = await User.login(email, password);
        if (status === false) {
            console.log("Wrong")
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

//Profile page 
async function profilePage(page) {
    if (page !== "profile.html") return null;
    requireLogin();

    //Get current login in user
    let user = await User.getCurrentUser();

    //Elements 
    const username = document.getElementById("display-username");
    const fullNameInput = document.getElementById("full-name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const editBtn = document.getElementById("edit-btn");
    const editImageBtn = document.getElementById("edit-image-btn")
    const imageInput = document.getElementById("image-input");
    const profilePic = document.getElementById("profile-pic");
    const logoutBtn = document.getElementById("logout-btn");
    const dashboardBtn = document.getElementById("dashboard-btn");
    const profileForm = document.getElementById("profile-form");
    const fullNameFeedback = document.getElementById("profile-full-name-feedback");
    const emailFeedback = document.getElementById("profile-email-feedback");
    const phoneFeedback = document.getElementById("profile-phone-feedback");
    const socialForm = document.getElementById("social-form");
    const inputModalIcon = document.getElementById("input-modal-icon");
    const inputLink = document.getElementById("input-link");
    const inputLinkFeedback = document.getElementById("input-link-feedback");
    const addSocialBtn = document.getElementById("add-social-btn");
    const socialContainer = document.getElementById("social-container");


    //Add listeners
    imagePreviewEvent("image-input");
    addClickableImageInput("edit-image-btn");
    async function updateProfileDisplay() {
        //Apply user data
        username.innerText = user.name;
        fullNameInput.value = user.name;
        emailInput.value = user.email;
        phoneInput.value = user.phone;

        // Check if image exists AND is a Blob/File
        const imgBlob = await User.getImageFromUser(user);
        if (imgBlob instanceof Blob) {
            profilePic.src = URL.createObjectURL(imgBlob);
        } else {
            console.log(imgBlob);
            profilePic.src = "images/profile.png"; // fallback image
        }
    }

    async function displaySocials() {
        let social = await User.getSocialFromUser(user);
        if (!social) { console.log("Unable to retrive social"); return null; }

        const links = Object.values(social.links);
        socialContainer.innerHTML = "";

        let numberOfLink = 0;
        links.forEach(link => {
            if (!link) return;

            const socialIcon = Social.getSocialIconFromLink(link);

            if (socialIcon.icon !== null) {
                let div = document.createElement("div");
                div.innerHTML = `
                    <div
                        class="d-flex align-items-center justify-content-between p-2 mb-2 bg-white rounded border shadow-sm w-100 social-item">
                        <div class="d-flex align-items-center">
                          <a href="${link}" target="_blank" class="text-black text-decoration-none"><i class="${socialIcon.icon} ${socialIcon.solid} me-3 fs-4"></i>
                          ${socialIcon.name}</a>
                        </div>
                        <button type="button" class="btn btn-sm text-danger border-0" '>
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                `;
                div.classList.add("media-container");

                div.querySelector("button").addEventListener("click", () => removeMediaItem(link));
                numberOfLink++;
                socialContainer.appendChild(div);
            }
        });

        if (numberOfLink === 0) {
            let div = document.createElement("div");
            div.innerHTML = `<p class ="text-center">You dont have any social media linked yet.</p>`;
            socialContainer.appendChild(div);
        }
    }

    //Remove media social item
    async function removeMediaItem(link) {
        let mediaContainers = socialContainer.querySelectorAll(".media-container");

        for (const element of mediaContainers) {
            const anchor = element.querySelector("a");

            if (anchor && anchor.href === link) {
                element.remove(); // Remove UI

                await User.removeSocialMedia(user, link); // Remove and save

                displaySocials(); // Re-display media
                break; // stop after one match
            }
        }
    }


    //Display current user data
    updateProfileDisplay();

    //Display socials
    displaySocials();

    //Edit btn
    let isEditMode = false;
    editBtn.addEventListener("click", async function () {
        if (isEditMode === false) {
            //Edit mode
            //Edit image btn
            editImageBtn.classList.remove("d-none");
            editImageBtn.classList.add("d-block");

            //Make all inputs editable
            fullNameInput.removeAttribute("readonly");
            emailInput.removeAttribute("readonly");
            phoneInput.removeAttribute("readonly");

            editBtn.innerText = "Save Changes";
        } else {
            //Save changes

            //Grab data
            const newFullName = fullNameInput.value;
            const newEmail = emailInput.value;
            const newPhone = phoneInput.value;
            const newImage = imageInput.files[0];

            //Check validity
            let isValid = true;
            profileForm.querySelectorAll(".input-group").forEach(group => {
                const input = group.querySelector("input");
                if (!input.checkValidity()) {
                    group.classList.add("invalid-input");

                    const errMessage = input.validationMessage;
                    //Check which input 
                    if (input === emailInput) {
                        emailFeedback.classList.remove("d-none");
                        emailFeedback.classList.add("d-block");
                        emailFeedback.innerText = errMessage;
                    } else if (input === fullNameInput) {
                        fullNameFeedback.classList.remove("d-none");
                        fullNameFeedback.classList.add("d-block");
                        fullNameFeedback.innerText = errMessage;
                    } else if (input === phoneInput) {
                        phoneFeedback.classList.remove("d-none");
                        phoneFeedback.classList.add("d-block");
                        phoneFeedback.innerText = errMessage;
                    }

                    isValid = false;
                }
            });

            if (!isValid) { return null };

            editImageBtn.classList.remove("d-block");
            editImageBtn.classList.add("d-none");

            //Make all inputs only readable
            fullNameInput.setAttribute("readonly", "true");
            emailInput.setAttribute("readonly", "true");
            phoneInput.setAttribute("readonly", "true");

            user.name = newFullName;
            user.email = newEmail;
            user.phone = newPhone;
            user.image = newImage;

            await pawpalHavenDB.update("user", user);

            //Update session storage 
            sessionStorage.setItem("loggedInUser", JSON.stringify(user));

            user = await User.getCurrentUser();
            updateProfileDisplay()

            editBtn.innerText = "Edit Profile";
        }

        isEditMode = !isEditMode;
    });

    //Detect changes in input
    profileForm.querySelectorAll(".input-group").forEach(group => {
        const input = group.querySelector("input");

        input.addEventListener("input", function () {
            group.classList.remove("invalid-input");

            emailFeedback.classList.add("d-none");
            phoneFeedback.classList.add("d-none");
            fullNameFeedback.classList.add("d-none");

        });

    })

    //Detect changes in link input
    socialForm.querySelectorAll(".input-group").forEach(group => {
        const input = group.querySelector("input");

        input.addEventListener("input", function () {
            group.classList.remove("invalid-input");

            inputLinkFeedback.classList.add("d-none");

        });

    })

    //Change icon dynamically
    inputLink.addEventListener("input", function () {
        let link = inputLink.value;
        const social = Social.getSocialIconFromLink(link);
        inputModalIcon.innerHTML = `<span class="${social.icon} ${social.solid} fs-1"> </span>`
    })

    //Add social btn
    addSocialBtn.addEventListener("click", async function () {
        //Grab link
        const userLink = inputLink.value;

        //Check validity
        let isValid = true;
        socialForm.querySelectorAll(".input-group").forEach(group => {
            const input = group.querySelector("input");
            if (!input.checkValidity()) {
                group.classList.add("invalid-input");

                const errMessage = input.validationMessage;
                //Check which input 
                if (input === inputLink) {
                    inputLinkFeedback.classList.remove("d-none");
                    inputLinkFeedback.classList.add("d-block");
                    inputLinkFeedback.innerText = errMessage;
                }

                isValid = false;
            }
        });

        if (!isValid) { return null };

        //Add social media and save
        await User.addSocialMedia(user, userLink);


        displaySocials();

    });

    //Logout btn
    logoutBtn.addEventListener("click", User.logout);

    //Dashboard btn
    dashboardBtn.addEventListener("click", function () {
        window.location.href = "dashboard.html"
    });
}

//Functions that should be run on dashboard
async function dashboard(page) {
    if (page !== "dashboard.html") return null;
    requireLogin();

    // ===== IMAGE PREVIEW SETUP =====
    ["pet-image", "poster-image", "lost-pet-image"].forEach(imageId => imagePreviewEvent(imageId));
    ["clickable-img-input-pet", "clickable-img-input-event", "clickable-img-input-lost-pet"].forEach(clickId => addClickableImageInput(clickId));

    // ===== MAP SETUP =====
    addMapPicker("petModal", "pet-city", "pet-latitude", "pet-longitude", "pet-state", "pet-country");
    addMapPicker("eventModal", "event-city", "event-latitude", "event-longitude", "event-state", "event-country");
    addMapPicker("lostPetModal", "lost-city", "lost-latitude", "lost-longitude", "lost-state", "lost-country");

    const pageLinks = document.querySelectorAll(".a-link");
    const dashboardTitle = document.getElementById("dashboard-title");
    const addBtn = document.getElementById("add-btn");
    const itemContainer = document.getElementById("item-container");

    // ===== MODALS & FORMS =====
    const modals = {
        pet: {
            modalElement: document.getElementById("petModal"),
            modal: new bootstrap.Modal(document.getElementById("petModal")),
            form: document.getElementById("petForm"),
            inputs: {
                image: document.getElementById("pet-image"),
                clickableImg: document.getElementById("clickable-img-input-pet"),
                name: document.getElementById("pet-name"),
                species: document.getElementById("pet-species"),
                gender: document.getElementById("pet-gender"),
                age: document.getElementById("pet-age"),
                description: document.getElementById("pet-description"),
                latitude: document.getElementById("pet-latitude"),
                longitude: document.getElementById("pet-longitude"),
                city: document.getElementById("pet-city"),
                state: document.getElementById("pet-state"),
                country: document.getElementById("pet-country"),
            },
            saveBtn: document.getElementById("save-pet-btn")
        },
        event: {
            modalElement: document.getElementById("eventModal"),
            modal: new bootstrap.Modal(document.getElementById("eventModal")),
            form: document.getElementById("eventForm"),
            inputs: {
                image: document.getElementById("poster-image"),
                clickableImg: document.getElementById("clickable-img-input-event"),
                name: document.getElementById("event-name"),
                date: document.getElementById("event-date"),
                time: document.getElementById("event-time"),
                description: document.getElementById("event-description"),
                latitude: document.getElementById("event-latitude"),
                longitude: document.getElementById("event-longitude"),
                city: document.getElementById("event-city"),
                state: document.getElementById("event-state"),
                country: document.getElementById("event-country"),
            },
            saveBtn: document.getElementById("save-event-btn")
        },
        lost: {
            modalElement: document.getElementById("lostPetModal"),
            modal: new bootstrap.Modal(document.getElementById("lostPetModal")),
            form: document.getElementById("lostPetForm"),
            inputs: {
                image: document.getElementById("lost-pet-image"),
                clickableImg: document.getElementById("clickable-img-input-lost-pet"),
                name: document.getElementById("lost-pet-name"),
                species: document.getElementById("lost-pet-species"),
                gender: document.getElementById("lost-pet-gender"),
                age: document.getElementById("lost-pet-age"),
                description: document.getElementById("lost-pet-description"),
                latitude: document.getElementById("lost-latitude"),
                longitude: document.getElementById("lost-longitude"),
                city: document.getElementById("lost-city"),
                state: document.getElementById("lost-state"),
                country: document.getElementById("lost-country"),
            },
            saveBtn: document.getElementById("save-lost-pet-btn")
        }
    };

    // ===== PAGE CONFIG =====
    const pages = {
        adopt: {
            title: "My Pets for Adoption",
            btnTitle: "Add New Pet",
            btnAttribute: "#petModal",
            item: pet => `<div class="col-md-12 col-lg-6">
                <div class="bg-dark p-3 rounded h-100 d-flex">
                    <div class="me-3 d-flex align-items-center justify-content-center">
                        <img class="img-fluid card dashboard-pet-event" src="${URL.createObjectURL(pet.image)}" alt="Pet Image">
                    </div>
                    <div class="text-white flex-grow-1 d-flex flex-column justify-content-between">
                        <div>
                            <h3 class="fw-bold mb-1">${pet.name}</h3>
                            <p class="mb-1">Species: ${pet.species}</p>
                            <p class="mb-1">Gender: ${pet.gender}</p>
                            <p class="mb-3">Age: ${pet.age}</p>
                        </div>
                        <div class="d-flex gap-2">
                            <button class="btn btn-primary flex-fill edit-btn" data-item-id="${pet.petId}" data-type="adopt">Edit</button>
                            <button class="btn btn-danger flex-fill delete-btn" data-item-id="${pet.petId}" data-type="adopt">Delete</button>
                        </div>
                    </div>
                </div>
            </div>`
        },
        event: {
            title: "My Events",
            btnTitle: "Add New Event",
            btnAttribute: "#eventModal",
            item: async event => {
                const addr = await pawpalHavenDB.get("address", event.addressId);

                return `<div class="col-md-12 col-lg-6">
                <div class="bg-dark p-3 rounded h-100 d-flex">
                    <div class="me-3 d-flex align-items-center justify-content-center">
                        <img class="img-fluid card dashboard-pet-event" src="${URL.createObjectURL(event.image)}">
                    </div>
                    <div class="text-white flex-grow-1 d-flex flex-column justify-content-between">
                        <div>
                            <h3 class="fw-bold mb-1">${event.name}</h3>
                            <p class="mb-1">Date: ${event.date}</p>
                            <p class="mb-1">Location: ${addr.city || addr.state}</p>
                        </div>
                        <div class="d-flex gap-2">
                            <button class="btn btn-primary flex-fill edit-btn" data-item-id="${event.eventId}" data-type="event">Edit</button>
                            <button class="btn btn-danger flex-fill delete-btn" data-item-id="${event.eventId}" data-type="event">Delete</button>
                        </div>
                    </div>
                </div>
            </div>`;
            }
        },
        lost: {
            title: "My Lost Pets",
            btnTitle: "Add Lost Pet",
            btnAttribute: "#lostPetModal",
            item: pet => `<div class="col-md-12 col-lg-6">
                <div class="bg-dark p-3 rounded h-100 d-flex">
                    <div class="me-3 d-flex align-items-center justify-content-center">
                        <img class="img-fluid card dashboard-pet-event" src="${URL.createObjectURL(pet.image)}" alt="Pet Image">
                    </div>
                    <div class="text-white flex-grow-1 d-flex flex-column justify-content-between">
                        <div>
                            <h3 class="fw-bold mb-1">${pet.name}</h3>
                            <p class="mb-1">Species: ${pet.species}</p>
                            <p class="mb-1">Gender: ${pet.gender}</p>
                            <p class="mb-3">Age: ${pet.age}</p>
                        </div>
                        <div class="d-flex gap-2">
                            <button class="btn btn-primary flex-fill edit-btn" data-item-id="${pet.petId}" data-type="lost">Edit</button>
                            <button class="btn btn-danger flex-fill delete-btn" data-item-id="${pet.petId}" data-type="lost">Delete</button>
                        </div>
                    </div>
                </div>
            </div>`
        }
    };

    // ===== UTILITY =====
    function getStoreNameByType(type) {
        return type === "adopt" ? "pet"
            : type === "event" ? "event"
                : "lost-pet";
    }

    // ===== DISPLAY ITEMS =====
    async function displayItem(pageId) {
        let storeName = "", pageDetails = null;
        if (pageId === "pets-page") { storeName = "pet"; pageDetails = pages.adopt; }
        else if (pageId === "events-page") { storeName = "event"; pageDetails = pages.event; }
        else if (pageId === "lost-pets-page") { storeName = "lost-pet"; pageDetails = pages.lost; }

        const data = await pawpalHavenDB.getAllDataByStoreName(storeName);
        itemContainer.innerHTML = "";
        dashboardTitle.textContent = pageDetails.title;
        addBtn.textContent = pageDetails.btnTitle;
        addBtn.setAttribute("data-bs-target", pageDetails.btnAttribute);

        if (!data.length) {
            const div = document.createElement("div");
            div.className = "container-fluid d-flex align-items-center justify-content-center col-12 gap-2";
            div.innerHTML = `<p class="fs-2 m-0 mt-4"><i class="fa-solid fa-dog"></i> Wow such emptiness <i class="fa-solid fa-cat"></i></p>`;
            itemContainer.appendChild(div);
        } else {
            const htmlList = await Promise.all(data.map(pageDetails.item));
            itemContainer.innerHTML = htmlList.join("");
            // ===== EDIT BUTTON =====
            document.querySelectorAll(".edit-btn").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const type = btn.dataset.type;
                    const itemId = btn.dataset.itemId;
                    const storeName = getStoreNameByType(type);
                    const modalData = modals[type === "adopt" ? "pet" : type];

                    const item = await pawpalHavenDB.get(storeName, itemId);
                    if (!item) return;

                    // ===== STORE CURRENT IMAGE =====
                    let currentImage = item.image || null;

                    // Fill modal fields
                    modalData.inputs.name.value = item.name || "";
                    modalData.inputs.species && (modalData.inputs.species.value = item.species || "");
                    modalData.inputs.gender && (modalData.inputs.gender.value = item.gender || "");
                    modalData.inputs.age && (modalData.inputs.age.value = item.age || "");
                    modalData.inputs.description && (modalData.inputs.description.value = item.description || "");

                    //Get address
                    console.log(item);
                    const address = await pawpalHavenDB.get("address", item.addressId);
                    console.log(address);

                    //Set map location
                    modalData.inputs.longitude.value = address.longitude || 101.6869;
                    modalData.inputs.latitude.value = address.latitude || 3.1390;
                    modalData.inputs.city.value = address.city || "";
                    modalData.inputs.state.value = address.state || "";
                    modalData.inputs.country.value = address.country || "";
                    modalData.modalElement.addMarker(modalData.inputs.latitude.value, modalData.inputs.longitude.value);

                    //Clear input file
                    document.getElementById(modalData.inputs.clickableImg.dataset.target).value = "";

                    // Image preview
                    if (currentImage) {
                        modalData.inputs.clickableImg.src = URL.createObjectURL(currentImage);
                    } else {
                        modalData.inputs.clickableImg.src = ""; // or default image
                    }

                    // ===== EVENT DATE & TIME =====
                    if (type === "event") {
                        modalData.inputs.date.value = item.date || "";
                        modalData.inputs.time.value = item.time || "";
                    }

                    modalData.saveBtn.dataset.type = "save";
                    modalData.saveBtn.dataset.itemId = itemId;
                    modalData.saveBtn.innerText = type === "event" ? "Save Event" : "Save Pet";

                    modalData.modal.show();
                });
            });


            // ===== DELETE BUTTON =====
            document.querySelectorAll(".delete-btn").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const type = btn.dataset.type;
                    const itemId = btn.dataset.itemId;
                    const storeName = getStoreNameByType(type);

                    if (!confirm("Are you sure you want to delete this item?")) return;

                    await pawpalHavenDB.deleteById(storeName, itemId);

                    const refreshPageId =
                        type === "adopt" ? "pets-page" :
                            type === "event" ? "events-page" :
                                "lost-pets-page";

                    displayItem(refreshPageId);
                });
            });
        }
    }

    displayItem("pets-page"); // default

    // ===== FORM SUBMISSION =====
    Object.keys(modals).forEach(key => {
        const modalData = modals[key];
        modalData.saveBtn.addEventListener("click", async function (e) {
            e.preventDefault();
            let valid = true;

            // Form validation
            modalData.form.querySelectorAll(".input-group, .mb-3").forEach(group => {
                const input = group.querySelector("input, textarea, select");
                if (!input) return;

                if (!input.checkValidity()) {
                    group.classList.add("invalid-input");
                    const feedback = group.querySelector(".invalid-feedback");
                    if (feedback) {
                        feedback.classList.remove("d-none");
                        feedback.classList.add("d-block");
                        feedback.innerText = input.validationMessage;
                    }
                    valid = false;
                } else {
                    group.classList.remove("invalid-input");
                    const feedback = group.querySelector(".invalid-feedback");
                    if (feedback) {
                        feedback.classList.add("d-none");
                        feedback.classList.remove("d-block");
                    }
                }
            });

            if (!valid) return;

            // Build properties object
            let properties;
            if (key === "event") {
                properties = {
                    name: modalData.inputs.name.value,
                    date: modalData.inputs.date.value,
                    time: modalData.inputs.time.value,
                    description: modalData.inputs.description.value,
                    image: modalData.inputs.image.files && modalData.inputs.image.files[0] ? modalData.inputs.image.files[0] : null,
                    address: {
                        latitude: modalData.inputs.latitude.value,
                        longitude: modalData.inputs.longitude.value,
                        city: modalData.inputs.city.value,
                        state: modalData.inputs.state.value,
                        country: modalData.inputs.country.value
                    }
                };
            } else {
                properties = {
                    name: modalData.inputs.name.value,
                    species: modalData.inputs.species.value,
                    age: modalData.inputs.age.value,
                    gender: modalData.inputs.gender.value,
                    description: modalData.inputs.description.value,
                    image: modalData.inputs.image.files && modalData.inputs.image.files[0] ? modalData.inputs.image.files[0] : null,
                    address: {
                        latitude: modalData.inputs.latitude.value,
                        longitude: modalData.inputs.longitude.value,
                        city: modalData.inputs.city.value,
                        state: modalData.inputs.state.value,
                        country: modalData.inputs.country.value
                    },
                    status: key === "pet" ? "adopt" : "lost"
                };
            }

            const type = modalData.saveBtn.dataset.type;
            const user = await User.getCurrentUser();
            console.log(properties.address);

            if (type === "add") {
                if (key === "pet") {
                    await Pet.addPet(user, properties);
                }
                else if (key === "event") await MyPetEvent.addEvent(user, properties); //HERE
                else if (key === "lost") await Pet.addPet(user, properties);
            } else if (type === "save") {
                const itemId = modalData.saveBtn.dataset.itemId;
                const storeName = getStoreNameByType(key === "pet" ? "adopt" : key === "event" ? "event" : "lost-pet");
                let existing = await pawpalHavenDB.get(storeName, itemId);

                if (!existing) return;

                // Merge updated values (IDs remain)

                const updated = { ...existing }; // start with original

                for (const key in properties) {
                    if (key === "address") continue; // skip address merging

                    // merge arrays instead of replacing them
                    if (Array.isArray(existing[key]) && Array.isArray(properties[key])) {
                        updated[key] = [...existing[key], ...properties[key]];
                    }
                    // normal override for non-array fields
                    else {
                        updated[key] = properties[key];
                    }
                }
                console.log(updated);
                properties.address["addressId"] = updated['addressId'];
                const address = properties.address;

                await pawpalHavenDB.update(storeName, updated);
                await pawpalHavenDB.update("address", address);
            }

            displayItem(key === "pet" ? "pets-page" : key === "event" ? "events-page" : "lost-pets-page");
            modalData.modal.hide();
        });
    });

    // ===== PAGE LINKS =====
    pageLinks.forEach(link => {
        link.addEventListener("click", function () {
            pageLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");
            displayItem(link.dataset.target);
        });
    });

    // ===== ADD BUTTON =====
    addBtn.addEventListener("click", function () {
        const page = addBtn.dataset.bsTarget;

        if (page === "#petModal") {
            modals.pet.saveBtn.dataset.type = "add";
            modals.pet.saveBtn.innerText = "Add Pet";
            modals.pet.form.reset(); // reset all inputs
            modals.pet.inputs.clickableImg.src = "images/profile.png"; // reset image preview
            // reset location fields
            ["latitude", "longitude", "city", "state", "country"].forEach(field => modals.pet.inputs[field].value = "");
        }
        else if (page === "#eventModal") {
            modals.event.saveBtn.dataset.type = "add";
            modals.event.saveBtn.innerText = "Add Event";
            modals.event.form.reset();
            modals.event.inputs.clickableImg.src = "images/profile.png";
            ["latitude", "longitude", "city", "state", "country"].forEach(field => modals.event.inputs[field].value = "");
        }
        else if (page === "#lostPetModal") {
            modals.lost.saveBtn.dataset.type = "add";
            modals.lost.saveBtn.innerText = "Add Pet";
            modals.lost.form.reset();
            modals.lost.inputs.clickableImg.src = "images/profile.png";
            ["latitude", "longitude", "city", "state", "country"].forEach(field => modals.lost.inputs[field].value = "");
        }
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
function addMapPicker(id, cityId, latitudeId, longitudeId, stateid, countryId) {
    const mapContainer = document.getElementById(id);
    let map, marker;


    // Helper to add or move marker
    function addMarker(lat, lng) {
        if (!map) return; // Map not initialized yet
        if (marker) map.removeLayer(marker); // Remove existing marker
        marker = L.marker([lat, lng]).addTo(map);
        map.setView([lat, lng], 13); // Center map on marker
        console.log("Update");
    }


    mapContainer.addEventListener('shown.bs.modal', function () {
        // Default coordinates
        const defaultLat = 3.1390;
        const defaultLng = 101.6869;

        if (!map) {
            map = L.map(mapContainer.dataset.target).setView([defaultLat, defaultLng], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }).addTo(map);
        }

        // Remove old click listeners to avoid multiple markers
        map.off('click');


        // Try geolocation
        if (navigator.geolocation && !document.getElementById(latitudeId).value && !document.getElementById(longitudeId).value) {
            console.log("Using current location")
            navigator.geolocation.getCurrentPosition(function (position) {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                map.setView([userLat, userLng], 13);

                // Remove old marker if exists
                if (marker) map.removeLayer(marker);
                marker = L.marker([userLat, userLng]).addTo(map);

                document.getElementById(latitudeId).value = userLat;
                document.getElementById(longitudeId).value = userLng;

                reverseGeocode(userLat, userLng);
            }, function (err) {
                console.warn("Geolocation failed or denied, using default location", err);
            });
        }

        // Click map to select location
        map.on('click', function (e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;

            // Remove existing marker
            if (marker) map.removeLayer(marker);
            marker = L.marker([lat, lng]).addTo(map);

            document.getElementById(latitudeId).value = lat;
            document.getElementById(longitudeId).value = lng;

            reverseGeocode(lat, lng);
        });

        setTimeout(() => { map.invalidateSize(); }, 200);
    });

    async function reverseGeocode(lat, lng) {
        const apiKey = "3c39795f825d401783a3cf2cd6ceb39e";
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}&no_annotations=0&abbrv=0`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (!data.results || !data.results.length) return;

            const result = data.results.find(r => r.confidence >= 9) || data.results[0];
            const c = result.components;
            console.log(document.getElementById(latitudeId).value);
            document.getElementById(cityId).value = c.city || c.town || c.village || c.hamlet || "";
            document.getElementById(stateid).value = c.state || "";
            document.getElementById(countryId).value = c.country || "";
        } catch (err) {
            console.error("Reverse geocoding failed", err);
        }
    }

    mapContainer.addMarker = addMarker;
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


function addCloseMapEvent(page) {
    document.getElementById('mapModal').addEventListener('hidden.bs.modal', function () {
        document.getElementById('mapFrame').src = "";
    })
}


document.addEventListener("DOMContentLoaded", async function () {
    //Initialize DB
    pawpalHavenDB = new Database("Test", 2);
    await pawpalHavenDB.openDB();

    const page = window.location.pathname.split("/").pop();
    updateNavbar();
    homepageEvent(page);
    eventPage(page);
    dashboard(page);
    loginRegisterPage(page);
    profilePage(page);
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

// pop up contact owner
document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("petContactModal");

    modal.addEventListener("show.bs.modal", function (event) {
        const button = event.relatedTarget;

        // Get data from button
        document.getElementById("modalPetName").textContent = button.dataset.name;
        document.getElementById("modalPetNameTitle").textContent = button.dataset.name;
        document.getElementById("modalPetSpecies").textContent = button.dataset.species;
        document.getElementById("modalPetAge").textContent = button.dataset.age;
        document.getElementById("modalPetGender").textContent = button.dataset.gender;
        document.getElementById("modalPetDesc").textContent = button.dataset.desc;
        document.getElementById("modalPetImg").src = button.dataset.img;
    });
});





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

