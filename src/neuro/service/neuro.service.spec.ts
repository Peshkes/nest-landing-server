import { Test, TestingModule } from "@nestjs/testing";
import { NeuroService } from "./neuro.service";

describe("NeuroService", () => {
  let service: NeuroService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NeuroService],
    }).compile();

    service = module.get<NeuroService>(NeuroService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
