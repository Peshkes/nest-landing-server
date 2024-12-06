import mongoose from "mongoose";

const publicOffer = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  body: {
    type: [mongoose.Schema.Types.Mixed],
    required: true,
  },
  publication_date: {
    type: Date,
    required: true,
  },
  update_date: {
    type: Date,
    required: false,
  },
  expiration_date: {
    type: Date,
    required: true,
  },
});

const PublicOfferModel = mongoose.model("PublicOffer", publicOffer);

export default PublicOfferModel;
