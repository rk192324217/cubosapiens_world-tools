import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main()
{
  await prisma.tool.createMany({
    skipDuplicates: true,
    data: [
      {
            name: "CUBO DSA",
            slug: "dsa-sheet",
            description: "The Ultimate DSA Cheat Sheet.",
            category: "education",
            icon: "dsa-sheet.png",
            url: "https://dsa-sheet.cubosapiens.world",
            isLive: true,
            isFeatured: true,
            order: 0
      },
      {
            name: "Cubo AI",
            slug: "chat-bot",
            description: "Your own Personalized chat bot",
            category: "ai",
            icon: "🤖",
            url: "https://cubobot.cubosapiens.world",
            isLive: false,
            isFeatured: false,
            order: 0
      },
      {
            name: "Cubo Comics Reader",
            slug: "pdf-reader",
            description: "View EPUB, PDF and CBZ Files For Free ! ",
            category: "pdf",
            icon: "📖 ",
            url: "https://pdf-reader.cubosapiens.world.",
            isLive: true,
            isFeatured: true,
            order: 0
      },
      {
            name: "Video Framer",
            slug: "vid-framer",
            description: "Convert video to images",
            category: "image",
            icon: "vid-framer.png",
            url: "https://vidframer.cubosapiens.world",
            isLive: true,
            isFeatured: false,
            order: 0
      },
      {
            name: "Image Editor",
            slug: "image-editor",
            description: "Reashpe, Resize, Edit Image Instantly for Free\n",
            category: "image",
            icon: "image-editor.png",
            url: "https://image-editor.cubosapiens.world",
            isLive: true,
            isFeatured: true,
            order: 0
      },
      {
            name: "Cubo GPS",
            slug: "gps-cam",
            description: "Get personalised Geo-Tagged photos",
            category: "image",
            icon: "gps-cam.png",
            url: "https://gps-cam.cubosapiens.world",
            isLive: true,
            isFeatured: true,
            order: 1
      },
      {
            name: "GenQr",
            slug: "qr-generator",
            description: "Create personalised QR codes instantly",
            category: "generator",
            icon: "qr-generator.png",
            url: "https://qr.cubosapiens.world",
            isLive: true,
            isFeatured: false,
            order: 2
      },
      {
            name: "CUBO CGPA",
            slug: "cgpa-calculator",
            description: "Calculate and Download CGPA",
            category: "education",
            icon: "cgpa-calculator.png",
            url: "https://cubocgpa.cubosapiens.world",
            isLive: true,
            isFeatured: false,
            order: 3
      },
      {
            name: "Unit Converter",
            slug: "unit-converter",
            description: "Convert length weight temperature and more",
            category: "converter",
            icon: "📏",
            url: "https://units.cubosapiens.world",
            isLive: true,
            isFeatured: false,
            order: 3
      },
      {
            name: "CUBO MD",
            slug: "markdown-editor",
            description: "Write and preview markdown in real time",
            category: "text",
            icon: "markdown-editor.png",
            url: "https://md.cubosapiens.world",
            isLive: true,
            isFeatured: false,
            order: 4
      },
      {
            name: "Text Analyse",
            slug: "text-analyse",
            description: "Get complete analysis of your text instantly ",
            category: "text",
            icon: "text-analyse.png",
            url: "https://words.cubosapiens.world",
            isLive: true,
            isFeatured: false,
            order: 5
      },
      {
            name: "CPalette",
            slug: "color-palette",
            description: "Customize and Extract Personalised Color Palette",
            category: "design",
            icon: "color-palette.png",
            url: "https://cpalette.cubosapiens.world",
            isLive: true,
            isFeatured: false,
            order: 6
      },
      {
            name: "IMG Convert",
            slug: "img-convert",
            description: "Convert images between various formats",
            category: "converter",
            icon: "img-convert.png",
            url: "https://imgconvert.cubosapiens.world",
            isLive: true,
            isFeatured: false,
            order: 7
      },
      {
            name: "Password Gen",
            slug: "password-gen",
            description: "Generate secure passwords instantly",
            category: "generator",
            icon: "password-gen.png",
            url: "https://passgen.cubosapiens.world",
            isLive: true,
            isFeatured: false,
            order: 8
      },
      {
            name: "Cubo Json",
            slug: "json-formatter",
            description: "Format validate and beautify JSON instantly",
            category: "text",
            icon: "json-formatter.png",
            url: "https://json.cubosapiens.world",
            isLive: true,
            isFeatured: true,
            order: 9
      },
      {
            name: "Pomodoro",
            slug: "pomodoro-timer",
            description: "Supercharged studying sessions",
            category: "education",
            icon: "pomodoro-timer.png",
            url: "https://pomodoro.cubosapiens.world",
            isLive: true,
            isFeatured: true,
            order: 11
      },
      {
            name: "PDF Merger",
            slug: "pdf-merger",
            description: "Combine multiple PDF files into one",
            category: "pdf",
            icon: "📑",
            url: "https://pdf.cubosapiens.world",
            isLive: false,
            isFeatured: false,
            order: 13
      },
      {
            name: "PDF Splitter",
            slug: "pdf-splitter",
            description: "Split PDF files into individual pages",
            category: "pdf",
            icon: "✂️",
            url: "https://split.cubosapiens.world",
            isLive: false,
            isFeatured: false,
            order: 14
      },
      {
            name: "CUBO GST ",
            slug: "gst-calculator",
            description: "Calculate and download GST for your shopping ",
            category: "money",
            icon: "gst-calculator.png",
            url: "https://gstcalculator.cubosapiens.world",
            isLive: true,
            isFeatured: false,
            order: 15
      }
]
  })

  console.log("✅ 19 tools seeded")

  await prisma.game.createMany({
    skipDuplicates: true,
    data: [
      {
            name: "Tic Tac Toe",
            slug: "xo",
            description: "Play Classic Themed XO",
            genre: "Puzzle",
            icon: "xo.png",
            url: "https://xo.cubosapiens.world",
            isLive: true,
            isFeatured: false,
            order: 0
      },
      {
            name: "Da Vinci Fly ",
            slug: "da-vinci-fly",
            description: "Da Vinci has made a flying machine to explore dangerous dungeon, but no one is willing to be the test pilot.",
            genre: "action",
            icon: "da-vinci-fly.png",
            url: "https://idev.games/embed/da-vinci-fly",
            isLive: false,
            isFeatured: false,
            order: 0
      },
      {
            name: "Stickman Idle RPG",
            slug: "stickman-idle-rpg",
            description: "Stickman Idle RPG is an endless auto-battler where your stickman hero automatically walks forward and fights monsters.  ",
            genre: "action",
            icon: "stickman-idle-rpg.png",
            url: "https://idev.games/embed/stickman-idle-rpg",
            isLive: false,
            isFeatured: false,
            order: 0
      },
      {
            name: "Stick Man Iron Domination ",
            slug: "stick-man-iron-domination",
            description: "In the shadows of the Gearforge Mountains, the age of wood and stone has been crushed into dust.",
            genre: "action",
            icon: "stick-man-iron-domination.png",
            url: "https://idev.games/embed/stick-man-iron-domination",
            isLive: false,
            isFeatured: false,
            order: 0
      },
      {
            name: "The Wizarding Quiz",
            slug: "hp-quiz",
            description: "Are You a True Witch or Wizard?",
            genre: "puzzle ",
            icon: "hp-quiz.png",
            url: " https://hp-quiz.cubosapiens.world",
            isLive: true,
            isFeatured: false,
            order: 0
      },
      {
            name: "Sudoku",
            slug: "sudoku",
            description: "Classic themed Sudoku.",
            genre: "puzzle",
            icon: "sudoku.png",
            url: " https://sudoku.cubosapiens.world",
            isLive: true,
            isFeatured: false,
            order: 0
      },
      {
            name: "Snake",
            slug: "snake",
            description: "Classic arcade snake — eat, grow, don't crash",
            genre: "arcade",
            icon: "cubo-snake.png",
            url: "https://cubo-snake.cubosapiens.world",
            isLive: true,
            isFeatured: true,
            order: 1
      },
      {
            name: "Wordle",
            slug: "wordle",
            description: "Guess the 5-letter word in 6 tries",
            genre: "word",
            icon: "🟩",
            url: "https://wordle.cubosapiens.world",
            isLive: false,
            isFeatured: false,
            order: 2
      },
      {
            name: "Memory",
            slug: "memory",
            description: "Flip cards and match pairs to win",
            genre: "puzzle",
            icon: "🧠",
            url: "https://memory.cubosapiens.world",
            isLive: true,
            isFeatured: false,
            order: 3
      },
      {
            name: "Chess",
            slug: "chess",
            description: "Play chess against the computer",
            genre: "strategy",
            icon: "♟️",
            url: "https://chess.cubosapiens.world",
            isLive: false,
            isFeatured: false,
            order: 4
      },
      {
            name: "Aim Lab",
            slug: "aim-lab",
            description: "Train your aim and reaction time",
            genre: "action",
            icon: "🎯",
            url: "https://aim.cubosapiens.world",
            isLive: false,
            isFeatured: false,
            order: 5
      },
      {
            name: "Tetris",
            slug: "tetris",
            description: "Classic block stacking — clear lines, survive",
            genre: "arcade",
            icon: "🧩",
            url: "https://tetris.cubosapiens.world",
            isLive: false,
            isFeatured: false,
            order: 6
      }
]
  })

  console.log("✅ 12 games seeded")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
