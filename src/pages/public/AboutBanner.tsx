export const AboutBanner = () => (
    <section className="py-4 md:py-6 bg-white dark:bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto">
                <picture>
                    <source srcSet="/dareen8.webp" type="image/webp" />
                    <source srcSet="/dareen8.avif" type="image/avif" />
                    <img src="/dareen8.png" alt="دارين السابعة" width="1983" height="793" loading="lazy"
                        className="w-full max-w-[400px] md:max-w-full mx-auto h-auto block" />
                </picture>
            </div>
        </div>
    </section>
);
