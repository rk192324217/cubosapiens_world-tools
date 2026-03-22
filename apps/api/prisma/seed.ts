import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main()
{
  await prisma.tool.createMany({
    skipDuplicates: true,
    data: [
      {
        name:        "GPS CAM",
        slug:        "gps-cam",
        description: "Stamp GPS location, satellite map and date on your photos",
        category:    "image",
        icon:        "📍",
        url:         "https://gps-cam.cubosapiens.world",
        isLive:      true,
        isFeatured:  true,
        order:       1
      },
      {
        name:        "QR Generator",
        slug:        "qr-generator",
        description: "Create QR codes for any URL or text instantly",
        category:    "generator",
        icon:        "⬛",
        url:         "https://qr.cubosapiens.world",
        isLive:      false,
        order:       2
      },
      {
        name:        "PDF Merger",
        slug:        "pdf-merger",
        description: "Combine multiple PDF files into one",
        category:    "pdf",
        icon:        "📑",
        url:         "https://pdf.cubosapiens.world",
        isLive:      false,
        order:       3
      },
      {
        name:        "Image Compressor",
        slug:        "image-compressor",
        description: "Reduce image file size without losing quality",
        category:    "image",
        icon:        "🗜️",
        url:         "https://compress.cubosapiens.world",
        isLive:      false,
        order:       4
      },
      {
        name:        "Word Counter",
        slug:        "word-counter",
        description: "Count words, characters and reading time instantly",
        category:    "text",
        icon:        "📝",
        url:         "https://words.cubosapiens.world",
        isLive:      false,
        order:       5
      }
    ]
  })

  console.log("✅ Tools seeded successfully")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())