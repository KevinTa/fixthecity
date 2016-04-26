List = new Mongo.Collection("list");
var MAP_ZOOM = 15;
if (Meteor.isClient) {
  // This code only runs on the client
  /*Template.body.helpers({
    list: function(){
	var myArray = List.find({}, {sort: {createdAt: -1}}).fetch();
	var distinctHead = _.uniq(myArray, true, function(List) {return List.heading});
	return distinctHead;
	}
  });*/
  Template.home.helpers({//helper for home template to show all distinct issues
  list: function(){
	var myArray = List.find({}, {sort: {createdAt: -1}}).fetch();
	var distinctHead = _.uniq(myArray, true, function(List) {return List.heading});
	return distinctHead;
	}
  });
  Template.entry.helpers({
  quantity: function(entry){
  var q=0;
  var myArray = List.find({}, {sort: {createdAt: -1}}).fetch();
  var headings = function(myArray){return _.pluck(myArray, "heading")};
  var headarray = headings(myArray);
  for(var i = 0; i<headarray.length; i++)
  {
	if(this.heading==headarray[i])
	{
		q++;
	}
  }
  return q;
  }
  });
  Template.show.helpers({//helper for show template to only show issues of the same category and location 
	list: function(){
	var myArray = List.find({}, {sort: {createdAt: -1}}).fetch();
	var cy=Session.get('currentiss');
	var nlist=new Array();
	for(var i = 0; i<myArray.length;i++)
	{
		if(myArray[i].heading==cy)
		{
			nlist.push(myArray[i]);
		}
	}
	return nlist;
	}
  });
  Template.entry.events({
    "click .delete": function () {
      List.remove(this._id);
    },
	"click .iss": function(e){//new click function to get the heading of the clicked element
	 currentiss=Session.set('currentiss', this.heading);
	}
  });
  	
}
//iron router tied to home and show templates
Router.route('/', {
	name: 'home',
    template: 'home'
});
Router.route('/show',{
	name:'show',
	template: 'show'
});

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
