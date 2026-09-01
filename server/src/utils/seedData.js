import User from '../models/User.js';
import Course from '../models/Course.js';

export async function seedDatabase() {
  await Promise.all([User.deleteMany(), Course.deleteMany()]);
  const admin = await User.create({ name: 'Platform Admin', email: 'admin@learningcompanion.studio', passwordHash: await User.hashPassword('AdminPass123!'), role: 'admin' });
  const author = await User.create({ name: 'Farah Author', email: 'author@learningcompanion.studio', passwordHash: await User.hashPassword('AuthorPass123!'), role: 'author' });
  const learner = await User.create({ name: 'Priya Companion', email: 'companion@learningcompanion.studio', passwordHash: await User.hashPassword('LearnerPass123!') });

  const coursesData = [
    {
      title: 'The LCM Model for Learning Companions',
      description: 'Master the Learner-Centric MOOC (LCM) framework — LeD, LbD, LxT and LxI — and learn to apply it in your 1-1 sessions with neurodivergent learners.',
      category: 'LC Training',
      level: 'Beginner',
      accent: 'indigo',
      status: 'published',
      lessons: [
        {
          title: 'Why Learner-Centric Design?',
          summary: 'Shift the focus from content delivery to what the learner actually does.',
          content: 'Traditional instruction is organised around what the instructor presents. Learner-centric design flips this: every element is organised around what the learner does with it. For IMLC, this matters doubly — our neurodivergent learners aged 10-15 disengage quickly from passive content, but thrive when sessions are built around their interests and active participation. In this lesson you will see the key takeaways of learner-centric online instruction and why IMLC adopted the LCM model for training its Learning Companions.',
          videoUrl: 'https://www.youtube.com/embed/NpM5WuwYL5s',
          durationMinutes: 12,
          order: 1,
          reflectionSpots: [
            { prompt: 'Pause and reflect: think of a session you observed (or attended) that lost the learner’s attention. What was the instructor doing at that moment, and what was the learner doing?', hint: 'Focus on the learner’s activity, not the quality of the content.' }
          ],
          lbdQuestions: [
            {
              prompt: 'A Learning Companion plans a 40-minute session that is entirely a walkthrough of a drawing tutorial video. What is the most learner-centric improvement?',
              options: [
                { text: 'Pick a longer, higher-quality tutorial video', feedback: 'Not quite. The problem is not video quality — it is that the learner stays passive for 40 minutes. LCM asks: what does the learner DO?' },
                { text: 'Break the video into short segments with a try-it-yourself activity after each', feedback: 'Exactly right! Short dialogues punctuated by doing is the heart of LeD + LbD sequencing.' },
                { text: 'Replace the video with a printed worksheet', feedback: 'Swapping one passive medium for another does not make the session learner-centric. Think about active participation.' },
                { text: 'Let the child watch the video at home instead', feedback: 'This just moves the passive experience elsewhere. The LCM fix is to interleave watching with doing.' }
              ],
              answer: 1
            }
          ],
          subjectivePrompts: [
            { prompt: 'In 3-4 sentences, describe how you would restructure a 30-minute "introduction to comics" session for a 12-year-old who loves superheroes, using at least two LCM components.', exemplar: 'I would open with a 4-minute dialogue about the child’s favourite superhero comic panel and pause to ask what makes it exciting (LeD with a reflection spot). Then the child immediately sketches a single panel of their own hero (LbD). I would close by sharing one age-appropriate webcomic tutorial for the week (LxT) and a question to discuss with their parent or peer group: "which panel of yours tells the biggest story?" (LxI).' }
          ],
          resources: [
            { title: 'The LCM Model — official site', url: 'https://lcm-model.org/', kind: 'article', note: 'The canonical reference for LeD, LbD, LxT and LxI, by the IIT Bombay team.' },
            { title: 'Learner-centric MOOC model (ETR&D paper)', url: 'https://www.cse.iitb.ac.in/~sri/papers/LCM-ETRnD2022.pdf', kind: 'article', note: 'Deeper academic read for companions who want the research behind the model.' }
          ],
          discussionPrompts: [
            { title: 'Weekly focus', prompt: 'Share one moment from your practice sessions this week where the learner was doing rather than watching. What triggered the shift?' }
          ]
        },
        {
          title: 'Learning Dialogues (LeD) and Reflection Spots',
          summary: 'Short concept segments with strategic pauses that make the learner think.',
          content: 'A Learning Dialogue (LeD) is a short video or explanation with a strategic pause point — a Reflection Spot — where the learner is asked to recollect, apply or evaluate what they just saw, before the dialogue resumes and addresses the anticipated answers. In IMLC sessions, you are the dialogue: explain a small chunk, pause, ask, listen, then respond to what the child actually said. This lesson shows the anatomy of a LeD and how to design reflection spots that neurodivergent learners find inviting rather than stressful.',
          videoUrl: 'https://www.youtube.com/embed/Jkpr5_sPj34',
          durationMinutes: 14,
          order: 2,
          reflectionSpots: [
            { prompt: 'Reflection spot: why is "explain for 3 minutes, then pause with a question" more effective than "explain for 15 minutes, then quiz"?', hint: 'Think about working memory and the chance to act on feedback early.' },
            { prompt: 'Design one reflection-spot question you could ask a child midway through showing them a new coding block.', hint: 'Prediction questions ("what do you think happens if…") work especially well.' }
          ],
          lbdQuestions: [
            {
              prompt: 'Where should a reflection spot ideally sit inside a LeD?',
              options: [
                { text: 'Only at the very end, as a summary check', feedback: 'That becomes a quiz, not a dialogue. The pause belongs at a strategic point mid-way, where thinking changes what comes next.' },
                { text: 'At a strategic pause point, with the following segment responding to likely answers', feedback: 'Correct! The second half of the LeD should anticipate and address the learner’s probable responses.' },
                { text: 'Before any content, to test prior knowledge', feedback: 'Priming can help, but a reflection spot is specifically a pause inside the dialogue, after some content has set up the question.' }
              ],
              answer: 1
            }
          ],
          subjectivePrompts: [
            { prompt: 'Write the script of a 2-minute LeD (with one reflection spot) introducing "saving your work" to a 10-year-old digital artist.', exemplar: 'Script: "Remember last week when the app closed and your rainbow dragon vanished? Today we make sure that never happens again. Files are like treasure chests for your art…" [Reflection spot: "Before I show you — where do you think the drawing goes when we press Save?"] Then respond to their guess, show the save dialog, and let them save the file themselves twice.' }
          ],
          resources: [
            { title: 'NPTEL: Designing Learner-Centric MOOCs (full course)', url: 'https://onlinecourses.nptel.ac.in/noc26_ge12/preview', kind: 'video', note: 'The complete IIT Bombay course this training is based on.' }
          ],
          discussionPrompts: [
            { title: 'Weekly focus', prompt: 'Post your best reflection-spot question of the week and describe how the child responded to it.' }
          ]
        },
        {
          title: 'LbD, LxT and LxI in Practice',
          summary: 'Doing, extending, and interacting — closing the loop after the dialogue.',
          content: 'Learning by Doing (LbD) activities follow every LeD: ungraded practice with immediate, constructive feedback on every choice — so a wrong answer teaches as much as a right one. Learning Extension Trajectories (LxT) offer optional pathways — worksheets, alternative visual or sensory materials, deeper reads — matched to the learner’s niche and level. Learner Experience Interactions (LxI) connect learners (and for IMLC, companions) with each other through weekly focus questions. Together they turn a lesson from a broadcast into a cycle: dialogue, doing, extension, interaction.',
          videoUrl: 'https://www.youtube.com/embed/zAflkxPyDJA',
          durationMinutes: 15,
          order: 3,
          reflectionSpots: [
            { prompt: 'Reflection spot: why does LCM insist that LbD activities stay ungraded?', hint: 'Consider what grading does to a learner’s willingness to attempt and to fail safely.' }
          ],
          lbdQuestions: [
            {
              prompt: 'A child picks a wrong option in an LbD activity. What should happen next, according to the LCM model?',
              options: [
                { text: 'They lose a point and move to the next question', feedback: 'LbDs are ungraded by design. Points punish exploration; feedback fuels it.' },
                { text: 'They immediately see specific feedback explaining why that choice does not work', feedback: 'Yes! Every option carries authored feedback, so each attempt becomes a micro-lesson.' },
                { text: 'The correct answer is revealed so they can memorise it', feedback: 'Revealing the answer skips the thinking. Feedback on their specific choice lets them reason their way to it.' }
              ],
              answer: 1
            },
            {
              prompt: 'Which of these is the best example of an LxT for a visual learner exploring digital art?',
              options: [
                { text: 'The same lesson text, repeated', feedback: 'An LxT extends the trajectory — it is new, optional material matched to the learner, not repetition.' },
                { text: 'A curated video walkthrough of a colour-palette tool, tagged "visual, beginner"', feedback: 'Exactly — an optional, tagged pathway matched to the learner’s niche and modality.' },
                { text: 'A mandatory graded assignment', feedback: 'LxTs are optional trajectories, not gates. Mandatory grading belongs to neither LbD nor LxT.' }
              ],
              answer: 1
            }
          ],
          subjectivePrompts: [
            { prompt: 'Describe one LxI focus question you would post to the IMLC companion cohort this week, and what you hope the discussion surfaces.', exemplar: 'Focus question: "What is one adaptation you made this week for a learner’s sensory preference, and how did it land?" I would hope it surfaces a library of small, reusable adaptations and normalises sharing failed attempts as much as wins.' }
          ],
          resources: [
            { title: 'What is an LxT? (IIT Bombay)', url: 'https://www.youtube.com/watch?v=zAflkxPyDJA', kind: 'video', note: 'Short explainer on extension trajectories.' },
            { title: 'LCM Model resources page', url: 'https://lcm-model.org/', kind: 'tool', note: 'Templates and examples for each LCM component.' }
          ],
          discussionPrompts: [
            { title: 'Weekly focus', prompt: 'Which LCM component do you find hardest to run live in a 1-1 session, and what would help?' }
          ]
        }
      ]
    },
    {
      title: 'Running Spark Sessions',
      description: 'Plan and run the three Spark Sessions that uncover a child’s career niche and interest profile.',
      category: 'LC Practice',
      level: 'Intermediate',
      accent: 'emerald',
      status: 'published',
      lessons: [
        {
          title: 'Discovering the Child’s Niche',
          summary: 'Session 1: observe interests without steering them.',
          content: 'The first Spark Session is about listening. You bring three short, open-ended activities from different niches — for example a drawing warm-up, a story-starter, and a block-coding toy — and observe which one the child returns to, talks about, or extends without prompting. Record observations in the interest profile template: what they chose, how long they stayed, what language they used. Resist evaluating quality; you are mapping energy, not skill. Understanding what learners expect from a session is the foundation of meeting them where they are.',
          videoUrl: 'https://www.youtube.com/embed/Il8AN_UIEIc',
          durationMinutes: 13,
          order: 1,
          reflectionSpots: [
            { prompt: 'Reflection spot: a child spends the whole session lining up the coding blocks by colour instead of building the program. What might this tell you, and what would you try next session?', hint: 'There is more than one valid reading — pattern-seeking, sensory preference, or avoidance.' }
          ],
          lbdQuestions: [
            {
              prompt: 'During Spark Session 1, the child asks "am I doing this right?" What is the best companion response?',
              options: [
                { text: '"Yes, perfect!" — keep their confidence high', feedback: 'Well-meant, but it signals there IS a right answer, which shifts the child from exploring to performing.' },
                { text: '"There’s no right way here — I’m curious what you’ll try next."', feedback: 'Yes — this keeps the session exploratory and keeps your observation data honest.' },
                { text: 'Correct their technique so they build good habits early', feedback: 'Spark Sessions map interest, not technique. Correction comes much later, inside the niche they choose.' }
              ],
              answer: 1
            }
          ],
          subjectivePrompts: [
            { prompt: 'Draft the three warm-up activities you would bring to a first Spark Session for a 14-year-old who "hates school but loves YouTube".', exemplar: 'A thumbnail-remix activity (design a better thumbnail for their favourite video), a 60-second script-writing prompt for a channel intro, and a simple video-trimming task on a phone. All three are YouTube-native but each probes a different niche: visual design, writing, and editing.' }
          ],
          resources: [
            { title: 'Interest profile template (IMLC)', url: 'https://lcm-model.org/', kind: 'worksheet', note: 'Fill one per Spark Session; upload to the mentor dashboard afterwards.' }
          ],
          discussionPrompts: [
            { title: 'Weekly focus', prompt: 'What surprised you most in your last Spark Session observation, and did it change the niche you had assumed?' }
          ]
        },
        {
          title: 'Planning Interest-Driven Activities',
          summary: 'Turn the interest profile into a custom session plan in under 10 minutes.',
          content: 'Once the niche is identified, session planning becomes assembly rather than invention. Start from the child’s interest profile, pick a template from the resource library that matches age, niche and difficulty, and adapt only the surface details to the child’s current obsession. A good course design principle applies here too: structure first, content second. A well-structured 30-minute plan is one LeD-style dialogue, one LbD-style hands-on block, one optional LxT extension, and one LxI-style share-out with a parent, peer, or mentor.',
          videoUrl: 'https://www.youtube.com/embed/fuPszWkwFag',
          durationMinutes: 16,
          order: 2,
          reflectionSpots: [
            { prompt: 'Reflection spot: which part of your current planning routine takes the longest, and which LCM structure could replace it with assembly from templates?', hint: 'Most companions report the search for activities takes longer than the session design itself.' }
          ],
          lbdQuestions: [
            {
              prompt: 'You have 10 minutes to prepare a session for a child whose niche is creative writing. The fastest LCM-aligned approach is to:',
              options: [
                { text: 'Search the web for fresh writing exercises', feedback: 'That is the 3-hours-on-Pinterest trap the studio exists to eliminate. Start from the tagged template library instead.' },
                { text: 'Pick a tagged writing template from the library and swap in the child’s current favourite fandom', feedback: 'Correct — assembly over invention. The structure is reusable; only the surface theme changes.' },
                { text: 'Reuse last week’s plan unchanged', feedback: 'Reuse is good, but with zero adaptation the session stops tracking the child’s interests. Swap the surface details at minimum.' }
              ],
              answer: 1
            }
          ],
          subjectivePrompts: [
            { prompt: 'Write your post-session reflection for an imagined session that went badly in the middle but recovered at the end.', exemplar: 'The middle block ran long: the worksheet had too much text and Kabir shut down around minute 15. I switched to the verbal version and let him dictate while I typed, and he re-engaged and finished the story arc. Next time I will bring the low-text variant from the start and keep the written version as an LxT for home.' }
          ],
          resources: [
            { title: 'Session plan template library', url: 'https://lcm-model.org/', kind: 'worksheet', note: 'Tagged by age, niche, and difficulty by the Content Author.' }
          ],
          discussionPrompts: [
            { title: 'Weekly focus', prompt: 'Share a template adaptation that took you under 10 minutes and worked. What made it fast?' }
          ]
        }
      ]
    },
    {
      title: 'Understanding Neurodivergent Learners',
      description: 'Practical foundations: attention, sensory preferences, and communication styles in ADHD and autistic learners aged 10-15.',
      category: 'Foundations',
      level: 'Beginner',
      accent: 'blue',
      status: 'published',
      lessons: [
        {
          title: 'Attention and Engagement',
          summary: 'Work with the learner’s attention pattern, not against it.',
          content: 'Attention in ADHD learners is not absent — it is interest-gated. The same child who cannot sit through a 10-minute explanation can hyperfocus for an hour on a task inside their niche. Practical implications for sessions: lead with the interesting part, keep instruction chunks under 5 minutes, make transitions explicit and predictable, and treat movement as a support rather than a violation. When engagement drops, change the activity’s format before changing its topic.',
          durationMinutes: 11,
          order: 1,
          reflectionSpots: [
            { prompt: 'Reflection spot: recall a moment when a learner’s "distraction" was actually attention pointed somewhere better. What were they attending to?', hint: 'Off-task behaviour often reveals the real interest profile.' }
          ],
          lbdQuestions: [
            {
              prompt: 'Mid-session, your learner starts spinning in their chair while still answering your questions correctly. You should:',
              options: [
                { text: 'Pause the session until they sit still', feedback: 'Movement is often self-regulation that SUPPORTS attention. Stopping the session punishes a coping strategy that was working.' },
                { text: 'Continue — the movement is likely helping them regulate and attend', feedback: 'Right. Judge engagement by their responses, not their posture.' },
                { text: 'Switch to an easier activity', feedback: 'Their correct answers show the difficulty is fine. The movement is regulation, not struggle.' }
              ],
              answer: 1
            }
          ],
          subjectivePrompts: [
            { prompt: 'Describe two format changes (not topic changes) you could make mid-session when engagement drops.', exemplar: 'Switch modality: from reading the instructions to me acting them out and the child correcting me. Switch role: from the child answering my questions to the child quizzing me and judging my answers. Both keep the same content but reset engagement.' }
          ],
          resources: [
            { title: 'Sensory-friendly session checklist', url: 'https://lcm-model.org/', kind: 'worksheet', note: 'Run through this before the first session in any new environment.' }
          ],
          discussionPrompts: [
            { title: 'Weekly focus', prompt: 'What is one engagement signal you have learned to read in your learner that an outsider would misread?' }
          ]
        }
      ]
    }
  ];

  const quizzesData = [
    [
      { lessonIndex: 0, questions: [
        { prompt: 'The central question of learner-centric design is:', options: ['How polished is the content?', 'What does the learner do with it?', 'How long is the session?', 'Which platform hosts the video?'], answer: 1 },
        { prompt: 'IMLC adopted the LCM model primarily to:', options: ['Grade learners more accurately', 'Train Learning Companions in active, learner-driven sessions', 'Replace mentors with videos', 'Standardise school syllabi'], answer: 1 }
      ]},
      { lessonIndex: 1, questions: [
        { prompt: 'A Reflection Spot is:', options: ['A graded pop quiz', 'A strategic pause where the learner recollects, applies or evaluates', 'A break for the instructor', 'A summary slide'], answer: 1 },
        { prompt: 'After the pause, the LeD should:', options: ['Move to unrelated content', 'Respond to the learner’s anticipated answers', 'Repeat the same segment', 'End immediately'], answer: 1 }
      ]},
      { lessonIndex: 2, questions: [
        { prompt: 'LbD activities are:', options: ['Graded exams', 'Ungraded practice with feedback on every option', 'Optional reading lists', 'Weekly discussions'], answer: 1 },
        { prompt: 'LxI connects learners through:', options: ['Focus questions and peer discussion', 'Individual worksheets', 'Timed tests', 'Certificates'], answer: 0 }
      ]}
    ],
    [
      { lessonIndex: 0, questions: [
        { prompt: 'The goal of Spark Session 1 is to:', options: ['Teach foundational skills', 'Map the child’s interests through observation', 'Assess academic level', 'Set homework'], answer: 1 }
      ]},
      { lessonIndex: 1, questions: [
        { prompt: 'LCM-aligned session planning is fastest when you:', options: ['Invent new activities weekly', 'Assemble from tagged templates and adapt surface details', 'Reuse plans unchanged', 'Skip planning'], answer: 1 }
      ]}
    ],
    [
      { lessonIndex: 0, questions: [
        { prompt: 'Attention in ADHD learners is best described as:', options: ['Absent', 'Interest-gated', 'Unlimited', 'Identical to neurotypical attention'], answer: 1 }
      ]}
    ]
  ];

  for (let i = 0; i < coursesData.length; i++) {
    const course = await Course.create(coursesData[i]);
    course.quizzes = quizzesData[i].map((quiz) => ({
      lessonId: course.lessons[quiz.lessonIndex]._id,
      questions: quiz.questions
    }));
    await course.save();
  }

  console.log(`Seeded ${admin.email}, ${author.email}, ${learner.email} and ${coursesData.length} LCM courses`);
  return { admin, author, learner };
}
