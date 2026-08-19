import { useAcademyName } from '../../context/AppContext'

export const ForumHeader = () => {
  const academyName = useAcademyName()
  return (
    <div className="mx-4 mb-6 mt-4 rounded-card bg-primary px-6 py-8">
      <div className="flex flex-col items-center text-center">
        <h1 className="mb-2 text-3xl font-bold leading-tight text-on-primary">
          منتدى {academyName}
        </h1>
        <p className="text-on-primary/80 max-w-md text-sm font-medium leading-relaxed">
          مساحة آمنة للنقاش وتبادل الأفكار بين الطلاب والمعلمات وأولياء الأمور.
        </p>
      </div>
    </div>
  )
}
