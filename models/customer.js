const mongoose = require("mongoose");
require("dotenv").config();

main()
.then(()=>{
    console.log("Connected to MongoDB✅");
}).catch((err)=>{
    console.log("Failed to Connect with MongoDB");
});

async function main() {
    await mongoose.connect(process.env.MONGODB);
}

const customerSchema = new mongoose.Schema({
    fname: {
        type: String,
        require: true
    },
    lname: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    }, 
    contact: {
        type: String,
        require: true
    },
    outlet: {
        type: String,
        require: true
    },
    date: {
        type: Date,
        default: Date.now 
    }
});

const Customer = new mongoose.model("Customer", customerSchema);
module.exports = Customer;