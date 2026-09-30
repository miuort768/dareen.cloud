import type { LevelBank } from './_bank-types'

export const frenchPlacement: LevelBank = {
  id: 'placement',
  title: 'اختبار تحديد المستوى',
  description: '25 سؤالًا سريعًا لمعرفة مستواك في اللغة الفرنسية',
  templates: [
    {
      type: 'tr',
      items: [
        ['maison', 'منزل'],
        ['livre', 'كتاب'],
        ['eau', 'ماء'],
        ['professeur', 'معلّم'],
        ['ami', 'صديق'],
        ['ville', 'مدينة'],
      ],
    },
    {
      type: 'art',
      distractors: ['le', 'la', 'les', 'un', 'une'],
      items: [
        ['garçon', 'le'],
        ['fille', 'la'],
        ['pomme', 'la'],
        ['ami', 'un'],
        ['souris', 'une'],
      ],
    },
    {
      type: 'num',
      items: [
        ['1', 'un'],
        ['2', 'deux'],
        ['5', 'cinq'],
        ['10', 'dix'],
      ],
    },
    {
      type: 'plur',
      items: [
        ['chat', 'chats'],
        ['cheval', 'chevaux'],
        ['animal', 'animaux'],
        ['maison', 'maisons'],
        ['travail', 'travaux'],
        ['journal', 'journaux'],
      ],
    },
    {
      type: 'cloze',
      items: [
        ['Je ___ français.', 'parle'],
        ['Nous ___ étudiants.', 'sommes'],
        ['Elle ___ une voiture.', 'a'],
        ['Tu ___ un garçon.', 'es'],
      ],
    },
  ],
}
