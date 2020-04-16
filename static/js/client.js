const removeHtml = "<button class='entry-item remove-button hide waves-effect waves btn-flat grey lighten-3 grey-text text-darken-2' name='action' value='REM'>Remove</button>";
const cancelHtml = "<button class='entry-item cancel-button hide waves-effect waves btn-flat grey lighten-3 grey-text text-darken-2' name='action' value='CANCEL'>Cancel</button>";
const doneHtml = "<button class='entry-item done-button hide waves-effect waves-light btn blue' name='action' value='DONE'>Done</button>";
const helpHtml = "<button class='entry-item help-button hide waves-effect waves-light btn blue' name='action' value='HELP'>Help</button>";
const changeQuestionHtml = "<button class='entry-item changeQuestion-button hide waves-effect waves btn-flat blue lighten-5 grey-text text-darken-2' name='action' value='CHANGEQUESTION'>Change Question</button>";


const entryHtml = `
    <li class='collection-item'>
        <form method='POST'>
            <div class='helping-text teal-text lighten-1'></div>
            <div class='entry-container'>
                <input type='hidden' class='id-input' name='entry_id'>
                <div class='entry-item entry-container entry-text'>
                    <div class='entry-item entry-name'></div>
                    <div class='entry-item entry-question'></div>
                </div>
                <div class='entry-item entry-spacer'></div>
                <div class='entry-item entry-container entry-buttons'>
                    ${changeQuestionHtml}
                    ${removeHtml}
                    ${helpHtml}
                    ${cancelHtml}
                    ${doneHtml}
                </div>
            </div>
        </form>
    </li>
`;

var xHtml = "<button class='waves-effect waves btn-flat grey lighten-2 black-text x-button' name='action' value='CANCEL'>X</button>";

var mq;

$(document).ready(function() {
    $('select').formSelect();
    $('.modal').modal();

    $(document).on("click", ".remove-button", function(event) {
        if (!$(this).hasClass("confirming")) {
            $(".confirming").each(function() {
                $(this).removeClass("confirming red white-text")
                    .addClass("grey lighten-3 grey-text text-darken-2")
                    .text("Remove");
            });
            $(this).addClass("confirming red white-text")
                .removeClass("grey lighten-3 grey-text text-darken-2")
                .text("Are you sure?");
            event.preventDefault();
        }
    });
    $(document).click(function(event) {
        if (!$(event.target).hasClass("remove-button")) {
            $(".confirming").each(function() {
                $(this).removeClass("confirming red white-text")
                    .addClass("grey lighten-3 grey-text text-darken-2")
                    .text("Remove");
            });
        }
    });
    mq = window.matchMedia("(min-width: 761px)");
    mq.onchange = positionOverlay;
});


function editMessage() {
    $("#message").hide();
    $("#message_form").show();
    var len = $("#message_form input").val().length;
    $("#message_form input").focus().get(0).setSelectionRange(len, len);
}

function cancelEditMessage() {
    $("#message_form").hide();
    $("#message").show();
}


//REQUIRED FIELDS: id, status, name, user_id, ta_id, topic_name, ta_full_name, question
function buildTAEntry(entry) {
    var elt = $(entryHtml);
    elt.data("entryId", entry.id);
    elt.find(".id-input").val(entry.id);
    elt.find(".entry-name").html(`${entry.name} (${entry.user_id})`);
    elt.find(".entry-question").html(`[${entry.topic_name}] ${entry.question}`);

    if (entry.status == 1 && ta_id == entry.ta_id) {
        elt.find(".cancel-button").removeClass("hide");
        elt.find(".done-button").removeClass("hide");
        elt.find(".helping-text").text("You are helping");
    } else if (entry.status == 1) {
        elt.find(".helping-text").html(`${entry.ta_full_name} is helping ${xHtml}`);
    } else if (!ta_helping_id) {
        if (ta_id) {
            elt.find(".changeQuestion-button").removeClass("hide");
            elt.find(".remove-button").removeClass("hide");
            elt.find(".help-button").removeClass("hide");
        } else {
            elt.find(".remove-button").removeClass("hide");
        }
    }
    return elt;
}

//REQUIRED FIELDS: id, status, name, user_id, topic_name, ta_full_name
function buildMyEntry(entry) {
    var elt = $(entryHtml);
    elt.addClass("me");
    elt.data("entryId", entry.id);
    elt.find(".id-input").val(entry.id);
    elt.find(".entry-name").html(`${entry.name} (${entry.user_id})`);
    elt.find(".entry-question").html(`[${entry.topic_name}] ${entry.question}`);

    if (entry.status == 1) {
        elt.find(".helping-text").text(entry.ta_full_name + " is helping");
    } else {
        elt.find(".remove-button").removeClass("hide");
    }
    return elt;
}

//REQUIRED FIELDS: id, status, ta_full_name
function buildStudentEntry(entry) {
    var elt = $(entryHtml);
    elt.data("entryId", entry.id);
    elt.find(".id-input").val(entry.id);
    if (entry.status == 1) {
        elt.find(".helping-text").text(entry.ta_full_name + " is helping");
    }
    return elt;
}

function positionOverlay() {
    var me = $("#queue").find(".me");
    var ahead;
    var last;
    if (me.length > 0) {
        ahead = me.prevAll().length;
        last = me.prev();
    } else {
        ahead = $("#queue").children().length;
        last = $("#queue").last();
    }
    if (ahead >= 3 && !ta_id && mq.matches) {
        $("#status").addClass("overlay");
        var totalheight = last.offset().top + last.outerHeight() - $("#queue").offset().top;
        $("#status").css("top", totalheight * 0.15);
        $("#status").css("height", totalheight * 0.7);
    } else {
        $("#status").removeClass("overlay");
        $("#status").removeAttr("style");
    }
}

function updateStatus() {
    var me = $("#queue").find(".me");
    var statushtml = "";
    if (me.length > 0) {
        var ahead = me.prevAll().length;
        if (ahead == 0) {
            statushtml += "You're currently first in the queue.";
        } else if (ahead == 1) {
            statushtml += "There is 1 student ahead of you.";
        } else {
            statushtml += "There are " + ahead + " students ahead of you.";
        }
        if (me.index() < waittimes.length) {
            var time = Math.ceil(waittimes[me.index()]/60);
            if (time < 3) {
                time = "less than 3";
            }
            statushtml += "<br>Your estimated wait time is " + time + " minutes.";
        }
    } else {
        var ahead = $("#queue").children().length;
        if (ahead == 0) {
            statushtml += "There are no students on the queue.";
        } else if (ahead == 1) {
            statushtml += "There is 1 student on the queue.";
        } else {
            statushtml += "There are " + ahead + " students on the queue.";
        }
        if (waittimes.length == ahead+1) {
            var time = Math.ceil(waittimes[ahead]/60);
            if (time < 3) {
                time = "less than 3";
            }
            statushtml += "<br>The estimated wait time is " + time + " minutes.";
        }
    }
    $("#status_content").html(statushtml);
    $("#num_ahead").text(ahead);
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkAndUpdateSeq(message_seq) {
    if (message_seq != seq + 1) {
        window.location.reload();
        throw new Error("Queue data is out of date. Reloading...");
    }
    seq = message_seq;
}

var socket = io();
socket.on("connect", function () {
    socket.emit("authenticate", unescape(getCookie("auth")));
    // notification permission request on connect
    if (!("Notification" in window)) {
        console.log("This browser does not support desktop notification");
    } else if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }
});
$(document).on("submit", "form", function(event) {
    socket.disconnect();
});

socket.on("add", function(message) {
    // notification on add for ta
    try {
        if ( ta_id && ("Notification" in window) && (Notification.permission == "granted") ) {
            var notification = new Notification("New Queue Entry", {
                "body": "Name: " + message.data.name + "\n" +
                        "Andrew ID: " + message.data.user_id + "\n" +
                        "Topic: " + message.data.topic_name
            });
        }
    } catch (error) {
        console.log("There was an error showing a browser notification.");
    }
    checkAndUpdateSeq(message.seq);
    var elt = null;
    if (ta_id || is_owner) {
        elt = buildTAEntry(message.data);
    } else {
        elt = buildStudentEntry(message);
    }
    $("#queue").append(elt);
    positionOverlay();
    updateStatus();
});


socket.on("edit", function (message) {
    checkAndUpdateSeq(message.seq);
    if (ta_id == message.data.ta_id) {
        //you just cancelled helping someone, this changes everything so reload
        window.location.reload();
        return;
    }
    $("#queue li").each(function(index, item) {
        if ($(item).data("entryId") == message.id) {
            $(item).find(".entry-question").html(`[WHAT] OKAY`);
        }
    });
    positionOverlay();
    updateStatus();
});

socket.on("remove", function(message) {
    checkAndUpdateSeq(message.seq);
    $("#queue li").each(function(index, item) {
        if ($(item).data("entryId") == message.id) {
            if ($(item).hasClass("me")) {
                $("#add_form").show();
            }
            $(item).remove();
        }
    });
    positionOverlay();
    updateStatus();
});

socket.on("changeQuestion", function(message) {
    console.log("HERE2");
    checkAndUpdateSeq(message.seq);
    if (ta_id == message.data.ta_id) {
        //you just cancelled helping someone, this changes everything so reload
        window.location.reload();
        return;
    }

    $("#queue li").each(function(index, item) {
        if ($(item).data("entryId") == message.id) {
            if ($(item).hasClass("me")) {
                M.Modal.getInstance($("#change_question_modal")).open();
            }
        }
    });
    positionOverlay();
    updateStatus();
});

socket.on("help", function(message) {
    checkAndUpdateSeq(message.seq);
    if (ta_id == message.data.ta_id) {
        //you just started helping someone, this changes everything so reload
        window.location.reload();
        return;
    }
    $("#queue li").each(function(index, item) {
        if ($(item).data("entryId") == message.id) {
            $(item).find("button").addClass("hide");
            $(item).find(".helping-text").text(message.data.ta_full_name + " is helping");
            if (ta_id) {
                $(item).find(".helping-text").append(xHtml);
            }
            if ($(item).hasClass("me")) {
                try {
                    if (("Notification" in window) && (Notification.permission == "granted")) {
                        var notification = new Notification("It's your turn to get help!", {
                            "body": message.data.ta_full_name + " is ready to help you."
                        });
                    }
                } catch (error) {
                    console.log("There was an error showing a browser notification.");
                }
                $("#modal_ta_name").text(message.data.ta_full_name);
                if (message.data.ta_video_chat_url && message.data.ta_video_chat_url.length > 0) {
                    $("#modal_ta_video_chat_url").show();
                    $("#modal_ta_video_chat_url").attr("href", message.data.ta_video_chat_url);
                } else {
                    $("#modal_ta_video_chat_url").hide();
                }
                M.Modal.getInstance($("#help_modal")).open();
            }
        }
    });
});

socket.on("cancel", function(message) {
    checkAndUpdateSeq(message.seq);
    if (ta_id == message.data.ta_id) {
        //you just cancelled helping someone, this changes everything so reload
        window.location.reload();
        return;
    }
    $("#queue li").each(function(index, item) {
        if ($(item).data("entryId") == message.id) {
            $(item).find(".helping-text").text("");
            if ($(item).hasClass("me")) {
                $(item).find(".remove-button").removeClass("hide");
                M.Modal.getInstance($("#help_modal")).close();
            } else if (ta_id && !ta_helping_id) {
                $(item).find(".remove-button").removeClass("hide");
                $(item).find(".help-button").removeClass("hide");
            }
        }
    });
});

socket.on("done", function(message) {
    checkAndUpdateSeq(message.seq);
    if (ta_id == message.data.ta_id) {
        //you just finished helping someone, this changes everything so reload
        window.location.reload();
        return;
    }
    $("#queue li").each(function(index, item) {
        if ($(item).data("entryId") == message.id) {
            if ($(item).hasClass("me")) {
                $("#add_form").show();
            }
            $(item).remove();
        }
    });
    positionOverlay();
    updateStatus();
});

socket.on("option", function(message) {
    checkAndUpdateSeq(message.seq);
    if (message.key == "frozen") {
        if (message.value == "1") {
            $("#frozen_message").show();
            if (ta_id) {
                $(".freeze-input").val(0);
                $(".freeze-btn").text("Unfreeze");
            } else {
                $("#add_form").hide();
            }
        } else {
            $("#frozen_message").hide();
            if ($("#queue").find(".me").length == 0) {
                $("#add_form").show();
            }
            if (ta_id) {
                $(".freeze-input").val(1);
                $(".freeze-btn").text("Freeze");
            }
        }
    } else if (message.key == "message") {
        if (ta_id) {
            window.location.reload();
            return;
        }
        $("#message_content").html(message.value);
    }
});

socket.on("waittimes", function(message) {
    checkAndUpdateSeq(message.seq);
    console.log("Got wait times: " + message.times);
    waittimes = message.times;
    updateStatus();
});
