import { NestFactory } from "@nestjs/core";
import { SeedBootstrapModule } from "../database/seed-bootstrap.module";
import { DatabaseSeedService } from "../database/database-seed.service";

/** Ejecuta solo la actualización de imageUrl en bebidas existentes. Uso: npm run seed:images */
async function runSeedImages() {
  const app = await NestFactory.createApplicationContext(SeedBootstrapModule);
  const seedService = app.get(DatabaseSeedService);
  await seedService.seedBeverageImages();
  await app.close();
  process.exit(0);
}

runSeedImages().catch(err => {
  console.error("Error en seed de imágenes:", err);
  process.exit(1);
});
