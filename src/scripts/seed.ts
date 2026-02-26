import { NestFactory } from "@nestjs/core";
import { SeedBootstrapModule } from "../database/seed-bootstrap.module";
import { DatabaseSeedService } from "../database/database-seed.service";

async function runSeed() {
  const app = await NestFactory.createApplicationContext(SeedBootstrapModule);
  const seedService = app.get(DatabaseSeedService);
  await seedService.run();
  await app.close();
  process.exit(0);
}

runSeed().catch(err => {
  console.error("Error ejecutando seed:", err);
  process.exit(1);
});
