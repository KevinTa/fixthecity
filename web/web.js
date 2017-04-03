List = new Mongo.Collection("list"); //List Collection to hold all entries
Display = new Mongo.Collection(null); //Display Collection tol hold entries to be displayed
var MAP_ZOOM = 15;
if (Meteor.isClient) {
  // This code only runs on the client
  var current; //Variable keeps track of clicked entry in reactive table
  
/*Helper functions for homepage*/
  Template.home.helpers({
  
	/*Scans List Collection for entries with distinct topics,
	counts number of entries for each distinct topic,
	then inserts this information into Display Collection*/
    list: function(){
    Display.remove({});
    var myArray = List.find({}, {sort:{createdAt: -1}}).fetch();
    var distinctHead = _.uniq(myArray, false, function(List) {return List.topic});
    var valuearray= new Array();
    var topics = function(myArray){return _.pluck(distinctHead, "topic")};
    var topicarray = topics(distinctHead);
    for(var i = 0; i<topicarray.length; i++)
    {
         valuearray[i]=0;
      for(var j = 0; j<myArray.length; j++)
      {
        if(topicarray[i]==myArray[j].topic)
        {
          valuearray[i]++;
        }
      }
    }
    for(var k =0;k<distinctHead.length;k++)
    {
      distinctHead[k].quantity=valuearray[k];
    }
    for(var m =0;m<distinctHead.length; m++){
    Display.insert(distinctHead[m]);
        }   
    },
	
	/*Returns Display Collection with the 
	fields: key for pulling the data from the collection and
	label for the corresponding header to be displayed in the
	reactive table in web.HTML*/
    settings: function () {
      return {
        collection: Display,
        fields: [
          {key: 'topic', label: 'Category'},
          {key: 'details', label: 'Description'},
          {key: 'createdAt', label: 'Date Added'},
          {key: 'quantity', label: 'Quantity'},
        ]
      };
    }
  });
  
/*Helper functions for the page that shows entries of clicked topics*/
  Template.show.helpers({
  
  /*Scans List Collection for entries that match topics with clicked entry
  in reactive table*/
    list: function(){
      var myArray = List.find({}, {sort:{createdAt: -1}}).fetch();
      var nlist= new Array();
      for(var i = 0; i< myArray.length;i++)
      {
        if(myArray[i].topic==current)
        {
          nlist.push(myArray[i]);
        }
      }
      return nlist;
    }

  });
  
  /*Event handlers the page that shows entries of clicked topics*/
  Template.show.events({
  
    /*Routes to home page when user clicks back button with class 'btn-secondary' on 'show' page*/
    "click .btn-secondary": function(){
      Router.go('/');
    },
	
	/*Deletes object from List Collection, when icon with class 'delete' is clicked*/
    "click .delete": function(){
      List.remove(this._id);
    }
    });
  
  /*Event handlers for home page*/
  Template.home.events({
  
  /*Sets variable 'current' to topic of clicked entry in reactive table,'
  then routes user to 'show' page*/
  'click .reactive-table tbody tr': function () {
   current = this.topic;
   Router.go('/show');
    }
  });
}

/*Routes user to 'show' page, which displays all entries
of matching topics to clicked entry*/
Router.route('/show', {
  name:'show',
  template:'show'
});

/*Routes user to home page*/
Router.route('/', {
  name:'home',
  template:'home'
});
if (Meteor.isServer) {
  Meteor.startup(function () {
  });
}