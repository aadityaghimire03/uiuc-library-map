// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC1aZ_G6Jg7BPmbebvikc_hv9gUfwqxW9I",
    authDomain: "uiuclibrarymap.firebaseapp.com",
    projectId: "uiuclibrarymap",
    storageBucket: "uiuclibrarymap.appspot.com",
    messagingSenderId: "501121734474",
    appId: "1:501121734474:web:f4e9d04ca6dbfb149d53b3",
    measurementId: "G-ETCQP8V9W9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// Library data
const libraries = [
    {
        name: "Grainger Engineering Library",
        address: "1301 W Springfield Ave, Urbana, IL 61801",
        phoneNumber: "(217) 333-3576",
        image: "grainger-image.jpg",
        position: { x: 500, y: 300 },
        googleMapsLink: "https://www.google.com/maps/place/Grainger+Engineering+Library+Information+Center/@40.1106998,-88.2295835,17z/data=!3m1!5s0x880cd7401f15d3af:0xcf6a0239f89ae790!4m14!1m7!3m6!1s0x880cd70b4fa63a1d:0x34f778940450def5!2sThe+Grainger+College+of+Engineering!8m2!3d40.1106998!4d-88.2270086!16zL20vMDN3MGcz!3m5!1s0x880cd76a968358b5:0xae7c7d5e32439ec2!8m2!3d40.1124997!4d-88.2269172!16zL20vMGYzdzRr?entry=ttu"
    },
    {
        name: "Undergraduate Library",
        address: "1402 W Gregory Dr, Urbana, IL 61801",
        phoneNumber: "(217) 333-3477",
        image: "path/to/undergraduate-library-image.jpg",
        position: { x: 450, y: 350 },
        googleMapsLink: "https://goo.gl/maps/exampleLink2"
    },
    {
        name: "Main Library",
        address: "1408 W Gregory Dr, Urbana, IL 61801",
        phoneNumber: "(217) 333-2290",
        image: "path/to/main-library-image.jpg",
        position: { x: 550, y: 400 },
        googleMapsLink: "https://goo.gl/maps/exampleLink3"
    }
];

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Sign in function
function signIn() {
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            console.log(`User ${user.displayName} signed in`);
            document.getElementById('user-pic').src = user.photoURL;
            document.getElementById('user-email').textContent = user.email;
            document.getElementById('auth-link').textContent = 'Log out';
            alert(`User ${user.displayName} signed in`);
        })
        .catch((error) => {
            console.error(error);
            alert(`Error: ${error.message}`);
        });
}

// Sign out function
function signOutUser() {
    auth.signOut().then(() => {
        console.log('User signed out');
        document.getElementById('user-pic').src = 'default-profile.png';
        document.getElementById('user-email').textContent = 'Guest';
        document.getElementById('auth-link').textContent = 'Log in';
        alert('User signed out');
    }).catch((error) => {
        console.error(error);
        alert(`Error: ${error.message}`);
    });
}

// Toggle menu visibility
function toggleMenu() {
    const menu = document.getElementById('menu');
    menu.classList.toggle('hidden');
}

// Navigation functions
function navigateHome() {
    window.location.href = '/';
}

function navigateFavorites() {
    window.location.href = '/favorites';
}

function addLibrary(name, address, phoneNumber, image, position, googleMapsLink) {
    libraries.push({ name, address, phoneNumber, image, position, googleMapsLink });
    addMarkerToMap(libraries[libraries.length - 1]);
}

function addMarkerToMap(library) {
    const marker = document.createElement('div');
    marker.className = 'library-marker';
    marker.style.left = `${library.position.x}px`;
    marker.style.top = `${library.position.y}px`;
    marker.innerHTML = '📚';

    marker.addEventListener('click', () => showLibraryInfo(library));

    document.getElementById('map-container').appendChild(marker);
}

let currentInfoBox = null;

function showLibraryInfo(library) {
    if (currentInfoBox) {
        currentInfoBox.remove();
    }

    const infoBox = document.createElement('div');
    infoBox.className = 'library-info';
    const isFavorite = favorites.includes(library.name);
    infoBox.innerHTML = `
        <div class="info-header">
            <h2>${library.name}</h2>
            <button class="close-info">✖</button>
        </div>
        <img src="${library.image}" alt="${library.name}" style="max-width: 200px;">
        <p>Address: ${library.address}</p>
        <p>Phone: ${library.phoneNumber}</p>
        <div class="info-footer">
            <button class="star-button" onclick="toggleFavorite('${library.name}')">
                ${isFavorite ? '★' : '☆'}
            </button>
            <a href="${library.googleMapsLink}" target="_blank" class="go-to-library">Go to Library!</a>
        </div>
    `;
    document.getElementById('map-container').appendChild(infoBox);

    infoBox.querySelector('.close-info').addEventListener('click', () => infoBox.remove());
    currentInfoBox = infoBox;

    // Clear search bar and hide results
    document.getElementById('search-bar').value = '';
    document.getElementById('search-results').style.display = 'none';
}

function toggleFavorite(libraryName) {
    const index = favorites.indexOf(libraryName);
    if (index === -1) {
        favorites.push(libraryName);
    } else {
        favorites.splice(index, 1);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavorites();
    const starButton = document.querySelector('.star-button');
    if (starButton) {
        starButton.innerHTML = favorites.includes(libraryName) ? '★' : '☆';
    }
}

function updateFavorites() {
    const favoritesList = document.getElementById('favorites-list');
    if (favoritesList) {
        favoritesList.innerHTML = '';
        favorites.forEach(name => {
            const li = document.createElement('li');
            li.textContent = name;
            favoritesList.appendChild(li);
        });
    }
}

let zoomLevel = 1;

function initializeMapDragging() {
    const mapContainer = document.getElementById('map-container');
    const mapImage = document.getElementById('map-image');
    if (!mapImage) {
        console.error('Map image not found');
        return;
    }

    mapImage.ondragstart = () => false;

    let isDragging = false;
    let startX, startY;

    mapContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - mapImage.offsetLeft;
        startY = e.clientY - mapImage.offsetTop;
        mapContainer.style.cursor = 'grabbing';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        mapContainer.style.cursor = 'grab';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const newX = e.clientX - startX;
        const newY = e.clientY - startY;
        mapImage.style.left = `${newX}px`;
        mapImage.style.top = `${newY}px`;
        updateMarkerPositions();
    });

    libraries.forEach(addMarkerToMap);
}

function updateMarkerPositions() {
    const mapImage = document.getElementById('map-image');
    const markers = document.getElementsByClassName('library-marker');
    const mapRect = mapImage.getBoundingClientRect();

    for (let i = 0; i < markers.length; i++) {
        const marker = markers[i];
        const library = libraries[i];
        const scaledX = library.position.x * zoomLevel;
        const scaledY = library.position.y * zoomLevel;
        marker.style.left = `${mapRect.left + scaledX}px`;
        marker.style.top = `${mapRect.top + scaledY}px`;
        marker.style.transform = `scale(${1 / zoomLevel})`;
    }
}

function initializeSearch() {
    const searchBar = document.getElementById('search-bar');
    const searchResults = document.getElementById('search-results');

    searchBar.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const matchingLibraries = libraries.filter(library => 
            library.name.toLowerCase().startsWith(searchTerm)
        );

        displaySearchResults(matchingLibraries);
    });

    document.addEventListener('click', function(event) {
        if (!searchBar.contains(event.target) && !searchResults.contains(event.target)) {
            searchResults.style.display = 'none';
        }
    });
}

function displaySearchResults(results) {
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = '';

    if (results.length > 0) {
        results.forEach(library => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.textContent = library.name;
            resultItem.addEventListener('click', () => showLibraryInfo(library));
            searchResults.appendChild(resultItem);
        });
        searchResults.style.display = 'block';
    } else {
        searchResults.style.display = 'none';
    }
}

window.onload = () => {
    document.getElementById('hamburger-menu').addEventListener('click', toggleMenu);
    document.getElementById('close-menu').addEventListener('click', toggleMenu);
    document.getElementById('home-button').addEventListener('click', navigateHome);
    document.getElementById('favorites-button').addEventListener('click', navigateFavorites);
    document.getElementById('auth-link').addEventListener('click', () => {
        const isLoggedIn = auth.currentUser != null;
        if (isLoggedIn) {
            signOutUser();
        } else {
            signIn();
        }
    });

    auth.onAuthStateChanged(user => {
        if (user) {
            document.getElementById('user-pic').src = user.photoURL;
            document.getElementById('user-email').textContent = user.email;
            document.getElementById('auth-link').textContent = 'Log out';
        } else {
            document.getElementById('user-pic').src = 'default-profile.png';
            document.getElementById('user-email').textContent = 'Guest';
            document.getElementById('auth-link').textContent = 'Log in';
        }
    });

    initializeMapDragging();
    initializeSearch();

    const zoomStep = 0.1;
    const maxZoom = 2;
    const minZoom = 0.5;

    document.getElementById('zoom-in').addEventListener('click', () => {
        zoomLevel = Math.min(zoomLevel + zoomStep, maxZoom);
        document.getElementById('map-image').style.transform = `scale(${zoomLevel})`;
        updateMarkerPositions();
    });

    document.getElementById('zoom-out').addEventListener('click', () => {
        zoomLevel = Math.max(zoomLevel - zoomStep, minZoom);
        document.getElementById('map-image').style.transform = `scale(${zoomLevel})`;
        updateMarkerPositions();
    });

    updateMarkerPositions();
    updateFavorites();
};