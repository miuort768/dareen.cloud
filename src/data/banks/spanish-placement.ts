import type { LevelBank } from './_bank-types'

export const spanishPlacement: LevelBank = {
  id: 'placement',
  title: 'اختبار تحديد المستوى',
  description: '25 سؤالًا سريعًا لمعرفة مستواك في اللغة الإسبانية',
  templates: [
    {
      type: 'tr',
      items: [
        ['casa', 'منزل'],
        ['libro', 'كتاب'],
        ['agua', 'ماء'],
        ['profesor', 'معلّم'],
        ['amigo', 'صديق'],
        ['ciudad', 'مدينة'],
      ],
    },
    {
      type: 'art',
      distractors: ['el', 'la', 'los', 'las'],
      items: [
        ['doctor', 'el'],
        ['mujer', 'la'],
        ['manzana', 'la'],
        ['libros', 'los'],
        ['casas', 'las'],
      ],
    },
    {
      type: 'num',
      items: [
        ['1', 'uno'],
        ['2', 'dos'],
        ['5', 'cinco'],
        ['10', 'diez'],
      ],
    },
    {
      type: 'plur',
      items: [
        ['casa', 'casas'],
        ['perro', 'perros'],
        ['país', 'países'],
        ['reloj', 'relojes'],
        ['flor', 'flores'],
        ['mano', 'manos'],
      ],
    },
    {
      type: 'cloze',
      items: [
        ['Yo ___ español.', 'hablo'],
        ['Nosotros ___ estudiantes.', 'somos'],
        ['Ella ___ un coche.', 'tiene'],
        ['Tú ___ simpático.', 'eres'],
      ],
    },
  ],
}
