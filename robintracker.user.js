// ==UserScript==
// @name         Robin Tracker
// @namespace    https://monstrouspeace.com
// @version      1.02
// @description  Contributes statistics data to https://monstrouspeace.com/robintracker/
// @author       /u/GuitarShirt
// @match        https://www.reddit.com/robin*
// ==/UserScript==
/* jshint esnext: true */

function sendTrackingStatistics(config)
{
    // Use the name / id from the passed config if available
    //  Otherwise fallback to the baked info
    room_name = r.config.robin_room_name;
    room_id = r.config.robin_room_id;

    if('undefined' !== typeof config['robin_room_name'])
    {
        room_name = config.robin_room_name;
    }

    if('undefined' !== typeof config['robin_room_id'])
    {
        room_id = config.robin_room_id;
    }

    trackers = [
        "https://monstrouspeace.com/robintracker/track.php"
    ];

    queryString = "?id=" + room_name.substr(0,10) +
        "&guid=" + room_id +
        "&ab=" + r.robin.stats.abandonVotes +
        "&st=" + r.robin.stats.continueVotes +
        "&gr=" + r.robin.stats.increaseVotes +
        "&nv=" + r.robin.stats.abstainVotes +
        "&count=" + r.robin.stats.totalUsers +
        "&present=" + r.robin.stats.presentUsers +
        "&ft=" + Math.floor(r.config.robin_room_date / 1000) +
        "&rt=" + Math.floor(r.config.robin_room_reap_time / 1000);

    trackers.forEach(function(tracker){
        $.get(tracker + queryString);
    });
}

function updateStatistics(config)
{
    // Take over r.robin.stats for this
    if('undefined' === typeof r.robin['stats'])
    {
        r.robin.stats = {};
    }

    // Update the userlist
    if('undefined' !== typeof config['robin_user_list'])
    {
        var robinUserList = config.robin_user_list;
        r.robin.stats.totalUsers = robinUserList.length;
        r.robin.stats.presentUsers = robinUserList.filter(function(voter){return voter.present === true;}).length;
        r.robin.stats.increaseVotes = robinUserList.filter(function(voter){return voter.vote === "INCREASE";}).length;
        r.robin.stats.abandonVotes = robinUserList.filter(function(voter){return voter.vote === "ABANDON";}).length;
        r.robin.stats.abstainVotes = robinUserList.filter(function(voter){return voter.vote === "NOVOTE";}).length;
        r.robin.stats.continueVotes = robinUserList.filter(function(voter){return voter.vote === "CONTINUE";}).length;
        r.robin.stats.abstainPct = (100 * r.robin.stats.abstainVotes / r.robin.stats.totalUsers).toFixed(2);
        r.robin.stats.increasePct = (100 * r.robin.stats.increaseVotes / r.robin.stats.totalUsers).toFixed(2);
        r.robin.stats.abandonPct = (100 * r.robin.stats.abandonVotes / r.robin.stats.totalUsers).toFixed(2);
        r.robin.stats.continuePct = (100 * r.robin.stats.continueVotes / r.robin.stats.totalUsers).toFixed(2);

        // Update the div with that data
        $('#totalUsers').html(r.robin.stats.totalUsers);

        $('#increaseVotes').html(r.robin.stats.increaseVotes);
        $('#continueVotes').html(r.robin.stats.continueVotes);
        $('#abandonVotes').html(r.robin.stats.abandonVotes);
        $('#abstainVotes').html(r.robin.stats.abstainVotes);

        $('#increasePct').html("(" + r.robin.stats.increasePct + "%)");
        $('#continuePct').html("(" + r.robin.stats.continuePct + "%)");
        $('#abandonPct').html("(" + r.robin.stats.abandonPct + "%)");
        $('#abstainPct').html("(" + r.robin.stats.abstainPct + "%)");
    }

    sendTrackingStatistics(config);
}

// This grabs us the same data that is available in r.config via
//   parsing down a new page (giving us updated data without us having
//   to follow it like we probably should)
function parseStatistics(data)
{
    // There is a call to r.setup in the robin HTML. We're going to try to grab that.
    //   Wish us luck!
    var START_TOKEN = "<script type=\"text/javascript\" id=\"config\">r.setup(";
    var END_TOKEN = ")</script>";

    // If we can't locate the start token, don't bother to update this.
    //   We'll try again in 60 seconds
    var index = data.indexOf(START_TOKEN);
    if(index == -1)
    {
        return;
    }
    data = data.substring(index + START_TOKEN.length);

    index = data.indexOf(END_TOKEN);
    if(index == -1)
    {
        return;
    }
    data = data.substring(0,index);

    // This will throw on failure
    var config = JSON.parse(data);

    updateStatistics(config);
}

function generateStatisticsQuery()
{
    // Query for the userlist
    $.get("/robin",parseStatistics);
}

(function(){
    // For the initial update, just use the values baked into the DOM
    updateStatistics(r.config);

    // Trigger the update to robintracker every 5 minutes
    //  This is at a 5 second delay so we don't make two stats requests
    //  at the same time when used with scripts setup to query every 10 seconds
    setTimeout(function(){
        setInterval(generateStatisticsQuery, 5 * 60 * 1000);
    },5 * 1000);
})();
