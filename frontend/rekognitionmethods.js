window.onload = getLocationandPost(); // gets the user's location as soon as the page.
var finalEmotion;
var longitudeString
var latitudeString

function getLocationandPost() {
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			longitudeString = position.coords.longitude + '';
			latitudeString = position.coords.latitude + '';
			console.log(longitudeString);
			console.log(latitudeString);
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
			$.post('/handle-image', jsonFormImage, function() {
				// console.log(eval(result.responseText));
			});
		}
		fileReader.readAsDataURL(fileToLoad);
	  }
}

  // removes element from html
  function removeElement(elementId) {
    var element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
}