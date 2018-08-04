var elerem = require('electron').remote;
var dialog = elerem.dialog;
var app = elerem.app;

function saveAs(fileName) {


    var toLocalPath = path.resolve(app.getPath("desktop"), path.basename(fileName));

    var userChosenPath = dialog.showSaveDialog({
        defaultPath: toLocalPath
    });

    if (userChosenPath) {
        download(fileName, userChosenPath, myUrlSaveAsComplete)
    }
}


function myUrlSaveAsComplete(err) {
    alert("done");
}


function download(fileName, dest, cb) {
    var file = fs.createWriteStream(dest);


    c.get(fileName, function (err, stream) {
        if (err) throw err;
        stream.pipe(file);

            file.on('finish', function() {
                file.close(cb); // close() is async, call cb after close completes.
            });

    });
};