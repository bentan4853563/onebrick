const mongoose = require('mongoose');

const BrickSchema = new mongoose.Schema({
  brick_id: {
    type: String,
    required: true,
    unique: true
  },
  donor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'donor'
  },
  amount: {
    type: Number
  },
  location: String,
  dedication: {
    name: {
      type: String
    },
    relationship: {
      type: String
    },
    message: {
      type: String
    },
    image: {
      type: Buffer
    }
  },
  sold: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('bricks', BrickSchema);
