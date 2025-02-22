import { Test, TestingModule } from "@nestjs/testing";
import { GroupService } from "./group.service";

describe("SubscriptionService", () => {
  let service: GroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupService],
    }).compile();

    service = module.get<GroupService>(GroupService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
