import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/ip-sakti";

async function seed() {
  console.log("Connecting to MongoDB at:", uri);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("ip-sakti");
    const usersCol = db.collection("users");
    const tokenLogsCol = db.collection("token_logs");

    // Seed Danush Master Admin User
    const adminEmail = "danush@ipsakti.gov.in";
    const existingAdmin = await usersCol.findOne({
      email: { $in: ["danush@ipsakti.gov.in", "danush"] },
    });
    const adminPasswordHash = await bcrypt.hash("danush123", 10);

    if (!existingAdmin) {
      await usersCol.insertOne({
        name: "Danush (Administrator)",
        email: adminEmail,
        password: adminPasswordHash,
        role: "admin",
        createdAt: new Date(),
      });
      console.log("✓ Created Master Admin user:", adminEmail, "/ danush123");
    } else {
      await usersCol.updateOne(
        { _id: existingAdmin._id },
        { $set: { role: "admin", password: adminPasswordHash, email: adminEmail } }
      );
      console.log("✓ Updated Master Admin user permissions:", adminEmail);
    }

    // Seed Regular User
    const userEmail = "user@ipsakti.gov.in";
    const existingUser = await usersCol.findOne({ email: userEmail });
    const userPasswordHash = await bcrypt.hash("user123", 10);

    if (!existingUser) {
      await usersCol.insertOne({
        name: "IP Researcher",
        email: userEmail,
        password: userPasswordHash,
        role: "user",
        createdAt: new Date(),
      });
      console.log("✓ Created Demo User:", userEmail, "/ user123");
    }

    // Seed Sample Token Logs if empty
    const logCount = await tokenLogsCol.countDocuments();
    if (logCount === 0) {
      console.log("Seeding sample token usage logs...");
      const sampleLogs = [
        {
          userId: "user-1",
          userEmail: "user@ipsakti.gov.in",
          role: "user",
          question: "Can an Ayurvedic herbal formulation be patented under Section 3(p)?",
          language: "English",
          questionType: "rag",
          promptTokens: 420,
          completionTokens: 280,
          totalTokens: 700,
          latencyMs: 1450,
          sourcesCount: 3,
          timestamp: new Date(Date.now() - 3600000 * 24 * 2),
        },
        {
          userId: "user-1",
          userEmail: "user@ipsakti.gov.in",
          role: "user",
          question: "क्या आयुर्वेदिक फॉर्मूलेशन पेटेंट हो सकता है?",
          language: "Hindi",
          questionType: "rag",
          promptTokens: 380,
          completionTokens: 310,
          totalTokens: 690,
          latencyMs: 1620,
          sourcesCount: 2,
          timestamp: new Date(Date.now() - 3600000 * 24),
        },
        {
          userId: "admin-1",
          userEmail: "admin@ipsakti.gov.in",
          role: "admin",
          question: "Summary of Traditional Knowledge Digital Library (TKDL) provisions",
          language: "English",
          questionType: "rag",
          promptTokens: 510,
          completionTokens: 390,
          totalTokens: 900,
          latencyMs: 1890,
          sourcesCount: 4,
          timestamp: new Date(Date.now() - 3600000 * 5),
        },
      ];

      await tokenLogsCol.insertMany(sampleLogs);
      console.log("✓ Seeded sample token usage logs into MongoDB.");
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await client.close();
  }
}

seed();
