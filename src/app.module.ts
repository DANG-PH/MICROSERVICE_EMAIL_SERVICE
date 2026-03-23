import { Module } from '@nestjs/common';
import { EmailModule } from './email/email.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ItemModule } from './item/item.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,           
      envFilePath: '.env',     
    }),
    EmailModule,
    ItemModule
  ],
})
export class AppModule {}