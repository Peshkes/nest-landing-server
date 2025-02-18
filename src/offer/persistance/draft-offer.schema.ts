// import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
// import { DraftOffer } from "../offer.types";
// import { OfferDocument } from "./offer.schema";
//
// @Schema({ timestamps: true })
// export class DraftOfferDocument extends OfferDocument implements DraftOffer {
//   // @Prop({ type: String, default: uuidv4 })
//   // _id: string;
//
//   @Prop({ required: true, type: String })
//   published_id: string;
//
//   // @Prop({ required: true, type: [Object] })
//   // body: Mixed[];
//
//   // @Prop({ required: true, type: String })
//   // status: OfferStatus;
//   //
//   // @Prop({ required: true })
//   // owner_type: OwnerType;
//   //
//   // @Prop({ required: true, type: Date })
//   // createdAt: Date;
//   //
//   // @Prop({ required: true, type: Date })
//   // updatedAt: Date;
// }
//
// export const DraftOfferSchema = SchemaFactory.createForClass(DraftOfferDocument);
// // export const DraftOfferSchema = new MongooseSchema<DraftOffer>({
// //   published_id: { type: String, required: false },
// // });
