const palette = [
  "bg-[#10352b] text-[#a9f4cf]",
  "bg-[#302842] text-[#dacbff]",
  "bg-[#402a28] text-[#ffd1cb]",
  "bg-[#183348] text-[#b9ddff]",
  "bg-[#343226] text-[#f4e8b0]",
  "bg-[#233323] text-[#cdf2c4]",
];

const sizes = {
  sm: "h-12 w-12 text-lg",
  md: "h-16 w-16 text-2xl",
  lg: "h-28 w-28 text-4xl",
  card: "aspect-square w-full text-5xl",
};

export default function Artwork({ title = "S", size = "md" }) {
  const index = Math.abs(
    title.split("").reduce((total, letter) => total + letter.charCodeAt(0), 0)
  ) % palette.length;
  const initial = title.trim().charAt(0).toUpperCase() || "S";

  return (
    <div
      className={`${sizes[size]} ${palette[index]} flex shrink-0 items-center justify-center rounded-md border border-white/10 font-bold`}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}
