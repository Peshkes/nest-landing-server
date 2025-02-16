import { Body, Controller, Post, Res } from "@nestjs/common";
import { Response } from "express";
import { NeuroService } from "../service/neuro.service";
import { SingleMessageRequest } from "../neuro.types";

@Controller("neuro")
export class NeuroController {
  constructor(private readonly neuroService: NeuroService) {}

  @Post("single-message")
  async handleSingleChat(@Body() body: SingleMessageRequest, @Res() res: Response) {
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    const stream = await this.neuroService.getSingleResponse(body.message);

    stream.on("data", (chunk) => {
      res.write(chunk);
    });

    stream.on("end", () => {
      res.end();
    });

    stream.on("error", (err) => {
      console.error("Stream error:", err);
      res.status(500).end("Internal Server Error");
    });
  }
}
