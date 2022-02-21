import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "./pipes/validation.pipe";
import * as cookieParser from "cookie-parser";
import { AppClusterService } from "./app-cluster.service";
import { RedisIoAdapter } from "./RedisIoAdapter";

async function bootstrap() {
  const PORT = process.env.PORT || 5000;
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const config = new DocumentBuilder()
    .setTitle("BITCRUSH")
    .setDescription("Documentation Bitcrush REST API")
    .setVersion("1.0.0")
    .addTag("Azon5")
    .addBearerAuth(
      { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      "JWT"
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/api/docs", app, document);

  app.useGlobalPipes(new ValidationPipe());
  const whitelist = [
    "http://localhost:3000",
    "http://104.219.251.99:3000",
    "http://104.219.251.99:3005",
    "https://diceinvaders.bitcrush.com",
  ];
  app.enableCors({
    origin: function (origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS Origin: ${origin}`));
      }
    },
    allowedHeaders:
      "X-Requested-With, X-HTTP-Method-Override, Content-Type, Origin, Accept, Observe, Authorization",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });
  app.useWebSocketAdapter(new RedisIoAdapter(app));
  await app.listen(PORT, () => console.log(`Server started on port = ${PORT}`));
}

AppClusterService.clusterize(bootstrap);
