const transitAPIKey = 'zpOgDArFTQol_ErrEKUk';
const openMapAPIToken = 'pk.eyJ1IjoicmFra2kiLCJhIjoiY2tqbmM2Mm5tMHNvYzJycW5mZzVmYzRobyJ9.Bd43bWrjB6wkguIf2Q7c5A';
const bbox = "bbox=-97.325875, 49.766204, -96.953987, 49.99275";
const originForm = document.querySelector('.origin-form');
const origins = document.querySelector('.origins');
const destinationForm = document.querySelector('.destination-form');
const destinations = document.querySelector('.destinations');
const planTrip = document.querySelector(".plan-trip");
const myTrip = document.querySelector(".my-trip");

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
    places.innerHTML = `<p><b>None of the places matches with your search result !!</b></p>`;
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
  getTripGuidance();
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


const getTripGuidance = () => {

  myTrip.textContent = "";
  let originCoords = getCoordinates(origins);
  let destinationCoords = getCoordinates(destinations);
  let undefined = "geo/undefined,undefined";

  if (originCoords != undefined && destinationCoords != undefined) {
    if (originCoords === destinationCoords) {
      myTrip.innerHTML = `
     <li>
       <p><b>Your starting location and destination are same !!
             Please select different starting location or destination !!</b></p>
     </li>`
    } else {
      fetch("https://api.winnipegtransit.com/v3/trip-planner.json?origin=" + getCoordinates(origins) + "&destination=" + getCoordinates(destinations) + "&api-key=" + transitAPIKey)
        .then(response => response.json())
        .then(data => printTrip(data.plans[0].segments))
        .catch(err => console.log(err))
    }
  } else if (originCoords === undefined && destinationCoords === undefined) {
    myTrip.innerHTML = `
      <li>
        <p><b>Please search and select your starting location and destination !!</b></p>
      </li>`
  } else if (destinationCoords === undefined) {
    myTrip.innerHTML = `
      <li>
        <p><b>Please search and select your destination !!</b></p>
      </li>`
  } else {
    myTrip.innerHTML = `
      <li>
        <p><b>Please search and select your starting location !!</b></p>
      </li>`
  }
}

const makeCapital = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const printTrip = (trip) => {
  myTrip.textContent = "";
  let htmlEle = ``;
  if (trip.length > 0) {
    trip.forEach(segment => {

      let segmentType = makeCapital(segment.type);
      let time = segment.times.durations.total;

      if (segmentType === "Walk") {
        if (segment.to.destination) {
          htmlEle = `
          <li>
            <i class="fas fa-walking"></i>${segmentType} for ${time} minutes to your destination.
          </li>`;
        } else {
          htmlEle = `
          <li>
            <i class="fas fa-walking"></i>${segmentType} for ${time} minutes to stop #${segment.to.stop.key}-${segment.to.stop.name}.
          </li>`;
        }
      } else if (segmentType === "Ride") {
        if (segment.route.key === "BLUE") {
          htmlEle = `
          <li>
            <i class="fas fa-bus"></i>${segmentType} the ${segment.route.key} for ${time} minutes.
          </li>`
        } else {
          htmlEle = `
          <li>
            <i class="fas fa-bus"></i>${segmentType} the ${segment.route.name} for ${time} minutes.
          </li>`
        }
      } else if (segmentType === "Transfer") {
        htmlEle = `
        <li>
          <i class="fas fa-ticket-alt"></i>${segmentType} from stop #${segment.from.stop.key}-${segment.from.stop.name} to stop #${segment.to.stop.key}-${segment.to.stop.name}.
        </li>`
      }
      myTrip.insertAdjacentHTML('beforeend', htmlEle);
    })
  } else {
    myTrip.innerHTML = `
      <li>
        <p><b> No routs available right now !!</b></p>
      </li>`;
  }
}