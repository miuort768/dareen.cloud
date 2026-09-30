import type { LevelBank } from './_bank-types'

export const englishPlacement: LevelBank = {
  id: 'placement',
  title: 'اختبار تحديد المستوى',
  description: '25 سؤالًا سريعًا لمعرفة مستواك في اللغة الإنجليزية',
  templates: [
    {
      type: 'tr',
      items: [
        ['house', 'منزل'],
        ['book', 'كتاب'],
        ['water', 'ماء'],
        ['teacher', 'معلّم'],
        ['friend', 'صديق'],
        ['city', 'مدينة'],
      ],
    },
    {
      type: 'plur',
      items: [
        ['cat', 'cats'],
        ['child', 'children'],
        ['foot', 'feet'],
        ['box', 'boxes'],
        ['woman', 'women'],
        ['day', 'days'],
      ],
    },
    {
      type: 'num',
      items: [
        ['1', 'one'],
        ['3', 'three'],
        ['7', 'seven'],
        ['12', 'twelve'],
      ],
    },
    {
      type: 'art',
      distractors: ['a', 'an', 'the', 'some'],
      items: [
        ['apple', 'an'],
        ['book', 'a'],
        ['hour', 'an'],
        ['university', 'a'],
        ['umbrella', 'an'],
      ],
    },
    {
      type: 'cloze',
      items: [
        ['She ___ a student at school.', 'is'],
        ['I ___ two brothers.', 'have'],
        ['They ___ playing football now.', 'are'],
        ['___ you like coffee?', 'Do'],
      ],
    },
  ],
}
