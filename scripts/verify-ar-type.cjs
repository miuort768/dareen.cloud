/**
 * verify-ar-type.cjs — validates an `ar-type` template.
 *
 * Prompt is «كلمة «X» هي:», so row[0] must be unique across the WHOLE language,
 * and the label must actually be the right part of speech.
 *
 * Usage: node scripts/verify-ar-type.cjs <fileA.ts> [fileB.ts ...] --expected <n>
 */
const { pathToFileURL } = require('node:url')
const path = require('node:path')

const EXPECTED = 200

const VERBS = new Set(
  ('كتب قرأ فهم حفظ درس سأل أجاب شرح تعلم درب نطق ترجم رسم لوّن نحت نسج خبز طبخ سقى زرع ' +
    'اشترى باع دفع كسب خسر ربح ادخر اقترض التزم وعد كسر أصلحبنى هدم رعى صاد ركب نزل صعد ' +
    'دخل خرج رجع سافر وصل غادر استقبل قال سمع نظر نسي تذكر شعر خاف فرح حزن ضحك بكى نام ' +
    'استيقظ أكل شرب لبس مشى ركض جلس وقف يسكن يذاكر يلعب يقرأ يشرح يفتح ينظر يسافر يرتفع ' +
    'يجري تنمو يمطر تهب يميل تلمع يتلألأ يبدع تزهر يمتد تشرف يعلو يرتفع يصعد ينزل يمتد ' +
    'يجلس يوضع توضع تطل تُفتح يُغلق يعرض يزا��حم يرسو يعبر يتساوى تقع يجري يمتلئ ينحني ' +
    'يقف تُفتح تُسخن تبرد تغسل تنظف تجمع تحمل تُحمل تحمي تُغلق تحط يخذع يرفرف يصطاد ' +
    'يُرسل يستقبل يجيب يصنع يرسم يخزن يغسل ينمو يجتمع يسافر لوّن لون اصلح أصلح بني مشى مشي بُنى بنى').split(/\s+/)
)

const NON_VERB = new Set(
  ('كتاب قلم دفتر مدرسة طالب معلم بيت حديقة مكتبة مدينة مفتاح نافذة باب كرسي طاولة مصباح ' +
    'مرآة سرير خزانة مطبخ حمام حجرة ساحة ملعب حقيبة شنطة مظلة قميص حذاء قبعة خريطة تذكرة ' +
    'سلعة دراجة سيارة حافلة قطار طائرة سفينة طريق جسر نفق محطة متجر سوق مطعم فندق مستشفى ' +
    'صيدلية كنيسة مسجد نهر جبل صحراء غابة حقل بستان واحة عين شلال جزيرة قلعة برج قصر ' +
    'ميناء مطار متحف ناقوس خيمة مزرعة في على من إلى مع لكن هذا كل حيث قبل بعد أثناء رغم ' +
    'بين دون حتى فوق تحت عند غير حول أمام خلف بسبب خلال جميل قبيح كبير صغير جديد قديم ' +
    'سريع بطيء قوي ضعيف طويل قصير عريض ضيق عميق نظيف متسخ دافئ بارد ساخن معتدل مشرق مظلم ' +
    'هادئ صاخب حزين شجاع جبان كريم بخيل مرتب فوضوي ذكي متعب مرتاح محبوب متعجب').split(/\s+/)
)

function normalize(s) {
  return s.replace(/[\u064B-\u0652\u0640]/g, '')
}

function main() {
  const args = process.argv.slice(2)
  const ei = args.indexOf('--expected')
  const expected = ei >= 0 ? Number(args[ei + 1]) : EXPECTED
  const files = args.filter((a, i) => a.endsWith('.ts') && i !== ei + 1)

  const subjects = new Map()
  let total = 0
  let bad = 0
  const problems = []

  Promise.all(
    files.map(async (f) => {
      const m = await import(pathToFileURL(path.resolve(f)).href)
      for (const [name, bank] of Object.entries(m)) {
        if (name === 'default' || !bank || !Array.isArray(bank.templates)) continue
        for (const t of bank.templates) {
          if (t.type !== 'ar-type') continue
          for (const [i, row] of t.items.entries()) {
            total++
            const [w, label] = row
            if (subjects.has(w)) {
              problems.push(`[DUP] ${name}[${i}] "${w}" already used at #${subjects.get(w)}`)
              bad++
              continue
            }
            subjects.set(w, i)
            const nw = normalize(w)
            if (label === 'فعل' && !VERBS.has(nw)) {
              problems.push(`[TYPE] ${name}[${i}] "${w}" labelled فعل but not in verb list`)
              bad++
            }
            if ((label === 'اسم' || label === 'صفة' || label === 'حرف') && VERBS.has(nw)) {
              problems.push(`[TYPE] ${name}[${i}] "${w}" is a known verb but labelled ${label}`)
              bad++
            }
            if (label === 'اسم' && NON_VERB.has(nw) && !VERBS.has(nw)) {
              // fine — nouns/adjectives/particles are all in the non-verb table
            }
            if (label === 'صفة' && !NON_VERB.has(nw) && !label.startsWith('__')) {
              // possible unlisted adjective; report for manual review
              problems.push(`[REVIEW] ${name}[${i}] adjective "${w}" not in known table`)
            }
          }
        }
      }
    })
  ).then(() => {
    for (const p of problems) console.error(p)
    console.log(`[ar-type] total=${total} expected=${expected} problems=${bad}`)
    if (total !== expected || bad > 0) process.exit(1)
    console.log('[PASS] ar-type clean')
  })
}

main()
