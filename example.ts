import { permutations } from "./index.ts";

const deck = new Array(52)
    .fill(null)
    .map((_, i) => ({ value: i % 13, suit: Math.floor(i / 13) }));

const suitCodePoints = [0x2660, 0x2665, 0x2666, 0x2663];
const renderCard = ({ value, suit }: { value: number; suit: number }) =>
    `${(() => {
        switch (value) {
            case 0:
                return "A";
            case 10:
                return "J";
            case 11:
                return "Q";
            case 12:
                return "K";
            default:
                return `${value}`;
        }
    })()}${String.fromCodePoint(suitCodePoints[suit], 0xfe0f)}`;

for (const shuffle of permutations(deck, "random").take(3)) {
    console.log(shuffle.map(renderCard));
}
