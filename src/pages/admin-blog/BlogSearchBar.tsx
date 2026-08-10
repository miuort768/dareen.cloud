import { Search } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BlogSearchBarProps {
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    filterType: string;
    setFilterType: (v: string) => void;
}

const filters = [
    { key: '', label: 'الكل' },
    { key: 'foundation', label: 'التأسيس' },
    { key: 'solutions', label: 'حل الكتب' },
    { key: 'notes', label: 'المذكرات' },
    { key: 'more', label: 'المزيد' },
];

export const BlogSearchBar = ({ searchTerm, setSearchTerm, filterType, setFilterType }: BlogSearchBarProps) => (
    <div className="bg-card p-4 border border-border space-y-4 rounded-2xl">
        <div className="relative flex-grow">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
            <input type="text" aria-label="بحث عن مقالات" placeholder="بحث عن مقالات أو تصنيفات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surface border border-border ps-12 py-3 focus:outline-none focus:ring-2 focus:ring-focus transition-all font-bold text-sm rounded-xl outline-none" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
            {filters.map(btn => (
                <button key={btn.key} onClick={() => setFilterType(btn.key)}
                    className={cn(
                        "px-3.5 py-2 text-xs font-semibold rounded-lg transition-all duration-200 active:scale-[0.97]",
                        filterType === btn.key
                            ? "bg-error text-on-error shadow-sm"
                            : "text-muted bg-card border border-border hover:bg-hover"
                    )}>
                    {btn.label}
                </button>
            ))}
        </div>
    </div>
);
