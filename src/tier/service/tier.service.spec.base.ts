import { Test, TestingModule } from "@nestjs/testing";
import { TierServiceBase } from "./tier.service.base";

describe("TierService", () => {
  let service: TierServiceBase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TierServiceBase],
    }).compile();

    service = module.get<TierServiceBase>(TierServiceBase);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
