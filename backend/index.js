require('dotenv').config(); // for hiding api keys
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');

const AWS = require('aws-sdk');
const yelp = require('yelp-fusion');

// setting AWS credentials
AWS.config.region = process.env.AWS_CONFIG_REGION;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: process.env.AWS_CONFIG_IDENTITYPOOLID,
});

// setting Yelp API key
const client = yelp.client(process.env.YELP_API_KEY);

// declaring the variable that will eventually be a JSON file sent back to frontend
var responseJSON;
// the mood that will be used to query the Yelp API as well as send back
var finalEmotion;

// shows homepage!
app.use(express.static(path.join(__dirname, '/../frontend')));

// setting larger limits because images are big
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));


// takes the base64 encoded image from my JavaScript post and uses Rekognition on it to detect mood
app.post("/handle-image", function (req, res) {
    // parsing the JSON post
    let encodedImage = JSON.stringify(req.body).substring(17); // slices off key
    let longitudeString = encodedImage.substring(encodedImage.indexOf('","longitude":') + 15, encodedImage.indexOf('","latitude":'));
    let latitudeString = encodedImage.slice(encodedImage.indexOf('","latitude":')+14, -2);
    encodedImage = encodedImage.substring(0, encodedImage.indexOf('","longitude":'));
    
    const rekognition = new AWS.Rekognition();
    
    var image = null;
    var jpg = true;
    try {
        image = encodedImage.split("data:image/jpeg;base64,")[1];

    } catch (e) {
        jpg = false;
    }
    if (jpg == false) {
        try {
            image = encodedImage.split("data:image/png;base64,")[1];
        } catch (e) {
            console.log("Not an image file Rekognition can process");
            return;
        }
    }

    const buffer = new Buffer.from(image, 'base64');

    // setting parameters for Amazon Rekognition
    const params = {
        Image: {
          Bytes: buffer
        },
        Attributes: [
          'ALL',
        ]
    };

    // using Rekognition to find the face(s) in the photo
    rekognition.detectFaces(params, function(err, data) {
		if (err) {
			console.log(err, err.stack);
			console.log('There was an error parsing your photo.');
		} else {
            const numPeople = data.FaceDetails.length;
	        const EmotionsData = data.FaceDetails[0].Emotions; // extracting the emotions from faces dataset
	        let highestConfidence, highestEmotion;

            // finding the emotion that Rekognition is most confident in
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
            console.log(finalEmotion); // testing if getting emotion works
		}
    });
    

    // 1. SEND QUERY TO YELP API WITH SEARCH TERMS: "food " + finalMood
    // 2. Compile into JSON format
    // 3. res.json(JSONFILE)

    client.search({

    })


})

app.use(function (req, res, next) {
    res.status(404).send("Sorry that route doesn't exist");
});

var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log('Food Mood listening on port #{PORT}');
});