import Image from "next/image";

const modes = [
  {
    label: "Light",
    screenshots: ["light-gallery", "light-expiring", "light-trash"],
  },
  {
    label: "Dark",
    screenshots: ["dark-gallery", "dark-expiring", "dark-trash"],
  },
] as const;

const screenNames = ["Gallery", "Expiring", "Trash"];

export function PinshotGallery() {
  return (
    <div className="my-8 space-y-6">
      {modes.map((mode) => (
        <section key={mode.label} aria-labelledby={`pinshot-${mode.label.toLowerCase()}-mode`}>
          <div className="mb-2.5 flex items-center gap-2">
            <span
              className={`size-2 rounded-full ${mode.label === "Light" ? "border border-edge-strong bg-white" : "bg-zinc-800"}`}
              aria-hidden
            />
            <h3
              id={`pinshot-${mode.label.toLowerCase()}-mode`}
              className="m-0! font-mono text-[10.5px]! font-medium tracking-wider text-faint uppercase"
            >
              {mode.label} mode
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {mode.screenshots.map((screenshot, index) => (
              <figure key={screenshot} className="m-0 overflow-hidden rounded-[14px] border border-edge bg-surface sm:rounded-[20px]">
                <div className="relative aspect-[1080/2424] overflow-hidden">
                  <Image
                    src={`/images/projects/toys/pinshot/${screenshot}.png`}
                    alt={`Pinshot ${screenNames[index].toLowerCase()} screen in ${mode.label.toLowerCase()} mode`}
                    fill
                    sizes="(min-width: 768px) 210px, 30vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="border-t border-edge px-2 py-1.5 text-center font-mono text-[9px] tracking-wide text-faint uppercase sm:text-[10px]">
                  {screenNames[index]}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
