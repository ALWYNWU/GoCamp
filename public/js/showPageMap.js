mapboxgl.accessToken = 'pk.eyJ1IjoieWlsb25nd3UiLCJhIjoiY2w4YjZpazg0MG5oZDN1cnhqcGxnNnFwdiJ9.eKv0f2hQdFfBt1Z_Il2SSw';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/yilongwu/cl8b8jvuk001m14p1qud28trz', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 6, // starting zoom
    projection: 'globe' // display the map as a 3D globe
});
    map.on('style.load', () => {
    map.setFog({}); // Set the default atmosphere style
});

map.addControl(new mapboxgl.NavigationControl());

const el = document.createElement('div');
const width = 50;
const height = 50;
el.className = 'marker';

// custom marker
el.style.backgroundImage = `url(https://cdn-icons-png.flaticon.com/512/1600/1600565.png)`;
el.style.width = `${width}px`;
el.style.height = `${height}px`;
el.style.backgroundSize = '100%';
    
const marker1 = new mapboxgl.Marker(el)
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset: 25})
        .setHTML(
            `<h5>${campground.title}<h5><p>${campground.location}</p>`
        )
    )
    .addTo(map)
