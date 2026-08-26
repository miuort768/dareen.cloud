import { motion } from 'framer-motion'
import { AnimateOnScroll } from '../../components/ui/AnimateOnScroll'
import { Shield, Lightbulb, Award, Compass } from 'lucide-react'

export const AboutValues = () => (
  <section className="relative overflow-hidden bg-background py-4 dark:bg-card md:py-6">
    <div className="absolute end-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-surface to-transparent"></div>

    <div className="container relative z-10 mx-auto px-4">
      <AnimateOnScroll animation="fadeUp">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-l from-primary to-primary-hover px-3 py-1 shadow-lg shadow-primary/20">
            <span className="text-micro font-black text-on-primary">دستورنا التعليمي</span>
          </div>
          <h2 className="mb-4 font-heading text-2xl font-black text-main md:text-4xl">
            القيم التي <span className="text-primary">تُحدد هويتنا</span>
          </h2>
          <div className="mx-auto mb-6 h-1 w-20 bg-warning"></div>
          <p className="mx-auto max-w-none text-micro font-medium leading-relaxed text-muted md:text-sm">
            الالتزام الراسخ بهذه القيم هو ما يصنع الفرق الحقيقي في رحلة نجاح طلابنا.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="mx-auto grid max-w-7xl grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4"
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-card border border-primary/50 bg-gradient-to-br from-card to-primary/10 p-6 shadow-sm dark:border-primary/30 dark:to-primary/5 md:p-8"
          >
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-gradient-to-br from-primary to-primary text-on-primary shadow-lg shadow-primary/20">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-lg font-black text-main md:text-xl">الأمانة</h3>
            </div>
            <p className="text-xs font-medium leading-relaxed text-muted md:text-sm">
              نلتزم بأعلى معايير النزاهة والصدق في كل تفاعل تعليمي، لنكون الشريك الموثوق لمستقبل
              أبنائكم.
            </p>
          </motion.div>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-2xl border border-warning bg-gradient-to-br from-card to-transparent p-6 shadow-sm dark:border-warning-soft dark:to-transparent md:p-8"
          >
            <div className="mb-4 flex items-center gap-4">
              <div className="shadow-l flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-gradient-to-br from-warning to-warning text-on-warning">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-lg font-black text-main md:text-xl">الابتكار</h3>
            </div>
            <p className="text-xs font-medium leading-relaxed text-muted md:text-sm">
              نطور أدواتنا باستمرار لنجعل من رحلة العلم تجربة استثنائية مشوقة تفتح آفاق العقل.
            </p>
          </motion.div>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-2xl border border-success bg-gradient-to-br from-card to-transparent p-6 shadow-sm dark:border-success-soft dark:to-transparent md:p-8"
          >
            <div className="mb-4 flex items-center gap-4">
              <div className="shadow-l flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-gradient-to-br from-success to-success text-on-success">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-lg font-black text-main md:text-xl">التميز</h3>
            </div>
            <p className="text-xs font-medium leading-relaxed text-muted md:text-sm">
              لا نرضى بأقل من الجودة الفائقة في كل برنامج نقدمه، لضمان مخرجات تعليمية تليق بطلابنا.
            </p>
          </motion.div>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-2xl border border-error bg-gradient-to-br from-card to-transparent p-6 shadow-sm dark:border-error-soft dark:to-transparent md:p-8"
          >
            <div className="mb-4 flex items-center gap-4">
              <div className="shadow-l flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-gradient-to-br from-error to-error text-on-error">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-lg font-black text-main md:text-xl">بناء الجيل</h3>
            </div>
            <p className="text-xs font-medium leading-relaxed text-muted md:text-sm">
              نركز على صقل شخصية الطالب ومهاراته القيادية ليكون منارة للتغيير الإيجابي في المجتمع.
            </p>
          </motion.div>
        </motion.div>
      </AnimateOnScroll>
    </div>
  </section>
)
