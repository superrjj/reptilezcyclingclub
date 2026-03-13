import React, { useEffect, useState } from "react";
import GradientText from "./gradient-text";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function LogoCloudCarousel({
  logos = [],
  className,
  speedSeconds = 30,
  itemClassName,
  variant = "circle", // "circle" | "card"
  title = "",
  titleClassName,
  direction = "left", // "left" | "right"
}) {
  const safeLogos = Array.isArray(logos) ? logos.filter(Boolean) : [];
  const track = safeLogos.length ? [...safeLogos, ...safeLogos] : [];
  const isCard = variant === "card";
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={cx("w-full flex flex-col items-center gap-2 py-1", className)}>
      {title ? (
        <div
          className={cx(
            "text-center space-y-2 transition-all duration-1000",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
          )}
        >
          <GradientText
            className={cx(
              "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight",
              titleClassName
            )}
            animationDuration={2}
          >
            {title}
          </GradientText>
          <div className="w-24 h-1 mx-auto bg-black/10 rounded-full"></div>
        </div>
      ) : null}

      <div
        className={cx(
          "relative w-full overflow-hidden",
          "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
        )}
      >
        <style>{`
          @keyframes logo-cloud-scroll-left {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          @keyframes logo-cloud-scroll-right {
            from { transform: translateX(-50%); }
            to { transform: translateX(0); }
          }
        `}</style>

        <div
          className={cx("flex w-max items-center gap-3 sm:gap-4 md:gap-5 py-1 sm:py-2")}
          style={{
            animation: safeLogos.length
              ? `logo-cloud-scroll-${direction} ${speedSeconds}s linear infinite`
              : undefined,
            animationPlayState: "running",
            willChange: "transform",
          }}
        >
          {track.map((logo, idx) => {
            const src = logo.darkUrl || logo.url;
            const content = (
              <div
                className={cx(
                  "flex items-center justify-center transition-colors my-1",
                  isCard
                    ? "bg-white border border-black/10 shadow-sm"
                    : "bg-white/5 ring-1 ring-white/10",
                  isCard
                    ? "rounded-xl h-14 w-28 sm:h-18 sm:w-40 md:h-22 md:w-52 lg:h-24 lg:w-60"
                    : "rounded-full h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14",
                  itemClassName
                )}
                title={logo.description || logo.name}
              >
                {isCard ? (
                  <div className="h-full w-full p-2 sm:p-3 md:p-4 flex items-center justify-center">
                    <img
                      src={src}
                      alt={logo.name || "Logo"}
                      className="select-none max-h-full max-w-full object-contain"
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                    />
                  </div>
                ) : (
                  <img
                    src={src}
                    alt={logo.name || "Logo"}
                    className="select-none h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full object-contain"
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                )}
              </div>
            );

            return (
              <div key={`${logo.name || "logo"}-${idx}`} className="shrink-0">
                {logo.href ? (
                  <a
                    href={logo.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={logo.name}
                    className={cx(
                      "block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                      isCard ? "focus-visible:ring-black/40" : "focus-visible:ring-white/60",
                      "focus-visible:ring-offset-white",
                      isCard ? "rounded-xl" : "rounded-full"
                    )}
                  >
                    {content}
                  </a>
                ) : (
                  content
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}