export type Stage = {
  id: string;
  level: string;
  title: string;
  skill: string;
  whyItMatters: string;
  mnemonic: string;
  source: string;
  demo: {
    prompt: string;
    answer: string;
    explanation: string;
  };
};

export type PracticeQuestion = {
  id: string;
  stageId: string;
  type: "mcq" | "text";
  prompt: string;
  answer: string;
  options?: string[];
  hint: string;
  explanation: string;
  reviewPrompt: string;
};

export type ReviewCard = {
  id: string;
  front: string;
  back: string;
  anchor: string;
  keywords: string[];
};

export type ListeningStrategy = {
  title: string;
  description: string;
  action: string;
};

export const stages: Stage[] = [
  {
    id: "hotel-and-place-language",
    level: "Level 1",
    title: "Hotel Hopper",
    skill: "Places, signs, and practical exam vocabulary",
    whyItMatters:
      "The paper asks Mihika to identify where to go or what a place is for. She needs quick recognition, not slow translation.",
    mnemonic:
      "Reception receives. Restaurant restores hunger. Garage guards cars.",
    source: "Practice Paper II: sign and location recognition",
    demo: {
      prompt: "Tu peux garer ta voiture ici.",
      answer: "Garage.",
      explanation:
        "The clue is the action. Garer means to park, so the matching place is the garage."
    }
  },
  {
    id: "present-tense-helpers",
    level: "Level 2",
    title: "Verb Workshop",
    skill: "High-frequency present tense verbs",
    whyItMatters:
      "Mihika sees present tense in gap fills before she converts those same verbs into passé composé.",
    mnemonic:
      "Present tense is the toolbox. Passé composé is the same toolbox with a helper verb attached.",
    source: "Practice Paper II: prendre, mettre, remplir, partir, pouvoir",
    demo: {
      prompt: "Vous ______ quand ? [partir]",
      answer: "Vous partez quand ?",
      explanation:
        "With vous in the present tense, partir becomes partez. The sentence is about a current or future plan, not a past action."
    }
  },
  {
    id: "passe-compose-core",
    level: "Level 3",
    title: "Time Travel Lab",
    skill: "Passé composé with avoir",
    whyItMatters:
      "Most verbs in the uploaded practice sets use avoir, so Mihika needs this as the default pathway.",
    mnemonic:
      "Avoir is the backpack helper: I carry ai, as, a, avons, avez, ont into the past.",
    source: "Worksheet 3 and Practice Paper II",
    demo: {
      prompt: "Ma mère ______ ses clés. [perdre]",
      answer: "Ma mère a perdu ses clés.",
      explanation:
        "Perdre normally takes avoir in the passé composé, so we use a + perdu."
    }
  },
  {
    id: "etre-movers",
    level: "Level 4",
    title: "Elevator of Movement",
    skill: "Être verbs and agreement",
    whyItMatters:
      "The worksheets strongly focus on movement and state-change verbs such as aller, arriver, partir, entrer, naître, mourir and rester.",
    mnemonic:
      "If the subject moved or changed state, ask: did it ride the être elevator? Then make the ending agree.",
    source: "Worksheet 2 and Worksheet 3",
    demo: {
      prompt: "Elle ______ au cinéma avec ses amis. [aller]",
      answer: "Elle est allée au cinéma avec ses amis.",
      explanation:
        "Aller takes être. Because the subject is feminine singular, the past participle becomes allée."
    }
  },
  {
    id: "repair-station",
    level: "Level 5",
    title: "Grammar Repair Station",
    skill: "Correcting wrong passé composé forms",
    whyItMatters:
      "The correction worksheet trains Mihika to notice whether the helper verb, participle, and agreement are all correct.",
    mnemonic:
      "Repair in three taps: helper, participle, agreement.",
    source: "Worksheet 3: Corrigez les phrases",
    demo: {
      prompt: "Nous avons allé au parc.",
      answer: "Nous sommes allés au parc.",
      explanation:
        "Aller is an être verb, not an avoir verb. With nous, the participle also takes s: allés."
    }
  },
  {
    id: "reading-and-writing",
    level: "Level 6",
    title: "Story Scout",
    skill: "Reading comprehension and short guided writing",
    whyItMatters:
      "The paper ends with a reading task and a guided piece titled Ma sortie récente, so Mihika needs both recall and composition confidence.",
    mnemonic:
      "Read for gifts, floors, and reasons. Write with who, where, what, wore, ate.",
    source: "Practice Paper II: shopping text and Ma sortie récente",
    demo: {
      prompt: "Pourquoi M. Lafont fait-il du shopping aujourd’hui ?",
      answer: "Parce que c'est Noël ce weekend et il achète pour sa famille.",
      explanation:
        "The reason appears at the start of the passage, and the rest of the text explains whom he is buying for."
    }
  }
];

export const practiceQuestions: PracticeQuestion[] = [
  {
    id: "q-reception",
    stageId: "hotel-and-place-language",
    type: "mcq",
    prompt: "Allons demander la clé de notre chambre.",
    answer: "La réception",
    options: ["Le garage", "La réception", "Le restaurant", "Les toilettes"],
    hint: "Where do you check in and get keys?",
    explanation:
      "Keys are linked to reception, because that is where guests are welcomed and helped.",
    reviewPrompt: "Where do you get the key to your room in a hotel?"
  },
  {
    id: "q-restaurant",
    stageId: "hotel-and-place-language",
    type: "mcq",
    prompt: "Notre table est près de la fenêtre.",
    answer: "Le restaurant",
    options: ["Le restaurant", "Le garage", "La salle de gym", "Le court de tennis"],
    hint: "A table by the window suggests a meal setting.",
    explanation:
      "The clue is table. In this exam set, that points to the restaurant.",
    reviewPrompt: "Which place matches a table by the window?"
  },
  {
    id: "q-garage",
    stageId: "hotel-and-place-language",
    type: "mcq",
    prompt: "Tu peux garer ta voiture ici.",
    answer: "Le garage",
    options: ["Le garage", "La réception", "Le restaurant", "L'ascenseur"],
    hint: "Garer means to park.",
    explanation:
      "The action gives the answer away: parking a car leads to the garage.",
    reviewPrompt: "Which place goes with parking a car?"
  },
  {
    id: "q-sixth-floor",
    stageId: "hotel-and-place-language",
    type: "mcq",
    prompt: "Notre chambre est au 6ème étage.",
    answer: "L'ascenseur",
    options: ["Le restaurant", "Les toilettes", "L'ascenseur", "La salle de gym"],
    hint: "Think about what helps you reach upper floors.",
    explanation:
      "The clue is floor access. In the hotel-sign set, that points to the elevator.",
    reviewPrompt: "Which hotel place best matches going to the 6th floor?"
  },
  {
    id: "q-prenez",
    stageId: "present-tense-helpers",
    type: "text",
    prompt: "______ cette aspirine si vous êtes malade. [prendre]",
    answer: "Prenez",
    hint: "This is a polite/plural command form built from vous.",
    explanation:
      "For vous, prendre becomes prenez. The worksheet uses this as a practical command.",
    reviewPrompt: "What is the correct present tense/imperative form of prendre with vous?"
  },
  {
    id: "q-remplissons",
    stageId: "present-tense-helpers",
    type: "text",
    prompt: "Nous ______ la fiche d'identité. [remplir]",
    answer: "remplissons",
    hint: "Use the nous present tense form.",
    explanation:
      "Remplir is a regular -ir verb here: nous remplissons.",
    reviewPrompt: "How do you say 'we fill in' with remplir?"
  },
  {
    id: "q-mets",
    stageId: "present-tense-helpers",
    type: "text",
    prompt: "Je ______ une chemise bleue et un pantalon noir pour la soirée. [mettre]",
    answer: "mets",
    hint: "Use the je form of mettre.",
    explanation:
      "Mettre becomes mets with je in the present tense: je mets.",
    reviewPrompt: "How do you conjugate mettre with je in the present tense?"
  },
  {
    id: "q-peuvent",
    stageId: "present-tense-helpers",
    type: "text",
    prompt: "Sara et Claudine ______ aller à la fête ce soir. [pouvoir]",
    answer: "peuvent",
    hint: "Plural subject, third person plural form.",
    explanation:
      "Sara et Claudine is plural, so pouvoir becomes peuvent.",
    reviewPrompt: "What is the ils/elles form of pouvoir?"
  },
  {
    id: "q-a-perdu",
    stageId: "passe-compose-core",
    type: "text",
    prompt: "Ma mère ______ ses clés. [perdre]",
    answer: "a perdu",
    hint: "Most verbs use avoir in the passé composé.",
    explanation:
      "Perdre takes avoir, so the full answer is a perdu.",
    reviewPrompt: "What is the passé composé of perdre with elle?"
  },
  {
    id: "q-ont-fini",
    stageId: "passe-compose-core",
    type: "text",
    prompt: "Elles finissent leurs exercices. Transforme au passé composé.",
    answer: "Elles ont fini leurs exercices.",
    hint: "Finir usually takes avoir, not être.",
    explanation:
      "We convert the present tense into a completed action with ont + fini.",
    reviewPrompt: "How do you turn 'Elles finissent leurs exercices' into the passé composé?"
  },
  {
    id: "q-as-compris",
    stageId: "passe-compose-core",
    type: "text",
    prompt: "Tu ______ cette leçon ? [comprendre]",
    answer: "as compris",
    hint: "Comprehendre takes avoir in the passé composé.",
    explanation:
      "With tu, the helper is as and the participle is compris.",
    reviewPrompt: "What is the passé composé of comprendre with tu?"
  },
  {
    id: "q-a-ecrit",
    stageId: "passe-compose-core",
    type: "text",
    prompt: "Mon ami ______ une lettre à sa grand-mère. [écrire]",
    answer: "a écrit",
    hint: "Écrire uses avoir.",
    explanation:
      "The correct completed form is a écrit.",
    reviewPrompt: "How do you form the passé composé of écrire with il/elle?"
  },
  {
    id: "q-est-allee",
    stageId: "etre-movers",
    type: "text",
    prompt: "Elle ______ au cinéma avec ses amis. [aller]",
    answer: "est allée",
    hint: "Aller is one of the movement verbs that takes être.",
    explanation:
      "The helper is est, and allée needs e because elle is feminine singular.",
    reviewPrompt: "What is the passé composé of aller with elle?"
  },
  {
    id: "q-sommes-arrives",
    stageId: "etre-movers",
    type: "text",
    prompt: "Nous ______ à l'aéroport à temps. [arriver]",
    answer: "sommes arrivés",
    hint: "Nous with an être verb needs the present form of être plus agreement.",
    explanation:
      "Arriver takes être here, so the answer is sommes arrivés.",
    reviewPrompt: "How do you form the passé composé of arriver with nous?"
  },
  {
    id: "q-sont-partis",
    stageId: "etre-movers",
    type: "text",
    prompt: "Les élèves ______ tôt ce matin. [partir]",
    answer: "sont partis",
    hint: "Partir is a movement verb that takes être.",
    explanation:
      "With a plural subject, the full form is sont partis.",
    reviewPrompt: "What is the passé composé of partir with ils/elles?"
  },
  {
    id: "q-est-entre",
    stageId: "etre-movers",
    type: "text",
    prompt: "Le chat ______ dans la maison. [entrer]",
    answer: "est entré",
    hint: "Entrer is one of the être verbs in these worksheets.",
    explanation:
      "The helper is est and the masculine singular participle is entré.",
    reviewPrompt: "How do you form the passé composé of entrer with il?"
  },
  {
    id: "q-correction-nous",
    stageId: "repair-station",
    type: "text",
    prompt: "Corrige: Nous avons allé au parc.",
    answer: "Nous sommes allés au parc.",
    hint: "Start by checking the helper verb.",
    explanation:
      "Aller needs être, and with nous the participle agrees: allés.",
    reviewPrompt: "How do you correct 'Nous avons allé au parc'?"
  },
  {
    id: "q-correction-elle",
    stageId: "repair-station",
    type: "text",
    prompt: "Corrige: Elle est mangé une pizza.",
    answer: "Elle a mangé une pizza.",
    hint: "Manger is not an être verb here.",
    explanation:
      "Manger uses avoir in the passé composé, so the corrected form is a mangé.",
    reviewPrompt: "How do you correct 'Elle est mangé une pizza'?"
  },
  {
    id: "q-correction-ils",
    stageId: "repair-station",
    type: "text",
    prompt: "Corrige: Ils sont pris le train.",
    answer: "Ils ont pris le train.",
    hint: "Prendre takes avoir here.",
    explanation:
      "The past participle pris is correct, but the helper should be ont, not sont.",
    reviewPrompt: "How do you correct 'Ils sont pris le train'?"
  },
  {
    id: "q-correction-tu",
    stageId: "repair-station",
    type: "text",
    prompt: "Corrige: Tu as tombé dans la cour.",
    answer: "Tu es tombé dans la cour.",
    hint: "Tomber belongs with être.",
    explanation:
      "Tomber is a movement/state verb here, so tu es tombé is correct.",
    reviewPrompt: "How do you correct 'Tu as tombé dans la cour'?"
  },
  {
    id: "q-reading-reason",
    stageId: "reading-and-writing",
    type: "mcq",
    prompt: "Pourquoi M. Lafont fait-il du shopping aujourd'hui ?",
    answer: "Parce que c'est Noël ce weekend et il achète pour sa famille.",
    options: [
      "Parce qu'il veut acheter une voiture.",
      "Parce que c'est Noël ce weekend et il achète pour sa famille.",
      "Parce qu'il cherche ses clés.",
      "Parce qu'il va au musée."
    ],
    hint: "The reason is given in the first line of the reading text.",
    explanation:
      "The passage opens by explaining that it is Noël this weekend, which motivates the shopping trip.",
    reviewPrompt: "Why is M. Lafont shopping in the reading passage?"
  },
  {
    id: "q-writing-frame",
    stageId: "reading-and-writing",
    type: "mcq",
    prompt: "For Ma sortie récente, which sequence best matches the uploaded paper?",
    answer: "Where, with whom, what you did, what you wore, what you ate and whether you liked it",
    options: [
      "Name, age, favourite colour, favourite subject",
      "Where, with whom, what you did, what you wore, what you ate and whether you liked it",
      "School timings, bus route, homework, marks",
      "Weekend weather, hobbies, pets, sports"
    ],
    hint: "The paper gives a five-part scaffold.",
    explanation:
      "The writing prompt is guided, so Mihika can use it as a checklist rather than inventing structure from scratch.",
    reviewPrompt: "What are the five checkpoints for Ma sortie récente?"
  },
  {
    id: "q-reading-robe",
    stageId: "reading-and-writing",
    type: "mcq",
    prompt: "Quelle robe M. Lafont achète-t-il finalement ?",
    answer: "La robe rouge",
    options: ["La robe noire", "La robe rouge", "La robe bleue", "La robe verte"],
    hint: "The passage states the final choice after he sees many dresses.",
    explanation:
      "The text says he finally buys the red dress.",
    reviewPrompt: "Which dress does M. Lafont finally buy?"
  },
  {
    id: "q-reading-gifts",
    stageId: "reading-and-writing",
    type: "mcq",
    prompt: "Quels cadeaux achète-t-il pour ses enfants ?",
    answer: "Un jeu vidéo pour son fils et une poupée pour sa fille",
    options: [
      "Un chapeau et une robe",
      "Un jeu vidéo pour son fils et une poupée pour sa fille",
      "Deux poupées",
      "Deux jeux vidéo"
    ],
    hint: "The son and daughter receive different gifts.",
    explanation:
      "The reading gives both gifts directly: a video game for the son and a doll for the daughter.",
    reviewPrompt: "What gifts does M. Lafont buy for his children?"
  }
];

export const reviewCards: ReviewCard[] = [
  {
    id: "r-default-avoir",
    front: "Which helper is the default in the passé composé?",
    back: "Avoir is the default helper for most verbs.",
    anchor: "Most verbs wear the avoir backpack.",
    keywords: ["avoir", "default", "most", "verbs", "helper"]
  },
  {
    id: "r-etre-movers",
    front: "When should Mihika check for être?",
    back: "Check for movement or state-change verbs such as aller, arriver, entrer, partir, rentrer, tomber, venir, naître, mourir, rester, devenir.",
    anchor: "Movement often rides the être elevator.",
    keywords: ["movement", "state", "change", "move", "etre", "aller"]
  },
  {
    id: "r-agreement",
    front: "What happens to the past participle after être?",
    back: "It agrees with the subject in gender and number: e for feminine, s for plural when needed.",
    anchor: "Être asks the ending to match the traveler.",
    keywords: ["agree", "match", "gender", "number", "feminine", "plural"]
  },
  {
    id: "r-repair-check",
    front: "What are the three repair checks for a wrong passé composé sentence?",
    back: "Helper verb, past participle, agreement.",
    anchor: "Repair in three taps.",
    keywords: ["helper", "participle", "agreement", "check", "verb"]
  },
  {
    id: "r-writing-check",
    front: "What is the writing checklist for Ma sortie récente?",
    back: "Where you went, with whom, what you did there, what you wore, what you ate and whether you liked it.",
    anchor: "Who, where, did, wore, ate.",
    keywords: ["where", "who", "what", "wore", "ate", "did", "food"]
  },
  {
    id: "r-avoir-pattern",
    front: "What is the standard passé composé pattern with avoir?",
    back: "Subject + avoir in the present + past participle.",
    anchor: "Backpack helper first, action word second.",
    keywords: ["subject", "avoir", "participle", "helper", "past"]
  },
  {
    id: "r-listening-elimination",
    front: "What should Mihika do first in a multiple-choice listening question?",
    back: "Scan the options before listening and identify the category differences such as place, drink, clothing, or action.",
    anchor: "See the battlefield before the audio starts.",
    keywords: ["scan", "look", "options", "before", "listen", "read"]
  }
];

export const listeningStrategies: ListeningStrategy[] = [
  {
    title: "Spot the category fast",
    description:
      "The listening paper shell shows questions about transport, drinks, vegetables, clothes, actions, and film types. Before hearing anything, Mihika should classify each option set.",
    action: "Ask first: am I listening for a place, an object, a person, or an action?"
  },
  {
    title: "Listen for the difference, not every word",
    description:
      "If all four pictures are vegetables, Mihika does not need to decode the whole sentence. She only needs the clue that separates carrot from tomato or onion.",
    action: "Train her to latch onto one decisive noun or adjective."
  },
  {
    title: "Use two-pass listening logic",
    description:
      "The paper states that each remark or dialogue is heard twice. First listen for the gist. Second listen to confirm and eliminate the closest distractor.",
    action: "Pass one: likely answer. Pass two: prove it."
  },
  {
    title: "Circle trap pairs",
    description:
      "Listening distractors often come in close pairs such as drink vs food, bus vs train, or clothing vs accessory. Naming the likely trap keeps attention sharp.",
    action: "Before audio, predict the easiest pair to confuse."
  }
];

export const pedagogyNotes = [
  {
    title: "Spacing + retrieval",
    body:
      "The app schedules short return visits to old ideas instead of keeping Mihika only in new content. Missed items come back sooner; stable items wait longer."
  },
  {
    title: "Game layer stays secondary",
    body:
      "Lives, health, and streaks react to learning quality, but every loss opens a hint and a repair explanation. Progress is tied to understanding, not random reward farming."
  },
  {
    title: "Source fidelity",
    body:
      "The stage map is built from the uploaded worksheets and practice paper: signs and places, present tense gap-fills, passé composé with avoir and être, correction drills, reading comprehension, and guided writing."
  },
  {
    title: "Listening handled honestly",
    body:
      "The uploaded .docx was a listening paper shell without the actual audio prompts, so the site does not invent listening answers or pretend to teach missing material."
  }
];

export const sourceFiles = [
  "Grade_7_French_Term_2-PP-P1.docx",
  "French PP 2.pdf",
  "French Wks 2.pdf",
  "French WS 3.pdf"
];
