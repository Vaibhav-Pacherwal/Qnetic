const mongoose = require("mongoose");
const initialData = require("./data.js");
const Admin = require("../models/Admin.js");
const initialData2 = require("./customerData.js");
const Customer = require("../models/customer.js");
const initialData3 = require("./tokenData.js")
const Token = require("../models/token.js");
require("dotenv").config();

async function main() {
    await mongoose.connect(process.env.MONGODB);
}

async function initData() {
    try {
        await Admin.deleteMany({});
        await Token.deleteMany({});
        await Admin.insertMany(initialData.data);
    } catch(err) {
        console.log("Can't Insert Data!");
    }
} 

async function initCustomerData() {
    try {
        await Customer.deleteMany({});
        await Customer.insertMany(initialData2.data);
    } catch(err) {
        console.log("Can't Insert Data!");
    }
}

async function initTokenDta() {
    try {
        await Token.deleteMany({});
        await Token.insertMany(initialData3.data);
    } catch(err) {
        console.log("Can't Insert Data!");
    }
}

main()
.then(()=>{
    console.log("Connected to MongoDB✅")
}).catch((err)=>{
    console.log("Failed to Connect with MongoDB");
});

initData()
.then(()=>{
    console.log("Data Inserted Successfully!")
}).catch((err)=>{
    console.log("Can't Insert Data!");
});

initCustomerData()
.then(()=>{
    console.log("Customer Data Inserted Successfully!")
}).catch((err)=>{
    console.log("Can't Insert Data!");
});

initTokenDta()
.then(()=>{
    console.log("Customer Data Inserted Successfully!")
}).catch((err)=>{
    console.log("Can't Insert Data!");
});
