window.onload = getLocationandPost(); // gets the user's location as soon as the page.
var finalEmotion;
var longitudeString
var latitudeString
// Created two more coordinate variables so I can use them as numbers for Google Maps
var latitude;
var longitude;

function getLocationandPost() {
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			// sets user coordinates to variables to be later appended to JSON HTTP post
			longitude = parseFloat(position.coords.longitude);
			latitude = parseFloat(position.coords.latitude);
			longitudeString = position.coords.longitude + '';
			latitudeString = position.coords.latitude + '';
		});
	} else {
			alert("HTML5 Geolocation is not supported by this browser.");
	}
}

// Shows error in console if there's an error in getting the user's location.
function locationError(err) {
	if(err.code == 1) {
		console.log("Error: Location request declined.");
	} else if(err.code == 2) {
		console.log("Error: Position unavailable.");
	} else if(err.code == 3) {
		console.log("Error: Network timed out.");
	} else {
		console.log("Unknown error.");
	}
}
	
// posts image as http request
function postImage() {	
	// encodes image to base64
	var filesSelected = document.getElementById("userphoto").files;
	if (filesSelected.length > 0) {
		var fileToLoad = filesSelected[0];
		var fileReader = new FileReader();
  
		fileReader.onload = function(fileLoadedEvent) {
		  	var srcData = fileLoadedEvent.target.result;
  
		  	var newImage = document.createElement('img');
		  	newImage.src = srcData;
  
		  	document.getElementById("imgTest").innerHTML = newImage.outerHTML; // adds image to website
  
			let encodedImage = document.getElementById("imgTest").innerHTML; // gets base64 string from image
		    
		  	removeElement('imgTest'); // removes image from website

			// let betterEncodedImage = encodedImage.slice(encodedImage.indexOf("base64")+7, -2); // just the base64 code
			let betterEncodedImage = encodedImage.slice(10, -2); // doesn't remove image type

			// preparing JSON to be sent to server
			let presjsonFormImage = '{'.concat(
				'"encodedImage": "').concat(betterEncodedImage).concat('",').concat(
				'"longitude": "').concat(longitudeString).concat('",').concat(
				'"latitude": "').concat(latitudeString).concat('"').concat(
				'}');
			
			// converting variable type to JSON
			let jsonFormImage = JSON.parse(JSON.stringify(presjsonFormImage));

			$.ajaxSetup({
				headers: {'content-type':'application/json'}
			});

			// posts base64 encoded image to server
			$.post('/handle-image', jsonFormImage, function(data) {
				var jsondata = JSON.stringify(data);
				console.log(jsondata);

				// parsing JSON data
				var mood = jsondata.slice(jsondata.indexOf('"mood') + 11, -4);
				var restaurantname = jsondata.slice(jsondata.indexOf('"name') + 10, jsondata.indexOf('"image_url') - 4);
				var restaurantaddress = jsondata.slice(jsondata.indexOf('"address1') + 14, jsondata.indexOf('"address2') - 4).concat(
					', ').concat(jsondata.slice(jsondata.indexOf('"city') + 10, jsondata.indexOf('"zip_code') - 4)).concat(
						' ').concat(jsondata.slice(jsondata.indexOf('"zip_code') + 14, jsondata.indexOf('"country') - 4)
				);

				document.getElementById("finalmood").innerHTML = "You Appear to be " + mood;
				document.getElementById("results").style.backgroundColor = "#FFC400";
				document.getElementById("results").style.boxShadow = "4px 4px";
				document.getElementById("restaurantsuggestion").innerHTML = "A restaurant that fits your mood is " + restaurantname + ".";
				document.getElementById("restaurantaddress").innerHTML = restaurantaddress;

			}, "json");
		}
		fileReader.readAsDataURL(fileToLoad);
	  }
}

// Initialize and add the map
// function initMap() {
// 	var uluru = {lat: parseFloat(latitude), lng: parseFloat(longitude)};
// 	var map = new google.maps.Map(document.getElementById('map'), {zoom: 15, center: uluru});

// 	var marker = new google.maps.Marker({position: uluru, map: map});
//   }
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: parseFloat(latitude), lng: parseFloat(longitude)},
	  zoom: 6
	});
  }

  // removes element from html
  function removeElement(elementId) {
    var element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
}