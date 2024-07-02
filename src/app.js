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

// Sign in function
function signIn() {
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            console.log(`User ${user.displayName} signed in`);
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
        alert('User signed out');
    }).catch((error) => {
        console.error(error);
        alert(`Error: ${error.message}`);
    });
}

// Initialize and add the map
function initMap() {
    const uiuc = { lat: 40.1019523, lng: -88.2271615 };
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: uiuc,
    });
    const marker = new google.maps.Marker({
        position: uiuc,
        map: map,
    });
}

// Load the map script
function loadScript() {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap`;
    script.defer = true;
    document.head.appendChild(script);
}

window.onload = () => {
    loadScript();
    document.getElementById('login').addEventListener('click', signIn);
    document.getElementById('logout').addEventListener('click', signOutUser);
};
