import mongoose from "mongoose";

const draftOffer = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  body: {
    type: [mongoose.Schema.Types.Mixed],
    required: true,
  },
});

const DraftOfferModel = mongoose.model("DraftOffer", draftOffer);

export default DraftOfferModel;
