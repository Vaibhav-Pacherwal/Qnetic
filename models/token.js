const mongoose = require("mongoose");
require("dotenv").config();

main()
.then(()=>{
    console.log("Connected to MongoDB✅")
}).catch((err)=>{
    console.log("failed to connect with mongodb");
});

async function main() {
    mongoose.connect(process.env.MONGODB);
}

const tokenSchema = new mongoose.Schema({
  outletName: String,
  tokenNumber: Number,
  date: String,
  customer: {
    name: String,
    phone: String,
    email: String
  },
  issuedAt: String
});

const Token = mongoose.model("Token", tokenSchema);
module.exports = Token;