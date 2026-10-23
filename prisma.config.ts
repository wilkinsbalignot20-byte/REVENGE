 import "dotenv/config";
import { definePrismaConfig } from "prisma/config";

export default definePrismaConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Binabasa nito ang DATABASE_URL mula sa iyong .env file
    url: process.env.DATABASE_URL!,
  },
});
