const mongoose = require("mongoose");
require("dotenv").config();

main()
.then(()=>{
    console.log("Connected to MongoDB✅");
}).catch((err)=>{
    console.log("Failed to Connect with MongoDB");
})

async function main() {
    await mongoose.connect(process.env.MONGODB);
}

const adminSchema = new mongoose.Schema({
    fname: {
        type: String,
        require: true
    },
    lname: {
        type: String,
        require: true
    },
    username: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    outlet: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    }
});

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;