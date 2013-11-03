var winston = Winston;

Meteor.publish("stories", function () {
    winston.info("stories subscribed");

    return Stories.find({});
});
