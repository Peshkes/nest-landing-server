import mongoose from "mongoose";

const baseTierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  settings: {
    type: JSON,
    required: true,
  },
});

export default baseTierSchema;
