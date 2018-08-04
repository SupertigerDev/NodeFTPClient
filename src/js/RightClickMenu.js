var clickedFile = "";
$(document).bind("contextmenu", function (e) {
    e.preventDefault();
    if (!isConnected) {
        return;
    }
    if (e.target.parentElement.parentElement.id == "cntnr") {
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
    clickedFile = clicked;




});

function startFocusOut() {
    $(document).on("click", function () {
        $("#cntnr").hide();
        $(document).off("click");

    });
}

$("#cntnr").click(function (e) {
    let optionClicked = $(e.target).text()
    if (optionClicked == "New Folder") {

        $(".newFolderPopOut").fadeIn();

    } else if (optionClicked == "Delete") {

        let location = currentPath;
        if (clickedFile.startsWith("file-")) {
            location = location + clickedFile.substring(5)
            deleteFile(location)
            consoleMessage("Delete", "Deleting <b>"+clickedFile.substring(5)+"</b>", false)

        } else if (clickedFile.startsWith("folder-")) {

            location = location + clickedFile.substring(7)
            deleteDir(location)
            consoleMessage("Delete", "Deleting <b>"+clickedFile.substring(7)+"</b>", false)
        }

        $("[id='"+clickedFile+"'] .dir").css("color", "red")

    }else if (optionClicked == "Download"){

        if (clickedFile.startsWith("file-")) {

            saveAs(clickedFile.substring(5))
            
        }
    }
});

function createFolder() {
    makeDir(currentPath, $(".folderName").val(), function () {
        c.list(currentPath, function (err, list) {
            if (err) throw err;
            appendFiles(list)
        });
        $(".newFolderPopOut").fadeOut();
        $(".folderName").val("Cool Folder");
    });
}

function deleteFile(fileLocation) {
    c.delete(fileLocation, function (err) {
        if (err) throw err;
        consoleMessage("Delete", "Deleted!", false)
        c.list(currentPath, function (err, list) {
            if (err) throw err;
            appendFiles(list)
        });
    })
}
function deleteDir(dirLocation) {
    c.rmdir(dirLocation,true ,function (err) {
        if (err) throw err;
        consoleMessage("Delete", "Deleted!", false)
        c.list(currentPath, function (err, list) {
            if (err) throw err;
            appendFiles(list)
        });
    })
}