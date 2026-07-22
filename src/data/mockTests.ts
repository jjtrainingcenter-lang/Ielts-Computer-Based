import { IELTSTest } from '../types';

export const ACADEMIC_TEST_1: IELTSTest = {
  id: 'jj-ielts-acad-01',
  title: 'JJ Academy Academic Practice Test 1',
  module: 'academic',
  
  // Listening Section
  listeningData: [
    {
      partNumber: 1,
      title: 'Part 1: Student Accommodation Enquiry',
      audioDuration: 360,
      instructions: 'Questions 1–10. Answer the questions below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
      transcript: `[Receptionist]: Good morning, Student Accommodation Office. How can I help you?
[Student]: Hello, I'd like to ask about renting a room near the university for the upcoming semester. My name is Mark Turner.
[Receptionist]: Welcome, Mark. Let me take down your details. What type of room are you looking for?
[Student]: I prefer a single studio room with an attached bathroom if possible.
[Receptionist]: Great. We have availability at Oakwood Residence. The address is 45 Station Road, post code CB2 4PT.
[Student]: Sounds good. What is the monthly rent?
[Receptionist]: For a studio room, the rent is 650 pounds per month, which includes utility bills and internet.
[Student]: Perfect. Is there a deposit required?
[Receptionist]: Yes, a security deposit of 300 pounds is payable upon signing the tenancy contract.
[Student]: Okay. What facilities are available in the building?
[Receptionist]: There is a communal study room on the ground floor, a laundry room with washing machines, and a secure bicycle shed in the rear garden.
[Student]: That is convenient. When is the earliest move-in date?
[Receptionist]: The rooms will be ready from the 15th of September.
[Student]: Great, I will submit my application online today. Thank you!`
    },
    {
      partNumber: 2,
      title: 'Part 2: City Museum Guided Tour Information',
      audioDuration: 420,
      instructions: 'Questions 11–20. Choose the correct letter, A, B, or C.',
      transcript: `[Guide]: Welcome everyone to the City Maritime Museum. Before we begin our tour, I would like to give you some background on the newly renovated exhibits...`
    },
    {
      partNumber: 3,
      title: 'Part 3: Academic Tutor Discussion on Artificial Intelligence',
      audioDuration: 480,
      instructions: 'Questions 21–30. Complete the notes below. Write NO MORE THAN THREE WORDS.',
      transcript: `[Professor]: Today we are evaluating the socio-economic impacts of machine learning algorithms in healthcare...`
    },
    {
      partNumber: 4,
      title: 'Part 4: Scientific Lecture on Coral Reef Conservation',
      audioDuration: 540,
      instructions: 'Questions 31–40. Complete the summary below. Write ONE WORD ONLY for each answer.',
      transcript: `[Lecturer]: Good afternoon. Coral reefs occupy less than 0.1 percent of the ocean floor, yet they harbor over 25 percent of marine species...`
    }
  ],

  listeningQuestions: [
    {
      id: 'l1',
      section: 'listening',
      questionNumber: 1,
      partNumber: 1,
      instruction: 'Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
      questionText: 'Name of applicant: Mark __________',
      type: 'fill-blank',
      correctAnswer: 'Turner',
      explanation: 'In Part 1, the applicant states his name is Mark Turner.'
    },
    {
      id: 'l2',
      section: 'listening',
      questionNumber: 2,
      partNumber: 1,
      instruction: 'Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
      questionText: 'Preferred accommodation type: Single __________ room',
      type: 'fill-blank',
      correctAnswer: 'studio',
      explanation: 'Mark specifies he prefers a single studio room.'
    },
    {
      id: 'l3',
      section: 'listening',
      questionNumber: 3,
      partNumber: 1,
      instruction: 'Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
      questionText: 'Location: 45 __________ Road',
      type: 'fill-blank',
      correctAnswer: 'Station',
      explanation: 'The address given by the receptionist is 45 Station Road.'
    },
    {
      id: 'l4',
      section: 'listening',
      questionNumber: 4,
      partNumber: 1,
      instruction: 'Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
      questionText: 'Monthly rent (including utilities): £__________',
      type: 'fill-blank',
      correctAnswer: '650',
      explanation: 'The rent specified is 650 pounds per month.'
    },
    {
      id: 'l5',
      section: 'listening',
      questionNumber: 5,
      partNumber: 1,
      instruction: 'Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
      questionText: 'Security deposit amount: £__________',
      type: 'fill-blank',
      correctAnswer: '300',
      explanation: 'The deposit required is 300 pounds.'
    },
    {
      id: 'l6',
      section: 'listening',
      questionNumber: 6,
      partNumber: 1,
      instruction: 'Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
      questionText: 'Shared facility on ground floor: __________ room',
      type: 'fill-blank',
      correctAnswer: 'study',
      explanation: 'The receptionist mentions a communal study room on the ground floor.'
    },
    {
      id: 'l7',
      section: 'listening',
      questionNumber: 7,
      partNumber: 1,
      instruction: 'Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
      questionText: 'Storage available in garden: Secure __________ shed',
      type: 'fill-blank',
      correctAnswer: 'bicycle',
      explanation: 'A secure bicycle shed is located in the rear garden.'
    },
    {
      id: 'l8',
      section: 'listening',
      questionNumber: 8,
      partNumber: 1,
      instruction: 'Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
      questionText: 'Earliest move-in date: 15th of __________',
      type: 'fill-blank',
      correctAnswer: 'September',
      explanation: 'The move-in date starts from the 15th of September.'
    },
    {
      id: 'l9',
      section: 'listening',
      questionNumber: 9,
      partNumber: 1,
      instruction: 'Choose the correct option.',
      questionText: 'How will Mark submit his application?',
      type: 'multiple-choice',
      options: [
        { value: 'A', label: 'A) In person at the office' },
        { value: 'B', label: 'B) Online via the portal' },
        { value: 'C', label: 'C) By post' }
      ],
      correctAnswer: 'B',
      explanation: 'Mark says: "I will submit my application online today."'
    },
    {
      id: 'l10',
      section: 'listening',
      questionNumber: 10,
      partNumber: 1,
      instruction: 'Choose the correct option.',
      questionText: 'What is included in the monthly rent fee?',
      type: 'multiple-choice',
      options: [
        { value: 'A', label: 'A) Utility bills and internet' },
        { value: 'B', label: 'B) Laundry and gym access' },
        { value: 'C', label: 'C) Breakfast and parking' }
      ],
      correctAnswer: 'A',
      explanation: 'The rent includes utility bills and internet connection.'
    },
    // Questions 11 to 20 (Part 2)
    {
      id: 'l11',
      section: 'listening',
      questionNumber: 11,
      partNumber: 2,
      instruction: 'Choose the correct letter, A, B, or C.',
      questionText: 'When was the Maritime Museum originally built?',
      type: 'multiple-choice',
      options: [
        { value: 'A', label: 'A) 1845' },
        { value: 'B', label: 'B) 1890' },
        { value: 'C', label: 'C) 1920' }
      ],
      correctAnswer: 'A',
      explanation: 'The museum main wing was constructed in 1845.'
    },
    {
      id: 'l12',
      section: 'listening',
      questionNumber: 12,
      partNumber: 2,
      instruction: 'Choose the correct letter, A, B, or C.',
      questionText: 'What feature makes the new exhibit gallery unique?',
      type: 'multiple-choice',
      options: [
        { value: 'A', label: 'A) Interactive touch-screen displays' },
        { value: 'B', label: 'B) Undersea glass tunnel walkthrough' },
        { value: 'C', label: 'C) Live ship restoration workshop' }
      ],
      correctAnswer: 'B',
      explanation: 'Visitors can walk through the glass underwater tunnel exhibit.'
    },
    {
      id: 'l13',
      section: 'listening',
      questionNumber: 13,
      partNumber: 2,
      instruction: 'Choose the correct letter, A, B, or C.',
      questionText: 'Where are the historic navigation charts located?',
      type: 'multiple-choice',
      options: [
        { value: 'A', label: 'A) First Floor East Wing' },
        { value: 'B', label: 'B) Ground Floor Main Hall' },
        { value: 'C', label: 'C) Basement Vault Gallery' }
      ],
      correctAnswer: 'A',
      explanation: 'Navigation maps and charts are preserved in the First Floor East Wing.'
    },
    {
      id: 'l14',
      section: 'listening',
      questionNumber: 14,
      partNumber: 2,
      instruction: 'Fill in the blank with ONE WORD ONLY.',
      questionText: 'The special exhibition on polar exploration closes in ________.',
      type: 'fill-blank',
      correctAnswer: 'October',
      explanation: 'The guide highlights the exhibition closes at the end of October.'
    },
    {
      id: 'l15',
      section: 'listening',
      questionNumber: 15,
      partNumber: 2,
      instruction: 'Fill in the blank with ONE WORD ONLY.',
      questionText: 'Cafeteria discount is provided for museum members and ________.',
      type: 'fill-blank',
      correctAnswer: 'students',
      explanation: 'Full-time students with valid ID receive a 15% cafe discount.'
    },
    // Questions 16-20
    {
      id: 'l16', section: 'listening', questionNumber: 16, partNumber: 2, instruction: 'Write ONE WORD ONLY.', questionText: 'Main courtyard monument honors famous sea ________.', type: 'fill-blank', correctAnswer: 'captains', explanation: 'Dedicated to 19th-century sea captains.'
    },
    {
      id: 'l17', section: 'listening', questionNumber: 17, partNumber: 2, instruction: 'Write ONE WORD ONLY.', questionText: 'Guided tours depart every ________ minutes.', type: 'fill-blank', correctAnswer: '30', explanation: 'Tours run every 30 minutes.'
    },
    {
      id: 'l18', section: 'listening', questionNumber: 18, partNumber: 2, instruction: 'Select TRUE or FALSE.', questionText: 'Photography is allowed in all areas without flash.', type: 'true-false-not-given', options: [{value:'TRUE', label:'TRUE'}, {value:'FALSE', label:'FALSE'}, {value:'NOT GIVEN', label:'NOT GIVEN'}], correctAnswer: 'TRUE', explanation: 'Non-flash photography is permitted in all public galleries.'
    },
    {
      id: 'l19', section: 'listening', questionNumber: 19, partNumber: 2, instruction: 'Select option.', questionText: 'What is required for group bookings over 10 people?', type: 'multiple-choice', options: [{value:'A', label:'A) Advance reservation'}, {value:'B', label:'B) Deposit fee'}, {value:'C', label:'C) Tour guide hire'}], correctAnswer: 'A', explanation: 'Advance booking is mandatory for large groups.'
    },
    {
      id: 'l20', section: 'listening', questionNumber: 20, partNumber: 2, instruction: 'Fill in blank.', questionText: 'Gift shop proceeds support marine wildlife ________.', type: 'fill-blank', correctAnswer: 'research', explanation: 'Proceeds directly fund coastal research projects.'
    },
    // Questions 21-30 (Part 3)
    {
      id: 'l21', section: 'listening', questionNumber: 21, partNumber: 3, instruction: 'Choose the correct letter.', questionText: 'What is the students main concern regarding AI in diagnosis?', type: 'multiple-choice', options: [{value:'A', label:'A) High implementation costs'}, {value:'B', label:'B) Algorithmic bias in training data'}, {value:'C', label:'C) Lack of trained medical staff'}], correctAnswer: 'B', explanation: 'The debate centers on algorithmic bias in historical dataset samples.'
    },
    {
      id: 'l22', section: 'listening', questionNumber: 22, partNumber: 3, instruction: 'Fill in blank.', questionText: 'The research project focuses on machine learning in ________ imaging.', type: 'fill-blank', correctAnswer: 'diagnostic', explanation: 'Diagnostic radiology and scanning techniques.'
    },
    {
      id: 'l23', section: 'listening', questionNumber: 23, partNumber: 3, instruction: 'Fill in blank.', questionText: 'Initial accuracy rate achieved by model was ________ percent.', type: 'fill-blank', correctAnswer: '94', explanation: 'Model accuracy reached 94% in initial trial testing.'
    },
    {
      id: 'l24', section: 'listening', questionNumber: 24, partNumber: 3, instruction: 'Choose letter.', questionText: 'Who will review the ethical framework draft?', type: 'multiple-choice', options: [{value:'A', label:'A) Department ethics committee'}, {value:'B', label:'B) External hospital board'}, {value:'C', label:'C) Student peer group'}], correctAnswer: 'A', explanation: 'Submitted to the university ethics committee.'
    },
    {
      id: 'l25', section: 'listening', questionNumber: 25, partNumber: 3, instruction: 'Fill in blank.', questionText: 'Final submission deadline is the end of ________.', type: 'fill-blank', correctAnswer: 'May', explanation: 'Due date confirmed for end of May.'
    },
    { id: 'l26', section: 'listening', questionNumber: 26, partNumber: 3, instruction: 'Fill in blank.', questionText: 'Data collected from ________ hospitals nationwide.', type: 'fill-blank', correctAnswer: 'twelve', explanation: 'Data sourced from 12 medical facilities.' },
    { id: 'l27', section: 'listening', questionNumber: 27, partNumber: 3, instruction: 'Select option.', questionText: 'Which software was chosen for statistical evaluation?', type: 'multiple-choice', options: [{value:'A', label:'A) Python Scikit'}, {value:'B', label:'B) R-Studio'}, {value:'C', label:'C) SPSS'}], correctAnswer: 'A', explanation: 'Python data analysis pipeline was selected.' },
    { id: 'l28', section: 'listening', questionNumber: 28, partNumber: 3, instruction: 'Fill in blank.', questionText: 'Primary obstacle was formatting unorganized ________ records.', type: 'fill-blank', correctAnswer: 'patient', explanation: 'Unstructured medical notes required extensive cleaning.' },
    { id: 'l29', section: 'listening', questionNumber: 29, partNumber: 3, instruction: 'Fill in blank.', questionText: 'Secondary supervisor expertise is in ________ ethics.', type: 'fill-blank', correctAnswer: 'medical', explanation: 'Professor Davies specializes in bioethics.' },
    { id: 'l30', section: 'listening', questionNumber: 30, partNumber: 3, instruction: 'Choose letter.', questionText: 'Next project phase involves clinical ________.', type: 'multiple-choice', options: [{value:'A', label:'A) Field trials'}, {value:'B', label:'B) Patent filing'}, {value:'C', label:'C) Commercial release'}], correctAnswer: 'A', explanation: 'Real-world clinical trial validation.' },

    // Questions 31-40 (Part 4)
    { id: 'l31', section: 'listening', questionNumber: 31, partNumber: 4, instruction: 'Write ONE WORD ONLY.', questionText: 'Coral reefs act as natural underwater ________ protecting shorelines.', type: 'fill-blank', correctAnswer: 'barriers', explanation: 'Reefs serve as wave break barriers.' },
    { id: 'l32', section: 'listening', questionNumber: 32, partNumber: 4, instruction: 'Write ONE WORD ONLY.', questionText: 'Ocean acidification reduces essential ________ required for shell growth.', type: 'fill-blank', correctAnswer: 'calcium', explanation: 'Carbonate/calcium depletion impedes skeleton formation.' },
    { id: 'l33', section: 'listening', questionNumber: 33, partNumber: 4, instruction: 'Write ONE WORD ONLY.', questionText: 'Symbiotic algae provide corals with vibrant color and ________.', type: 'fill-blank', correctAnswer: 'nutrients', explanation: 'Zooxanthellae supply essential nutrients via photosynthesis.' },
    { id: 'l34', section: 'listening', questionNumber: 34, partNumber: 4, instruction: 'Write ONE WORD ONLY.', questionText: 'Thermal stress triggers expulsion resulting in coral ________.', type: 'fill-blank', correctAnswer: 'bleaching', explanation: 'Bleaching occurs when water temperatures rise.' },
    { id: 'l35', section: 'listening', questionNumber: 35, partNumber: 4, instruction: 'Write ONE WORD ONLY.', questionText: 'Artificial reefs are constructed using durable 3D printed ________.', type: 'fill-blank', correctAnswer: 'concrete', explanation: 'pH-neutral concrete blocks provide structural habitat.' },
    { id: 'l36', section: 'listening', questionNumber: 36, partNumber: 4, instruction: 'Write ONE WORD ONLY.', questionText: 'Genetic selection identifies resilient micro-algae capable of surviving ________.', type: 'fill-blank', correctAnswer: 'heat', explanation: 'Heat-tolerant strain cultivation.' },
    { id: 'l37', section: 'listening', questionNumber: 37, partNumber: 4, instruction: 'Write ONE WORD ONLY.', questionText: 'Local community involvement in marine protected areas boosts ________ compliance.', type: 'fill-blank', correctAnswer: 'enforcement', explanation: 'Community policing improves conservation compliance.' },
    { id: 'l38', section: 'listening', questionNumber: 38, partNumber: 4, instruction: 'Write ONE WORD ONLY.', questionText: 'Ecotourism revenues replace destructive commercial ________ practices.', type: 'fill-blank', correctAnswer: 'fishing', explanation: 'Sustainable tourism reduces dynamite/cyanide fishing pressure.' },
    { id: 'l39', section: 'listening', questionNumber: 39, partNumber: 4, instruction: 'Write ONE WORD ONLY.', questionText: 'Satellite monitoring detects subtle sea surface ________ variations.', type: 'fill-blank', correctAnswer: 'temperature', explanation: 'Thermal anomaly detection via orbital sensors.' },
    { id: 'l40', section: 'listening', questionNumber: 40, partNumber: 4, instruction: 'Write ONE WORD ONLY.', questionText: 'Global ocean restoration requires international policy ________.', type: 'fill-blank', correctAnswer: 'cooperation', explanation: 'Cross-border legislative alignment and cooperation.' }
  ],

  // Reading Section (3 Passages, 40 Questions)
  readingPassages: [
    {
      id: 'p1',
      title: 'Passage 1: The Architecture of Sustainable Urban Transportation',
      subtitle: 'How modern cities are redesigning transit systems for net-zero carbon futures.',
      partNumber: 1,
      paragraphs: [
        {
          id: 'A',
          text: 'Urban transportation accounts for roughly 24 percent of direct carbon dioxide emissions from fuel combustion worldwide. As global populations continue to concentrate in metropolitan areas, urban planners face an unprecedented imperative: transforming public transit networks into zero-emission ecosystems without sacrificing economic efficiency or commuter mobility.'
        },
        {
          id: 'B',
          text: 'In Scandinavian capitals such as Copenhagen and Oslo, municipality-led initiatives have combined extensive dedicated cycling superhighways with electrified rapid transit. The integration of high-density battery electric buses (BEBs), recharged at terminus stations via ultra-fast pantograph systems, has reduced municipal fleet emissions by over 60 percent within a single decade.'
        },
        {
          id: 'C',
          text: 'However, physical infrastructure represents only half the equation. Advanced transit authority systems leverage IoT sensors and real-time predictive traffic routing to adjust bus dispatch intervals based on live passenger density. By eliminating empty runs during off-peak hours and prioritizing public buses at traffic signals via automated priority triggers, city networks optimize energy consumption per passenger kilometer.'
        },
        {
          id: 'D',
          text: 'Despite these remarkable technical triumphs, urban transit electrification faces significant economic bottlenecks in developing economies. High upfront capital expenses for grid upgrades, transformer substations, and battery pack replacements present daunting hurdles for municipal budgets. Financial experts argue that public-private partnerships (PPPs) and international green climate funds are essential to bridging this capital financing gap.'
        }
      ]
    },
    {
      id: 'p2',
      title: 'Passage 2: The Cognitive Neuroscience of Multilingualism',
      subtitle: 'Investigating neuroplasticity and executive control mechanisms in bilingual brains.',
      partNumber: 2,
      paragraphs: [
        {
          id: 'A',
          text: 'For decades, early 20th-century educational theorists argued that exposing young children to two languages simultaneously caused cognitive confusion and language delay. Modern neuroimaging techniques, including functional Magnetic Resonance Imaging (fMRI) and magnetoencephalography (MEG), have completely dismantled this dogma.'
        },
        {
          id: 'B',
          text: 'Neuroscientists have revealed that the bilingual brain is perpetually managing two active linguistic systems. When a bilingual speaker communicates in one language, the non-target language remains subtly active in the background. To prevent linguistic intrusion, the brain relies on its executive control network—specifically the anterior cingulate cortex and dorsolateral prefrontal cortex.'
        },
        {
          id: 'C',
          text: 'This perpetual mental workout enhances cognitive flexibility, task-switching proficiency, and working memory capacity. Epidemiological studies conducted by Dr. Ellen Bialystok demonstrate that lifelong bilingualism builds cognitive reserve, effectively delaying the onset of dementia and Alzheimer symptoms by an average of 4 to 5 years compared to monolinguals.'
        },
        {
          id: 'D',
          text: 'Nevertheless, researchers emphasize that bilingualism is not a magic panacea. Differences in executive function task performance between monolinguals and bilinguals are often nuanced and vary based on age, socioeconomic background, and the age of second language acquisition.'
        }
      ]
    },
    {
      id: 'p3',
      title: 'Passage 3: Biomimicry and the Future of Structural Engineering',
      subtitle: 'Engineers look to biological forms to design super-efficient buildings and materials.',
      partNumber: 3,
      paragraphs: [
        {
          id: 'A',
          text: 'Biomimicry—the practice of emulating nature’s models, systems, and elements to solve complex human problems—is revolutionizing structural architecture. Nature has undergone 3.8 billion years of evolutionary research and development, refining structural solutions that maximize structural integrity while minimizing material waste.'
        },
        {
          id: 'B',
          text: 'A famous landmark of biomimetic design is the Eastgate Centre in Harare, Zimbabwe. Designed by architect Mick Pearce, the building has no conventional air conditioning system. Instead, it draws inspiration from the self-cooling mounds built by indigenous macrotermes termites. By utilizing a network of chimney flues and thermal mass concrete walls, the building maintains comfortable internal temperatures while using 90 percent less energy than a traditional climate-controlled tower.'
        },
        {
          id: 'C',
          text: 'On a microscopic scale, bio-inspired materials modeled on honeycomb cells and sea sponge lattices are transforming aerospace and skyscraper engineering. By mimicking the porous, cross-braced cellular geometry of human bone tissue, structural engineers can fabricate ultra-lightweight steel girders that exhibit equal load-bearing capacity with 40 percent less steel volume.'
        },
        {
          id: 'D',
          text: 'As computational parametric design and 3D additive manufacturing mature, the line between biological biology and artificial architecture continues to dissolve. Future smart buildings will not merely passively mimic nature, but actively self-heal concrete cracks through embedded bacterial spores and dynamically respond to sunlight exposure like living organism leaves.'
        }
      ]
    }
  ],

  readingQuestions: [
    // Passage 1 Questions (1-13)
    {
      id: 'r1',
      section: 'reading',
      questionNumber: 1,
      passageId: 'p1',
      instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE, or NOT GIVEN.',
      questionText: 'Urban transportation generates approximately one quarter of world fuel combustion CO2 emissions.',
      type: 'true-false-not-given',
      options: [
        { value: 'TRUE', label: 'TRUE' },
        { value: 'FALSE', label: 'FALSE' },
        { value: 'NOT GIVEN', label: 'NOT GIVEN' }
      ],
      correctAnswer: 'TRUE',
      explanation: 'Paragraph A states urban transportation accounts for "roughly 24 percent" (one quarter) of worldwide emissions.'
    },
    {
      id: 'r2',
      section: 'reading',
      questionNumber: 2,
      passageId: 'p1',
      instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE, or NOT GIVEN.',
      questionText: 'Electric buses in Oslo are charged solely at overnight depot stations.',
      type: 'true-false-not-given',
      options: [
        { value: 'TRUE', label: 'TRUE' },
        { value: 'FALSE', label: 'FALSE' },
        { value: 'NOT GIVEN', label: 'NOT GIVEN' }
      ],
      correctAnswer: 'FALSE',
      explanation: 'Paragraph B states buses are recharged at "terminus stations via ultra-fast pantograph systems", not solely overnight at depots.'
    },
    {
      id: 'r3',
      section: 'reading',
      questionNumber: 3,
      passageId: 'p1',
      instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE, or NOT GIVEN.',
      questionText: 'IoT sensors enable transit systems to eliminate empty bus runs during quiet hours.',
      type: 'true-false-not-given',
      options: [
        { value: 'TRUE', label: 'TRUE' },
        { value: 'FALSE', label: 'FALSE' },
        { value: 'NOT GIVEN', label: 'NOT GIVEN' }
      ],
      correctAnswer: 'TRUE',
      explanation: 'Paragraph C states predictive routing eliminates empty runs during off-peak hours.'
    },
    {
      id: 'r4',
      section: 'reading',
      questionNumber: 4,
      passageId: 'p1',
      instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE, or NOT GIVEN.',
      questionText: 'Developing nations currently possess more electrified buses than Scandinavian countries.',
      type: 'true-false-not-given',
      options: [
        { value: 'TRUE', label: 'TRUE' },
        { value: 'FALSE', label: 'FALSE' },
        { value: 'NOT GIVEN', label: 'NOT GIVEN' }
      ],
      correctAnswer: 'NOT GIVEN',
      explanation: 'Paragraph D mentions financial hurdles in developing nations, but no comparative quantities are stated.'
    },
    {
      id: 'r5',
      section: 'reading',
      questionNumber: 5,
      passageId: 'p1',
      instruction: 'Choose the correct paragraph letter (A-D) that contains the following information.',
      questionText: 'Which paragraph describes how Copenhagen and Oslo reduced fleet emissions by 60 percent?',
      type: 'multiple-choice',
      options: [
        { value: 'A', label: 'Paragraph A' },
        { value: 'B', label: 'Paragraph B' },
        { value: 'C', label: 'Paragraph C' },
        { value: 'D', label: 'Paragraph D' }
      ],
      correctAnswer: 'B',
      explanation: 'Paragraph B details the Scandinavian cycling superhighways and bus electrification.'
    },
    {
      id: 'r6',
      section: 'reading',
      questionNumber: 6,
      passageId: 'p1',
      instruction: 'Complete the sentence below. Choose NO MORE THAN TWO WORDS from Paragraph D.',
      questionText: 'Upfront capital costs for grid upgrades and transformer ________ create financial challenges.',
      type: 'fill-blank',
      correctAnswer: 'substations',
      explanation: 'Paragraph D refers to grid upgrades and "transformer substations".'
    },
    {
      id: 'r7',
      section: 'reading',
      questionNumber: 7,
      passageId: 'p1',
      instruction: 'Complete the sentence below. Choose NO MORE THAN TWO WORDS from Paragraph D.',
      questionText: 'Financial experts suggest public-private ________ are essential to fund transit projects.',
      type: 'fill-blank',
      correctAnswer: 'partnerships',
      explanation: 'Paragraph D highlights "public-private partnerships (PPPs)".'
    },
    {
      id: 'r8', section: 'reading', questionNumber: 8, passageId: 'p1', instruction: 'Write ONE WORD ONLY.', questionText: 'Automated signal priority triggers prioritize public ________ at intersections.', type: 'fill-blank', correctAnswer: 'buses', explanation: 'Paragraph C mentions prioritizing public buses.' },
    { id: 'r9', section: 'reading', questionNumber: 9, passageId: 'p1', instruction: 'Write ONE WORD ONLY.', questionText: 'Terminus pantograph systems deliver ultra-fast ________ to bus battery packs.', type: 'fill-blank', correctAnswer: 'recharging', explanation: 'Paragraph B describes terminus fast charging.' },
    { id: 'r10', section: 'reading', questionNumber: 10, passageId: 'p1', instruction: 'Choose paragraph letter.', questionText: 'Mentions global transportation carbon dioxide percentage.', type: 'multiple-choice', options: [{value:'A', label:'Paragraph A'}, {value:'B', label:'Paragraph B'}, {value:'C', label:'Paragraph C'}, {value:'D', label:'Paragraph D'}], correctAnswer: 'A', explanation: 'Paragraph A gives the 24 percent figure.' },
    { id: 'r11', section: 'reading', questionNumber: 11, passageId: 'p1', instruction: 'Write ONE WORD ONLY.', questionText: 'Copenhagen built cycling ________ highways.', type: 'fill-blank', correctAnswer: 'superhighways', explanation: 'Paragraph B mentions dedicated superhighways.' },
    { id: 'r12', section: 'reading', questionNumber: 12, passageId: 'p1', instruction: 'Write ONE WORD ONLY.', questionText: 'Predictive routing adjusts dispatch intervals based on live passenger ________.', type: 'fill-blank', correctAnswer: 'density', explanation: 'Paragraph C mentions live passenger density.' },
    { id: 'r13', section: 'reading', questionNumber: 13, passageId: 'p1', instruction: 'Write ONE WORD ONLY.', questionText: 'Green climate ________ help bridge the municipal financing gap.', type: 'fill-blank', correctAnswer: 'funds', explanation: 'Paragraph D notes international green climate funds.' },

    // Passage 2 Questions (14-26)
    {
      id: 'r14',
      section: 'reading',
      questionNumber: 14,
      passageId: 'p2',
      instruction: 'Choose the correct letter, A, B, C, or D.',
      questionText: 'What was the prevailing early 20th-century view on childhood bilingualism?',
      type: 'multiple-choice',
      options: [
        { value: 'A', label: 'A) It accelerated early reading comprehension' },
        { value: 'B', label: 'B) It caused linguistic confusion and developmental delay' },
        { value: 'C', label: 'C) It had no measurable impact on cognitive growth' },
        { value: 'D', label: 'D) It improved musical ability in toddlers' }
      ],
      correctAnswer: 'B',
      explanation: 'Paragraph A states early theorists believed it caused "cognitive confusion and language delay".'
    },
    {
      id: 'r15',
      section: 'reading',
      questionNumber: 15,
      passageId: 'p2',
      instruction: 'Choose the correct letter, A, B, C, or D.',
      questionText: 'Which brain region helps prevent intrusion from the non-target language?',
      type: 'multiple-choice',
      options: [
        { value: 'A', label: 'A) The occipital visual cortex' },
        { value: 'B', label: 'B) The anterior cingulate cortex' },
        { value: 'C', label: 'C) The auditory cerebellum' },
        { value: 'D', label: 'D) The brainstem sensory node' }
      ],
      correctAnswer: 'B',
      explanation: 'Paragraph B specifies the anterior cingulate cortex and dorsolateral prefrontal cortex.'
    },
    {
      id: 'r16',
      section: 'reading',
      questionNumber: 16,
      passageId: 'p2',
      instruction: 'Do the following statements agree with Reading Passage 2? Write TRUE, FALSE, or NOT GIVEN.',
      questionText: 'Lifelong bilingualism delays the onset of dementia symptoms by an average of 4 to 5 years.',
      type: 'true-false-not-given',
      options: [
        { value: 'TRUE', label: 'TRUE' },
        { value: 'FALSE', label: 'FALSE' },
        { value: 'NOT GIVEN', label: 'NOT GIVEN' }
      ],
      correctAnswer: 'TRUE',
      explanation: 'Paragraph C states Dr. Bialystok showed a delay of 4 to 5 years.'
    },
    {
      id: 'r17',
      section: 'reading',
      questionNumber: 17,
      passageId: 'p2',
      instruction: 'Write NO MORE THAN TWO WORDS from Paragraph B.',
      questionText: 'When speaking, a bilingual individual keeps the non-target language active in the ________.',
      type: 'fill-blank',
      correctAnswer: 'background',
      explanation: 'Paragraph B states the non-target language remains subtly active in the background.'
    },
    { id: 'r18', section: 'reading', questionNumber: 18, passageId: 'p2', instruction: 'Write ONE WORD ONLY.', questionText: 'fMRI and MEG are modern neuroimaging ________.', type: 'fill-blank', correctAnswer: 'techniques', explanation: 'Paragraph A describes neuroimaging techniques.' },
    { id: 'r19', section: 'reading', questionNumber: 19, passageId: 'p2', instruction: 'Write ONE WORD ONLY.', questionText: 'Bilingualism builds cognitive ________ guarding against neurodegeneration.', type: 'fill-blank', correctAnswer: 'reserve', explanation: 'Paragraph C states it builds cognitive reserve.' },
    { id: 'r20', section: 'reading', questionNumber: 20, passageId: 'p2', instruction: 'Select TRUE/FALSE/NOT GIVEN.', questionText: 'Dr. Ellen Bialystok studied working memory in monolingual children only.', type: 'true-false-not-given', options: [{value:'TRUE', label:'TRUE'}, {value:'FALSE', label:'FALSE'}, {value:'NOT GIVEN', label:'NOT GIVEN'}], correctAnswer: 'FALSE', explanation: 'She compared bilinguals and monolinguals.' },
    { id: 'r21', section: 'reading', questionNumber: 21, passageId: 'p2', instruction: 'Write ONE WORD ONLY.', questionText: 'Executive control networks manage task-switching ________.', type: 'fill-blank', correctAnswer: 'proficiency', explanation: 'Paragraph C mentions task-switching proficiency.' },
    { id: 'r22', section: 'reading', questionNumber: 22, passageId: 'p2', instruction: 'Choose option.', questionText: 'Is bilingualism considered a magic cure for all cognitive deficits?', type: 'multiple-choice', options: [{value:'YES', label:'Yes'}, {value:'NO', label:'No'}, {value:'NOT GIVEN', label:'Not Given'}], correctAnswer: 'NO', explanation: 'Paragraph D states it is not a magic panacea.' },
    { id: 'r23', section: 'reading', questionNumber: 23, passageId: 'p2', instruction: 'Write ONE WORD ONLY.', questionText: 'Cognitive differences depend on age of L2 ________.', type: 'fill-blank', correctAnswer: 'acquisition', explanation: 'Paragraph D states age of acquisition.' },
    { id: 'r24', section: 'reading', questionNumber: 24, passageId: 'p2', instruction: 'Write ONE WORD ONLY.', questionText: 'The non-target language causes linguistic ________ if not suppressed.', type: 'fill-blank', correctAnswer: 'intrusion', explanation: 'Paragraph B mentions preventing linguistic intrusion.' },
    { id: 'r25', section: 'reading', questionNumber: 25, passageId: 'p2', instruction: 'Write ONE WORD ONLY.', questionText: 'Prefrontal cortex coordinates executive ________ networks.', type: 'fill-blank', correctAnswer: 'control', explanation: 'Paragraph B mentions executive control.' },
    { id: 'r26', section: 'reading', questionNumber: 26, passageId: 'p2', instruction: 'Write ONE WORD ONLY.', questionText: 'MEG stands for magnetoencephalography imaging ________.', type: 'fill-blank', correctAnswer: 'technology', explanation: 'Advanced neuroimaging tool.' },

    // Passage 3 Questions (27-40)
    {
      id: 'r27',
      section: 'reading',
      questionNumber: 27,
      passageId: 'p3',
      instruction: 'Which paragraph describes the natural temperature regulation of termite mounds?',
      questionText: 'Which paragraph describes the natural temperature regulation of termite mounds?',
      type: 'multiple-choice',
      options: [
        { value: 'A', label: 'Paragraph A' },
        { value: 'B', label: 'Paragraph B' },
        { value: 'C', label: 'Paragraph C' },
        { value: 'D', label: 'Paragraph D' }
      ],
      correctAnswer: 'B',
      explanation: 'Paragraph B details architect Mick Pearce inspired by macrotermes termite mounds.'
    },
    {
      id: 'r28',
      section: 'reading',
      questionNumber: 28,
      passageId: 'p3',
      instruction: 'Which paragraph mentions ultra-lightweight steel girders modeled on human bone structure?',
      questionText: 'Which paragraph mentions ultra-lightweight steel girders modeled on human bone structure?',
      type: 'multiple-choice',
      options: [
        { value: 'A', label: 'Paragraph A' },
        { value: 'B', label: 'Paragraph B' },
        { value: 'C', label: 'Paragraph C' },
        { value: 'D', label: 'Paragraph D' }
      ],
      correctAnswer: 'C',
      explanation: 'Paragraph C describes porous cellular geometry inspired by human bone tissue.'
    },
    {
      id: 'r29',
      section: 'reading',
      questionNumber: 29,
      passageId: 'p3',
      instruction: 'Complete the summary. Write NO MORE THAN TWO WORDS from Paragraph B.',
      questionText: 'The Eastgate Centre in Zimbabwe does not require conventional ________ conditioning systems.',
      type: 'fill-blank',
      correctAnswer: 'air',
      explanation: 'Paragraph B states it has no conventional air conditioning system.'
    },
    {
      id: 'r30',
      section: 'reading',
      questionNumber: 30,
      passageId: 'p3',
      instruction: 'Complete the summary. Write NO MORE THAN TWO WORDS from Paragraph B.',
      questionText: 'Internal climate control is managed through chimney flues and thermal ________ walls.',
      type: 'fill-blank',
      correctAnswer: 'mass',
      explanation: 'Paragraph B specifies thermal mass concrete walls.'
    },
    { id: 'r31', section: 'reading', questionNumber: 31, passageId: 'p3', instruction: 'Write ONE WORD ONLY.', questionText: 'Eastgate Centre uses 90 percent less ________ than traditional towers.', type: 'fill-blank', correctAnswer: 'energy', explanation: 'Paragraph B states 90 percent less energy.' },
    { id: 'r32', section: 'reading', questionNumber: 32, passageId: 'p3', instruction: 'Write ONE WORD ONLY.', questionText: 'Biomimicry emulates nature which has evolved over 3.8 ________ years.', type: 'fill-blank', correctAnswer: 'billion', explanation: 'Paragraph A states 3.8 billion years.' },
    { id: 'r33', section: 'reading', questionNumber: 33, passageId: 'p3', instruction: 'Write ONE WORD ONLY.', questionText: 'Cellular geometry of bone tissue is porous and ________ braced.', type: 'fill-blank', correctAnswer: 'cross', explanation: 'Paragraph C states cross-braced cellular geometry.' },
    { id: 'r34', section: 'reading', questionNumber: 34, passageId: 'p3', instruction: 'Write ONE WORD ONLY.', questionText: 'Bio-inspired girders use 40 percent less ________ volume.', type: 'fill-blank', correctAnswer: 'steel', explanation: 'Paragraph C specifies steel volume.' },
    { id: 'r35', section: 'reading', questionNumber: 35, passageId: 'p3', instruction: 'Write ONE WORD ONLY.', questionText: 'Future concrete will self-heal cracks using embedded bacterial ________.', type: 'fill-blank', correctAnswer: 'spores', explanation: 'Paragraph D mentions bacterial spores.' },
    { id: 'r36', section: 'reading', questionNumber: 36, passageId: 'p3', instruction: 'Write ONE WORD ONLY.', questionText: 'Parametric design paired with 3D additive ________ advances biomimicry.', type: 'fill-blank', correctAnswer: 'manufacturing', explanation: 'Paragraph D states 3D additive manufacturing.' },
    { id: 'r37', section: 'reading', questionNumber: 37, passageId: 'p3', instruction: 'Select TRUE/FALSE/NOT GIVEN.', questionText: 'Mick Pearce studied sea sponges before building Eastgate Centre.', type: 'true-false-not-given', options: [{value:'TRUE', label:'TRUE'}, {value:'FALSE', label:'FALSE'}, {value:'NOT GIVEN', label:'NOT GIVEN'}], correctAnswer: 'NOT GIVEN', explanation: 'Passage mentions termite mounds for Mick Pearce, sea sponges for materials in C, but no explicit sponge link for Mick Pearce.' },
    { id: 'r38', section: 'reading', questionNumber: 38, passageId: 'p3', instruction: 'Write ONE WORD ONLY.', questionText: 'Smart building surfaces will respond dynamically to ________ like plant leaves.', type: 'fill-blank', correctAnswer: 'sunlight', explanation: 'Paragraph D mentions responding to sunlight.' },
    { id: 'r39', section: 'reading', questionNumber: 39, passageId: 'p3', instruction: 'Write ONE WORD ONLY.', questionText: 'Biomimicry seeks to maximize structural ________.', type: 'fill-blank', correctAnswer: 'integrity', explanation: 'Paragraph A states structural integrity.' },
    { id: 'r40', section: 'reading', questionNumber: 40, passageId: 'p3', instruction: 'Choose letter.', questionText: 'What is the main topic of Reading Passage 3?', type: 'multiple-choice', options: [{value:'A', label:'A) Applications of biological models in structural engineering'}, {value:'B', label:'B) History of African air conditioning systems'}, {value:'C', label:'C) 3D printing techniques in aerospace production'}], correctAnswer: 'A', explanation: 'Passage 3 examines biomimicry in structural engineering and architecture.' }
  ],

  // Writing Section (Task 1 & Task 2)
  writingTasks: [
    {
      taskNumber: 1,
      title: 'Writing Task 1: Renewable Energy Consumption Comparison (2015 - 2025)',
      prompt: 'The chart below shows the percentage of electricity generated from renewable energy sources in four European countries between 2015 and 2025.\n\nSummarize the information by selecting and reporting the main features, and make comparisons where relevant.\nWrite at least 150 words.',
      minWordCount: 150,
      timeLimitMinutes: 20,
      chartType: 'bar',
      chartData: {
        labels: ['Germany', 'United Kingdom', 'Spain', 'Denmark'],
        datasets: [
          { label: '2015 (%)', data: [30, 22, 35, 56], color: '#3b82f6' },
          { label: '2020 (%)', data: [45, 38, 42, 68], color: '#10b981' },
          { label: '2025 (%)', data: [58, 51, 50, 82], color: '#8b5cf6' }
        ]
      },
      sampleAnswer: 'The bar chart illustrates the proportion of national electricity produced from renewable energy sources across four European nations (Germany, the UK, Spain, and Denmark) over a ten-year period from 2015 to 2025.\n\nOverall, all four countries experienced substantial upward trends in renewable electricity adoption. Denmark consistently led the group throughout the decade, whereas the United Kingdom registered the most dramatic percentage increase.\n\nIn 2015, Denmark stood far ahead of the other nations, generating 56% of its power from renewables. By 2020, this figure rose to 68%, eventually peaking at an impressive 82% in 2025. In contrast, the United Kingdom recorded the lowest starting figure in 2015 at just 22%. However, the UK more than doubled its share over the decade, reaching 38% in 2020 and 51% by 2025.\n\nGermany and Spain demonstrated steady growth patterns. Spain initially held second place in 2015 with 35%, growing moderately to 42% in 2020 and reaching 50% in 2025. Germany surpassed Spain after 2015, surging from 30% in 2015 to 45% in 2020 and finishing strongly at 58% in 2025.'
    },
    {
      taskNumber: 2,
      title: 'Writing Task 2: Artificial Intelligence and Human Employment',
      prompt: 'Some people believe that rapid developments in artificial intelligence and automation will lead to widespread unemployment and social inequality. Others argue that AI will create new job opportunities and boost economic productivity.\n\nDiscuss both views and give your own opinion.\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\nWrite at least 250 words.',
      minWordCount: 250,
      timeLimitMinutes: 40,
      sampleAnswer: 'The exponential advancement of artificial intelligence (AI) and robotic automation has sparked intense global debates regarding its impact on the workforce. While critics warn that automation threatens to render millions unemployed and deepen socio-economic divides, proponents maintain that technological disruptions historically yield superior economic efficiency and higher-skilled employment opportunities. This essay will examine both perspectives before presenting a balanced viewpoint.\n\nOn the one hand, apprehension regarding AI-driven job displacement is far from unfounded. Routine manual and cognitive tasks across sectors such as manufacturing, customer support, data entry, and transportation are increasingly being automated. For instance, self-service kiosks and algorithmic logistics have reduced reliance on human labor in retail and warehousing. Workers who lack specialized digital literacy or retraining resources risk facing structural unemployment, which can exacerbate income inequality between technology owners and displaced wage earners.\n\nOn the other hand, technological revolutions have historically destroyed obsolete jobs while simultaneously spawning entirely new industries. Just as the Industrial Revolution shifted employment from manual agriculture to manufacturing, the AI era is cultivating demands for prompt engineers, data ethicists, cybersecurity specialists, and automated system maintenance technicians. Furthermore, AI enhances human productivity by automating repetitive drudgery, freeing workers to engage in creative problem-solving and interpersonal leadership—qualities that algorithms cannot replicate.\n\nIn my opinion, AI automation will inevitably cause short-term labor market disruptions; however, its long-term benefits will outweigh the risks if managed proactively. Governments and educational institutions must institute comprehensive reskilling initiatives and adaptive social safety nets to support transitioning workers. In conclusion, while AI carries legitimate risks of inequality if left unregulated, it ultimately holds the potential to drive economic prosperity and create higher-value human occupations.'
    }
  ],

  // Speaking Section (Part 1, Part 2, Part 3)
  speakingTasks: [
    {
      partNumber: 1,
      title: 'Part 1: Introduction and General Topics',
      topic: 'Hometown, Studies, and Technology Usage',
      questions: [
        'Can you describe your hometown to me?',
        'What do you like most about living in your city or town?',
        'How often do you use digital technology in your daily routine?',
        'Do you think technology makes life simpler or more complicated?'
      ]
    },
    {
      partNumber: 2,
      title: 'Part 2: Individual Long Turn (Cue Card)',
      topic: 'Describe an important goal you set and achieved',
      cueCard: {
        mainTopic: 'Describe an important goal you set for yourself and successfully achieved.',
        bulletPoints: [
          'What the goal was and why you set it',
          'How long it took you to achieve it',
          'What steps or effort you took to accomplish it',
          'And explain how you felt after achieving this goal.'
        ]
      },
      questions: ['Talk for 1 to 2 minutes. You have 1 minute to prepare notes.'],
      prepTimeSeconds: 60,
      speakTimeSeconds: 120
    },
    {
      partNumber: 3,
      title: 'Part 3: Two-Way Discussion',
      topic: 'Goal Setting, Ambition, and Societal Success',
      questions: [
        'Why is it important for young people to set personal and academic goals?',
        'Do you think society places too much pressure on individuals to achieve financial success?',
        'How have the career ambitions of younger generations changed compared to older generations?',
        'What factors contribute most to long-term career fulfillment?'
      ]
    }
  ]
};
