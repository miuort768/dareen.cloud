export interface McqQuestion {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
}

export interface QuizSet {
  id: string
  title: string
  description: string
  questions: McqQuestion[]
}

export interface LanguageQuiz {
  placement: QuizSet
  levels: [QuizSet, QuizSet, QuizSet]
}

export type QuizLanguageId = 'arabic' | 'english' | 'french' | 'spanish'

const q = (id: string, prompt: string, options: string[], correctIndex: number): McqQuestion => ({
  id,
  prompt,
  options,
  correctIndex,
})

/* ------------------------------ العربية ------------------------------ */

const arabicPlacement: QuizSet = {
  id: 'placement',
  title: 'اختبار تحديد المستوى',
  description: 'أسئلة عامة لمعرفة مستواك الحالي في اللغة العربية',
  questions: [
    q('ar-placement-1', 'كم عدد حروف اللغة العربية؟', ['28', '30', '26', '25'], 0),
    q(
      'ar-placement-2',
      'أي مجموعة هي حروف المد؟',
      ['(ا، و، ي)', '(ب، ت، ث)', '(م، ن، ل)', '(ص، ض، ط)'],
      0,
    ),
    q(
      'ar-placement-3',
      'كلمة «ذهبَ» في جملة «ذهبَ الولدُ إلى المدرسةِ» فعل…',
      ['ماضٍ', 'مضارع', 'أمر', 'ناقص'],
      0,
    ),
    q('ar-placement-4', 'المضاف إليه يكون دائمًا…', ['مجرورًا', 'مرفوعًا', 'منصوبًا', 'مبنيًا'], 0),
    q('ar-placement-5', 'مرادف كلمة «سعيد»:', ['فرِح', 'حزين', 'غاضب', 'خائف'], 0),
    q('ar-placement-6', 'جمع كلمة «كتاب»:', ['كُتُب', 'كاتِب', 'كُتّاب', 'مُكاتَب'], 0),
    q(
      'ar-placement-7',
      'في جملة «المدرسةُ جميلةٌ» كلمة «جميلة»:',
      ['خبر', 'مبتدأ', 'فاعل', 'مفعول به'],
      0,
    ),
    q(
      'ar-placement-8',
      'أي جملة صحيحة الترتيب؟',
      [
        'يلعبُ الأطفالُ في الحديقةِ',
        'الحديقة الأطفالَ يلعبُ في',
        'في الأطفالَ يلعبُ الحديقةِ',
        'الحديقةُ الأطفالَ في يلعبُ',
      ],
      0,
    ),
  ],
}

const arabicLevel1: QuizSet = {
  id: 'level-1',
  title: 'المستوى الأول',
  description: 'المفردات والأساسيات',
  questions: [
    q('ar-level1-1', 'عكس كلمة «طويل»:', ['قصير', 'عريض', 'واسع', 'قريب'], 0),
    q(
      'ar-level1-2',
      'أكمل: «الطالبةُ ……… دروسَها كلَّ يوم»',
      ['تُراجِعُ', 'يجلسُ', 'يلعبُ', 'ينامُ'],
      0,
    ),
    q('ar-level1-3', 'مفرد كلمة «معلمات»:', ['مُعَلِّمَة', 'مُعَلِّم', 'مَعلَم', 'مُعَلَّم'], 0),
    q('ar-level1-4', 'ضمير المخاطبة المؤنثة:', ['أنتِ', 'أنتَ', 'أنتَما', 'أنتُم'], 0),
    q('ar-level1-5', 'حرف الجر في «الكتابُ على الطاولةِ»:', ['على', 'من', 'في', 'إلى'], 0),
    q('ar-level1-6', 'جمع كلمة «قلم»:', ['أقلام', 'قُلام', 'قُلوم', 'قَليم'], 0),
    q(
      'ar-level1-7',
      'همزة كلمة «سأل»:',
      ['همزة قطع على الألف', 'همزة وصل', 'همزة على الياء', 'لا توجد همزة'],
      0,
    ),
    q('ar-level1-8', 'ضد «الكذب»:', ['الصدق', 'الحسد', 'الخوف', 'الغضب'], 0),
  ],
}

const arabicLevel2: QuizSet = {
  id: 'level-2',
  title: 'المستوى الثاني',
  description: 'بنية الجملة والقواعد المتوسطة',
  questions: [
    q(
      'ar-level2-1',
      'إعراب «معلّمُ» في «جاءَ معلّمُ الصفِّ»:',
      ['فاعل مرفوع', 'مبتدأ مرفوع', 'مفعول به منصوب', 'خبر مرفوع'],
      0,
    ),
    q(
      'ar-level2-2',
      'أي جملة صحيحة مع «إنّ»؟',
      ['إنّ الطالبَ مجتهدٌ', 'إنّ الطالبُ مجتهدٌ', 'إنَّ الطلابُ مجتهدٌ', 'إنَّ الطالبَ مجتهدًا'],
      0,
    ),
    q('ar-level2-3', 'المفعول به يكون دائمًا…', ['منصوبًا', 'مرفوعًا', 'مجرورًا', 'مجزومًا'], 0),
    q('ar-level2-4', 'المصدر من الفعل «كتبَ»:', ['كِتابة', 'كاتِب', 'مكتوب', 'مكتَب'], 0),
    q('ar-level2-5', 'جمع كلمة «علم»:', ['علوم', 'أعلام', 'عُلومي', 'علْماء'], 0),
    q(
      'ar-level2-6',
      'التاء في كلمة «مدرسة» عند الوقف تُنطق:',
      ['هاء', 'تاء مكسورة', 'ألفًا', 'لا تنطق'],
      0,
    ),
    q('ar-level2-7', 'أي الكلمات التالية مؤنثة؟', ['طاولة', 'قلم', 'باب', 'دفتر'], 0),
    q(
      'ar-level2-8',
      'حرف «كان» يدخل على الجملة الاسمية فيرفع…',
      ['المبتدأ ويسمى اسمها', 'الخبر ويُسمى خبرها', 'الفاعل', 'المفعول به'],
      0,
    ),
  ],
}

const arabicLevel3: QuizSet = {
  id: 'level-3',
  title: 'المستوى الثالث',
  description: 'قواعد متقدمة وتطبيقات',
  questions: [
    q(
      'ar-level3-1',
      'إعراب «الفتى» في «جاءَ الفتى»:',
      ['فاعل مرفوع بضمة مقدرة', 'فاعل مرفوع بضمة ظاهرة', 'مبتدأ مرفوع', 'خبر مرفوع'],
      0,
    ),
    q(
      'ar-level3-2',
      '«كاد» من أخوات «كان» تفيد:',
      ['المقاربة', 'الاستمرار', 'التبعيض', 'النفي'],
      0,
    ),
    q(
      'ar-level3-3',
      'في «قرأتُ القصةَ قراءةً جميلةً» المفعول المطلق هو:',
      ['قراءةً', 'القصةَ', 'جميلةً', 'قرأتُ'],
      0,
    ),
    q(
      'ar-level3-4',
      'همزة الفعل «استغفر»:',
      ['همزة وصل', 'همزة قطع', 'همزة متطرفة', 'لا توجد همزة'],
      0,
    ),
    q(
      'ar-level3-5',
      'الاسم الموصول «الذي» يطابق ما بعده في:',
      ['العدد والنوع', 'الإعراب فقط', 'الحركة الأخيرة', 'الحرف الأول'],
      0,
    ),
    q('ar-level3-6', 'أسلوب «ما أجملَ السماءَ!»:', ['تعجّب', 'تمنّي', 'استفهام', 'نفي'], 0),
    q('ar-level3-7', 'فعل الأمر من «اجتهد»:', ['اجتهد', 'اجتهاد', 'مجتهد', 'يَجتهد'], 0),
    q(
      'ar-level3-8',
      'معنى «الفَلَك»:',
      [
        'العلم الذي يدرس النجوم والكواكب',
        'العلم الذي يدرس التربة',
        'العلم الذي يدرس الأجسام',
        'العلم الذي يدرس المعادن',
      ],
      0,
    ),
  ],
}

/* ------------------------------ الإنجليزية ------------------------------ */

const englishPlacement: QuizSet = {
  id: 'placement',
  title: 'Placement Test',
  description: 'أسئلة عامة لمعرفة مستواك الحالي في الإنجليزية',
  questions: [
    q(
      'en-placement-1',
      'The plural of "child" is:',
      ['children', 'childs', 'childes', 'childrens'],
      0,
    ),
    q('en-placement-2', 'She ___ to school every day.', ['goes', 'go', 'going', 'gone'], 0),
    q('en-placement-3', 'Which word is a noun?', ['table', 'happy', 'quickly', 'sit'], 0),
    q('en-placement-4', 'The past form of "go" is:', ['went', 'gone', 'goed', 'goen'], 0),
    q('en-placement-5', 'The opposite of "hot" is:', ['cold', 'warm', 'soft', 'tall'], 0),
    q('en-placement-6', 'I ___ a student.', ['am', 'is', 'are', 'be'], 0),
    q(
      'en-placement-7',
      'Which sentence is correct?',
      [
        "He doesn't like coffee.",
        "He don't like coffee.",
        'He not like coffee.',
        "He doesn't likes coffee.",
      ],
      0,
    ),
    q('en-placement-8', 'The Arabic meaning of "book" is:', ['كتاب', 'قلم', 'دفتر', 'مدرسة'], 0),
  ],
}

const englishLevel1: QuizSet = {
  id: 'level-1',
  title: 'المستوى الأول',
  description: 'الأساسيات والمفردات اليومية',
  questions: [
    q('en-level1-1', '___ is your name?', ['What', 'How', 'Who', 'Where'], 0),
    q(
      'en-level1-2',
      'Choose the correct article: ___ apple.',
      ['an', 'a', 'the same', 'no article'],
      0,
    ),
    q('en-level1-3', '"blue" means:', ['أزرق', 'أحمر', 'أخضر', 'أصفر'], 0),
    q('en-level1-4', '"cats" is the plural of:', ['cat', 'cate', 'kot', 'cats'], 0),
    q(
      'en-level1-5',
      '"Good morning" in Arabic:',
      ['صباح الخير', 'مساء الخير', 'تصبح على خير', 'السلام عليكم'],
      0,
    ),
    q('en-level1-6', 'The number "nine" is:', ['تسعة', 'ثمانية', 'عشرة', 'سبعة'], 0),
    q('en-level1-7', 'She ___ happy.', ['is', 'are', 'am', 'be'], 0),
    q('en-level1-8', 'I ___ a book yesterday.', ['read', 'reads', 'reading', 'will read'], 0),
  ],
}

const englishLevel2: QuizSet = {
  id: 'level-2',
  title: 'المستوى الثاني',
  description: 'الأزمنة والقواعد المتوسطة',
  questions: [
    q('en-level2-1', 'Look! The baby ___.', ['is sleeping', 'sleeps', 'sleep', 'slept'], 0),
    q('en-level2-2', 'I have lived here ___ 2010.', ['since', 'for', 'from', 'at'], 0),
    q(
      'en-level2-3',
      'The comparative of "tall" is:',
      ['taller', 'more tall', 'tallier', 'most tall'],
      0,
    ),
    q('en-level2-4', "He doesn't ___ coffee.", ['like', 'likes', 'liking', 'liked'], 0),
    q('en-level2-5', '___ you like some tea? (offering)', ['Would', 'Do', 'Does', 'Was'], 0),
    q(
      'en-level2-6',
      'While I ___ , the phone rang.',
      ['was cooking', 'cook', 'cooked', 'am cooking'],
      0,
    ),
    q(
      'en-level2-7',
      'The opposite of "interesting" is:',
      ['boring', 'exciting', 'wonderful', 'important'],
      0,
    ),
    q('en-level2-8', 'He said he ___ come.', ['would', 'will', 'was', 'did'], 0),
  ],
}

const englishLevel3: QuizSet = {
  id: 'level-3',
  title: 'المستوى الثالث',
  description: 'قواعد متقدمة وتعبيرات دقيقة',
  questions: [
    q('en-level3-1', 'If I ___ you, I would study harder.', ['were', 'was', 'am', 'be'], 0),
    q(
      'en-level3-2',
      'The passive: "The cake ___ by my mother."',
      ['was baked', 'baked', 'is baking', 'bakes'],
      0,
    ),
    q(
      'en-level3-3',
      'Despite the rain, we ___ our walk.',
      ['continued', 'continue', 'are continuing', 'continuous'],
      0,
    ),
    q('en-level3-4', 'You ___ wear a seatbelt.', ['must', "can't", 'might not', "needn't have"], 0),
    q(
      'en-level3-5',
      'The phrasal verb "give up" means:',
      ['quit', 'start', 'continue', 'improve'],
      0,
    ),
    q(
      'en-level3-6',
      'The man ___ car was stolen called the police.',
      ['whose', 'who', 'which', 'whom'],
      0,
    ),
    q('en-level3-7', 'I wish I ___ taller.', ['were', 'was', 'am', 'will be'], 0),
    q('en-level3-8', 'She sings ___.', ['beautifully', 'beautiful', 'beauty', 'beautify'], 0),
  ],
}

/* ------------------------------ الفرنسية ------------------------------ */

const frenchPlacement: QuizSet = {
  id: 'placement',
  title: 'اختبار تحديد المستوى',
  description: 'أسئلة عامة لمعرفة مستواك الحالي في الفرنسية',
  questions: [
    q('fr-placement-1', '"Bonjour" تعني:', ['مرحبًا', 'مع السلامة', 'شكرًا', 'من فضلك'], 0),
    q('fr-placement-2', '"Merci" تعني:', ['شكرًا', 'نعم', 'لا', 'وداعًا'], 0),
    q(
      'fr-placement-3',
      '"Comment tu t\'appelles ?" تعني:',
      ['ما اسمك؟', 'كيف حالك؟', 'أين تسكن؟', 'كم عمرك؟'],
      0,
    ),
    q('fr-placement-4', 'Elle ___ une pomme.', ['mange', 'manges', 'mangent', 'manger'], 0),
    q('fr-placement-5', '___ livre (the book):', ['Le', 'La', 'Les', "L'"], 0),
    q('fr-placement-6', 'عكس كلمة "grand":', ['petit', 'beau', 'vieux', 'rapide'], 0),
    q('fr-placement-7', '"Oui" تعني:', ['نعم', 'لا', 'ربما', 'أبدًا'], 0),
    q('fr-placement-8', '"deux" هو العدد:', ['اثنان', 'ثلاثة', 'أربعة', 'خمسة'], 0),
  ],
}

const frenchLevel1: QuizSet = {
  id: 'level-1',
  title: 'المستوى الأول',
  description: 'التحيات والأساسيات',
  questions: [
    q('fr-level1-1', '"Au revoir" تعني:', ['إلى اللقاء', 'مرحبًا', 'شكرًا', 'صباح الخير'], 0),
    q('fr-level1-2', '"S\'il vous plaît" تعني:', ['من فضلك', 'معذرة', 'أهلًا', 'إن شاء الله'], 0),
    q('fr-level1-3', 'Je ___ étudiant.', ['suis', 'es', 'est', 'sont'], 0),
    q('fr-level1-4', '___ chien (the dog):', ['Le', 'La', 'Les', "L'"], 0),
    q('fr-level1-5', '"la maison" تعني:', ['المنزل', 'المدرسة', 'الحديقة', 'السيارة'], 0),
    q('fr-level1-6', '"trois" هو العدد:', ['ثلاثة', 'اثنان', 'أربعة', 'واحد'], 0),
    q('fr-level1-7', 'الجملة المنفية: "Je ne sais ___."', ['pas', 'non', 'rien', 'plus'], 0),
    q(
      'fr-level1-8',
      '"Où est la gare ?" تعني:',
      ['أين المحطة؟', 'أين السوق؟', 'أين المدرسة؟', 'أين البيت؟'],
      0,
    ),
  ],
}

const frenchLevel2: QuizSet = {
  id: 'level-2',
  title: 'المستوى الثاني',
  description: 'تصريف الأفعال والقواعد المتوسطة',
  questions: [
    q('fr-level2-1', 'Nous ___ français. (speak)', ['parlons', 'parlez', 'parlent', 'parle'], 0),
    q('fr-level2-2', 'Je ___ mes devoirs. (do)', ['fais', 'faits', 'font', 'font'], 0),
    q('fr-level2-3', 'المؤنث من "un ami":', ['une amie', 'un amie', 'une ami', 'un amies'], 0),
    q(
      'fr-level2-4',
      "J'ai ___ un film. (watched)",
      ['regardé', 'regardez', 'regarde', 'regarder'],
      0,
    ),
    q(
      'fr-level2-5',
      'Il ___ à huit heures. (arrives)',
      ['arrive', 'arrives', 'arrivent', 'arriver'],
      0,
    ),
    q('fr-level2-6', '"beaucoup" تعني:', ['كثيرًا', 'قليلًا', 'أحيانًا', 'دائمًا'], 0),
    q('fr-level2-7', '"Demain" تعني:', ['غدًا', 'اليوم', 'أمس', 'الآن'], 0),
    q('fr-level2-8', 'La voiture ___ rouge.', ['est', 'es', 'suis', 'sommes'], 0),
  ],
}

const frenchLevel3: QuizSet = {
  id: 'level-3',
  title: 'المستوى الثالث',
  description: 'قواعد متقدمة وتعبيرات دقيقة',
  questions: [
    q(
      'fr-level3-1',
      "Si j'avais de l'argent, j'___ un billet. (would buy)",
      ['achèterais', 'achète', 'achetais', 'acheter'],
      0,
    ),
    q(
      'fr-level3-2',
      "Je ___ un café, s'il vous plaît. (would like)",
      ['voudrais', 'veux', 'voulais', 'voulu'],
      0,
    ),
    q(
      'fr-level3-3',
      '"J\'ai froid" تعني:',
      ['أشعر بالبرد', 'أشعر بالجوع', 'أشعر بالتعب', 'أشعر بالسعادة'],
      0,
    ),
    q('fr-level3-4', '"Il pleut" تعني:', ['إنها تمطر', 'إنها تثلج', 'الجو مشمس', 'الجو غائم'], 0),
    q('fr-level3-5', '"plus tard" تعني:', ['لاحقًا', 'لأول مرة', 'أخيرًا', 'قريبًا'], 0),
    q(
      'fr-level3-6',
      '"Que faites-vous ?" تعني:',
      ['ماذا تفعلون؟', 'أين تذهبون؟', 'متى تسافرون؟', 'لماذا تتأخرون؟'],
      0,
    ),
    q('fr-level3-7', "Nous sommes partis ___ l'aube.", ['à', 'au', 'en', 'dans'], 0),
    q('fr-level3-8', "Elle s'est ___. (washed)", ['lavée', 'lavé', 'lavés', 'laver'], 0),
  ],
}

/* ------------------------------ الإسبانية ------------------------------ */

const spanishPlacement: QuizSet = {
  id: 'placement',
  title: 'اختبار تحديد المستوى',
  description: 'أسئلة عامة لمعرفة مستواك الحالي في الإسبانية',
  questions: [
    q('es-placement-1', '"Hola" تعني:', ['مرحبًا', 'وداعًا', 'شكرًا', 'نعم'], 0),
    q(
      'es-placement-2',
      '"¿Cómo estás?" تعني:',
      ['كيف حالك؟', 'ما اسمك؟', 'كم عمرك؟', 'من أين أنت؟'],
      0,
    ),
    q('es-placement-3', '"Gracias" تعني:', ['شكرًا', 'من فضلك', 'معذرة', 'أهلًا'], 0),
    q('es-placement-4', 'Yo ___ un estudiante.', ['soy', 'eres', 'es', 'son'], 0),
    q('es-placement-5', '___ casa (the house):', ['La', 'El', 'Los', 'Las'], 0),
    q('es-placement-6', '"uno" هو العدد:', ['واحد', 'اثنان', 'ثلاثة', 'أربعة'], 0),
    q(
      'es-placement-7',
      '"Buenos días" تعني:',
      ['صباح الخير', 'مساء الخير', 'تصبح على خير', 'وداعًا'],
      0,
    ),
    q('es-placement-8', '"Adiós" تعني:', ['وداعًا', 'مرحبًا', 'شكرًا', 'نعم'], 0),
  ],
}

const spanishLevel1: QuizSet = {
  id: 'level-1',
  title: 'المستوى الأول',
  description: 'التحيات والأساسيات',
  questions: [
    q('es-level1-1', 'Ellos ___ españoles.', ['son', 'soy', 'eres', 'es'], 0),
    q('es-level1-2', '"hablar" تعني:', ['يتكلم', 'يسمع', 'يقول', 'يكتب'], 0),
    q('es-level1-3', 'جمع "el libro":', ['los libros', 'las libros', 'el libros', 'los libro'], 0),
    q(
      'es-level1-4',
      'Yo ___ María. (llamarse)',
      ['me llamo', 'me llamas', 'te llamas', 'se llama'],
      0,
    ),
    q('es-level1-5', '"No entiendo" تعني:', ['لا أفهم', 'لا أسكن', 'لا أعرف', 'لا أستطيع'], 0),
    q(
      'es-level1-6',
      '"¿Dónde vive usted?" تعني:',
      ['أين تسكن؟', 'ماذا تعمل؟', 'كم عمرك؟', 'كيف حالك؟'],
      0,
    ),
    q('es-level1-7', '"rojo" تعني:', ['أحمر', 'أزرق', 'أخضر', 'أصفر'], 0),
    q('es-level1-8', '"por favor" تعني:', ['من فضلك', 'شكرًا', 'معذرة', 'أهلًا'], 0),
  ],
}

const spanishLevel2: QuizSet = {
  id: 'level-2',
  title: 'المستوى الثاني',
  description: 'تصريف الأفعال والقواعد المتوسطة',
  questions: [
    q('es-level2-1', 'Hoy ___ lunes.', ['es', 'son', 'está', 'están'], 0),
    q('es-level2-2', 'Ayer yo ___ pizza. (comer)', ['comí', 'come', 'como', 'comía'], 0),
    q(
      'es-level2-3',
      '"Me gusta el chocolate" تعني:',
      ['أحب الشوكولاتة', 'أكره الشوكولاتة', 'أشتري الشوكولاتة', 'أبيع الشوكولاتة'],
      0,
    ),
    q('es-level2-4', 'Yo ___ hambre. (tener)', ['tengo', 'tiene', 'tenemos', 'tenéis'], 0),
    q('es-level2-5', 'María es ___ alta que Ana.', ['más', 'menos', 'muy', 'tan'], 0),
    q(
      'es-level2-6',
      '"¿Qué hora es?" تعني:',
      ['كم الساعة؟', 'أين الساعة؟', 'متى الساعة؟', 'لماذا الساعة؟'],
      0,
    ),
    q(
      'es-level2-7',
      '"La semana que viene" تعني:',
      ['الأسبوع القادم', 'الأسبوع الماضي', 'الذي مضى', 'اليوم'],
      0,
    ),
    q('es-level2-8', '¿Hablas ___? (English)', ['inglés', 'francés', 'español', 'árabe'], 0),
  ],
}

const spanishLevel3: QuizSet = {
  id: 'level-3',
  title: 'المستوى الثالث',
  description: 'قواعد متقدمة وتعبيرات دقيقة',
  questions: [
    q(
      'es-level3-1',
      'Cuando era niño, ___ en el campo. (vivir)',
      ['vivía', 'viví', 'vivo', 'vivirá'],
      0,
    ),
    q('es-level3-2', 'Mañana yo ___. (travel)', ['viajaré', 'viajo', 'viajé', 'viajaba'], 0),
    q('es-level3-3', 'Este regalo es ___ ti.', ['para', 'por', 'de', 'con'], 0),
    q(
      'es-level3-4',
      'Llevo dos años ___ español. (estudiar)',
      ['estudiando', 'estudiado', 'estudiaba', 'estudiar'],
      0,
    ),
    q('es-level3-5', 'El jarrón se ___. (fell)', ['cayó', 'cae', 'caía', 'caerá'], 0),
    q(
      'es-level3-6',
      'Ojalá que ___ mañana. (llover)',
      ['llueva', 'llueve', 'llovió', 'lloverá'],
      0,
    ),
    q(
      'es-level3-7',
      '"Me parece bien" تعني:',
      ['يبدو لي جيدًا', 'لا يبدو لي جيدًا', 'أنا بخير', 'ليس لدي وقت'],
      0,
    ),
    q(
      'es-level3-8',
      '"¡Cuánto tiempo!" تعني:',
      ['منذ مدة طويلة!', 'كم من الوقت؟', 'في أي وقت؟', 'حسنًا'],
      0,
    ),
  ],
}

export const languageQuizzes: Record<QuizLanguageId, LanguageQuiz> = {
  arabic: { placement: arabicPlacement, levels: [arabicLevel1, arabicLevel2, arabicLevel3] },
  english: { placement: englishPlacement, levels: [englishLevel1, englishLevel2, englishLevel3] },
  french: { placement: frenchPlacement, levels: [frenchLevel1, frenchLevel2, frenchLevel3] },
  spanish: { placement: spanishPlacement, levels: [spanishLevel1, spanishLevel2, spanishLevel3] },
}

export const allQuizzes: QuizSet[] = Object.values(languageQuizzes).flatMap((lang) => [
  lang.placement,
  ...lang.levels,
])
