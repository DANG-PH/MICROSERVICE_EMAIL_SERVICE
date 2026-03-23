import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ITEM_PACKAGE_NAME } from 'proto/item.pb';
import { ItemService } from './item.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: ITEM_PACKAGE_NAME,
        transport: Transport.GRPC,
        options: {
          package: ITEM_PACKAGE_NAME,
          protoPath: join(process.cwd(), 'proto/item.proto'),
          url: process.env.ITEM_URL,
          loader: {
                keepCase: true,
                objects: true,
                arrays: true,
          },
        },
      },
    ]),
  ],
  controllers: [],
  providers: [ItemService],
  exports: [ItemService]
})
export class ItemModule {}
