import { Injectable } from "@nestjs/common";
import * as https from "node:https";
import { Readable } from "stream";

@Injectable()
export class NeuroService {
  async getSingleResponse(message: string): Promise<Readable> {
    return this.sendToOpenRouter([{ role: "user", content: message }]);
  }

  private sendToOpenRouter(messages: { role: string; content: string }[]): Promise<Readable> {
    return new Promise((resolve, reject) => {
      const apiKey = process.env.OPENROUTER_API_KEY;
      const options = {
        hostname: "openrouter.ai",
        path: "/api/v1/chat/completions",
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.SITE_URL,
          "X-Title": process.env.SITE_NAME,
        },
      };

      const req = https.request(options, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Request failed with status code ${res.statusCode}`));
        }
        resolve(res);
      });

      req.on("error", (err) => {
        reject(err);
      });

      req.write(
        JSON.stringify({
          model: "deepseek/deepseek-chat:free",
          messages,
          temperature: 0.95,
          stream: true,
        }),
      );

      req.end();
    });
  }
}
