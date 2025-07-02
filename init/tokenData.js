const { ObjectId } = require('mongodb');

const sampleTokenData = [
  {
    customer: {
      name: 'Riya Sharma',
      phone: '9876543210',
      email: 'riya.sharma@example.com'
    },
    _id: new ObjectId('686305f8618f0bebc2833f01'),
    outletName: 'Trendy Hub',
    tokenNumber: 1,
    date: '2025-06-29',
    issuedAt: '11:42 AM',
    __v: 0
  },
  {
    customer: {
      name: 'Aditya Mehta',
      phone: '9123456789',
      email: 'aditya.m@gmail.com'
    },
    _id: new ObjectId('68630623618f0bebc2833f02'),
    outletName: 'Style Street',
    tokenNumber: 3,
    date: '2025-06-27',
    issuedAt: '04:18 PM',
    __v: 0
  },
  {
    customer: {
      name: 'Neha Verma',
      phone: '9988776655',
      email: 'neha.verma@hotmail.com'
    },
    _id: new ObjectId('6863065a618f0bebc2833f03'),
    outletName: 'Kabir Clothing',
    tokenNumber: 4,
    date: '2025-06-30',
    issuedAt: '09:00 AM',
    __v: 0
  },
  {
    customer: {
      name: 'Karan Kapoor',
      phone: '9001122334',
      email: 'karankapoor@outlook.com'
    },
    _id: new ObjectId('68630692618f0bebc2833f04'),
    outletName: 'Urban Threads',
    tokenNumber: 5,
    date: '2025-06-28',
    issuedAt: '07:35 PM',
    __v: 0
  },
  {
    customer: {
      name: 'Sneha Singh',
      phone: '9898989898',
      email: 'sneha.singh@gmail.com'
    },
    _id: new ObjectId('686306c9618f0bebc2833f05'),
    outletName: 'The Wardrobe Co.',
    tokenNumber: 6,
    date: '2025-07-01',
    issuedAt: '10:10 AM',
    __v: 0
  }
]

module.exports = {data: sampleTokenData}