export function classNames(...a: (string | false | undefined | null)[]) {
  return a.filter(Boolean).join(" ");
}
