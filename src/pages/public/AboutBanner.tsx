export const AboutBanner = () => (
  <section className="relative overflow-hidden bg-background py-4 md:py-6">
    <div className="container relative z-10 mx-auto px-4">
      <div className="mx-auto max-w-6xl">
        <picture>
          <source srcSet="/dareen8.v2.webp" type="image/webp" />
          <source srcSet="/dareen8.v2.avif" type="image/avif" />
          <img
            src="/dareen8.v2.png"
            alt="دارين السابعة"
            width="1983"
            height="793"
            loading="lazy"
            className="mx-auto block h-auto w-full max-w-[400px] md:max-w-full"
          />
        </picture>
      </div>
    </div>
  </section>
)
