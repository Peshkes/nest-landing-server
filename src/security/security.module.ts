import { MongooseModule } from "@nestjs/mongoose";
import { UserDocument, UserSchema } from "../authentication/persistence/user.schema";
import { SuperUserDocument, SuperUserSchema } from "../authentication/persistence/super-user.schema";
import { GroupAccessDocument, GroupAccessSchema } from "../group/persistanse/group-access.schema";
import { Module } from "@nestjs/common";
import { AdminAccessGuard, ModeratorAccessGuard, UserAccessGuard } from "./guards/group-access.guard";
import { SuperUserAccessGuard } from "./guards/super-user-access.guard";
import { RedisModule } from "../redis/redis.module";
import { OwnerOfferAccessGuard } from "./guards/owner-offer-access.guard";
import { DraftOfferSchema, OfferDocument, OfferSchema, PublicOfferSchema } from "../offer/persistance/offer.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
      { name: SuperUserDocument.name, schema: SuperUserSchema },
      { name: GroupAccessDocument.name, schema: GroupAccessSchema },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: OfferDocument.name,
        useFactory: () => {
          const schema = OfferSchema;
          schema.discriminator("huy", DraftOfferSchema);
          schema.discriminator("bighuy", PublicOfferSchema);
          return schema;
        },
      },
    ]),
    RedisModule,
  ],
  providers: [UserAccessGuard, ModeratorAccessGuard, AdminAccessGuard, SuperUserAccessGuard, OwnerOfferAccessGuard],
  exports: [UserAccessGuard, ModeratorAccessGuard, AdminAccessGuard, SuperUserAccessGuard, OwnerOfferAccessGuard, MongooseModule],
})
export class SecurityModule {}
