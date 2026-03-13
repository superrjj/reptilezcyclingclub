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
    <div className={cx("w-full flex flex-col items-center gap-6 py-6", className)}>
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
          "relative w-full overflow-hidden mt-4",
          "[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
        )}
      >
        <style>{`
          @keyframes logo-cloud-scroll {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        `}</style>

        <div
          className={cx("flex w-max items-center gap-6 py-4 mx-auto")}
          style={{
            animation: safeLogos.length
              ? `logo-cloud-scroll ${speedSeconds}s linear infinite`
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
                  "flex items-center justify-center transition-colors my-3 sm:my-4",
                  isCard
                    ? "bg-white border border-black/10 shadow-sm"
                    : "bg-white/5 ring-1 ring-white/10",
                  isCard
                    ? "rounded-2xl h-20 w-48 sm:h-24 sm:w-64 md:h-28 md:w-72"
                    : "rounded-full h-12 w-12 sm:h-14 sm:w-14",
                  itemClassName
                )}
                title={logo.description || logo.name}
              >
                {isCard ? (
                  <div className="h-full w-full p-3 sm:p-4 md:p-5 flex items-center justify-center">
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
                    className="select-none h-10 w-10 sm:h-12 sm:w-12 rounded-full object-contain"
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
                      isCard ? "rounded-2xl" : "rounded-full"
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