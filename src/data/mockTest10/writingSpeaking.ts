import { WritingTaskData, SpeakingTaskData } from '../../types';

export const TEST10_WRITING_TASKS: WritingTaskData[] = [
  {
    taskNumber: 1,
    title: 'Writing Task 1',
    prompt: 'The chart below gives information about household income distribution and expenditure across five economic brackets in the UK. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    minWordCount: 150,
    timeLimitMinutes: 20,
    chartType: 'line',
  },
  {
    taskNumber: 2,
    title: 'Writing Task 2',
    prompt: 'In many countries, an increasing number of people are choosing to apply for visas and emigrate to other countries for study and work opportunities. While some believe this creates cultural exchange and economic prosperity, others argue that it leads to brain drain and strain on local resources. Discuss both views and give your own opinion.',
    minWordCount: 250,
    timeLimitMinutes: 40,
  },
];

export const TEST10_SPEAKING_TASKS: SpeakingTaskData[] = [
  {
    partNumber: 1,
    title: 'Speaking Part 1',
    topic: 'Travel, Technology and Organization',
    questions: [
      'Do you often use smartphones or digital apps for planning your daily schedule?',
      'Have you ever booked tickets online for theatre or musical events?',
      'What kinds of entertainment venues do you enjoy visiting most?',
      'Do you prefer travelling independently or using guided tours and travel agencies?',
    ],
  },
  {
    partNumber: 2,
    title: 'Speaking Part 2',
    topic: 'A Memorable Experience or Visit to an Interesting Place',
    questions: [
      'Why do you think visiting natural wonders like caves or mountains makes such an impression on visitors?',
      'How does modern technology change the way people document and share their travel experiences?',
    ],
    cueCard: {
      mainTopic: 'Describe an interesting place or historic/natural site you visited that left a strong impression on you.',
      bulletPoints: [
        'where this place was',
        'when and why you decided to visit it',
        'what you saw and did there',
        'and explain why you found this visit so memorable.',
      ],
    },
    prepTimeSeconds: 60,
  },
  {
    partNumber: 3,
    title: 'Speaking Part 3',
    topic: 'Preservation, Exploration and Modern Travel Trends',
    questions: [
      'Why is it important to protect fragile natural environments like underground caves and archaeological sites from mass tourism?',
      'Do you think archaeological discoveries help us understand modern society better?',
      'In what ways has the process of travelling internationally and applying for visas changed over the past twenty years?',
      'Should governments make administrative processes like visa applications entirely digital, or should offline options always remain available?',
    ],
  },
];
