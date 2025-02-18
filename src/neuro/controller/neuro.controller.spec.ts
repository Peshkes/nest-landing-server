import { Test, TestingModule } from "@nestjs/testing";
import { NeuroController } from "./neuro.controller";

describe("NeuroController", () => {
  let controller: NeuroController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NeuroController],
    }).compile();

    controller = module.get<NeuroController>(NeuroController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
