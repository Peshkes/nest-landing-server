import { Module } from "@nestjs/common";
import { CsrfService } from "./services/csrf.service";
import { MailService } from "./services/mailing.service";
import { JwtService } from "./services/jwt.service";

@Module({
  providers: [JwtService, MailService, CsrfService],
  exports: [JwtService, MailService, CsrfService],
})
export class ShareModule {}
