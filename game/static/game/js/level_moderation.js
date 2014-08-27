var levelID;

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

var CONFIRMATION_DATA = {
    'deleteLevel': {
        options: {
            title: 'Delete level',
        },
        html: "<p>This student's level will be permanently deleted. Are you sure?</p>",
        confirm: function() {
            var csrftoken = $.cookie('csrftoken');
            $.ajax({
                url : '/game/level_moderation/delete/' + levelID,
                type : 'POST',
                dataType: 'json',
                beforeSend: function(xhr, settings) {
                    if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                        xhr.setRequestHeader("X-CSRFToken", csrftoken);
                    }
                },
                success: function(json) {
                    if(json.success) {
                        document.forms["levelModerationForm"].submit();
                    }
                    else {
                        console.debug("failure");
                    }
                },
                error : function(xhr,errmsg,err) {
                    console.debug(xhr.status + ": " + errmsg + " " + err + " " + xhr.responseText);
                }
            });
        },
    }
};

$(document).ready(function() {
	$(".delete").click(function() {
        
	  	levelID = this.getAttribute('value');
	  	openConfirmationBox('deleteLevel');
	});

	$('.play').click(function() {
		window.location.href = '/game/' + this.getAttribute('value');
	});
});