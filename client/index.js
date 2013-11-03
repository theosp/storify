Meteor.subscribe("stories");

Session.set("current_position", null);

Deps.autorun(function () {
    if (Session.get("current_position") === null) {
        Session.set("current_story", null);
        Session.set("current_slide", null);
        Session.set("me_and_my_parents", null);
    } else {
        var current_position = Session.get("current_position");
        var story = Stories.find({_id: current_position[0]}).fetch()[0];
        Session.set("current_story", story);

        var slide = story;
        var me_and_my_parents = [slide];
        for (var i = 1; i < current_position.length; i++) {
            var slide = slide.childs[current_position[i]];

            me_and_my_parents.push(slide);
        }

        Session.set("current_slide", slide);
        Session.set("me_and_my_parents", me_and_my_parents)
    }
});

Template.navigation.events({
	"click": function(){
        Session.set("current_position", null);
	}
});

Template.view.helpers({
    main: function () {
        return Session.get("current_position") === null;
    }
});

Template.stories.events({
	"click .new-story": function(){
        Stories.insert({caption: $(".caption").val(), url: $(".url").val(), childs: []});
	}
});

Template.stories.helpers({
    stories: function () {
        return Stories.find({});
    }
});

Template.story.helpers({
    me_and_my_parents: function () {
        return Session.get("me_and_my_parents");
    },

    childs: function () {
        return Session.get("current_slide").childs;
    }
});

Template.story.events({
	"click .new-slide": function(){
        var current_position = Session.get("current_position");
        var story = Session.get("current_story");
        var current_slide = story;
        for (var i = 1; i < current_position.length; i++) {
            current_slide = current_slide.childs[current_position[i]];
        }

        current_slide.childs.push({caption: $(".caption").val(), url: $(".url").val(), childs: []});

        Stories.update({_id: Session.get("current_story")._id}, _.extend(Session.get("current_story"), {childs: story.childs}));
	}
});

Template.story_image.events({
	"click .delete": function(e){
        Stories.remove({_id: this._id});

        e.stopPropagation();
	},

	"click img, click div": function(e, tpl){
        if (Session.get("current_position") === null) {
            Session.set("current_position", [this._id]);
        } else {
            if ($(e.target).parents(".childs").length === 0) {
                Session.set("current_position", Session.get("current_position").slice(0, $(e.target).parents(".story_image").index() + 1));
                return;
            }

            var current_position = Session.get("current_position");
            current_position.push($(e.target).parents(".story_image").index());
            Session.set("current_position", current_position);
        }

        e.stopPropagation();
	}
});
