import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "./db.js";

async function upsertUser({ email, password, name, role }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  const passwordHash = await bcrypt.hash(password, 10);
  if (existing) {
    return prisma.user.update({
      where: { email },
      data: { password: passwordHash, name, role }
    });
  }
  return prisma.user.create({
    data: { email, password: passwordHash, name, role }
  });
}

async function main() {
  const admin = await upsertUser({
    email: "admin@logi.local",
    password: "Admin123!",
    name: "Operations Admin",
    role: "ADMIN"
  });

  const client = await upsertUser({
    email: "client@logi.local",
    password: "Client123!",
    name: "Demo Client",
    role: "CLIENT"
  });

  const existingDemo = await prisma.shipment.findFirst({
    where: { trackingNumber: "DEMO-TRACK-001" }
  });

  if (!existingDemo) {
    await prisma.shipment.create({
      data: {
        trackingNumber: "DEMO-TRACK-001",
        title: "Electronics pallet",
        fromCity: "Houston, TX",
        toCity: "Atlanta, GA",
        status: "IN_TRANSIT",
        userId: client.id,
        events: {
          create: [
            {
              status: "CREATED",
              message: "Shipment created",
              location: "Houston, TX"
            },
            {
              status: "PICKED_UP",
              message: "Picked up from shipper",
              location: "Houston, TX"
            },
            {
              status: "IN_TRANSIT",
              message: "In transit to destination hub",
              location: "En route"
            }
          ]
        }
      }
    });
  }

  console.log("Seed complete:", { admin: admin.email, client: client.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
