import { IELTSTest, ReadingPassage, SpeakingTaskData, WritingTaskData } from '../types';
import { buildOfficialQuestions } from './mockTestFactory';

const LISTENING_ANSWERS = [
  "continental",
  "buffet dinner",
  "Common",
  "booked online",
  "all meals",
  "lounge",
  "Maple View",
  "pedestrian",
  "bank holidays",
  "in advance",
  "G",
  "H",
  "E",
  "F",
  "C",
  "B",
  "B",
  "A",
  "C",
  "C",
  "A",
  "B|E",
  "B|E",
  "A|B",
  "A|B",
  "C",
  "B",
  "A",
  "A",
  "C",
  "everyday lives",
  "co-operate with",
  "zero validity",
  "element of",
  "health organisations",
  "cultural bias|cultural factors",
  "coloured cards",
  "convincing tool",
  "groups of people",
  "lack of"
];
const READING_ANSWERS = [
  "FALSE",
  "FALSE",
  "TRUE",
  "TRUE",
  "NOT GIVEN",
  "TRUE",
  "NOT GIVEN",
  "FALSE",
  "develop new ideas",
  "problem-solving",
  "C",
  "B",
  "D",
  "C",
  "F",
  "G",
  "A",
  "D",
  "B",
  "FALSE",
  "TRUE",
  "TRUE",
  "FALSE",
  "FALSE",
  "NOT GIVEN",
  "D",
  "B",
  "B",
  "A",
  "B",
  "B",
  "A",
  "C",
  "C",
  "B",
  "B",
  "NOT GIVEN",
  "FALSE",
  "FALSE",
  "TRUE"
];

const READING_PASSAGES: ReadingPassage[] = [
  {
    "id": "t2-p1",
    "title": "Daydreaming",
    "partNumber": 1,
    "paragraphs": [
      {
        "id": "source-text",
        "type": "text",
        "text": "; | on imagination to\nEveryone daydreams sometimes. We sit or lie down, close our eyes and use edt tee cack Most\n“| think about something that might happen in the future or could have happene ik “a nappy if\ndaydreaming is pleasant. We would like the daydream to happen and we would be ean some.\nit did actually happen. We might daydream that we are in another person's place, ih oe than\nt | thing that we have always wanted to do, or that other people like or admire us much m\nthey normally do.\nreel | Daydreams are not dreams, because we can only daydream if we are awake. Also, we choose what\n~ =, | our daydreams will be about, which we cannot usually do with dreams. With many daydreams,\nwe know that what we imagine is unlikely to happen. At least, if it does happen, it probably will\ne Not do so in the way we want it to. However, some daydreams are about things that are likely to\n| happen. With these, our daydreams often help us to work out what we want to do, or how to do\nit to get the best results. So, these daydreams are helpful. We use our imagination to help us\nunderstand the world and other people.\nDaydreams can help people to be Creative. People in creative or artistic careers, such as composers,\nnovelists and filmmakers, develop new ideas through daydreaming. This is also true of research\nscientists and mathematicians. In fact, Albert Einstein said that imagination is more important\nthan knowledge because knowledge is limited whereas imagination is not.\nResearch in the 1980s showed that most daydreams are about ordinary, everyday events. It also\nshowed that over 75% of workers in so-called ‘boring jobs’, such as lorry drivers and security guards, —\nspend a lot of time daydreaming in order to make their time at work more interesting. Recent\nresearch has also shown that daydreaming has a Positive effect on the brain. Experiments with\nMRI brain scans show that the parts of the brain linked with complex problem-solving are more\nactive during daydreaming. Researchers conclude that daydreaming is an activity in which the\nbrain consolidates learning. In this respect, daydreaming is the same as dreaming during sleep,\n: Although there do seem to be many advantages with daydreamin in iti i\nNi man\na bad thing to do. One reason for this is that when you are daydreaming you are roe conseted\nthe 19th century, for example, People who daydreamed a lot Were judged to be lazy. This ha a d\nin Particular when people started working in factories on assembly lines. When you work o :\nemp ine, hie is one small task again and again, every time exactly the same. It is cathe\nrepetitive and, o Viously, you Cannot be i A :\nbenefit in daydreaming.” y creative. So many people decided that there was no\n: Other people have Said that daydreami i\n. ng leads to , woe .\nEscapist people spend a lot of time living in a dream * ld in ay oaths pe ealthy, either.\ninstead of trying to deal with the problems they foeey M which they are successful and Popular,\n__ | to be unhappy and are unable or unwilling to improve th . in brug Such people often seem\nthat people who often daydream have fewer Close frie dds the atheros Tn tet tudes show\ndo not have any close friends at all. Nes than other people, in fact, they often\nSe"
      }
    ]
  },
  {
    "id": "t2-p2",
    "title": "TRICKY SUMS AND PSYCHOLOGY",
    "partNumber": 2,
    "paragraphs": [
      {
        "id": "source-text",
        "type": "text",
        "text": "- A In their first years of studying mathematics at school, children all over the world usually have\nBf A) to learn the times table, also known as the multiplication table, which shows what you get when\noe a you multiply numbers together. Children have traditionally learned their times table by going\nB i from ‘1 times 1 is 1’ all the way up to ‘12 times 12 is 144’.\ni | — B Times tables have been around for a very long time now. The oldest known tables using base\ne eae 10 numbers, the base that is now used everywhere in the world, are written on bamboo strips\nf F as: dating from 305 BC, found in China. However, in many European cultures the times table is\noi & named after the Ancient Greek mathematician and philosopher Pythagoras (570-495 BC).\na ellen And so it is called the Table of Pythagoras in many languages, including French and Italian.\nC In 1820 in his book The Philosophy of Arithmetic, the mathematician John Leslie recommended\nLr that young pupils memorise the times table up to 25 x 25. Nowadays, however, educators\n5 p generally believe it is important for children to memorise the table up to 9 x 9, 10 x 10 or 12\nt x 12.\n!\nD The current aim in the UK is for school pupils to know all their times tables up to 12 x 12\nby the age of nine. However, many people do not know them, even as adults. Recently, some\nif politicians have been asked arithmetical questions of this kind. For example, in 1998, the schools\nNy minister Stephen Byers was asked the answer to 7 x 8. He got the answer wrong, saying 54\n; rather than 56, and everyone laughed at him.\nia E In 2014, a young boy asked the UK Chancellor George Osborne the exact same question. As\nhe had passed A-level maths and was in charge of the UK’s economic policies at the time, you\nwould expect him to know the answer. However, he simply said, ‘I've made it a rule in life not\n: to answer such questions.’\nF Why would a politician refuse to answer such a question? It is certainly true that some sums\n@ } are much harder than others. Research has shown that learning and remembering sums\ninvolving 6, 7, 8 and 9 tends to be harder than remembering sums involving other numbers.\nAnd it is even harder when 6, 7, 8 and 9 are multiplied by each other. Studies often find that\n: the hardest sum is 6 x 8, with 7 x 8 not far behind. However, even though 7 x 8 is a relatively\ndifficult sum, it is unlikely that George Osborne did not know the answer. So there must be\nsome other reason why he refused to answer the question.\nG The answer is that Osborne was being ‘put on the spot’ and he didn’t like it. It is well known\nthat when there is a lot of pressure to do something right, people often have difficulty doing\nsomething that they normally find easy. When you put someone on the spot and ask such a\nquestion, it causes stress. The person’s heart beats faster and their adrenalin levels go up. As\na result, people will often make mistakes that they would not normally make. This is called\nchoking’. Choking eien happens in sport, such as when a footballer takes a crucial penalty. In\nthe same way, the boy’s question put Osborne under great pressure. He knew it would be a\ndisaster for him if he got the answer to such a simple question wrong and feared that he\nmight choke. And that is why he refused to answer the question.\n(azz\n—a"
      }
    ]
  },
  {
    "id": "t2-p3",
    "title": "Care in the Community",
    "partNumber": 3,
    "paragraphs": [
      {
        "id": "source-text",
        "type": "text",
        "text": "aay ‘Bedlam’ is a word that has become synonymous in the English language with chaos and disorder. The\n* 7, term itself derives from the shortened name for a former 16th century London institution for the men-\n' a tally ill, known as St. Mary of Bethlehem. This institution was so notorious that its name was to become\noe a byword for mayhem. Patient ‘treatment’ amounted to little more than legitimised abuse. Inmates were\naf ad beaten and forced to live in unsanitary conditions, whilst others were placed on display to a curious pub-\nit ; lic as a side-show. There is little indication to suggest that other institutions.founded at around the same\nfi fs time in other European countries were much better.\n; 4 Even up until the mid-twentieth century, institutions for the mentally ill were regarded as being more\nee places of isolation and punishment than healing and solace. In popular literature of the Victorian era,\n\" that reflected true-life events, individuals were frequently sent to the ‘madhouse’ as a legal means of per-\n; manently disposing of an unwanted heir or spouse. Later, in the mid-twentieth century, institutes for\n; the mentally ill regularly carried out invasive brain surgery known as a ‘lobotomy’ on violent patients\nk without their consent. The aim was to ‘calm’ the patient but ended up producing a patient that was little\n. 4 more than a zombie. Such a procedure is well documented to devastating effect in the film One Flew\n: Over the Cuckoo’s Nest. Little wonder then that the appalling catalogue of treatment of the mentally ill\nled to a call for change from social activists and a system that largely relied on locking patients away\nfrom society in large institutions gave way to a policy of care in the community in Britain in the 1980s.\nCare in the community schemes sought to move patients out of hospitals and provide them with support\nwithin their own communities. In practice, however, the implementation of these schemes was often\npoorly funded and badly organised. Many patients found themselves living alone in inadequate housing,\nwithout enough professional support. Family members were frequently expected to take on most of the\nresponsibility for care. Critics argued that some vulnerable people had simply been transferred from one\nform of neglect to another.\nOver time, community care has developed. Modern schemes can include social workers, psychiatric nurses,\ncommunity mental-health teams, supported accommodation and day centres. The aim is to help patients live\nas independently as possible while maintaining access to treatment and assistance. For many people this\nrepresents a substantial improvement over institutional life because it allows greater personal freedom,\nmore contact with family and friends, and a stronger connection with ordinary social life.\nNevertheless, care in the community remains controversial. It does not suit every patient and its success\ndepends greatly on the availability of resources and a reliable network of professional and family support.\nThe debate is therefore not simply about whether community care is good or bad, but about the conditions\nthat are required for it to work effectively."
      }
    ]
  }
];

const WRITING_TASKS: WritingTaskData[] = [
  { taskNumber: 1, title: 'Academic Writing Task 1', prompt: "The graph below shows relative rates of language acquisition according to different study methods. Summarise the information by selecting and reporting the main features and make comparisons where relevant.\n\nSOURCE DATA / VISUAL LABELS TRANSCRIBED FROM THE SUPPLIED ORIGINAL PAGE:\nSpeed of Language Learning\nLevels shown: Beginner (A0), Elementary (A1), Pre-intermediate (A2), Intermediate (B1), Upper Intermediate.\nMethods compared: Studying 1 to 1; Studying in a group at a language school; Studying alone without a teacher.\nHorizontal axis: Number of Hours (approximately 1 to 289 hours).", minWordCount: 150, timeLimitMinutes: 20 },
  { taskNumber: 2, title: 'Academic Writing Task 2', prompt: "Parents are often over-anxious to teach their children to speak. If children are ‘slow-developers’ parents will often allow psychologists and schools to intervene and give their children speech therapy. Do you think children develop at different rates and so should be left to themselves to acquire language skills, or, is such intervention justified? Discuss both views and give your own opinion.", minWordCount: 250, timeLimitMinutes: 40 }
];

const SPEAKING_TASKS: SpeakingTaskData[] = [
  { partNumber: 1, title: 'Speaking Part 1', topic: 'Introduction and Interview', questions: [
  "Which skill do you find the easiest to acquire when learning a new language? Why?",
  "Do you think language skills can be learned as effectively at any age? Why/Why not?",
  "In your opinion, does learning one language make it easier to acquire others? Why/Why not?",
  "Would your life be easier if you were a polyglot (someone who knows several languages fluently)? Why/Why not?",
  "If you could choose between being fluent in English or your own language, which would you choose and why?",
  "Do you think language ability is inherited or learned? Why/Why not?",
  "In your opinion does text speak in mobile messaging teach bad language habits? Why/Why not?",
  "Should parents ensure children read books to improve their language skills? Why/Why not?",
  "In the future, will translation services like Google Translate make language learning redundant? Why/Why not?",
  "Do you think that animals can acquire human language? Why/Why not?"
] },
  { partNumber: 2, title: 'Speaking Part 2', topic: "Describe a particularly memorable language lesson that you had.", cueCard: { mainTopic: "Describe a particularly memorable language lesson that you had.", bulletPoints: ["why it was so memorable", "who gave the lesson", "how the lesson helped you improve or focus on an aspect of language"] }, questions: [], prepTimeSeconds: 60, speakTimeSeconds: 120 },
  { partNumber: 3, title: 'Speaking Part 3', topic: 'Two-way Discussion', questions: [
  "Should dead languages, such as Latin and Ancient Greek, be taught in schools? Why/Why not?",
  "Is more importance given to science and technology than to language learning in schools?",
  "Do cultural exchanges aid language acquisition? Why/Why not?",
  "Can a non-native speaker ever become as fluent as a native speaker? Why/Why not?",
  "How could language learning be taught more effectively in schools?",
  "Is it worth learning a language if you are past retirement age? Why/Why not?",
  "Would it be better if everyone just learnt one universal language in schools? Why/Why not?"
] }
];

export const ACADEMIC_TEST_2: IELTSTest = {
  id: 'jj-ielts-upgrade-practice-test-2',
  title: 'IELTS Upgrade Academic - Practice Test 2',
  module: 'academic',
  status: 'draft',
  assignedToAll: false,
  durationMinutes: 164,
  sectionTimers: { listening: 30, reading: 60, writing: 60, speaking: 14 },
  description: 'IELTS Upgrade Academic Practice Test 2. Reconstructed from the supplied official scan and official answer key. Listening audio is intentionally blank for Admin attachment.',
  listeningData: [{ partNumber: 1, title: 'Listening Test - Practice Test 2', audioUrl: '', audioDuration: 0, instructions: 'Attach the complete Practice Test 2 Listening recording in Admin.' }],
  listeningQuestions: buildOfficialQuestions(2, 'listening', LISTENING_ANSWERS, [
    { start: 1, end: 10, groupId: 't2-listening-1', instruction: 'SECTION 1 - Questions 1-10', sourceText: "SECTION 1 - Questions 1-10\nQuestions 1-10\nComplete the notes below. Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.\nAccommodation / booking details include meal type, room facilities, location and booking arrangements.\nUse the numbered fields 1-10 below to enter the answers while listening." },
    { start: 11, end: 20, groupId: 't2-listening-2', instruction: 'SECTION 2 - Questions 11-20', sourceText: "SECTION 2 - Questions 11-20\nQuestions 11-16 are a map/plan matching task with options A-H. Questions 17-20 are multiple-choice questions.\nRefer to the original labels shown in this section while listening; choose the corresponding letter for each numbered answer." },
    { start: 21, end: 30, groupId: 't2-listening-3', instruction: 'SECTION 3 - Questions 21-30', sourceText: "SECTION 3 - Questions 21-30\nQuestions include multiple-choice and paired-option selections. Read the source question wording and choose the appropriate answer letters in the numbered controls below." },
    { start: 31, end: 40, groupId: 't2-listening-4', instruction: 'SECTION 4 - Questions 31-40', sourceText: "Questions 31-32\nComplete the sentences below. Write NO MORE THAN TWO WORDS for each answer.\n31 It seems that personality tests are part of our ______ as they fulfil a basic human need to understand motivation.\n32 Understanding why we communicate and ______ others, in the way that we do, is revealed by personality tests.\n\nQuestions 33-40\nComplete the table about personality-test types including Graphology, Rorschach/Ink blot, Luscher colour test and TAT. Write NO MORE THAN THREE WORDS for each answer." }
  ]),
  readingPassages: READING_PASSAGES,
  readingQuestions: buildOfficialQuestions(2, 'reading', READING_ANSWERS, [
    { start: 1, end: 13, groupId: 't2-reading-1', instruction: 'Questions 1-13', sourceText: "Questions 1-8\nDo the following statements agree with the information given in the text? Write TRUE, FALSE or NOT GIVEN.\n1 People usually daydream when they are walking around.\n2 Some people can daydream when they are asleep.\n3 Some daydreams help us to be more successful in our lives.\n4 Most lorry drivers daydream in their jobs to make them more interesting.\n5 Factory workers daydream more than lorry drivers.\n6 Daydreaming helps people to be creative.\n7 Old people daydream more than young people.\n8 Escapist people are generally very happy.\n\nQuestions 9-10\nComplete the sentences below. Choose NO MORE THAN THREE WORDS from the text for each answer.\n9 Writers, artists and other creative people use daydreaming to ______.\n10 The areas of the brain used in daydreaming are also used for complicated ______.\n\nQuestions 11-13\nChoose the correct letter, A, B, C or D.\n11 Daydreams are: A dreams when asleep in daytime; B about sad past events; C often about things we would like to happen; D activities only a few people can do.\n12 In the nineteenth century, many people believed daydreaming was: A helpful in factory work; B a way of avoiding work; C something few people did; D a healthy activity.\n13 People who daydream a lot: A usually have creative jobs; B are much happier; C are less intelligent; D do not have as many friends.", passageId: 't2-p1', partNumber: 1 },
    { start: 14, end: 26, groupId: 't2-reading-2', instruction: 'Questions 14-26', sourceText: "Questions 14-19\nThe text has seven paragraphs, A-G. Which paragraph contains the following information?\n14 a 19th-century opinion of what children should learn\n15 the most difficult sums\n16 the effect of pressure on doing something\n17 how children learn the times table\n18 a politician who got a sum wrong\n19 a history of the times table\n\nQuestions 20-25\nWrite TRUE, FALSE or NOT GIVEN.\n20 Pythagoras invented the times table in China.\n21 Stephen Byers and George Osborne were asked the same question.\n22 All children in the UK have to learn the multiplication table.\n23 George Osborne did not know the answer to 7 x 8.\n24 7 x 8 is the hardest sum that children have to learn.\n25 Stephen Byers got the sum wrong because he choked.\n\nQuestion 26\nChoose the correct letter, A, B, C or D, according to the original question page.", passageId: 't2-p2', partNumber: 2 },
    { start: 27, end: 40, groupId: 't2-reading-3', instruction: 'Questions 27-40', sourceText: "Questions 27-31\nChoose the correct letter, A, B, C or D about the Care in the Community passage.\n\nQuestions 32-36\nMatch each statement to the correct person:\nA Dr. Mayalla\nB Anita Brown\nC Bob Ratchett\n\nQuestions 37-40\nWrite TRUE, FALSE or NOT GIVEN.\n37 There is a better understanding of the dynamics of mental illness today.\n38 Community care schemes do not provide adequate psychological support for patients.\n39 Dr. Mayalla believes that the scheme is less successful than in the past.\n40 The goal of community care schemes is to make patients less dependent on the system.", passageId: 't2-p3', partNumber: 3 }
  ]),
  writingTasks: WRITING_TASKS,
  speakingTasks: SPEAKING_TASKS,
  createdAt: '2026-09-09T00:00:00.000Z'
};
