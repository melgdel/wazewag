'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;

const contractSchema = new Schema({
  parent: {
    type: ObjectId,
    ref: 'User'
  },
  dogwalker: {
    type: ObjectId,
    ref: 'User'
  },
  state: {
    type: String ,
    enum: ['Accepted', 'Regectted', 'Pending', 'Feedback'],
    default: 'Pending'
  }
});

const Contract = mongoose.model('Contract', contractSchema);

module.exports = Contract;