import { Module } from '@nestjs/common';
import { Smtp } from './smtp';

@Module({
  imports:[],
  providers: [Smtp]
})
export class SmtpModule {}
