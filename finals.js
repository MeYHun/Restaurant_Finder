/* Important */
process.stdin.setEncoding("utf8");

let http = require("http");
let path = require("path");
let express = require("express"); /* Accessing express module */
let app = express(); /* app is a request handler function */
let fs = require("fs");
let bodyParser = require("body-parser");

let superModule = require("./superModule");
let user = new superModule.superModule();

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

app.use(express.static(__dirname + '/templates'));

app.use(bodyParser.urlencoded({
    extended: false
}));



app.get("/", function (request, response) {
    response.render("index");
});

app.get("/record", function (request, response) {
    response.render("record");
});

app.get("/review", function (request, response) {
    response.render("review");
});

app.get("/hours", function (request, response) {
    response.render("hours");
});
app.get("/remove", function (request, response) {
    response.render("delete");
});


app.post("/locationConfirmation", (request, response) => {
    /* Notice how we are extracting the values from request.query */
    let {
        building,
        time,
        latitude,
        longitude
    } = request.body;

    let loc = {
        Building: building,
        Time: time,
        Latitude: latitude,
        Longitude: longitude
    };

    user.insertLocation(loc);

    let statusCode = 200;

    response.render("locationConfirmation", loc);
});

app.post("/reviewConfirmation", (request, response) => {
    /* Notice how we are extracting the values from request.query */
    let {
        building
    } = request.body;

    let answer;
    let statusCode = 200;
    let val = user.lookupOne(building).then((val) => {
        if (val !== "USER NEVER STAYED THIS LONG IN ANY BUILDINGS") {
            answer = {
                Building: val.Building,
                Time: val.Time,
                Latitude: val.Latitude,
                Longitude: val.Longitude
            };
        } else {
            answer = {
                Building: "Invalid Building",
                Time: "No hours",
                Latitude: "Nonexistent",
                Longitude: "Nonexistent"
            };
        }
        return answer
    }).then((answer) => response.render("locationConfirmation", answer));

});

app.post("/reviewHours", (request, response) => {
    /* Notice how we are extracting the values from request.query */
    let {
        hours
    } = request.body;

    let answer;
    let statusCode = 200;
    let val = user.lookupMany(hours).then((val) => {
        let tb = `<table border='2'><tr><th>Restaurants</th><th>Stars</th>
                  <th>Latitude</th><th>Longitude</th></tr>`;
        console.log(val);
        val.forEach((elem) => tb = tb + `<tr><td>${elem.Building}</td><td>${elem.Time}</td>
                                         <td>${elem.Latitude}</td><td>${elem.Longitude}</td></tr>`);
        tb = tb + `</table>`;
        let answer = {
            table: tb
        };

        response.render("reviewHours", answer);
        //        return tb;
    });

});

app.post("/reviewDelete", (request, response) => {
    /* Notice how we are extracting the values from request.query */
    let answer;
    let statusCode = 200;
    let hi = user.deleteAll().then((val) => {
        let answer = {
            removal: val
        };

        response.render("reviewDelete", answer);
    });

});


http.createServer(app).listen(3000);

prompt = `Stop to shutdown the server: `
process.stdout.write(prompt);
process.stdin.on("readable", function () {
    let command = process.stdin.read();
    command = command.trim();

    if (command == "stop") {
        process.stdout.write("Shutting down the server\n");
        process.exit(0);
    } else {
        process.stdout.write("Invalid command: " + command + "\n");
        process.stdout.write(prompt);
        process.stdin.resume();
    }

});
