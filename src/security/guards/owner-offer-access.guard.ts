import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { RequestWithUser } from "../../share/interfaces/request-with-user.interface";
import { InjectModel } from "@nestjs/mongoose";
import { OfferDocument } from "../../offer/persistance/offer.schema";
import { Model } from "mongoose";
import { RedisService } from "../../redis/service/redis.service";

@Injectable()
export class OwnerOfferAccessGuard implements CanActivate {
  constructor(
    @InjectModel(OfferDocument.name) private readonly offerModel: Model<OfferDocument>,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (request.superAccess) return true;
    const offer_id = request.params.offer_id;
    if (!offer_id || !request.user_id) return false;
    let existingOffer: OfferDocument;
    const existingOfferString = await this.redisService.getValue("offer:" + offer_id);
    if (existingOfferString) existingOffer = JSON.parse(existingOfferString);
    if (!existingOffer) existingOffer = await this.offerModel.findById(request.params.offer_id);
    if (!existingOffer) return false;
    await this.redisService.setValue("offer:" + existingOffer._id, existingOfferString, 60);
    return existingOffer.owner_id === request.user_id;
  }
}
