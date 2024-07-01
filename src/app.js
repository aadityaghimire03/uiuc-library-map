// Initialize and add the map
function initMap() {
    // The location of UIUC
    const uiuc = { lat: 40.1019523, lng: -88.2271615 };
    // The map, centered at UIUC
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: uiuc,
    });
    // The marker, positioned at UIUC
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

window.onload = loadScript;
