import { memo } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";

interface lists {
  id:number;
  name:string,
  
}

interface ListBoxProps {
  lists:lists[];
  btnName?:string;
  selected:{name:string};
  onChange:(selected:{name:string }) => void;
}

export default memo (function ListBox({lists,btnName,selected,onChange}:ListBoxProps) {

console.log(`list box rendered...`)

  return (
    <Listbox value={selected} onChange={onChange}>
      <ListboxButton
        className={clsx(
          "relative block w-full rounded-lg bg-white py-1.5 pr-8 pl-3  text-black text-center",
          "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-gray-800 cursor-pointer"
        )}
      >
        {/* {selected !== null ? selected?.name :btnName} */}
        {selected?.name}
        {/* {btnName} */}
        <ChevronDownIcon
          className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-black/90"
          aria-hidden="true"
        />
      </ListboxButton>

      <ListboxOptions
        anchor="bottom"
        transition
        className={clsx(
          "w-(--button-width) rounded-xl border border-white/5 bg-white  p-1 [--anchor-gap:--spacing(1)] focus:outline-none",
          "transition duration-100 ease-in data-leave:data-closed:opacity-0"
        )}
      >
        {/* <ListboxOption value={null} disabled /> */}

        {lists.map((batch) => (
          <ListboxOption
            key={batch.name}
            value={batch}
            className="group flex cursor-pointer items-center text-center gap-2 rounded-lg px-3 py-1.5 select-none  data-focus:bg-gray-500 "
          >
            {/* {batch.name === batch[0] ? "" : */}
            <CheckIcon className="invisible size-4 fill-black group-data-selected:visible" />
            {/* } */}
            <div className="text-black">{batch.name}</div>
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  );
})
