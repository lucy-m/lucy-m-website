interface Accumulator {
  currentText: string;
  currentWidth: number;
  completedLines: string[];
}

export const breakText = (
  text: string,
  maxWidth: number,
  measureText: (s: string) => number
): string[] => {
  const spaceSize = measureText(" ");
  const words = text.split(" ");

  const initial: Accumulator = {
    currentText: "",
    currentWidth: 0,
    completedLines: [],
  };

  const items = words.reduce<Accumulator>((acc, next) => {
    const thisWidth = measureText(next);
    const newWidth = thisWidth + spaceSize + acc.currentWidth;

    if (newWidth > maxWidth) {
      const completedLines = [...acc.completedLines, acc.currentText];
      const currentText = next;
      const currentWidth = thisWidth;

      return { completedLines, currentText, currentWidth };
    } else {
      const completedLines = acc.completedLines;
      const currentText = acc.currentText + " " + next;
      const currentWidth = newWidth;

      return { completedLines, currentText, currentWidth };
    }
  }, initial);

  return [...items.completedLines, items.currentText];
};
