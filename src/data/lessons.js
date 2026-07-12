/**
 * Built-in lesson curriculum. Each band gets the same core skills at
 * increasing depth. Lessons carry a static example + fallback quiz so the
 * app fully works before the LLM function is deployed; when the LLM is
 * available, examples and quizzes are generated from the student's own
 * current reading passage instead.
 */

export const LESSONS = [
  // ---------- Sprout ----------
  {
    id: 'sprout-main-idea',
    band: 'Sprout',
    skill: 'Main Idea',
    emoji: '💡',
    title: 'What is the story mostly about?',
    body: `Every story has one BIG idea — the thing it is mostly about.

To find it, ask yourself: "If I told a friend about this story in one sentence, what would I say?"

The little details are like sprinkles. The main idea is the cupcake!`,
    example: `Read this: "Maya packed her bag. She brought a towel, sunscreen, and a shovel. Her family drove to the shore and built sandcastles all day."

The main idea: Maya's family had a day at the beach. The towel and shovel are just sprinkles!`,
    quiz: [
      { question: 'The main idea is...', options: ['The biggest thing the story is about', 'The first word', 'The longest sentence', 'The last page'], answerIndex: 0, skill: 'main idea' },
      { question: 'Little details in a story are like...', options: ['The cupcake', 'Sprinkles', 'The oven', 'The plate'], answerIndex: 1, skill: 'main idea' },
      { question: '"Leo fed his fish, cleaned the tank, and added a plant." What is it mostly about?', options: ['Plants', 'Leo taking care of his fish', 'Cleaning', 'Water'], answerIndex: 1, skill: 'main idea' },
    ],
  },
  {
    id: 'sprout-context-clues',
    band: 'Sprout',
    skill: 'Context Clues',
    emoji: '🔍',
    title: 'Be a word detective',
    body: `Sometimes you meet a word you don't know. Don't panic — be a detective!

The words AROUND the mystery word are clues. Read the whole sentence and ask: "What would make sense here?"`,
    example: `"The dog was so famished that he ate two whole bowls of food."

Mystery word: famished. Clue: he ate TWO bowls! Famished must mean very, very hungry.`,
    quiz: [
      { question: '"The tiny kitten was minuscule next to the big dog." Minuscule means...', options: ['Loud', 'Very small', 'Angry', 'Fast'], answerIndex: 1, skill: 'context clues' },
      { question: 'Context clues are found...', options: ['In the words around the mystery word', 'On the cover', 'In your pocket', 'Only in dictionaries'], answerIndex: 0, skill: 'context clues' },
      { question: '"Rain poured down, so we were drenched." Drenched means...', options: ['Dry', 'Happy', 'Very wet', 'Asleep'], answerIndex: 2, skill: 'context clues' },
    ],
  },
  {
    id: 'sprout-sequencing',
    band: 'Sprout',
    skill: 'Sequencing',
    emoji: '🚂',
    title: 'First, next, last',
    body: `Stories happen in order, like train cars: first, next, then, last.

Words like "first", "then", "after", and "finally" are signal words — they tell you the order things happen.`,
    example: `"First, Sam planted a seed. Then he watered it every day. Finally, a sunflower grew taller than him!"

The order: plant → water → grow. The signal words showed the way.`,
    quiz: [
      { question: 'Which word tells you something happens at the END?', options: ['First', 'Finally', 'Next', 'Suddenly'], answerIndex: 1, skill: 'sequencing' },
      { question: '"Before school, Ada ate breakfast." What happened first?', options: ['School', 'Breakfast', 'Lunch', 'Bedtime'], answerIndex: 1, skill: 'sequencing' },
      { question: 'Sequencing means putting events...', options: ['In rainbow colors', 'In order', 'In a hat', 'Backwards'], answerIndex: 1, skill: 'sequencing' },
    ],
  },

  // ---------- Explorer ----------
  {
    id: 'explorer-inference',
    band: 'Explorer',
    skill: 'Inference',
    emoji: '🕵️',
    title: 'Reading between the lines',
    body: `Authors don't always tell you everything directly. An inference is a smart guess using clues from the text PLUS what you already know.

Text clues + your brain = inference!`,
    example: `"Jordan slammed the door and stomped up the stairs without saying hello."

The author never says "Jordan is upset" — but the slamming and stomping are clues. You infer it!`,
    quiz: [
      { question: 'An inference is...', options: ['Copying the text', 'A smart guess using clues + what you know', 'A type of book', 'The title'], answerIndex: 1, skill: 'inference' },
      { question: '"Priya grabbed an umbrella before leaving." You can infer...', options: ['It might rain', 'She loves umbrellas', 'It is snowing', 'She is late'], answerIndex: 0, skill: 'inference' },
      { question: '"The crowd gasped and covered their eyes." The crowd probably feels...', options: ['Bored', 'Shocked or scared', 'Hungry', 'Sleepy'], answerIndex: 1, skill: 'inference' },
      { question: 'Good inferences always use...', options: ['Evidence from the text', 'Random guesses', 'Only pictures', 'The page number'], answerIndex: 0, skill: 'inference' },
    ],
  },
  {
    id: 'explorer-summarizing',
    band: 'Explorer',
    skill: 'Summarizing',
    emoji: '🎒',
    title: 'Pack the story into a backpack',
    body: `A summary is the whole story shrunk down to fit in a backpack: just the who, what, where, and why that matter most.

Try the "Somebody-Wanted-But-So-Then" trick:
Somebody (character) Wanted (goal) But (problem) So (action) Then (ending).`,
    example: `Cinderella: SOMEBODY (Cinderella) WANTED to go to the ball, BUT her stepmother said no, SO her fairy godmother helped her, THEN the prince found her with the glass slipper.

A whole story in one sentence!`,
    quiz: [
      { question: 'A good summary includes...', options: ['Every single detail', 'Only the most important parts', 'Just the ending', 'The number of pages'], answerIndex: 1, skill: 'summarizing' },
      { question: 'In "Somebody-Wanted-But-So-Then", the BUT is...', options: ['The problem', 'The hero', 'The setting', 'The title'], answerIndex: 0, skill: 'summarizing' },
      { question: 'Which is a summary, not a detail?', options: ['Her shoes were size 6', 'The dragon sneezed twice', 'A knight saved a village from a dragon', 'The castle had 14 windows'], answerIndex: 2, skill: 'summarizing' },
      { question: 'Summaries should be...', options: ['Longer than the story', 'Much shorter than the story', 'Exactly the same', 'Written backwards'], answerIndex: 1, skill: 'summarizing' },
    ],
  },
  {
    id: 'explorer-character',
    band: 'Explorer',
    skill: 'Character Traits',
    emoji: '🎭',
    title: 'What characters DO shows who they ARE',
    body: `Characters show their personality through actions, words, and choices — not just descriptions.

When a character does something, ask: "What does this tell me about them?" Brave? Kind? Sneaky? Stubborn?`,
    example: `"Even though Mia was late, she stopped to help the boy pick up his dropped books."

Mia's ACTION tells you she is kind and puts others first — the author never had to say it.`,
    quiz: [
      { question: 'We learn about characters mostly from...', options: ['Their actions, words, and choices', 'The page color', 'The font', 'The chapter numbers'], answerIndex: 0, skill: 'character' },
      { question: '"Despite being scared, Ken walked into the dark cave first." Ken is...', options: ['Lazy', 'Brave', 'Rude', 'Sleepy'], answerIndex: 1, skill: 'character' },
      { question: '"Tina shared her lunch with the new student." Tina is...', options: ['Selfish', 'Generous', 'Angry', 'Loud'], answerIndex: 1, skill: 'character' },
      { question: 'A character trait is...', options: ['What a character looks like only', 'A word describing their personality', 'Their name', 'Their age'], answerIndex: 1, skill: 'character' },
    ],
  },

  // ---------- Voyager ----------
  {
    id: 'voyager-authors-purpose',
    band: 'Voyager',
    skill: "Author's Purpose",
    emoji: '🎯',
    title: 'Why did the author write this?',
    body: `Every text exists for a reason. The big three purposes are easy to remember as PIE:

Persuade — convince you of something
Inform — teach you facts
Entertain — tell you a story for fun

Figuring out the purpose changes how you read: you question persuasion, verify information, and enjoy entertainment.`,
    example: `An ad saying "Fluffy Pups is the BEST dog food — buy it today!" wants to PERSUADE. An encyclopedia entry about dog nutrition wants to INFORM. A story about a talking dog detective wants to ENTERTAIN.`,
    quiz: [
      { question: 'PIE stands for...', options: ['Persuade, Inform, Entertain', 'Plot, Idea, Ending', 'Print, Ink, Edit', 'Pages, Index, Extras'], answerIndex: 0, skill: "author's purpose" },
      { question: 'A news article about a new planet discovery is meant to...', options: ['Persuade', 'Inform', 'Entertain', 'Confuse'], answerIndex: 1, skill: "author's purpose" },
      { question: 'A poster saying "Vote for recycling bins in every park!" is meant to...', options: ['Entertain', 'Inform', 'Persuade', 'Summarize'], answerIndex: 2, skill: "author's purpose" },
      { question: 'Knowing the author\'s purpose helps you...', options: ['Read with the right mindset', 'Skip the ending', 'Read faster only', 'Memorize the text'], answerIndex: 0, skill: "author's purpose" },
    ],
  },
  {
    id: 'voyager-compare',
    band: 'Voyager',
    skill: 'Compare & Contrast',
    emoji: '⚖️',
    title: 'Same and different',
    body: `Comparing (finding what's the same) and contrasting (finding what's different) helps you understand ideas more deeply.

Signal words for SAME: both, similarly, alike, also.
Signal words for DIFFERENT: but, however, unlike, whereas, on the other hand.`,
    example: `"Both wolves and dogs are pack animals. However, unlike dogs, wolves avoid humans."

Same: pack animals. Different: how they treat humans. The signal words "both", "however", and "unlike" mark the trail.`,
    quiz: [
      { question: 'Which signal word shows a DIFFERENCE?', options: ['Both', 'Also', 'However', 'Alike'], answerIndex: 2, skill: 'compare' },
      { question: 'To contrast two things means to find...', options: ['What is different', 'What is the same', 'The main idea', 'The setting'], answerIndex: 0, skill: 'compare' },
      { question: '"Similarly, sharks never stop swimming." Similarly signals...', options: ['A difference', 'A similarity', 'An ending', 'A question'], answerIndex: 1, skill: 'compare' },
      { question: 'Comparing ideas helps you...', options: ['Understand them more deeply', 'Forget them', 'Skip paragraphs', 'Count words'], answerIndex: 0, skill: 'compare' },
    ],
  },
  {
    id: 'voyager-cause-effect',
    band: 'Voyager',
    skill: 'Cause & Effect',
    emoji: '🎬',
    title: 'Because this... then that',
    body: `A cause is why something happens. An effect is what happens as a result.

Signal words: because, since, so, as a result, therefore, consequently.

Ask "Why did it happen?" to find the cause. Ask "What happened next because of it?" to find the effect.`,
    example: `"Because the bridge was flooded, the team took the mountain path, which made them arrive a day late."

Cause: flooded bridge → Effect: mountain path → Effect: arriving late. Effects can become causes of new effects — like dominoes!`,
    quiz: [
      { question: 'A cause is...', options: ['Why something happens', 'What happens after', 'The main character', 'The title'], answerIndex: 0, skill: 'cause-effect' },
      { question: '"Since it snowed all night, school was canceled." The effect is...', options: ['The snow', 'School was canceled', 'The night', 'Winter'], answerIndex: 1, skill: 'cause-effect' },
      { question: 'Which is a cause-effect signal word?', options: ['Beautiful', 'Therefore', 'Purple', 'Seventeen'], answerIndex: 1, skill: 'cause-effect' },
      { question: 'Effects can become...', options: ['Causes of new effects', 'Titles', 'Characters', 'Chapters'], answerIndex: 0, skill: 'cause-effect' },
    ],
  },

  // ---------- Champion ----------
  {
    id: 'champion-theme',
    band: 'Champion',
    skill: 'Theme',
    emoji: '💎',
    title: 'The message beneath the story',
    body: `Theme is the deeper message or life lesson a story carries — bigger than the plot itself. Plot is WHAT happens; theme is what it MEANS.

Themes are universal ideas: courage, friendship, honesty, perseverance, belonging. To find one, ask: "What did the character learn? What does the author want ME to understand about life?"`,
    example: `In "The Tortoise and the Hare", the plot is a race between two animals. The theme is that steady persistence beats careless overconfidence — a lesson about life, not just racing.`,
    quiz: [
      { question: 'Theme is...', options: ['The deeper message of a story', 'A list of events', 'The setting', 'The number of chapters'], answerIndex: 0, skill: 'theme' },
      { question: 'Plot is WHAT happens; theme is...', options: ['Where it happens', 'What it means', 'Who wrote it', 'When it happens'], answerIndex: 1, skill: 'theme' },
      { question: 'Which is a theme, not a plot?', options: ['A girl finds a map', 'Honesty builds trust', 'The ship sails at dawn', 'The dog barks twice'], answerIndex: 1, skill: 'theme' },
      { question: 'To find the theme, ask...', options: ['What did the character learn?', 'How many pages are there?', 'What color is the cover?', 'Is it hardcover?'], answerIndex: 0, skill: 'theme' },
    ],
  },
  {
    id: 'champion-point-of-view',
    band: 'Champion',
    skill: 'Point of View',
    emoji: '👓',
    title: 'Whose eyes are we looking through?',
    body: `Point of view (POV) shapes everything you're told — and everything you're NOT told.

First person: "I" — a character tells their own story (but can be biased or wrong!).
Third person limited: "he/she" — follows one character's thoughts.
Third person omniscient: an all-knowing narrator sees everyone's thoughts.

Champion readers ask: "Can I trust this narrator? What might they be missing?"`,
    example: `If the wolf narrated "The Three Little Pigs", he might claim he just had a cold and sneezed too hard near some poorly built houses. Same events — completely different story. That's the power of POV.`,
    quiz: [
      { question: 'A story using "I" and "me" is told in...', options: ['First person', 'Third person', 'Second person', 'No person'], answerIndex: 0, skill: 'pov' },
      { question: 'An omniscient narrator knows...', options: ["Everyone's thoughts", 'Only one character\'s thoughts', 'Nothing', 'Only the ending'], answerIndex: 0, skill: 'pov' },
      { question: 'First-person narrators can be...', options: ['Biased or unreliable', 'Always right', 'Invisible to readers', 'Only villains'], answerIndex: 0, skill: 'pov' },
      { question: 'POV affects...', options: ['What information the reader gets', 'The paper quality', 'The font size', 'The price'], answerIndex: 0, skill: 'pov' },
    ],
  },
  {
    id: 'champion-figurative',
    band: 'Champion',
    skill: 'Figurative Language',
    emoji: '🎨',
    title: 'When words paint pictures',
    body: `Authors use figurative language to make writing vivid — words that mean more than their literal definition.

Simile: comparison using "like" or "as" — "brave as a lion"
Metaphor: direct comparison — "the classroom was a zoo"
Personification: giving human traits to non-humans — "the wind whispered"
Hyperbole: exaggeration — "I've told you a million times"`,
    example: `"The old house groaned in the storm, its windows watching the street like tired eyes."

The house can't really groan or watch — that's personification and simile working together to make the house feel alive and a little spooky.`,
    quiz: [
      { question: '"Her smile was as bright as the sun" is a...', options: ['Simile', 'Metaphor', 'Hyperbole', 'Fact'], answerIndex: 0, skill: 'figurative' },
      { question: '"The thunder grumbled angrily" is...', options: ['Personification', 'A simile', 'A summary', 'Alliteration'], answerIndex: 0, skill: 'figurative' },
      { question: '"My backpack weighs a ton!" is...', options: ['Hyperbole', 'A fact', 'Personification', 'A theme'], answerIndex: 0, skill: 'figurative' },
      { question: 'A metaphor compares two things...', options: ['Directly, without like or as', 'Using like or as', 'Using numbers', 'Using rhyme'], answerIndex: 0, skill: 'figurative' },
    ],
  },
]

export function lessonsForBand(bandName) {
  return LESSONS.filter((l) => l.band === bandName)
}

export function lessonById(id) {
  return LESSONS.find((l) => l.id === id)
}

/* ---------- Diagnostic question bank (static fallback + primary flow) ----------
 * Passages step up in difficulty; scoring maps to a lexile estimate.
 */
export const DIAGNOSTIC = [
  {
    level: 'Sprout',
    lexile: 400,
    passage: `Pip the puppy found a red ball under the porch. He rolled it with his nose all the way to the garden. Then he barked until his best friend, a cat named Juno, came outside to play too.`,
    questions: [
      { question: 'What did Pip find?', options: ['A bone', 'A red ball', 'A stick', 'A shoe'], answerIndex: 1 },
      { question: 'Who is Juno?', options: ['A puppy', 'A bird', 'A cat', 'A kid'], answerIndex: 2 },
    ],
  },
  {
    level: 'Explorer',
    lexile: 650,
    passage: `Maya had practiced her lines for weeks, but standing behind the heavy stage curtain, her stomach fluttered like a jar full of moths. She peeked out at the crowded auditorium. Then she remembered what her grandmother always said: courage isn't the absence of fear — it's taking one step anyway. Maya took a deep breath and stepped into the spotlight.`,
    questions: [
      { question: 'How does Maya feel behind the curtain?', options: ['Bored', 'Nervous', 'Angry', 'Sleepy'], answerIndex: 1 },
      { question: 'What does her grandmother\'s saying mean?', options: ['Never be afraid', 'Being brave means acting despite fear', 'Avoid the stage', 'Fear is silly'], answerIndex: 1 },
    ],
  },
  {
    level: 'Voyager',
    lexile: 900,
    passage: `The lighthouse keeper's log had gone unwritten for three days — an anomaly the inspector could not ignore. Everything else appeared orderly: the lamp was polished, provisions were neatly shelved, and the keeper's coat still hung by the door. It was precisely this tidiness that unsettled her. A man who abandoned his post rarely left it immaculate; a man who intended to return rarely missed a single entry, let alone three.`,
    questions: [
      { question: 'What makes the inspector suspicious?', options: ['The mess everywhere', 'The tidiness combined with missing log entries', 'A broken lamp', 'The keeper\'s rude note'], answerIndex: 1 },
      { question: '"Anomaly" most nearly means...', options: ['Something unusual', 'A celebration', 'A repair', 'A schedule'], answerIndex: 0 },
    ],
  },
  {
    level: 'Champion',
    lexile: 1100,
    passage: `It is a peculiar irony of progress that each solution begets its own species of problem. The dams that tamed the river's floods also starved the delta of silt; the fields that fed millions leached quietly into the groundwater. To call such consequences unforeseen is often generous — more frequently they were foreseen and deemed acceptable, a debt assigned to a future that had no seat at the table.`,
    questions: [
      { question: 'The author\'s main argument is that...', options: ['Progress solves everything', 'Solutions often create new problems, sometimes knowingly', 'Dams are always good', 'The future is bright'], answerIndex: 1 },
      { question: '"A debt assigned to a future that had no seat at the table" suggests...', options: ['Future generations bear costs they never agreed to', 'Banks control rivers', 'Tables are important', 'Debts are always repaid'], answerIndex: 0 },
    ],
  },
]
