fs = require(['fs']);
http = require(['http']);
url = require(['url']);
console.log("thisisme");

http.Server(function (req, res) {
    var request = url.parse(req.url, true);
    var action = request.pathname;
    var thumbnails = getElementsByClassName("thumbnails");
    for (var i = 0; i < thumbnails.length; i++) {
        if (action == "click") {
            var image = thumbnails.nextChild;
            var img = fs.readFileSync(image);
            res.writeHead(200, { 'Content-Type': 'image/png' });
            res.end(img, 'binary');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('not image');
        }
    }
}).listen(62519, '127.0.0.1');

//this didnt work and apparently npm install does not work well with windows... 