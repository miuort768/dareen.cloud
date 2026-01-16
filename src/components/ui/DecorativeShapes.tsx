

export const HeaderDecorativeShapes = () => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden h-full w-full">
            {/* Main shapes with slightly higher visibility */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 -rotate-12 translate-x-20 -translate-y-20"></div>
            <div className="absolute top-0 right-0 w-32 h-32 border border-white/20 -rotate-45 translate-x-10 -translate-y-10"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rotate-45 -translate-x-16 translate-y-16"></div>

            {/* Small Geometric Elements */}
            <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-white/20 rotate-45 shadow-[0_0_15px_rgba(255,255,255,0.2)]"></div>
            <div className="absolute top-1/3 right-1/4 w-12 h-12 border border-white/10 rounded-full"></div>
            <div className="absolute bottom-1/4 left-1/3 w-8 h-8 border border-white/10 rotate-12"></div>

            {/* Abstract Lines */}
            <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
            <div className="absolute top-1/4 right-0 h-[1px] w-full bg-gradient-to-l from-white/10 via-transparent to-transparent"></div>

            {/* Tiny Details */}
            <div className="absolute top-[20%] right-[15%] w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
            <div className="absolute bottom-[30%] left-[20%] w-1.5 h-1.5 bg-white/30 rotate-45 animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 right-1/2 w-3 h-3 border border-white/20 rounded-sm rotate-[35deg]"></div>
        </div>
    );
};
