import { Injectable, Logger } from '@nestjs/common';
import { SMTPServer, SMTPServerDataStream, SMTPServerSession } from 'smtp-server';
import { simpleParser } from 'mailparser';
import { Redis } from "ioredis"

@Injectable()
export class Smtp {
  private readonly logger = new Logger(Smtp.name);
  private server: SMTPServer;
  private redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      port: parseInt(process.env.REDIS_PORT || ""), 
      host: process.env.REDIS_HOST, 
      db: 0, 
    });

    this.server = new SMTPServer({
      onData: this.onNewEmail.bind(this),
      disabledCommands: ['AUTH']
    });
  }

  async start(port: number, ){
    this.logger.log(`🚀 Starting SMTP sever at port ${port}`);
    return this.server.listen(port, "0.0.0.0");
  }

  async onNewEmail(stream: SMTPServerDataStream, session: SMTPServerSession, callback) {
    try {
      const mail = await simpleParser(stream, {});

      const mail_address = mail?.to?.text;
      const emailKey = `email:${mail_address}`;
      if (await this.redisClient.exists(emailKey)){
        await this.redisClient.lpush(emailKey, JSON.stringify(mail));
        await this.redisClient.ltrim(emailKey, 0, 49);
        this.logger.debug(`Add new email for: ${emailKey}`);
      } else {
        this.logger.debug(`Skip email for non exists email: ${emailKey}`);
      }
      callback();
    } catch (error) {
      this.logger.error("Error when process new email:", error);
    }
  }
}
