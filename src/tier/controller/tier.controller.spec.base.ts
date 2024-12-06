import { Test, TestingModule } from "@nestjs/testing";
import { TierControllerBase } from "./tier.controller.base";
import { TierServiceBase } from "../service/tier.service.base";

describe("TierController", () => {
  let controller: TierControllerBase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TierControllerBase],
      providers: [TierServiceBase],
    }).compile();

    controller = module.get<TierControllerBase>(TierControllerBase);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
