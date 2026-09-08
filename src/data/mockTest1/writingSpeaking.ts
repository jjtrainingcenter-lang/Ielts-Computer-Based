import { WritingTaskData, SpeakingTaskData } from '../../types';

export const TEST1_WRITING_TASKS: WritingTaskData[] = [
  {
    "taskNumber": 1,
    "title": "Writing Task 1",
    "prompt": "Below is a graph showing the incidence of mental illness (as indicated by receipt of Incapacity Benefit) amongst older UK males, from 1971-2015. The reform in the benefits system took place in 1995. Summarise the information by selecting and reporting the main features and make comparisons where relevant.",
    "minWordCount": 150,
    "timeLimitMinutes": 20,
    "media": {
      "type": "image",
      "url": "/assets/mock-test-1/writing-task1-graph.webp",
      "alt": "Graph showing incidence of mental illness indicated by Incapacity Benefit among older UK males from 1971 to 2015",
      "caption": "Writing Task 1 graph"
    }
  },
  {
    "taskNumber": 2,
    "title": "Writing Task 2",
    "prompt": "Psychological illnesses may not be as obvious as physical disabilities or illnesses. Nevertheless, they are just as disabling in their own way. Society, however, is more accepting of those with physical than psychological illnesses or disabilities; the latter being regarded as a 'taboo' subject sometimes. To what extent do you agree with this view? Give reasons for your answer and include any relevant examples from your own knowledge or experience.",
    "minWordCount": 250,
    "timeLimitMinutes": 40
  }
];

export const TEST1_SPEAKING_TASKS: SpeakingTaskData[] = [
  {
    "partNumber": 1,
    "title": "Speaking Part 1",
    "topic": "Stress and emotions; the importance of having a social network",
    "questions": [
      "What makes you happy/sad?",
      "How do you cope with stress and negative emotions?",
      "Do you only share happy rather than sad emotions with others? Why/Why not?",
      "What emotions are more difficult for you to express?",
      "Do you think it's better to keep your emotions to yourself?",
      "What do you gain from having a good social network?",
      "Is it more difficult to make friends and form relationships today? Why/Why not?",
      "If you didn't have a good social circle of friends, what would you do?",
      "Do you think it is better to spend time building up friendships or work contacts? Why?",
      "In your opinion, do you think many problems in society today result from a breakdown in social networks?"
    ]
  },
  {
    "partNumber": 2,
    "title": "Speaking Part 2",
    "topic": "A significant event in your life",
    "questions": [
      "Do significant events in your life usually impact others, too?",
      "Do you think that negative life events have a more lasting impact than positive ones?"
    ],
    "cueCard": {
      "mainTopic": "Describe a significant event in your life (good or bad) that made an impact on you.",
      "bulletPoints": [
        "what the event was",
        "why it was such a significant event",
        "how you felt at the time"
      ]
    },
    "prepTimeSeconds": 60,
    "speakTimeSeconds": 120
  },
  {
    "partNumber": 3,
    "title": "Speaking Part 3",
    "topic": "Problems, psychology, society and stress",
    "questions": [
      "Do people talk enough about their problems to other people?",
      "Should everyone have a personal psychologist as many Americans do?",
      "In your opinion, is talking to a good friend better than talking to a psychologist?",
      "As a society, are we more caring than past generations? Why/Why not?",
      "Are there enough organisations to cope with individuals seeking professional help?",
      "Do you think that the problems that we face today are more serious than in the past?",
      "Are changes in lifestyles, both at home and work, a major cause of stress today?",
      "When trying to escape a stressful lifestyle, is the old saying 'a change is as good as a rest' true?"
    ]
  }
];
