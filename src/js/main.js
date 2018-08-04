var fs = require('fs');
var path = require('path');
var Client = require('ftp');
const StreamSpeed = require('streamspeed');
var c = new Client();
var fileDrag = false;
var isConnected = false;
const Store = require('electron-store');
const store = new Store();


var currentPath = "/"

var uploadQueue = []

var inputIP = document.getElementById("inputIP"),
    inputUsername = document.getElementById("inputUsername"),
    inputPassword = document.getElementById("inputPassword"),
    inputPort = document.getElementById("inputPort"),
    connectButton = document.getElementById("connectButton"),
    notificationDiv = $(".notification"),
    server = {
        'host': '',
        'port': '21',
        'user': '',
        'password': ''
    };

if (typeof store.get("info") != "undefined") {

    let storage = store.get("info")
    inputIP.value = storage.host
    inputUsername.value = storage.username;
    inputPassword.value = storage.password;
    inputPort.value = storage.port;
}


var notifyTimerID;


$(connectButton).click(function () {

    if ($(this).text() != "Connect") {
        return;
    }

    $(this).text("Connecting...")

    let ip = inputIP.value,
        username = inputUsername.value,
        password = inputPassword.value,
        port = inputPort.value;


    store.set("info", {
        host: ip,
        username: username,
        password: password,
        port: port
    })


    server.host = ip;
    server.port = port;
    server.user = username;
    server.password = password;



    c.connect(server)


    c.on("error", function (error) {
        console.log(error)
        if (error.message == "Login incorrect.") {
            Notification("Incorrect login details. Check and try again.", true)
        } else if (error.message.split(" ")[0] == "getaddrinfo" || error.message.split(" ")[0] == "connect") {
            Notification("IP Address incorrect. Try again.", true)
        } else if (error.message.split(" ")[0] == "Timeout") {
            Notification("Connection timed out! Try again.", true)
        }
        $(connectButton).text("Connect")
    })
    c.on("greeting", function (serverMessage) {
        consoleMessage("Server Message", serverMessage, false)
    })
    c.list(currentPath, function (err, list) {
        if (err) throw err;
        isConnected = true;
        Notification("Connected!", false)
        appendFiles(list)
    });

    //.then(function (serverMessage) {
    //    Notification("Connected!", false)
    ///  console.log('Server message: ' + serverMessage);
    //return ftp.list('/');
    //}).then(function (list) {
    //    console.log('Directory listing:');
    //   appendFiles(list)
    //}).catch(function (error) {

    // })
})

$('.tab').resizable({
    handles: "e",
    resize: function (e, ui) {

        $(".dir" + ui.element[0].className.split(" ")[1].substring(3)).css("width", ui.size.width)
    }
});

function Notification(message, isError) {
    consoleMessage("Client", message, isError)
    clearTimeout(notifyTimerID);
    notificationDiv.animate({
        marginBottom: -50
    }, 300, function () {
        notificationDiv.text(message)

        if (isError) {
            notificationDiv.css("background-color", "rgba(255, 91, 91, 0.897)")
        } else {
            notificationDiv.css("background-color", "rgba(65, 255, 40, 0.822)")
        }

        notificationDiv.animate({
            marginBottom: 0
        }, 300)
        notifyTimerID = setTimeout(() => {
            notificationDiv.animate({
                marginBottom: -50
            }, 300)
            if (message == "Connected!") {
                $(".connectionScreen").fadeOut();
                $(".loggedIn").fadeIn();
            }
        }, 2000);
    })
}


function appendFiles(list) {
    $(".BackButton").css("color", "white")
    var toAppend = ""
    list.forEach(element => {
        let extention = getExtension(element.name, element.type).toLowerCase()
        if (element.type == "d") {
            toAppend += '<div class="appendFile" id="folder-' + element.name + '"><div class="dir dirName"><div class="material-icons">folder</div><div style="display: inline-block;vertical-align: middle;">' + element.name + '</div></div><div class="dir dirType">' + getExtension(element.name, element.type) + '</div><div class="dir dirSize">' + bytesToSize(element.size, element.type) + '</div><div class="dir dirDate">' + element.date + '</div></div>'
        } else {
            if ( extention == "mp3"  || extention == "m4a" || extention == "flac" ){
                toAppend += '<div class="appendFile" id="file-' + element.name + '"><div class="dir dirName"><div class="material-icons">music_note</div><div style="display: inline-block;vertical-align: middle;">' + element.name + '</div></div><div class="dir dirType">' + getExtension(element.name, element.type) + '</div><div class="dir dirSize">' + bytesToSize(element.size, element.type) + '</div><div class="dir dirDate">' + element.date + '</div></div>'
            }else if(extention == "apk"){
                toAppend += '<div class="appendFile" id="file-' + element.name + '"><div class="dir dirName"><div class="material-icons">android</div><div style="display: inline-block;vertical-align: middle;">' + element.name + '</div></div><div class="dir dirType">' + getExtension(element.name, element.type) + '</div><div class="dir dirSize">' + bytesToSize(element.size, element.type) + '</div><div class="dir dirDate">' + element.date + '</div></div>'
            }else if ( extention == "png"  || extention == "jpg" || extention == "jpeg"|| extention == "gif") {
                toAppend += '<div class="appendFile" id="file-' + element.name + '"><div class="dir dirName"><div class="material-icons">photo</div><div style="display: inline-block;vertical-align: middle;">' + element.name + '</div></div><div class="dir dirType">' + getExtension(element.name, element.type) + '</div><div class="dir dirSize">' + bytesToSize(element.size, element.type) + '</div><div class="dir dirDate">' + element.date + '</div></div>'
            }else{
                toAppend += '<div class="appendFile" id="file-' + element.name + '"><div class="dir dirName"><div class="material-icons">insert_drive_file</div><div style="display: inline-block;vertical-align: middle;">' + element.name + '</div></div><div class="dir dirType">' + getExtension(element.name, element.type) + '</div><div class="dir dirSize">' + bytesToSize(element.size, element.type) + '</div><div class="dir dirDate">' + element.date + '</div></div>'
            }
            
        }
    });
    $(".directory").html(toAppend)
}

function bytesToSize(bytes, type) {
    if (type == "d") {
        return ''
    }
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

function getExtension(path, type) {

    if (type == "d") {
        return "File Folder"
    }

    var basename = path.split(/[\\/]/).pop(),
        pos = basename.lastIndexOf(".");

    if (basename === "" || pos < 1)
        return "File";

    return basename.slice(pos + 1);
}

var holder = document;
var currentlyDraggingElement

holder.ondragover = (ev) => {

    if (ev.srcElement.className != currentlyDraggingElement) {
        currentlyDraggingElement = ev.srcElement.className
        if (currentlyDraggingElement == "dragDropGuide") {
            $(".dragDropGuide").css("background-color", "rgba(115, 255, 87, 0.377)")
        } else {
            $(".dragDropGuide").css("background-color", "rgba(24, 24, 24, 0.774)")
        }

        ev.path.forEach(element => {
            if (element.className == "appendFile") {
                $(".appendFile").css("background-color", "transparent")
                $(element).css("background-color", "rgba(255, 255, 255, 0.219)")
            }
        });

    }



    if (fileDrag == false) {

        fileDrag = true;
        $(".dragDropGuide").show();

    }
    return false;
};

holder.ondragleave = () => {

    return false;
};

$('body').bind("dragleave", function (e) {
    $(".appendFile").css("background-color", "transparent")
    if (!e.originalEvent.clientX && !e.originalEvent.clientY) {
        if (fileDrag == true) {
            fileDrag = false;
            $(".dragDropGuide").hide();
        }
    }
});

holder.ondragend = () => {
    return false;
};

holder.ondrop = (e) => {
    $(".appendFile").css("background-color", "transparent")
    fileDrag = false;
    $(".dragDropGuide").hide();
    e.preventDefault();
    for (let f of e.dataTransfer.files) {
        console.log('File(s) you dragged here: ', f.path)

        e.path.forEach(element => {
            let isDirectory;
            if (fs.lstatSync(f.path).isDirectory()) {
                isDirectory = true
            } else {
                isDirectory = false;
            }

            if (element.className == "appendFile") {
                if (element.id.startsWith("file-")) {
                    consoleMessage("Duh", "That is not a folder.", true)
                    return;
                }
                //uploadFile(f.path, element.id.substring(7) + "/")
                let id = randomID();
                uploadQueue.push({
                    localPath: f.path,
                    serverPath: element.id.substring(7) + "/",
                    id: id,
                    isDirectory: isDirectory
                })
                $(".filesToUpload").append('<div class="fileToUpload" id="upload-' + id + '"><div class="progressBarUpload"></div><div class="innerUpload"><span>' + path.basename(f.path) + '</span><span class="uploadPercent">Pending</span></div></div>')
            } else if (element.className == "dragDropGuide") {
                let id = randomID();
                //uploadFile(f.path, "/")
                uploadQueue.push({
                    localPath: f.path,
                    serverPath: "/",
                    id: id,
                    isDirectory: isDirectory
                })
                $(".filesToUpload").append('<div class="fileToUpload" id="upload-' + id + '"><div class="progressBarUpload"></div><div class="innerUpload"><span>' + path.basename(f.path) + '</span><span class="uploadPercent">Pending</span></div></div>')
            }


        });
    }
    updateUploadList()
    return false;
};

function uploadFile(localLocation, serverLocation, id) {

    let uploadfile = fs.createReadStream(localLocation);
    var ss = new StreamSpeed();
    ss.add(uploadfile);

    let fileName = path.basename(localLocation)


    consoleMessage("Upload", "Uploading <b>" + fileName + "</b> to <b>" + serverLocation + "</b>", false)

    var uploadedSize = 0;

    fs.stat(localLocation, function (err, stats) {

        uploadfile.on('data', function (buffer) {

            var segmentLength = buffer.length;
            uploadedSize += segmentLength;
            percent = (uploadedSize / stats.size * 100).toFixed(2).toString().split(".")[0];
            $("#upload-" + id + " .uploadPercent").text("Progress: " + percent + "%");
            $($("#upload-" + id).children()[0]).css("width", percent + "%")

        });

        ss.on('speed', (speed, avgSpeed) => {
            console.log(StreamSpeed.toHuman(avgSpeed), 's');
        });

        c.put(uploadfile, currentPath + "/" + serverLocation + fileName, function (err) {
            if (err) throw err;
            consoleMessage("Upload", "Upload Complete!", false)
            uploadQueue.shift();
            updateUploadList();
        });
    });

}

function updateUploadList() {
    if (uploadQueue.length == 0) {
        $(".uploadCloseButton").fadeIn();
        c.list(currentPath, function (err, list) {
            if (err) throw err;
            appendFiles(list)
        });
        return;
    }



    if (uploadQueue.length >= 1) {
        if (uploadQueue[0].isDirectory) {
            let id = uploadQueue[0].id;
            let serverPath = uploadQueue[0].serverPath;
            let localPath = uploadQueue[0].localPath;
            uploadQueue.shift();
            makeDir(serverPath, path.basename(localPath), function (cb) {
                $($("#upload-" + id).children()[0]).css("width", "100%");
                $("#upload-" + id + " .uploadPercent").text("Created Folder");
                addFolderItemToList(localPath + "/", serverPath, function (cb) {
                    uploadFile(uploadQueue[0].localPath, uploadQueue[0].serverPath, uploadQueue[0].id)
                });
                return;

            })
        } else {
            uploadFile(uploadQueue[0].localPath, uploadQueue[0].serverPath, uploadQueue[0].id)
        }

    }
    $(".uploadingPopOut").fadeIn();
}

function randomID() {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
}

function consoleMessage(title, message, isError) {
    if (isError) {
        $(".console").prepend("<font color='red'><b>" + title + " > </b> " + message + "</b></font><br>")
    } else {
        $(".console").prepend("<font color='green'><b>" + title + " > </b> " + message + "</b></font><br>")
    }
}

function makeDir(path, name, cb) {
    consoleMessage("New Folder", "Creating a folder called <b>"+name+"</b> at <b>"+path+"</b>")
    if (path != "/") {
        path = "/" + path;
    }
    c.mkdir(path + name + "/", function (err) {
        consoleMessage("New Folder", "<b>"+name+"</b> created.")
        cb("done!");
    })
}

function addFolderItemToList(FolderPath, serverPath, cb) {
    let isDirectory;
    fs.readdir(FolderPath, (err, files) => {
        files.forEach(file => {
            let id = randomID();
            console.log(file)
            if (fs.lstatSync(FolderPath + file).isDirectory()) {
                isDirectory = true
            } else {
                isDirectory = false;
            }

            uploadQueue.push({
                localPath: FolderPath + file,
                serverPath: serverPath + "/" + path.basename(FolderPath) + "/",
                id: id,
                isDirectory: isDirectory
            })
            $(".filesToUpload").append('<div class="fileToUpload" id="upload-' + id + '"><div class="progressBarUpload"></div><div class="innerUpload"><span>' + file + '</span><span class="uploadPercent">Pending</span></div></div>')

        });
        cb("done")
    })
}
$(".directory").dblclick(function (e) {
    let clicked = ""
    if (e.target.parentElement.parentElement.id.startsWith("folder-")) {
        clicked = e.target.parentElement.parentElement.id
    } else if (e.target.id.startsWith("folder-")) {
        clicked = e.target.id
    } else if (e.target.parentElement.id.startsWith("folder-")) {
        clicked = e.target.parentElement.id
    }
    if (clicked != "") {
        currentPath += clicked.substring(7) + "/"
        consoleMessage("cd", "Opening <b>" + currentPath + "</b>", false)
        $(".BackButton").css("color", "gray")
        $(".directory").html("<center><font color='white'>Loading...</font></center>")
        c.list(currentPath, function (err, list) {
            if (err) throw err;
            consoleMessage("cd", "Opened.", false)
            appendFiles(list)
            $(".pathTextArea").html(currentPath)
        });
    }
})

function backButton() {
    if ($(".directory").text() == "Loading..."){
        consoleMessage("Wait", "Something is currently loading.", true)
        return;
    }

    let split = currentPath.split("/").filter(Boolean)
    split.pop();
    console.log(split)
    if (currentPath.split("/").length - 1 == 2) {
        currentPath = "/"

    } else if (split.length == 0) {
        consoleMessage("Void", "You cant go any more back.", true);
        return;
    } else {
        split = "/" + split.join("/") + "/"
        currentPath = split;
    }
    $(".BackButton").css("color", "gray")
    $(".directory").html("<center><font color='white'>Loading...</font></center>")
    consoleMessage("cd", "Going back to <b>" + currentPath + "</b>", false)
    c.list(currentPath, function (err, list) {
        if (err) throw err;
        consoleMessage("cd", "Loaded.", false)
        appendFiles(list)
        $(".pathTextArea").html(currentPath)
    });
}