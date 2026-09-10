'use strict';

// ─── CASE DATABASE ────────────────────────────────────────────────────────────
const CASES = [
  // EASY CASES (Rookie)
  {
    id: 'C001',
    title: 'The Missing Prototype',
    location: 'Nexus Tech Headquarters',
    scene: `At 6:00 PM on Friday, the NX-7 AI chip prototype disappeared from Lab 3B. The lab requires biometric access. CCTV footage shows a figure entering at 5:47 PM. The prototype's tracking chip was found disabled in a bathroom bin. An anonymous email was sent to a competitor shortly after the theft.`,
    evidence: [
      { icon: '💻', text: 'Tracking chip disabled' },
      { icon: '🧥', text: 'White lab coat (Size M) found in bin' },
      { icon: '📡', text: 'Biometric log: access at 5:47 PM' },
      { icon: '📧', text: 'Anonymous email sent to competitor firm at 5:50 PM' },
      { icon: '🅿️', text: 'Parking lot CCTV: silver Prius left at 6:02 PM' },
    ],
    suspects: [
      { name: 'Dr. Yuna Park', role: 'Lead Engineer', avatar: '👩‍🔬', traits: ['Biometric access', 'Size S lab coat', 'Drives a Honda'], alibi: 'Dentist appointment at 5:30 PM' },
      { name: 'Felix Krohn', role: 'Product Manager', avatar: '👨‍💼', traits: ['Rival company contact', 'Biometric access', 'Drives a Prius', 'Size M lab coat'], alibi: 'Claims he was in a board meeting' },
      { name: 'Sana Mirza', role: 'Security Analyst', avatar: '👩‍💻', traits: ['No biometric access', 'Size S lab coat', 'Takes the bus'], alibi: 'Server room monitoring' },
      { name: 'Tomás Reyes', role: 'Hardware Tech', avatar: '🔧', traits: ['No biometric access', 'Size L lab coat', 'Drives a Ford'], alibi: 'Cafeteria with colleagues' },
    ],
    culpritIndex: 1,
    clues: [
      { question: 'Which piece of evidence directly connects to Felix Krohn\'s vehicle?', options: ['The disabled tracking chip', 'The silver Prius leaving at 6:02 PM', 'The biometric log', 'The white lab coat'], correct: 1, feedback: 'Felix Krohn\'s traits list that he "Drives a Prius", perfectly matching the CCTV footage of the getaway car.' },
      { question: 'The anonymous email sent to a competitor firm at 5:50 PM aligns best with which suspect\'s traits?', options: ['Dr. Yuna Park', 'Felix Krohn', 'Sana Mirza', 'Tomás Reyes'], correct: 1, feedback: 'Felix Krohn is the only suspect noted to have a "Rival company contact", establishing clear motive for the email.' },
      { question: 'The thief left behind a Size M white lab coat. Which suspect fits this physical profile?', options: ['Dr. Yuna Park', 'Felix Krohn', 'Sana Mirza', 'Tomás Reyes'], correct: 1, feedback: 'Felix Krohn is explicitly listed as wearing a "Size M lab coat", whereas the others wear Size S or L.' },
      { question: 'The lab was breached at 5:47 PM. Which suspects have the required Biometric access?', options: ['Sana Mirza and Tomás Reyes', 'Felix Krohn and Dr. Yuna Park', 'Only Dr. Yuna Park', 'Only Felix Krohn'], correct: 1, feedback: 'Only Dr. Yuna Park and Felix Krohn have biometric access listed in their traits.' },
      { question: 'Given Dr. Yuna Park\'s alibi at the dentist, who is the only remaining suspect with the means, motive, and opportunity?', options: ['Sana Mirza', 'Tomás Reyes', 'Felix Krohn', 'The security guard'], correct: 2, feedback: 'With Yuna at the dentist, Felix is the only one with biometric access, the right coat size, the matching getaway car, and the rival contact.' },
    ],
    verdict: 'Felix Krohn stole the prototype. His biometric access got him into the lab, his Size M lab coat was left at the scene, he emailed his rival company contact, and he fled in his silver Prius at 6:02 PM.',
    difficulty: 'easy',
  },
  {
    id: 'C002',
    title: 'The Sabotaged Servers',
    location: 'CloudNet Data Center',
    scene: `At exactly midnight, CloudNet's primary server racks overheated, causing a localized outage. Investigation showed the cooling system was manually overridden. A small puddle of spilled coffee was found near the override terminal. The terminal requires a physical admin key to unlock. A broken pair of reading glasses was found on the floor.`,
    evidence: [
      { icon: '❄️', text: 'Cooling system manually overridden at 12:00 AM' },
      { icon: '☕', text: 'Spilled coffee near the terminal' },
      { icon: '🔑', text: 'Admin key used to unlock terminal' },
      { icon: '👓', text: 'Broken reading glasses found on floor' },
      { icon: '🚪', text: 'Door logs show entry at 11:55 PM' },
    ],
    suspects: [
      { name: 'Alice Trent', role: 'Sysadmin', avatar: '👩‍💻', traits: ['Has admin key', 'Doesn\'t wear glasses', 'Drinks energy drinks'], alibi: 'Working from home' },
      { name: 'Bob Vance', role: 'Facility Manager', avatar: '👨‍🔧', traits: ['Has admin key', 'Wears reading glasses', 'Drinks coffee'], alibi: 'Claims he was in his office' },
      { name: 'Charlie Dean', role: 'Intern', avatar: '🧑‍🎓', traits: ['No admin key', 'Wears contacts', 'Drinks coffee'], alibi: 'Left at 5:00 PM' },
      { name: 'Diana Prince', role: 'Security', avatar: '👩‍✈️', traits: ['No admin key', 'Wears reading glasses', 'Drinks tea'], alibi: 'On patrol' },
    ],
    culpritIndex: 1,
    clues: [
      { question: 'Which suspect matches both the coffee spill and the reading glasses found at the scene?', options: ['Alice Trent', 'Bob Vance', 'Charlie Dean', 'Diana Prince'], correct: 1, feedback: 'Bob Vance is the only suspect who both drinks coffee and wears reading glasses.' },
      { question: 'The override terminal required a physical admin key. Who possesses one?', options: ['Charlie and Diana', 'Alice and Charlie', 'Alice and Bob', 'Only Alice'], correct: 2, feedback: 'Alice Trent and Bob Vance are the only ones with admin keys.' },
      { question: 'Which evidence rules out Diana Prince, despite her wearing reading glasses?', options: ['She doesn\'t drink coffee', 'She doesn\'t have an admin key', 'Both A and B', 'She was on patrol'], correct: 2, feedback: 'Diana Prince neither drinks coffee nor has an admin key.' },
      { question: 'Why is Charlie Dean an unlikely suspect?', options: ['He doesn\'t wear glasses', 'He doesn\'t have an admin key', 'Both A and B', 'He drinks tea'], correct: 2, feedback: 'Charlie Dean lacks both the reading glasses and the admin key required.' },
      { question: 'Based on the evidence and traits, who is the only suspect with the means and physical profile?', options: ['Alice Trent', 'Bob Vance', 'Charlie Dean', 'Diana Prince'], correct: 1, feedback: 'Bob Vance has the admin key, wears reading glasses, and drinks coffee, matching all evidence.' },
    ],
    verdict: 'Bob Vance sabotaged the servers. He used his admin key to access the terminal, spilling his coffee and breaking his reading glasses in the process.',
    difficulty: 'easy',
  },
  {
    id: 'C003',
    title: 'The Stolen Script',
    location: 'Hollywood Studio 4',
    scene: `The only copy of a highly anticipated movie script was stolen from the director's locked office. The theft occurred between 1:00 PM and 2:00 PM while the director was at lunch. A lingering scent of heavy floral perfume was noted in the room. A single blonde hair was found on the desk. The lock was picked, leaving scratch marks.`,
    evidence: [
      { icon: '🕒', text: 'Theft occurred between 1:00 PM and 2:00 PM' },
      { icon: '🌸', text: 'Heavy floral perfume scent in office' },
      { icon: '👱‍♀️', text: 'Single blonde hair on desk' },
      { icon: '🔓', text: 'Lock picked with tools' },
      { icon: '📷', text: 'CCTV offline during that hour' },
    ],
    suspects: [
      { name: 'Eve Malone', role: 'Lead Actress', avatar: '👱‍♀️', traits: ['Blonde hair', 'Wears floral perfume', 'No lockpicking skills'], alibi: 'In makeup trailer' },
      { name: 'Sam Ryder', role: 'Stunt Coordinator', avatar: '👨', traits: ['Brown hair', 'No perfume', 'Lockpicking hobbyist'], alibi: 'At the gym' },
      { name: 'Chloe Vance', role: 'Assistant Director', avatar: '👱‍♀️', traits: ['Blonde hair', 'Wears floral perfume', 'Former locksmith'], alibi: 'Claims she was eating lunch alone' },
      { name: 'Max Thorne', role: 'Rival Producer', avatar: '👨‍💼', traits: ['Bald', 'Wears cologne', 'Hires professionals'], alibi: 'Off-set meeting' },
    ],
    culpritIndex: 2,
    clues: [
      { question: 'Which suspect has the skills required to bypass the locked office door?', options: ['Eve Malone', 'Sam Ryder', 'Chloe Vance', 'Both Sam and Chloe'], correct: 3, feedback: 'Sam is a lockpicking hobbyist and Chloe is a former locksmith, giving both the means.' },
      { question: 'Which physical evidence rules out Sam Ryder and Max Thorne?', options: ['The floral perfume and blonde hair', 'The picked lock', 'The time of the theft', 'The offline CCTV'], correct: 0, feedback: 'The blonde hair and floral perfume strongly point away from Sam and Max.' },
      { question: 'Between the two blonde suspects, who has the necessary skill to pick the lock?', options: ['Eve Malone', 'Chloe Vance', 'Both', 'Neither'], correct: 1, feedback: 'Chloe Vance is a former locksmith, whereas Eve Malone has no lockpicking skills.' },
      { question: 'Which suspect perfectly matches the hair color, scent, and skills required?', options: ['Eve Malone', 'Sam Ryder', 'Chloe Vance', 'Max Thorne'], correct: 2, feedback: 'Chloe Vance is blonde, wears floral perfume, and has lockpicking skills.' },
      { question: 'Why is Eve Malone an unlikely suspect despite matching the physical profile?', options: ['She was at lunch', 'She doesn\'t know how to pick a lock', 'She has brown hair', 'She wears cologne'], correct: 1, feedback: 'Eve lacks the lockpicking skills necessary to enter the office.' },
    ],
    verdict: 'Chloe Vance stole the script. As a former locksmith, she easily picked the office lock. Her blonde hair and floral perfume left clear traces of her presence.',
    difficulty: 'easy',
  },

  // MEDIUM CASES (Detective)
  {
    id: 'C004',
    title: 'The Midnight Heist',
    location: 'The Grand Museum',
    scene: `At 2:14 AM, the Starlight Diamond — valued at £4.2 million — vanished from its display case on the third floor of the Grand Museum. The alarm was disabled for exactly 7 minutes. Security footage shows a shadow near the east wing. A half-eaten luxury chocolate wrapper was found at the scene. The janitor reports hearing heels on the marble floor at 2:10 AM.`,
    evidence: [
      { icon: '💎', text: 'Alarm disabled 2:07–2:14 AM' },
      { icon: '👠', text: 'High-heel impressions in dust near case' },
      { icon: '🍫', text: 'Half-eaten luxury chocolate wrapper (Valrhona)' },
      { icon: '🔑', text: 'Security keycard swiped at staff entrance' },
      { icon: '📱', text: 'Phone signal traced to east wing at 2:09 AM' },
    ],
    suspects: [
      { name: 'Vivienne Thorn', role: 'Museum Curator', avatar: '👩‍💼', traits: ['Has master keycard', 'Knows access codes', 'Wears flats'], alibi: 'Claims she was home asleep' },
      { name: 'Marcus Veil', role: 'Night Security Guard', avatar: '💂', traits: ['Has basic keycard', 'No alarm knowledge', 'Near east wing'], alibi: 'Says he was doing perimeter rounds' },
      { name: 'Isolde Crane', role: 'Visiting Art Appraiser', avatar: '🧑‍🎨', traits: ['Knew diamond value', 'Wears heels', 'Has luxury tastes', 'Borrowed Curator keycard'], alibi: 'Claims to have been at the hotel bar' },
      { name: 'Dorian Ash', role: 'Maintenance Tech', avatar: '🔧', traits: ['Alarm expertise', 'Late shift', 'Wears work boots'], alibi: 'Says he was fixing boiler in basement' },
    ],
    culpritIndex: 2,
    clues: [
      { question: 'Which suspect\'s physical trait matches the footprint evidence found near the display case?', options: ['Vivienne Thorn', 'Marcus Veil', 'Isolde Crane', 'Dorian Ash'], correct: 2, feedback: 'The high-heel impressions exactly match Isolde Crane\'s known footwear trait, ruling out Vivienne (flats) and Dorian (boots).' },
      { question: 'Which piece of evidence aligns perfectly with Isolde Crane\'s profile?', options: ['The disabled alarm', 'The luxury chocolate wrapper', 'The phone signal', 'The swiped keycard'], correct: 1, feedback: 'As an art appraiser with noted "luxury tastes", the high-end Valrhona chocolate wrapper fits her profile perfectly.' },
      { question: 'How did the thief likely bypass the locked staff entrance?', options: ['The guard let them in', 'They picked the lock', 'They used the Curator\'s borrowed keycard', 'They broke a window'], correct: 2, feedback: 'Isolde\'s traits state she "Borrowed Curator keycard", giving her the perfect means to enter through the staff doors.' },
      { question: 'Why is Dorian Ash unlikely to be the primary thief, despite his alarm expertise?', options: ['He doesn\'t know the diamond\'s value', 'His alibi is ironclad', 'He wears work boots, not heels', 'He was seen on CCTV'], correct: 2, feedback: 'The clear high-heel impressions at the scene rule out the maintenance tech, meaning someone else bypassed the alarm.' },
      { question: 'Given the evidence, what is the most logical conclusion about how the alarm was disabled?', options: ['Marcus Veil turned it off', 'Isolde used the borrowed master keycard which had alarm privileges', 'Dorian Ash did it for her', 'The alarm malfunctioned'], correct: 1, feedback: 'The Curator\'s master keycard would grant the necessary access codes, allowing Isolde to both enter the building and disable the alarm system.' },
    ],
    verdict: 'Isolde Crane orchestrated the theft. She used her knowledge of the diamond\'s value as motive, the borrowed Curator\'s master keycard to enter the staff entrance and bypass the alarm, and her luxury tastes and heels directly placed her at the crime scene.',
    difficulty: 'medium',
  },
  {
    id: 'C005',
    title: 'The Poisoned Pen',
    location: 'Blackwood Manor Library',
    scene: `Lord Edmund Blackwood, 74, was found unresponsive at his writing desk in the library at 9:45 PM. His evening tea sat half-drunk beside a manuscript he was editing. The doctor confirmed a fast-acting sedative in the tea. The window latch was found bent outward. The library door was locked from the outside.`,
    evidence: [
      { icon: '☕', text: 'Sedative compound in tea' },
      { icon: '🪟', text: 'Bent window latch, bent OUTWARD from the inside' },
      { icon: '📝', text: 'Manuscript: a new will, pages 3-4 missing' },
      { icon: '🧴', text: 'Trace of lavender hand lotion on teacup rim' },
      { icon: '🔐', text: 'Library locked from outside — Lord\'s key missing' },
    ],
    suspects: [
      { name: 'Reginald Blackwood', role: 'Estranged Nephew', avatar: '🧔', traits: ['Stood to inherit', 'Financial trouble', 'No keys'], alibi: 'Says he was in the drawing room all evening' },
      { name: 'Mrs. Pryce', role: 'Head Housekeeper', avatar: '👩‍🦳', traits: ['Prepared the tea', 'Wears lavender lotion', 'Has master keys'], alibi: 'Claims she served the tea and went to bed at 9 PM' },
      { name: 'Dr. Calloway', role: 'Family Physician', avatar: '👨‍⚕️', traits: ['Medical knowledge', 'Access to sedatives', 'No keys'], alibi: 'Left the manor by 4 PM per his log' },
      { name: 'Elspeth Crane', role: 'Literary Secretary', avatar: '👩‍💻', traits: ['Uses lavender lotion', 'Remote access', 'No keys'], alibi: 'Was working from home' },
    ],
    culpritIndex: 1,
    clues: [
      { question: 'Who had the most direct opportunity to place the sedative in the tea before Lord Blackwood drank it?', options: ['Reginald Blackwood', 'Dr. Calloway', 'Mrs. Pryce', 'Elspeth Crane'], correct: 2, feedback: 'Mrs. Pryce\'s traits confirm she prepared and served the tea, giving her direct access to poison it.' },
      { question: 'The lavender lotion on the teacup rim narrows the prime suspects down to:', options: ['Reginald and Dr. Calloway', 'Mrs. Pryce and Elspeth Crane', 'Dr. Calloway and Mrs. Pryce', 'Elspeth Crane and Reginald'], correct: 1, feedback: 'Both Mrs. Pryce and Elspeth Crane are noted to use lavender lotion, placing one of them as the tea handler.' },
      { question: 'The window latch was bent OUTWARD from the inside. What does this indicate?', options: ['The killer escaped through the window', 'The killer staged a break-in from inside the room', 'The wind blew it open', 'Lord Blackwood tried to get air'], correct: 1, feedback: 'Bending it outward from the inside is a deliberate attempt to stage a forced entry, covering the killer\'s tracks.' },
      { question: 'The library was locked from the OUTSIDE. Based on suspect traits, who had the means to lock it and leave?', options: ['Reginald Blackwood', 'Dr. Calloway', 'Mrs. Pryce', 'Elspeth Crane'], correct: 2, feedback: 'Mrs. Pryce is the only suspect with "master keys", allowing her to lock the door from the outside after staging the scene.' },
      { question: 'Why were pages 3-4 of the new will missing?', options: ['They were accidentally spilled on', 'The killer wanted to hide who was being written out of the inheritance', 'Lord Blackwood hadn\'t written them yet', 'Elspeth stole them to sell'], correct: 1, feedback: 'The missing pages likely removed Mrs. Pryce from the inheritance, providing her clear motive to stop the new will from being signed.' },
    ],
    verdict: 'Mrs. Pryce poisoned the Lord\'s evening tea. She prepared the tea (leaving lavender lotion on the rim), staged the window to look like a break-in, stole the will pages that wrote her out of the inheritance, and locked the door from the outside using her master keys.',
    difficulty: 'medium',
  },
  {
    id: 'C006',
    title: 'The Gallery Ghost',
    location: 'Modern Art Gallery',
    scene: `A valuable modern sculpture was smashed into pieces overnight. The gallery alarm did not trigger. A distinct smell of cigar smoke lingered in the room. The shattered pieces were swept into a neat pile. The gallery log shows only one authorized entry at 1:00 AM. A receipt from an all-night diner was found on the floor.`,
    evidence: [
      { icon: '🔔', text: 'Alarm bypassed with authorized code' },
      { icon: '💨', text: 'Lingering smell of cigar smoke' },
      { icon: '🧹', text: 'Shattered pieces swept into a neat pile' },
      { icon: '🧾', text: 'Diner receipt timestamped 12:30 AM' },
      { icon: '📖', text: 'Log shows entry at 1:00 AM' },
    ],
    suspects: [
      { name: 'Julian Vance', role: 'Gallery Owner', avatar: '👨‍💼', traits: ['Knows alarm code', 'Smokes cigars', 'Messy habits'], alibi: 'At a charity gala until 2 AM' },
      { name: 'Helena Troy', role: 'Rival Artist', avatar: '👩‍🎨', traits: ['No alarm code', 'Smokes cigarettes', 'Neat freak'], alibi: 'Working in her studio' },
      { name: 'Arthur Penhaligon', role: 'Night Janitor', avatar: '👨‍🔧', traits: ['Knows alarm code', 'Smokes cigars', 'Neat freak'], alibi: 'Claims he was eating at a diner' },
      { name: 'Diana Locke', role: 'Security Guard', avatar: '👩‍✈️', traits: ['Knows alarm code', 'Doesn\'t smoke', 'Messy habits'], alibi: 'Sleeping in breakroom' },
    ],
    culpritIndex: 2,
    clues: [
      { question: 'Which suspects have the authorized code to bypass the alarm?', options: ['Julian, Arthur, and Diana', 'Helena and Diana', 'Julian and Helena', 'Only Arthur'], correct: 0, feedback: 'Julian, Arthur, and Diana all know the alarm code.' },
      { question: 'The smell of cigar smoke narrows the suspects down to:', options: ['Julian and Helena', 'Julian and Arthur', 'Arthur and Diana', 'Helena and Arthur'], correct: 1, feedback: 'Only Julian and Arthur are noted to smoke cigars.' },
      { question: 'Which suspect matches the neatness of sweeping the pieces into a pile?', options: ['Julian Vance', 'Arthur Penhaligon', 'Diana Locke', 'None of the above'], correct: 1, feedback: 'Arthur is a "neat freak", whereas Julian has "messy habits".' },
      { question: 'The diner receipt timestamped 12:30 AM directly connects to whose alibi?', options: ['Julian Vance', 'Helena Troy', 'Arthur Penhaligon', 'Diana Locke'], correct: 2, feedback: 'Arthur claims he was eating at a diner; the receipt places him near the gallery right before the 1:00 AM entry.' },
      { question: 'Based on the traits, who is the only suspect matching the cigar smoke, the neatness, and the alarm code?', options: ['Julian Vance', 'Helena Troy', 'Arthur Penhaligon', 'Diana Locke'], correct: 2, feedback: 'Arthur Penhaligon has the alarm code, smokes cigars, and is a neat freak.' },
    ],
    verdict: 'Arthur Penhaligon smashed the sculpture. After eating at the diner, he used his alarm code to enter at 1:00 AM. He smoked a cigar while admiring his handiwork, and his habit as a neat freak compelled him to sweep up the mess.',
    difficulty: 'medium',
  },

  // HARD CASES (Inspector)
  {
    id: 'C007',
    title: 'The Silent Code',
    location: 'CyberSec HQ',
    scene: `A top-secret encryption algorithm was stolen from a secure air-gapped terminal. The terminal is isolated in a Faraday cage room. The room logs show entry by three people that day. A small, unauthorized USB drive was found hidden under the desk. The room's temperature log shows a spike at 3:15 PM. A faint smell of mint was noted.`,
    evidence: [
      { icon: '🖥️', text: 'Data transferred to unauthorized USB' },
      { icon: '🌡️', text: 'Temperature spike at 3:15 PM' },
      { icon: '🌿', text: 'Faint smell of mint in the room' },
      { icon: '🔑', text: 'Entry requires Level 5 clearance' },
      { icon: '📷', text: 'CCTV blinded by IR laser at 3:10 PM' },
    ],
    suspects: [
      { name: 'Elias Thorne', role: 'Chief Cryptographer', avatar: '👨‍💻', traits: ['Level 5 clearance', 'Chews mint gum', 'Left early at 2 PM'], alibi: 'At home reading' },
      { name: 'Dr. Aris Thorne', role: 'Hardware Specialist', avatar: '🧑‍🔬', traits: ['Level 5 clearance', 'Builds IR lasers', 'Drinks mint tea'], alibi: 'Working in adjacent lab' },
      { name: 'Nadia Rostova', role: 'Security Director', avatar: '👩‍✈️', traits: ['Level 5 clearance', 'Allergic to mint', 'No hardware skills'], alibi: 'In a management meeting' },
      { name: 'Liam Cross', role: 'Junior Analyst', avatar: '🧑‍🎓', traits: ['Level 3 clearance', 'Chews mint gum', 'Hardware hobbyist'], alibi: 'At his desk' },
    ],
    culpritIndex: 1,
    clues: [
      { question: 'Which suspect lacks the necessary clearance to enter the room?', options: ['Elias Thorne', 'Dr. Aris Thorne', 'Nadia Rostova', 'Liam Cross'], correct: 3, feedback: 'Liam Cross only has Level 3 clearance, making it impossible for him to enter the Level 5 room.' },
      { question: 'The CCTV was blinded by an IR laser. Which suspect has the skills to build one?', options: ['Elias Thorne', 'Dr. Aris Thorne', 'Nadia Rostova', 'Liam Cross'], correct: 1, feedback: 'Dr. Aris Thorne builds IR lasers, while Nadia explicitly has no hardware skills.' },
      { question: 'The smell of mint points to which suspects?', options: ['Elias and Aris', 'Elias and Liam', 'Aris and Nadia', 'Only Elias'], correct: 0, feedback: 'Elias chews mint gum and Aris drinks mint tea. Nadia is allergic to mint.' },
      { question: 'If Elias left at 2 PM, how does that affect the timeline?', options: ['He is the prime suspect', 'He could not have caused the 3:15 PM temperature spike', 'He blinded the camera before leaving', 'It means the log is wrong'], correct: 1, feedback: 'The temperature spike and camera blinding happened after 3 PM. Elias had already left the building.' },
      { question: 'Given the clearance level, hardware skills, and mint smell, who is the only viable suspect?', options: ['Elias Thorne', 'Dr. Aris Thorne', 'Nadia Rostova', 'Liam Cross'], correct: 1, feedback: 'Dr. Aris Thorne has Level 5 clearance, builds IR lasers to blind the camera, and drinks mint tea.' },
    ],
    verdict: 'Dr. Aris Thorne stole the algorithm. He used his custom IR laser to blind the camera at 3:10 PM, entered with his Level 5 clearance, and transferred the data. His mint tea left a lingering scent.',
    difficulty: 'hard',
  },
  {
    id: 'C008',
    title: 'The Alchemist\'s Demise',
    location: 'Antique Apothecary',
    scene: `An antique dealer was found poisoned by a rare, volatile chemical in his locked shop. The chemical is only stable at freezing temperatures. The shop's AC was set to 80°F. A damp towel was found near the body. The victim's ledger showed a recent dispute over a rare artifact. A set of muddy footprints led from the back door to the counter.`,
    evidence: [
      { icon: '☠️', text: 'Poisoning by volatile chemical (requires cold)' },
      { icon: '🔥', text: 'Shop AC deliberately set to 80°F' },
      { icon: '💧', text: 'Damp towel near the body' },
      { icon: '👣', text: 'Muddy footprints (size 10)' },
      { icon: '📔', text: 'Ledger: Dispute with "Collector X"' },
    ],
    suspects: [
      { name: 'Silas Vance', role: 'Rival Antiquarian', avatar: '👨‍💼', traits: ['Size 10 shoes', 'Has a greenhouse (mud)', 'No chemistry knowledge'], alibi: 'At an auction' },
      { name: 'Dr. Elara Lin', role: 'Chemist', avatar: '👩‍🔬', traits: ['Chemistry expertise', 'Size 7 shoes', 'Access to dry ice'], alibi: 'Working in her lab' },
      { name: 'Victor Thorne', role: 'The "Collector X"', avatar: '🕵️', traits: ['Size 10 shoes', 'Chemistry hobbyist', 'Seen in muddy park'], alibi: 'Walking in the park' },
      { name: 'Maude Flanders', role: 'Shop Assistant', avatar: '👩', traits: ['Size 8 shoes', 'Controls thermostat', 'No motive'], alibi: 'Went home sick' },
    ],
    culpritIndex: 2,
    clues: [
      { question: 'The volatile chemical required freezing temperatures to transport. Which suspects have the knowledge to handle it safely?', options: ['Silas Vance and Victor Thorne', 'Dr. Elara Lin and Victor Thorne', 'Only Dr. Elara Lin', 'Maude Flanders and Silas Vance'], correct: 1, feedback: 'Dr. Elara Lin has chemistry expertise and Victor Thorne is a chemistry hobbyist. Silas has no chemistry knowledge.' },
      { question: 'The muddy footprints are size 10. Which suspects match this footprint?', options: ['Silas Vance and Victor Thorne', 'Dr. Elara Lin and Maude Flanders', 'Only Silas Vance', 'Only Victor Thorne'], correct: 0, feedback: 'Both Silas Vance and Victor Thorne wear size 10 shoes.' },
      { question: 'The ledger mentions a dispute with "Collector X". Which suspect matches this alias?', options: ['Silas Vance', 'Dr. Elara Lin', 'Victor Thorne', 'Maude Flanders'], correct: 2, feedback: 'Victor Thorne is explicitly identified as "Collector X" in his traits, providing a clear motive.' },
      { question: 'Which suspect\'s alibi perfectly explains the muddy footprints?', options: ['Silas Vance (at an auction)', 'Dr. Elara Lin (in lab)', 'Victor Thorne (walking in muddy park)', 'Maude Flanders (home sick)'], correct: 2, feedback: 'Victor Thorne\'s alibi of walking in a muddy park perfectly explains the mud on his size 10 shoes.' },
      { question: 'Combining the motive, the chemistry knowledge, and the footprints, who is the killer?', options: ['Silas Vance', 'Dr. Elara Lin', 'Victor Thorne', 'Maude Flanders'], correct: 2, feedback: 'Victor Thorne (Collector X) had the motive, the chemistry hobbyist skills to transport the poison, and left size 10 muddy footprints.' },
    ],
    verdict: 'Victor Thorne murdered the dealer over their dispute. Using his chemistry knowledge, he transported the volatile poison using dry ice (explaining the damp towel), turned up the AC to vaporize it, and left his muddy size 10 footprints behind.',
    difficulty: 'hard',
  },
  {
    id: 'C009',
    title: 'The Locked Cabin',
    location: 'Snowy Peak Retreat',
    scene: `A reclusive author was found dead in his remote mountain cabin. The cabin was locked from the inside. A single bullet was fired, but the gun is missing. Outside, undisturbed snow surrounds the cabin. The fireplace ashes are still warm. A secret underground tunnel connects the cabin to a nearby supply shed.`,
    evidence: [
      { icon: '🚪', text: 'Cabin locked from the inside' },
      { icon: '🔫', text: 'Victim shot, weapon missing' },
      { icon: '❄️', text: 'Undisturbed snow outside cabin doors/windows' },
      { icon: '🔥', text: 'Warm fireplace ashes' },
      { icon: '🕳️', text: 'Underground tunnel to supply shed' },
    ],
    suspects: [
      { name: 'Jack Torrance', role: 'Caretaker', avatar: '👨‍🌾', traits: ['Knows about tunnel', 'Owns a gun', 'Wears snowshoes'], alibi: 'Shoveling snow miles away' },
      { name: 'Emma Frost', role: 'Editor', avatar: '👩‍💼', traits: ['Unaware of tunnel', 'Disliked author', 'Afraid of guns'], alibi: 'At the lodge' },
      { name: 'Logan Vance', role: 'Local Hunter', avatar: '💂', traits: ['Expert marksman', 'Knows about tunnel', 'Carries a rifle'], alibi: 'Hunting in the woods' },
      { name: 'Sarah Connor', role: 'Ex-Wife', avatar: '👩', traits: ['Knows about tunnel', 'Owns a handgun', 'Hates the cold'], alibi: 'Staying at the supply shed' },
    ],
    culpritIndex: 3,
    clues: [
      { question: 'How did the killer escape without leaving footprints in the snow?', options: ['They flew away', 'They used the underground tunnel', 'They swept their tracks', 'They are still in the cabin'], correct: 1, feedback: 'The undisturbed snow means the only exit was the underground tunnel connecting to the supply shed.' },
      { question: 'Which suspect is definitively ruled out because they are unaware of the tunnel?', options: ['Jack Torrance', 'Emma Frost', 'Logan Vance', 'Sarah Connor'], correct: 1, feedback: 'Emma Frost is unaware of the tunnel, meaning she could not have used it to escape the locked cabin.' },
      { question: 'The missing weapon was likely a handgun or rifle. Which suspect is afraid of guns?', options: ['Jack Torrance', 'Emma Frost', 'Logan Vance', 'Sarah Connor'], correct: 1, feedback: 'Emma Frost is afraid of guns, further ruling her out.' },
      { question: 'The tunnel connects directly to the supply shed. Whose alibi places them exactly at the escape point?', options: ['Jack Torrance', 'Emma Frost', 'Logan Vance', 'Sarah Connor'], correct: 3, feedback: 'Sarah Connor\'s alibi is that she was staying at the supply shed, the exact terminus of the tunnel.' },
      { question: 'Considering the tunnel knowledge, gun ownership, and location, who is the most logical suspect?', options: ['Jack Torrance', 'Logan Vance', 'Sarah Connor', 'Emma Frost'], correct: 2, feedback: 'Sarah Connor knows about the tunnel, owns a handgun, and was stationed at the supply shed where the tunnel leads.' },
    ],
    verdict: 'Sarah Connor used the underground tunnel to enter the cabin, shot her ex-husband, took the weapon, and escaped back through the tunnel to the supply shed. She locked the cabin door from the inside before leaving via the tunnel, creating a locked-room mystery with no footprints in the snow.',
    difficulty: 'hard',
  }
];


// ─── DIFFICULTY CONFIG ────────────────────────────────────────────────────────
const DIFF = {
  easy:   { timeLimit: 0, hintsAllowed: 3, penaltyPts: 5,  correctPts: 100, accusePts: 300, label: 'Rookie' },
  medium: { timeLimit: 0, hintsAllowed: 2, penaltyPts: 15, correctPts: 150, accusePts: 500, label: 'Detective' },
  hard:   { timeLimit: 0, hintsAllowed: 1, penaltyPts: 25, correctPts: 200, accusePts: 700, label: 'Inspector' },
};

// ─── GAME STATE ───────────────────────────────────────────────────────────────
let difficulty    = 'medium';
let currentCase   = null;
let caseIndex     = 0;
let phase         = 'scene'; // scene | suspects | clues | accuse
let clueIndex     = 0;
let score         = 0;
let hintsLeft     = 2;
let correctClues  = 0;
let timerSecs     = 0;
let timerHandle   = null;
let gameOver      = false;
let accusedIndex  = null;
let notebook      = [];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function $(id) { return document.getElementById(id); }
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function fmt(s) {
  const m = Math.floor(s / 60), sec = s % 60;
  return m + ':' + String(sec).padStart(2, '0');
}
function clamp(n, min, max) { return Math.min(Math.max(n, min), max); }

// ─── TIMER ────────────────────────────────────────────────────────────────────
function startTimer() {
  if (timerHandle) return;
  timerHandle = setInterval(() => {
    timerSecs++;
    const el = $('timer-display');
    el.textContent = fmt(timerSecs);
    el.classList.remove('urgent');
  }, 1000);
}
function stopTimer() { clearInterval(timerHandle); timerHandle = null; }
function resetTimer() { stopTimer(); timerSecs = 0; $('timer-display').textContent = '0:00'; }

// ─── TOAST ────────────────────────────────────────────────────────────────────
let toastTmr = null;
function showToast(msg, type) {
  const t = $('toast');
  t.textContent = msg;
  t.className = 'toast ' + (type || 'info') + ' show';
  clearTimeout(toastTmr);
  toastTmr = setTimeout(() => t.classList.remove('show'), 2500);
}

// ─── STATUS ───────────────────────────────────────────────────────────────────
function setStatus(msg, color) {
  const el = $('status-text');
  el.textContent = msg;
  el.style.color = color || 'var(--text)';
}

// ─── PROGRESS ─────────────────────────────────────────────────────────────────
function updateProgress() {
  const total = currentCase.clues.length;
  const pct   = (clueIndex / total) * 100;
  $('progress-fill').style.width = pct + '%';
  $('progress-count').textContent = clueIndex + '/' + total;
}

// ─── NOTEBOOK ─────────────────────────────────────────────────────────────────
function addNote(type, text) {
  notebook.push({ type, text });
  renderNotebook();
}
function renderNotebook() {
  const el = $('notebook-entries');
  el.innerHTML = '';
  for (const n of notebook) {
    const div = document.createElement('div');
    div.className = 'notebook-entry clue-' + n.type;
    const icons = { correct: '✓', wrong: '✗', hint: '💡' };
    div.innerHTML = `<span class="notebook-icon">${icons[n.type] || '·'}</span><span>${n.text}</span>`;
    el.appendChild(div);
  }
  el.scrollTop = el.scrollHeight;
}

// ─── SCORE DISPLAY ────────────────────────────────────────────────────────────
function updateScore(delta) {
  score = clamp(score + delta, 0, 99999);
  $('score-display').textContent = score;

  // Flash effect
  const el = $('score-display');
  el.style.transform = 'scale(1.3)';
  setTimeout(() => { el.style.transform = 'scale(1)'; }, 200);
}

// ─── PHASE TRANSITIONS ────────────────────────────────────────────────────────
function switchTab(tabId) {
  // Hide all sections
  document.querySelectorAll('.phase-section').forEach(s => s.classList.remove('active'));
  // Deactivate all tab buttons
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  
  // Show target section
  const el = $(tabId);
  if (el) el.classList.add('active');
  
  // Activate target tab button
  const btn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
  if (btn) btn.classList.add('active');
  
  phase = tabId;
}

// ─── LOBBY ──────────────────────────────────────────────────────────────────────
function showLobby() {
  $('game-ui').style.display = 'none';
  $('lobby-ui').style.display = 'block';
  $('overlay').classList.remove('show');
  stopTimer();

  const grid = $('lobby-cases-grid');
  grid.innerHTML = '';
  
  CASES.forEach((c, idx) => {
    if (c.difficulty !== difficulty) return;
    
    const card = document.createElement('div');
    card.className = 'lobby-case-card';
    card.innerHTML = `
      <div class="lobby-case-diff">${DIFF[difficulty].label}</div>
      <div class="lobby-case-id">CASE ${c.id}</div>
      <div class="lobby-case-title">${c.title}</div>
      <div class="lobby-case-loc">📍 ${c.location}</div>
      <button class="btn-start-case">START INVESTIGATION</button>
    `;
    card.addEventListener('click', () => {
      startCase(idx);
    });
    grid.appendChild(card);
  });
}

// ─── BUILD GAME ───────────────────────────────────────────────────────────────
function startCase(idx) {
  $('lobby-ui').style.display = 'none';
  $('game-ui').style.display = 'block';

  caseIndex  = idx % CASES.length;
  currentCase = CASES[caseIndex];
  const cfg  = DIFF[difficulty];

  score         = 0;
  hintsLeft     = cfg.hintsAllowed;
  clueIndex     = 0;
  correctClues  = 0;
  gameOver      = false;
  accusedIndex  = null;
  notebook      = [];

  resetTimer();
  updateScore(0);
  updateProgress();
  renderNotebook();

  $('case-number').textContent = currentCase.id;
  $('case-title').textContent  = currentCase.title;
  $('case-location').textContent = '📍 ' + currentCase.location;
  $('diff-label').textContent  = cfg.label.toUpperCase();
  $('hints-left').textContent  = hintsLeft;

  buildScenePhase();
  buildSuspectsPhase();
  buildCluePhase();
  
  startTimer();
  switchTab('phase-scene');
  setStatus('STUDY THE CRIME SCENE', 'var(--amber)');
  $('overlay').classList.remove('show');
}

function buildScenePhase() {
  $('scene-text').textContent = currentCase.scene;
  const grid = $('evidence-grid');
  grid.innerHTML = '';
  for (const ev of currentCase.evidence) {
    const chip = document.createElement('div');
    chip.className = 'evidence-chip';
    chip.innerHTML = `<span class="evidence-icon">${ev.icon}</span><span>${ev.text}</span>`;
    grid.appendChild(chip);
  }
}

function buildSuspectsPhase() {
  const grid = $('suspects-grid');
  grid.innerHTML = '';
  for (let i = 0; i < currentCase.suspects.length; i++) {
    const s = currentCase.suspects[i];
    const card = document.createElement('div');
    card.className = 'suspect-card';
    card.setAttribute('data-index', i);
    card.innerHTML = `
      <span class="suspect-avatar">${s.avatar}</span>
      <div class="suspect-name">${s.name}</div>
      <div class="suspect-role">${s.role}</div>
      <div class="suspect-traits">${s.traits.map(t => `<span class="trait-tag">${t}</span>`).join('')}</div>
    `;
    card.addEventListener('click', () => {
      document.querySelectorAll('.suspect-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      showToast('📋 SUSPECT NOTED: ' + s.name, 'info');
    });
    grid.appendChild(card);
  }
}

function buildCluePhase() {
  renderClue(clueIndex);
  updateProgress();
}

function renderClue(idx) {
  if (idx >= currentCase.clues.length) {
    $('phase-accuse').style.display = 'block';
    buildAccusePhase();
    return;
  }
  
  $('phase-accuse').style.display = 'none';

  const clue = currentCase.clues[idx];
  $('question-number').textContent = 'CLUE ' + (idx + 1) + ' OF ' + currentCase.clues.length;
  $('question-text').textContent   = clue.question;

  const optWrap = $('answer-options');
  optWrap.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D'];

  clue.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.setAttribute('data-idx', i);
    btn.innerHTML = `<span class="answer-letter">${letters[i]}</span><span>${opt}</span>`;
    btn.addEventListener('click', () => handleAnswer(i));
    optWrap.appendChild(btn);
  });

  // Hide feedback and next button
  const fb = $('clue-feedback');
  fb.className = 'clue-feedback';
  fb.textContent = '';
  $('btn-next-clue').classList.remove('show');
}

function handleAnswer(selectedIdx) {
  const clue    = currentCase.clues[clueIndex];
  const correct = selectedIdx === clue.correct;
  const cfg     = DIFF[difficulty];
  const buttons = document.querySelectorAll('.answer-btn');

  // Disable all buttons
  buttons.forEach(b => b.disabled = true);

  // Mark selected
  buttons[selectedIdx].classList.add(correct ? 'correct' : 'wrong');
  if (!correct) {
    buttons[clue.correct].classList.add('reveal');
  }

  // Feedback
  const fb = $('clue-feedback');
  fb.className = 'clue-feedback ' + (correct ? 'correct' : 'wrong') + ' show';
  fb.innerHTML = `<strong>${correct ? '✓ CORRECT' : '✗ INCORRECT'}:</strong> ${clue.feedback}`;

  // Score
  if (correct) {
    updateScore(cfg.correctPts);
    correctClues++;
    addNote('correct', `Q: ${clue.question}<br><span style="color: var(--green);">A: ${clue.options[selectedIdx]}</span>`);
    showToast('✓ CORRECT! +' + cfg.correctPts + ' PTS', 'success');
    setStatus('CORRECT — CLUE LOGGED', 'var(--green)');
  } else {
    updateScore(-cfg.penaltyPts);
    addNote('wrong', `Q: ${clue.question}<br><span style="color: var(--crimson);">A: ${clue.options[selectedIdx]} ✗</span>`);
    showToast('✗ WRONG! -' + cfg.penaltyPts + ' PTS', 'error');
    setStatus('WRONG DEDUCTION!', 'var(--crimson)');
  }

  clueIndex++;
  updateProgress();
  $('btn-next-clue').classList.add('show');
}

function buildAccusePhase() {
  const grid = $('suspect-select-grid');
  grid.innerHTML = '';
  accusedIndex = null;
  $('btn-confirm-accuse').classList.remove('show');

  for (let i = 0; i < currentCase.suspects.length; i++) {
    const s = currentCase.suspects[i];
    const card = document.createElement('div');
    card.className = 'accuse-card';
    card.setAttribute('data-index', i);
    card.innerHTML = `
      <span class="suspect-avatar">${s.avatar}</span>
      <div class="suspect-name">${s.name}</div>
      <div class="suspect-role" style="font-size:0.7rem;color:var(--muted);margin-top:4px;letter-spacing:1px;">${s.role}</div>
    `;
    card.addEventListener('click', () => {
      document.querySelectorAll('.accuse-card').forEach(c => c.classList.remove('accused'));
      card.classList.add('accused');
      accusedIndex = i;
      $('btn-confirm-accuse').classList.add('show');
      setStatus('MAKE YOUR ACCUSATION', 'var(--crimson)');
    });
    grid.appendChild(card);
  }
}

function handleAccusation() {
  if (accusedIndex === null) return;

  const correct = accusedIndex === currentCase.culpritIndex;
  const cfg = DIFF[difficulty];
  stopTimer();
  gameOver = true;

  if (correct) {
    updateScore(cfg.accusePts);
    showResult(true);
  } else {
    updateScore(-100);
    showResult(false);
  }
}

function showResult(correct) {
  const culprit = currentCase.suspects[currentCase.culpritIndex];
  const accused = currentCase.suspects[accusedIndex];

  $('res-emoji').textContent   = correct ? '🏆' : '😔';
  const title = $('res-title');
  title.textContent            = correct ? 'CASE CLOSED!' : 'WRONG SUSPECT!';
  title.style.color            = correct ? 'var(--amber)' : 'var(--crimson)';

  if (correct) {
    $('res-sub').textContent = `You correctly identified ${culprit.name} as the culprit.`;
  } else {
    $('res-sub').textContent = `You accused ${accused.name}, but the real culprit was ${culprit.name}.`;
  }

  $('verdict-text').textContent = currentCase.verdict;

  $('res-stat-score').textContent = score;
  $('res-stat-score').style.color = correct ? 'var(--amber)' : 'var(--crimson)';
  $('res-stat-time').textContent  = fmt(timerSecs);
  $('res-stat-clues').textContent = correctClues + '/' + currentCase.clues.length;

  $('overlay').classList.add('show');
}

// ─── PHASE TRANSITIONS ────────────────────────────────────────────────────────
function transitionToAccuse() {
  $('phase-accuse').style.display = 'block';
  buildAccusePhase();
  setStatus('WHO DID IT? MAKE YOUR ACCUSATION', 'var(--crimson)');
  showToast('⚠ FINAL DECISION — CHOOSE WISELY', 'error');
  
  // Auto-scroll to accuse section
  setTimeout(() => {
    $('phase-accuse').scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

// ─── HINT LOGIC ───────────────────────────────────────────────────────────────
function useHint() {
  if (hintsLeft <= 0 || phase !== 'phase-clues') return;
  const clue = currentCase.clues[clueIndex];
  if (!clue) return;

  // Find a wrong answer and eliminate it
  const wrongOptions = document.querySelectorAll('.answer-btn:not(:disabled)');
  let eliminated = false;
  for (const btn of wrongOptions) {
    if (parseInt(btn.dataset.idx) !== clue.correct) {
      btn.disabled = true;
      btn.style.opacity = '0.3';
      btn.style.textDecoration = 'line-through';
      eliminated = true;
      break;
    }
  }

  if (eliminated) {
    hintsLeft--;
    $('hints-left').textContent = hintsLeft;
    $('btn-hint').disabled = hintsLeft === 0;
    addNote('hint', 'Hint used on clue ' + (clueIndex + 1));
    showToast('💡 HINT USED — ' + hintsLeft + ' REMAINING', 'hint');
  }
}

// ─── DIFFICULTY SWITCH ────────────────────────────────────────────────────────
function switchDiff(d) {
  difficulty = d;
  document.querySelectorAll('.setup-btn[data-diff]').forEach(b => {
    b.classList.toggle('active', b.dataset.diff === d);
  });
  showLobby();
}

// ─── INIT & EVENT WIRING ──────────────────────────────────────────────────────
document.querySelectorAll('.setup-btn[data-diff]').forEach(b =>
  b.addEventListener('click', () => switchDiff(b.dataset.diff))
);

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    switchTab(btn.dataset.tab);
  });
});
$('btn-next-clue').addEventListener('click', () => {
  if (clueIndex >= currentCase.clues.length) {
    transitionToAccuse();
  } else {
    renderClue(clueIndex);
    updateProgress();
    $('btn-next-clue').classList.remove('show');
    setStatus('ANALYSE THE CLUES', 'var(--cyan)');
  }
});
$('btn-confirm-accuse').addEventListener('click', () => handleAccusation());
$('btn-hint').addEventListener('click', () => useHint());

$('btn-restart').addEventListener('click', () => startCase(caseIndex));
$('btn-leave-case').addEventListener('click', () => showLobby());
$('res-replay').addEventListener('click', () => startCase(caseIndex));
$('res-newcase').addEventListener('click', () => showLobby());

// How-to-play accordion
$('htp-toggle').addEventListener('click', () => {
  const body = $('htp-body'), chev = $('htp-chev');
  const open = body.classList.toggle('open');
  chev.classList.toggle('open', open);
  $('htp-toggle').setAttribute('aria-expanded', open);
});

// ─── BOOT ─────────────────────────────────────────────────────────────────────
// Load saved difficulty
const saved = localStorage.getItem('detective_diff');
if (saved && DIFF[saved]) {
  difficulty = saved;
  document.querySelectorAll('.setup-btn[data-diff]').forEach(b => {
    b.classList.toggle('active', b.dataset.diff === saved);
  });
}
// Save on change
document.querySelectorAll('.setup-btn[data-diff]').forEach(b =>
  b.addEventListener('click', () => localStorage.setItem('detective_diff', b.dataset.diff))
);
// Save high score
function saveStats() {
  const stats = JSON.parse(localStorage.getItem('detective_stats') || '{}');
  const key   = currentCase.id + '_' + difficulty;
  if (!stats[key] || score > stats[key].best) {
    stats[key] = { best: score, time: timerSecs };
    localStorage.setItem('detective_stats', JSON.stringify(stats));
  }
}
// Initialize lobby
showLobby();