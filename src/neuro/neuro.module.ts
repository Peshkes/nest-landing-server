import { Module } from "@nestjs/common";
import { NeuroService } from "./service/neuro.service";
import { NeuroController } from "./controller/neuro.controller";

@Module({
  providers: [NeuroService],
  controllers: [NeuroController],
})
export class NeuroModule {}
