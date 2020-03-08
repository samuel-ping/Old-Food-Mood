window.onload = getLocationandStore(); // gets the user's location as soon as the page.
var finalEmotion;

function loadFile(event) {
	var output = document.getElementById("output");
	output.src = URL.createObjectURL(event.target.files[0]);
}


function getLocationandStore() {
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			const longitudeString = position.coords.longitude + '';
			const latitudeString = position.coords.latitude + '';
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
			let betterEncodedImage = encodedImage.slice(10, -2); // includes image type

			console.log(betterEncodedImage);
			let presjsonFormImage = '{ "encodedImage": "'.concat(betterEncodedImage).concat('" }');
			let jsonFormImage = JSON.parse(JSON.stringify(presjsonFormImage));

			$.ajaxSetup({
				headers: {'content-type':'application/json'}
			});

			$.post('/handle-image', jsonFormImage, function() {
				console.log("3");
	
				const numPeople = data.FaceDetails.length;
				const EmotionsData = data.FaceDetails[0].Emotions;
				let highestConfidence, highestEmotion;
	
				for(var j = 0; j < numPeople; j++) {
					for(var i = 0; i < EmotionsData.length; i++) {
						if(i === 0) {
							highestConfidence = EmotionsData[i].Confidence;
							highestEmotion = EmotionsData[i].Type;
						} else {
							if(EmotionsData[i].Confidence > highestConfidence) {
								highestConfidence = EmotionsData[i].Confidence;
								highestEmotion = EmotionsData[i].Type;
							}
						}
					}
				}
				finalEmotion = highestEmotion;
				sessionStorage.setItem("emotion", finalEmotion);
				alert(finalEmotion); // testing if getting emotion works
			});


		}
		fileReader.readAsDataURL(fileToLoad);
	  }


	// console.log("1");
	// console.log(typeof(encodedImage));
	// $(document).ready(function() {
	// 	console.log("2");

		// $.post('/handle-image', encodedImage, function() {
		// 	console.log("3");

		// 	const numPeople = data.FaceDetails.length;
		// 	const EmotionsData = data.FaceDetails[0].Emotions;
		// 	let highestConfidence, highestEmotion;

		// 	for(var j = 0; j < numPeople; j++) {
		// 		for(var i = 0; i < EmotionsData.length; i++) {
		// 			if(i === 0) {
		// 				highestConfidence = EmotionsData[i].Confidence;
		// 				highestEmotion = EmotionsData[i].Type;
		// 			} else {
		// 				if(EmotionsData[i].Confidence > highestConfidence) {
		// 					highestConfidence = EmotionsData[i].Confidence;
		// 					highestEmotion = EmotionsData[i].Type;
		// 				}
		// 			}
		// 		}
		// 	}
		// 	finalEmotion = highestEmotion;
		// 	sessionStorage.setItem("emotion", finalEmotion);
		// 	alert(finalEmotion); // testing if getting emotion works
		// });
	// })
}

  // removes element from html
  function removeElement(elementId) {
    var element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
}

// Processes image
function processImage() {
	const control = document.getElementById('userphoto');
	var finalEmotion;

	if (control.files.length > 0) {
		const file = control.files[0];
		const reader = new FileReader();

		reader.onload = function(e) {
			getFaceData(e.target.result);
		};
		reader.readAsArrayBuffer(file);
	}
}

function getFaceData(imgData) {
    const params = {
        Image: {
          Bytes: imgData
        },
        Attributes: [
          'ALL',
        ]
    };

	rekognition.detectFaces(params, function(err, data) {
		if (err) {
			console.log(err, err.stack);
			alert('There was an error parsing your photo.');
		} else {
            // console.log(data);
            getEmotion(data)
		}
	});
}
		
// returns the emotion that Rekognition is most confident of out of all the people
// If I have time to improve this, take into account how many of each emotion there is (integer array size 8 with each emotion that counts how many people have each emotion)
function getEmotion(data) {
	const numPeople = data.FaceDetails.length;
	const EmotionsData = data.FaceDetails[0].Emotions;
	let highestConfidence, highestEmotion;

	for(var j = 0; j < numPeople; j++) {
		for(var i = 0; i < EmotionsData.length; i++) {
			if(i === 0) {
				highestConfidence = EmotionsData[i].Confidence;
				highestEmotion = EmotionsData[i].Type;
			} else {
				if(EmotionsData[i].Confidence > highestConfidence) {
					highestConfidence = EmotionsData[i].Confidence;
					highestEmotion = EmotionsData[i].Type;
				}
			}
		}
	}
	finalEmotion = highestEmotion;
	sessionStorage.setItem("emotion", finalEmotion);
	alert(finalEmotion); // testing if getting emotion works
}
