import type { BoardContent, CategoryData } from "./types";

// [clue, correct response] pairs, ordered from lowest to highest value.
function category(name: string, clues: [string, string][]): CategoryData {
  return { name, clues: clues.map(([clue, answer]) => ({ clue, answer })) };
}

export const SAMPLE_BOARD: BoardContent = {
  title: "Sample: General Trivia",
  rounds: {
    single: {
      categories: [
        category("Planets", [
          ["This planet is nicknamed the Red Planet.", "What is Mars?"],
          ["The largest planet in our solar system.", "What is Jupiter?"],
          ["This planet is famous for its bright, wide ring system.", "What is Saturn?"],
          ["The planet closest to the Sun.", "What is Mercury?"],
          ["This ice giant spins on its side, tilted about 98 degrees.", "What is Uranus?"],
        ]),
        category("Animal Kingdom", [
          ["The only mammal capable of true sustained flight.", "What is a bat?"],
          ["A group of these birds is called a parliament.", "What are owls?"],
          ["The largest animal ever known to have lived.", "What is the blue whale?"],
          ["Kangaroos, koalas and wombats are all this type of pouched mammal.", "What are marsupials?"],
          ["This animal's fingerprints are nearly indistinguishable from a human's.", "What is a koala?"],
        ]),
        category("World Capitals", [
          ["The capital of Japan.", "What is Tokyo?"],
          ["The capital of Canada.", "What is Ottawa?"],
          ["The capital of Australia.", "What is Canberra?"],
          ["The capital of Turkey.", "What is Ankara?"],
          ["Kazakhstan moved its capital to this city in 1997.", "What is Astana?"],
        ]),
        category("Kitchen Science", [
          ["Water boils at this Fahrenheit temperature at sea level.", "What is 212 degrees?"],
          ["Yeast releases this gas, making bread dough rise.", "What is carbon dioxide?"],
          ["Sodium bicarbonate is better known by this name.", "What is baking soda?"],
          ["This vitamin, plentiful in citrus fruit, prevents scurvy.", "What is vitamin C?"],
          ["This browning reaction gives seared steak and toast their flavor.", "What is the Maillard reaction?"],
        ]),
        category("Wordplay", [
          ["A word that reads the same forwards and backwards, like \"level\".", "What is a palindrome?"],
          ["\"Listen\" and \"silent\" are examples of this.", "What is an anagram?"],
          ["A word formed from initials and pronounced as a word, like NASA.", "What is an acronym?"],
          ["\"Brunch\" and \"smog\" are examples of this blended word.", "What is a portmanteau?"],
          ["A sentence using every letter of the alphabet.", "What is a pangram?"],
        ]),
        category("Inventions", [
          ["Alexander Graham Bell patented this device in 1876.", "What is the telephone?"],
          ["The Wright brothers flew the first powered one in 1903.", "What is an airplane?"],
          ["Johannes Gutenberg's 15th-century invention.", "What is the printing press?"],
          ["Tim Berners-Lee proposed this in 1989.", "What is the World Wide Web?"],
          ["Elisha Otis's safety brake made this machine practical for skyscrapers.", "What is the elevator?"],
        ]),
      ],
    },
    double: {
      categories: [
        category("Geography", [
          ["The longest river in South America.", "What is the Amazon?"],
          ["The world's largest hot desert.", "What is the Sahara?"],
          ["Mount Everest sits on the border of Nepal and this region of China.", "What is Tibet?"],
          ["The deepest known point in Earth's oceans.", "What is the Challenger Deep?"],
          ["This country's southern tip, Cape Agulhas, divides the Atlantic and Indian Oceans.", "What is South Africa?"],
        ]),
        category("Music", [
          ["A standard one of these instruments has 88 keys.", "What is a piano?"],
          ["The \"Fab Four\" from Liverpool.", "Who are the Beatles?"],
          ["This composer wrote his Ninth Symphony while almost completely deaf.", "Who is Beethoven?"],
          ["This Italian tempo marking means \"very fast\".", "What is presto?"],
          ["The number of lines on a standard musical staff.", "What is five?"],
        ]),
        category("Literature", [
          ["He wrote \"Romeo and Juliet\".", "Who is William Shakespeare?"],
          ["Herman Melville's novel about a white whale.", "What is Moby-Dick?"],
          ["George Orwell's novel featuring Big Brother.", "What is 1984?"],
          ["The second of the five Bennet sisters in \"Pride and Prejudice\".", "Who is Elizabeth Bennet?"],
          ["Gabriel García Márquez novel about the Buendía family.", "What is One Hundred Years of Solitude?"],
        ]),
        category("Human Body", [
          ["The largest organ of the human body.", "What is the skin?"],
          ["The number of chambers in the human heart.", "What is four?"],
          ["The smallest bone in the body, found in the middle ear.", "What is the stapes?"],
          ["These blood cells carry oxygen using hemoglobin.", "What are red blood cells?"],
          ["Often called the \"master gland\", it sits at the base of the brain.", "What is the pituitary gland?"],
        ]),
        category("Sports", [
          ["The number of players a soccer team has on the field.", "What is 11?"],
          ["In tennis, this word means a score of zero.", "What is love?"],
          ["Three strikes in a row in bowling.", "What is a turkey?"],
          ["Alan Shepard played this sport on the Moon in 1971.", "What is golf?"],
          ["This country has won the most men's FIFA World Cup titles.", "What is Brazil?"],
        ]),
        category("Computers", [
          ["The number of bits in a byte.", "What is eight?"],
          ["The \"B\" in \"GB\".", "What is byte?"],
          ["Named after a comedy troupe, this language is popular for data science.", "What is Python?"],
          ["Grace Hopper's team popularized this term after finding a moth in a computer.", "What is a bug?"],
          ["This Finnish programmer first released the Linux kernel in 1991.", "Who is Linus Torvalds?"],
        ]),
      ],
    },
  },
  final: {
    category: "World Landmarks",
    clue: "Built for an 1889 World's Fair, it was the tallest man-made structure in the world for 41 years.",
    answer: "What is the Eiffel Tower?",
  },
};
