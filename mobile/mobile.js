List = new Mongo.Collection("list");//List Collection to hold entered data

if (Meteor.isClient) {
var MAP_ZOOM = 15;

/*functions to run at startup*/
Meteor.startup(function () {
/*Loads Google Maps and starts 'showMainMenu' session*/
  GoogleMaps.load();
  Session.set("showMainMenu", 1);
  Session.set("showPhoto", 0);
  Session.set("showCategories", 0);
  Session.set("showTopic", 0);
  Session.set("showDetails", 0);
  Session.set("showConfirmation", 0);

  sAlert.config({
    effect: '',
    position: 'top-right',
    timeout: 5000,
    html: false,
    onRouteClose: true,
    stack: true,
    offset: 0, // in px - will be added to first alert (bottom or top - depends of the position in config)
    beep: false,
    onClose: _.noop //
  });

});

/*Event handlers for 'MainMenu' session*/
Template.MainMenu.events({

  /*After clicking 'submit',active session is now 'showPhoto'*/
  'click .submitareport': function(event) {
    event.preventDefault();
    Session.set("showMainMenu", 0);
	 Session.set("showPhoto", 1);
  }
});

/*Event handlers for 'PhotoPage' session*/
Template.PhotoPage.events({

 /*Clicking 'take photo' will cause the camera to take
 a photograph*/
 'click .takePhoto': function(event, template) {
    var cameraOptions = {
      width: 800,
      height: 600
    };
    MeteorCamera.getPicture(cameraOptions, function (error, data) {
      if (error) {
        var warining=sAlert.warning('error with picture', {timeout: 'none'});
      }
      else{
        $('.photo').show();
        $('.photo').attr('src', data); 
        $('.takePhoto').hide();
        $('.retakePhoto').show();
        $('.next').show();
        $('label').hide();
      }  
    });
    event.preventDefault();
  },
  /*clicking 'next' submits the photo, and starts the 'showCategories' session*/
  'click .next': function(event) {
    event.preventDefault(); 
    var PictureSrcSubmit= $( '.photo' ).attr('src') ;
    Session.set("picSubmit", PictureSrcSubmit);
    Session.set("showPhoto", 0);
    Session.set("showCategories", 1);
  }   
});

/*Event handlers for Category Page*/
Template.CategoryPage.events({ 

  /*clicking 'next' will set variable 'category'
  to selected category, then start 'showGPS' session*/
  'click .next': function(event) {
    event.preventDefault();
    var elements = document.getElementsByName("category");//start of getting selecting category

      for (var i = 0; i < elements.length; i++){
        if (elements[i].checked)
        {
          var category = elements[i].value;
        }
      }
    Session.set("categorySubmit", category);
    Session.set("topicSubmit", category);
    Session.set("showCategories", 0);
    Session.set("showGPS", 1);
  }
});


/*Event handlers for 'GPSPage'*/
Template.GPSPage.events({
  
  /*Clicking 'next' start 'showDetail' session*/
   'click .next': function(event) {
      event.preventDefault();

      Session.set("showGPS", 0);
      Session.set("showDetails", 1);
    }
});

/*Shows Google Map*/
Template.map.onCreated(function() {
    var self = this;

    GoogleMaps.ready('map', function(map) {
      var marker;

      // Create and move the marker when latLng changes.
      self.autorun(function() {
       
        var latLng = Geolocation.latLng();
        if (! latLng){
          
          return;
        }

        // If the marker doesn't yet exist, create it.
        if (! marker) {
          marker = new google.maps.Marker({
            position: new google.maps.LatLng(latLng.lat, latLng.lng),
            map: map.instance
          });
          Session.set("latitudeSubmit", latLng.lat);
          Session.set("longitudeSubmit", latLng.lng);
        }
        // The marker already exists, so we'll just change its position.
        else {
          marker.setPosition(latLng);
        }

        // Center and zoom the map view onto the current position.
        map.instance.setCenter(marker.getPosition());
        map.instance.setZoom(MAP_ZOOM);
      });
    });
  });
  
/*Helper functions for 'map*/
Template.map.helpers({

	/*Returns error message in case of an error*/
    geolocationError: function() {
      var error = Geolocation.error();
      return error && error.message;
    },
	
	/*Initializes map and centers in and zooms on location*/
    mapOptions: function() {
      var latLng = Geolocation.latLng();
      // Initialize the map once we have the latLng.
      if (GoogleMaps.loaded() && latLng) {
        return {
          center: new google.maps.LatLng(latLng.lat, latLng.lng),
          zoom: MAP_ZOOM
        };
      }
    }
  });
/*Helper functions for Confirmation page;
Each one returns the data entered from 
each session*/
Template.ConfirmationPage.helpers({
  image: function(){
    return Session.get("picSubmit");
  },
  category: function(){
    return Session.get("categorySubmit");
  },
  topic: function(){
    return Session.get("topicSubmit");
  },
  latitude: function(){
    return Session.get("latitudeSubmit");
  },
  longitude: function(){
    return Session.get("longitudeSubmit");
  }
});

/*Event handlers for 'TopicPage'*/
Template.TopicPage.events({

	/*Clicking 'next' start 'showGPS' session*/
   'click .next': function(event) {
      event.preventDefault();
      var topic= event.delegateTarget.topic.value;
      Session.set("topicSubmit",topic);
      Session.set("showTopic", 0);
      Session.set("showGPS", 1);
    }
});

/*Event handlers for 'OptionalSetailsPage'*/
Template.OptionalDetailsPage.events({

    /*clicking 'next' starts 'showConfirmation' session*/
  'click .next': function(event) {
    event.preventDefault();
    var details= event.delegateTarget.details.value;
    var name= event.delegateTarget.username.value;
    Session.set("detailsSubmit",details);

    Session.set("nameSubmit",name);
    Session.set("showDetails", 0);
    Session.set("showConfirmation", 1);
  }
});

/*Event handlers for 'formhere'*/
Template.formHere.events({

  /*assigns variables to data entered from sessions*/
  "submit form": function (event) {
      // Prevent default browser form submit
    event.preventDefault();
    
      // Get value from form element
    var topic= Session.get("topicSubmit");
    var details = Session.get("detailsSubmit");
    var src=  Session.get("picSubmit");
    var category= Session.get("categorySubmit");
    var latitude= Session.get("latitudeSubmit");
    var longitude= Session.get("longitudeSubmit");
    var hidden="hidden";
    
    
    //end of selecting category
    var heading = category+longitude+latitude;//heading is combination of category and location to distinguish each row in the table
   
    /*Insert variables into Collection*/
      List.insert({
        category: category,
        topic: topic,
        details: details,
        image: src,
        longitude: longitude,
        latitude: latitude,
        heading: heading,
        createdAt: new Date() // current time
      });
    Session.set("showConfirmation", 0);
    Session.set("showMainMenu", 1);
    

	  
	}
});


/*Returns current session*/
Template.registerHelper('session', function( value ) {
  return Session.get(value);
});

/*must bind to `document.body` as element will be replaced during re-renders
add the namespace `.tplquestions` so all event handlers can be removed easily*/
Template.CategoryPage.created = function(){
  $(document.body).on('change.tplquestions', '.form', function(e){
   
     $('.next').show();
  }); 
};

/*remove all event handlers in the namespace `.tplquestions`*/
Template.CategoryPage.destroyed = function(){
  $(document.body).off('.tplquestions');
}


}

