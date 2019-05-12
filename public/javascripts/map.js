'use strict';

const main = async () => {
  try {
    //insert own mapbox token
    mapboxgl.accessToken = 'pk.eyJ1IjoiY2FyZWJhYnkiLCJhIjoiY2p0MWNrOHplMHBhdTRibXh3aXRsNDk4cCJ9.zeNJPvVOdrinJmH7mxLO3w';
    const mapOptions = {
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [2.1577406, 41.387982],
      zoom: 13
    };

    const map = new mapboxgl.Map(mapOptions);
    var geocoder = new MapboxGeocoder({
	    accessToken: mapboxgl.accessToken
    });
    const setLocationMarker = (locationArray) => {
      map.setCenter(locationArray);
      const marker = new mapboxgl.Marker({
        color: 'blue',
        offset: {
          x: -20,
          y: -20
        }
      })
        .setLngLat(locationArray)
        .addTo(map);

      map.setZoom(13);
    };

    const hasLocation = (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      setLocationMarker([longitude, latitude]);
    };

    const error = (error) => {
      console.error(error);
    };

    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by your browser');
    } else {
      navigator.geolocation.getCurrentPosition(hasLocation, error);
    }

    // array de dogwalkers
    const arrayDogwalkers = await searchDogwalkers();

    arrayDogwalkers.forEach(dogwalker => {
      var el = document.createElement('div');
      el.className = 'marker';
      el.style.background = dogwalker.imageUrl;

      new mapboxgl.Marker(el)
        .setLngLat(dogwalker.location.coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
          .setHTML(`
          <div class="popup">
            <div class="popup-img">
              <div class="popup-img-avatar" style="background-image:url(${dogwalker.imageUrl})"></div>
            </div>
            <div class="popup-details">
              <p class="popup-details-name"><a href="/profile/${dogwalker._id}">${dogwalker.username}</a></p>
              <p>${dogwalker.city}</p>
              <p>${dogwalker.positiveFeedback} de ${dogwalker.totalFeedback}</p>
            </div>
          </div>
          `))
        .addTo(map);
    });

    // map in darkmode
    if (window.localStorage.getItem('darkmode') === 'yes') {
      map.setStyle('mapbox://styles/mapbox/dark-v9');
    }

    map.addControl(new MapboxGeocoder({
      accessToken: mapboxgl.accessToken
    }));
  } catch (error) {

  }
};

const searchDogwalkers = async () => {
  try {
    const dogwalkerRequest = await fetch(`/api/user`);
    if (dogwalkerrRequest.status === 404) {
      console.error('no walkers');
    }
    const arrayDogwalkers = await dogwalkerRequest.json();
    return arrayDogwalkers;
  } catch (error) {
    console.error(error);
  }
};

window.addEventListener('load', main);

// Toggle map
const arrow = document.querySelector('.arrow-slide-toogle');
const map = document.querySelector('.map-container');
const mapArrowImage = document.querySelector('.arrow-img');
const mapText = document.querySelector('.map-text');
const handleClickToggleMap = (event) => {
  if (event.target) {
    map.classList.toggle('toggle-map');
    mapArrowImage.classList.toggle('arrow-img--rotate');
    // Toggle text
   if (mapText.innerHTML === 'Ver mapa') {
     mapText.innerHTML = 'Ocultar mapa';
  } else if (mapText.innerHTML === 'Ocultar mapa') {
   mapText.innerHTML = 'Ver mapa';
   }
  }
};

arrow.addEventListener('click', handleClickToggleMap);