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
      },
      {
        name:        "Color Palette",
        slug:        "color-palette",
        description: "Extract dominant colors from any image instantly",
        category:    "image",
        icon:        "🎨",
        url:         "https://colors.cubosapiens.world",
        isLive:      false,
        order:       6
      },
      {
        name:        "IMG Convert",
        slug:        "img-convert",
        description: "Convert images between JPG PNG WEBP AVIF formats",
        category:    "converter",
        icon:        "🔄",
        url:         "https://convert.cubosapiens.world",
        isLive:      false,
        order:       7
      },
      {
        name:        "Password Gen",
        slug:        "password-gen",
        description: "Generate strong secure passwords instantly",
        category:    "generator",
        icon:        "🔐",
        url:         "https://pass.cubosapiens.world",
        isLive:      false,
        order:       8
      },
      {
        name:        "PDF Splitter",
        slug:        "pdf-splitter",
        description: "Split PDF files into individual pages",
        category:    "pdf",
        icon:        "✂️",
        url:         "https://split.cubosapiens.world",
        isLive:      false,
        order:       9
      },
      {
        name:        "Markdown Editor",
        slug:        "markdown-editor",
        description: "Write and preview markdown in real time",
        category:    "text",
        icon:        "🖊️",
        url:         "https://md.cubosapiens.world",
        isLive:      false,
        order:       10
      },
      {
        name:        "Unit Converter",
        slug:        "unit-converter",
        description: "Convert length weight temperature and more",
        category:    "converter",
        icon:        "📏",
        url:         "https://units.cubosapiens.world",
        isLive:      false,
        order:       11
      },
      {
        name:        "JSON Formatter",
        slug:        "json-formatter",
        description: "Format validate and beautify JSON instantly",
        category:    "text",
        icon:        "{ }",
        url:         "https://json.cubosapiens.world",
        isLive:      false,
        order:       12
      },
    ]
  })

  console.log("✅ 12 tools seeded")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())