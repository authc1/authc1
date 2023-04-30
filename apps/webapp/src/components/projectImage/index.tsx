import { component$ } from "@builder.io/qwik";

type Props = {
  src?: string;
  name?: string;
  alt: string;
};

export default component$(({ src, name, alt }: Props) => {
  return (
    <div class="relative w-7 h-7 rounded-full overflow-hidden bg-gradient-to-r from-pink-500 to-yellow-500">
      {src ? (
        <img class="w-full h-full object-cover" src={src} alt={alt} />
      ) : (
        <div class="flex items-center justify-center text-black-500 text-xl lowercase">
          <span>{name?.split("")[0]}</span>
        </div>
      )}
    </div>
  );
});
