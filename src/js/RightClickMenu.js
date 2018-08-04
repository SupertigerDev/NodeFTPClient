$(document).bind("contextmenu", function (e) {
    e.preventDefault();
    if (!isConnected){
        return;
    }
    $("#cntnr").css("left", e.pageX);
    $("#cntnr").css("top", e.pageY);
    $("#cntnr").fadeIn(200, startFocusOut());
    $("#cntnr").html("<ul id='items'><li>Download</li></ul><hr /><ul id='items'><li>Delete</li><li>Rename</li></ul>")

    let clicked = ""
    if (e.target.parentElement.parentElement.id.startsWith("folder-") || e.target.parentElement.parentElement.id.startsWith("file-")) {
        clicked = e.target.parentElement.parentElement.id
    } else if (e.target.id.startsWith("folder-") || e.target.id.startsWith("file-")) {
        clicked = e.target.id
    } else if (e.target.parentElement.id.startsWith("folder-") || e.target.parentElement.id.startsWith("file-")) {
        clicked = e.target.parentElement.id
    } else {
        $("#cntnr").html("<ul id='items'><li>New Folder</li></ul>")
    }
    console.log(clicked)




});

function startFocusOut() {
    $(document).on("click", function () {
        $("#cntnr").hide();
        $(document).off("click");

    });
}

$("#cntnr").click(function (e) {
    let optionClicked = $(e.target).text()
    if (optionClicked == "New Folder"){
        
    }
});