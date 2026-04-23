import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // ★ セキュリティの壁（CORS）を開放し、フロントエンドからの注文を許可する！
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
