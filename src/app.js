const transitAPIKey = 'zpOgDArFTQol_ErrEKUk';
const openMapAPIToken = 'pk.eyJ1IjoicmFra2kiLCJhIjoiY2tqbmM2Mm5tMHNvYzJycW5mZzVmYzRobyJ9.Bd43bWrjB6wkguIf2Q7c5A';
const bbox = "bbox=-97.325875, 49.766204, -96.953987, 49.99275";
const originForm = document.querySelector('.origin-form');
const origins = document.querySelector('.origins');
const destinationForm = document.querySelector('.destination-form');
const destinations = document.querySelector('.destinations');
const planTrip = document.querySelector(".plan-trip");

originForm.addEventListener('submit', (event) => {
  const input = event.target.querySelector('input');
  getRelatedOriginPlaces(input.value, origins);
  event.preventDefault();
})

destinationForm.addEventListener('submit', (event) => {
  const input = event.target.querySelector('input');
  getRelatedOriginPlaces(input.value, destinations);
  event.preventDefault();
})

const getRelatedOriginPlaces = (place, placeOfInterest) => {
  fetch("https://api.mapbox.com/geocoding/v5/mapbox.places/" + place + ".json?types=poi&limit=10&" + bbox + "&access_token=" + openMapAPIToken)
    .then(response => response.json())
    .then(data => printPlaces(data.features, placeOfInterest))
    .catch(err => console.log(err))
}

const printPlaces = (arrayOfPlaces, places) => {
  places.innerHTML = "";
  if (arrayOfPlaces.length > 0) {
    arrayOfPlaces.forEach(element => {

      let locationAddress = element['place_name'].split(',');
      let coordinates = element.geometry.coordinates;

      places.insertAdjacentHTML('beforeend', `
        <li data-long="${coordinates[0]}" data-lat="${coordinates[1]}">
          <div class="name">${locationAddress[0]}</div>
          <div>${locationAddress[1]}</div>
        </li>`)
    });
  } else {
    places.innerHTML = `
      <li>
        <p><b>None of the places matches with your search result !!</b></p>
      </li>  
    `;
  }
  selectedPlaces(places);
}

const selectedPlaces = (listOfPlaces) => {
  let list = listOfPlaces.getElementsByTagName('li');
  for (let i = 0; i < list.length; i++) {
    list[i].addEventListener('click', () => {
      for (let j = 0; j < list.length; j++) {
        if (list[j].classList.contains('selected')) {
          list[j].classList.remove('selected');
        }
      }
      list[i].classList.add('selected');
    })
  }
}

planTrip.addEventListener('click', () => {
  getTripGuidence();
});

const getCoordinates = (positions) => {

  let latitude;
  let longitude;
  let position = positions.getElementsByTagName('li');

  for (let i = 0; i < position.length; i++) {
    if (position[i].classList.contains("selected")) {
      latitude = position[i].getAttribute("data-lat");
      longitude = position[i].getAttribute("data-long");
    }
  }
  return "geo/" + latitude + "," + longitude;
}


const getTripGuidence = () => {
  fetch("https://api.winnipegtransit.com/v3/trip-planner.json?origin=" + getCoordinates(origins) + "&destination=" + getCoordinates(destinations) + "&api-key=" + transitAPIKey)
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(err => console.log(err))
}