require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const ejsMate = require("ejs-mate");
const moment = require("moment");
const nodemailer = require("nodemailer");
const {Server} = require('socket.io');
const methodOverride = require("method-override");
const path = require("path");
const app = express();
const server = require("http").createServer(app);
const Admin = require("./models/Admin.js");
const QRCode = require("qrcode");
const Customer = require("./models/customer.js")
const Token = require("./models/token.js");
const session = require("express-session");

const port = process.env.PORT || 8080;
server.listen(port, ()=>{
    console.log(`server is running on http://localhost:${port}`);
});

main()
.then(()=>{
    console.log("Connected to MongoDB✅")
}).catch((err)=>{
    console.log("Failed to Connect with MongoDB", err);
})

async function main() {
    await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
    })
}

const io = new Server(server, {
  cors: {
    origin: `http://localhost:${port}`,
    methods: ["GET", "POST"]
  }
});

app.engine("ejs", ejsMate);
app.set('io', io);
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended:true}));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("join-room", (roomName) => {
        socket.join(roomName);
        console.log(`Joined room: ${roomName}`);
    });

    socket.on("disconnect", (reason) => {
    console.log("Disconnected:", reason);
    });
});

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.BREVO_MAIL,
        pass: process.env.BREVO_PASS,
    },
    logger: true,
    debug: true
});

function generateOTP() {
    let otp = "";
    for(let i = 1; i < 6; i++) {
        otp += Math.floor(Math.random()*10)+1;
    }
    return otp;
}

const sentOtp = async (to, otp) => {
    try {
        const info = await transporter.sendMail({
        from: "Qnetic Auth <vaibhavpacherwal57@gmail.com>",
        to,
        subject: "Your OTP Code",
        text:  `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    console.log("OTP sent:", info.messageId);
    } catch(err) {
        console.log("failed to generate OTP!", err.messageId);
    }
}

app.get("/", (req, res)=>{
    res.render("routes/index");
});

app.get("/new-user", (req, res)=>{
    res.render("routes/signup");
});

app.post("/qnetic/adduser", async (req, res)=>{
    let {fname, lname, username, email, outlet, password, cpassword} = req.body;
    if(password != cpassword) {
        res.status(404).send("password do not match, check again!");
    }
    try {
        await Admin.insertOne({
            fname: fname,
            lname: lname,
            username: username,
            email: email,
            outlet: outlet,
            password: password
        });
        res.redirect("/");
    } catch(err) {
        console.log("Fail to insert data!");
    }
});

app.get("/login", (req, res)=>{
    res.render("routes/login");
});

app.post("/qnetic/login", async (req, res)=>{
    let {username, password} = req.body;
    try{
        let details = await Admin.findOne({username: username});
        if(details.password === password) {
            res.redirect(`/qnetic/${username}`);
        } else {
            res.send("invalid password, try again!");
        }
    } catch(err) {
        console.log("user not found!");
    }
});

app.get("/qnetic/:user", async (req, res)=>{
    let {user} = req.params;
    try {
        const today = moment().format("YYYY-MM-DD");
        let details = await Admin.findOne({username: user});
        let outletName = details.outlet;
        let tokenDetails = await Token.find({$and: [{outletName: outletName}, {date: today}]});

        res.render("routes/profile", {details, tokenDetails});
    } catch(err) {
        console.log("failed to fetch details!");
    }
});

const otpBackUp = new Map();

app.post("/qnetic/sent-otp", async (req, res)=>{
    let {email} = req.body;
    try {
        let details = await Admin.findOne({email: email});
        if (!details) {
            return res.send("User does not exist!");
        }
        let otp = generateOTP();
        otpBackUp.set(email, otp);
        otpBackUp.set("user", details.username);
        await sentOtp(email, otp);
        res.render("routes/sentotp");
    } catch(err) {
        console.error("Error sending OTP:", err.message);
        res.status(500).send("An error occurred while sending OTP.");
    }
});

app.post("/qnetic/verify-otp", async (req, res)=>{
    let {otp} = req.body;
    let user = otpBackUp.get("user");
    try {
        let details = await Admin.findOne({username: user});
        let email = details.email;
        let storedOTP = otpBackUp.get(email);
        console.log(storedOTP);
        if(otp === storedOTP) {
            console.log(details);
            if(!details) {
                return res.send("User does not exist!");
            }
            res.redirect(`/qnetic/${details.username}`);
        }
    } catch(err) {
        res.send("Invalid OTP!");
    }
});

app.get("/verify-email", (req, res)=>{
    res.render("routes/verifyEmail");
});

app.get("/generate-QR/:id", async (req, res)=>{
    let {id} = req.params;
    try {
        let details = await Admin.findOne({_id: id});
        if(!details) {
            return res.send("can't get QR Code right now!");
        }
        let outletName = details.outlet;
        const safeOutletName = `${outletName}`.replace(/[^a-zA-Z0-9_-]/g, '_');
        let url = `http://localhost:8080/qnetic/${outletName}/customer-details`;
        QRCode.toBuffer(url, { type: 'png' }, (err, buffer) => {
            if (err) return res.send("QR failed");

            res.setHeader(
                'Content-Disposition',
                `attachment; filename="${safeOutletName}_qr.png"`
            );
            res.setHeader('Content-Type', 'image/png');
            res.send(buffer);
        });
    } catch(err) {
        console.log("QR Generation Failed!");
    }
});

app.get("/qnetic/:outlet/customer-details", async (req, res)=>{
    let {outlet} = req.params;
    try {
        let details = await Admin.findOne({outlet: outlet});
        res.render("routes/customerdetails", {details});
    } catch(err) {
        console.log(err);
    }
});

app.post("/qnetic/queue-token", async (req, res)=>{
    let {fname, lname, email, contact, outlet} = req.body;
    try {
        let details = await Customer.insertOne({
            fname: fname,
            lname: lname,
            email: email,
            contact: contact,
            outlet: outlet
        });
        console.log("Customer data successfully inserted into database✅");
        res.redirect(`/qnetic/queue-token/${details._id}`);
    } catch(err) {
        console.log("can't insert your data into customer collection❌");
    }
});

app.get("/qnetic/queue-token/:id", async (req, res)=>{
    let {id} = req.params;
    const io = req.app.get("io");
    const today = moment().format("YYYY-MM-DD");
    let customerDetails = await Customer.findOne({_id: id});
    if(!customerDetails) {
        return res.send("can't fetch customer details right now!");
    }

    let outletName = customerDetails.outlet;
    const latest = await Token.find({outletName, date: today})
        .sort({tokenNumber: -1})
        .limit(1);

    let nextToken = 1;
    if(latest.length > 0) {
        nextToken = latest[0].tokenNumber + 1;
    }

    const newToken = new Token({
        outletName,
        tokenNumber: nextToken,
        date: today,
        customer: {
            name:customerDetails.fname,
            phone: customerDetails.contact,
            email: customerDetails.email
        },
        issuedAt: moment().format("hh:mm A")
    });
    await newToken.save();
    io.to(outletName).emit("new-token", newToken);

    res.render("routes/token", {
        outletName,
        tokenNumber: nextToken,
        issuedAt: newToken.issuedAt,
        issueDate: moment().format("DD MMMM YYYY"),
        customerDetails
    });
});



