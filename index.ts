const factorial = (n: number): bigint => {
    if (n === 0 || n === 1) {
        return 1n;
    }

    return factorial(n - 1) * BigInt(n);
};

const gcd = (a: bigint, b: bigint, normalized = false): bigint => {
    if (!normalized) {
        // absolute value
        a = a < 0n ? -a : a;
        b = b < 0n ? -b : b;
        // Force a as max and b as min
        [a, b] = a < b ? [b, a] : [a, b];
    }

    if (a === 0n) {
        return b;
    }

    if (b === 0n) {
        return a;
    }

    return gcd(b, a % b, true);
};

const coprimeNumbers = function* (
    n: bigint,
    max: bigint = n
): Generator<bigint> {
    for (let i = 1n; i < max; ++i) {
        const d = gcd(n, i);

        if (d === 1n) {
            yield i;
        }
    }
};

type PermutationOrder = "ascending" | "descending" | "random";

const ascendingPermutationIndices = function* (n: number) {
    const fact = factorial(n);
    for (let i = fact - 1n; i >= 0; --i) {
        yield i;
    }
};

const descendingPermutationIndices = function* (n: number) {
    const fact = factorial(n);
    for (let i = 0n; i < fact; ++i) {
        yield i;
    }
};

const randomBigInt = (max: bigint, depth = 0): bigint => {
    max = max < 0n ? 0n : max;

    const base16MaxRaw = max.toString(16);
    const base16MaxPadded =
        base16MaxRaw.length % 2 === 0 ? base16MaxRaw : "0" + base16MaxRaw;

    const randomRestBytes = new Uint8Array(base16MaxPadded.length / 2);
    crypto.getRandomValues(randomRestBytes);

    const leadByte = parseInt(base16MaxPadded.slice(0, 2), 16);
    const randomLeadByte = Math.floor(Math.random() * leadByte);

    const randomString = [randomLeadByte, ...randomRestBytes]
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");

    return BigInt(`0x${randomString}`);
};

const randomPermutationIndices = function* (n: number) {
    const fact = factorial(n);

    let increment = 1n;
    let seen = 1n;
    for (const i of coprimeNumbers(fact)) {
        const swap = randomBigInt(seen) === 0n;
        if (swap) {
            increment = i;
        }
    }

    const start = randomBigInt(fact);

    let current = start;
    do {
        yield current;
        current = (current + increment) % fact;
    } while (current !== start);
};

/**
 * Represent a number i (between 0 and n! - 1) in n-factorial notation.
 * Given by i = n * q + r,
 * where r is the component and we recurse on q now between 0 and (n - 1)!.
 * The result is a list of numbers [r1, ..., rn] such that 0 <= ri < i,
 * which bijects {0, ..., n! - 1} to {0} x {0, 1} x ... x {0, ..., n - 1}
 */
const factorialComponents = (i: bigint, n: number): number[] => {
    if (n === 0) {
        return [];
    }

    if (n === 1) {
        return [0];
    }

    const nb = BigInt(n);
    const finalComponent = i % nb;

    const subComponents = factorialComponents(i / nb, n - 1);

    subComponents.push(parseInt(finalComponent.toString()));
    return subComponents;
};

/**
 *
 * @param components From the set {0} x {0, 1} x ... x {0, ..., n - 1}
 * @returns Permutation of {0, ..., n - 1} represented as an array
 */
const factorialComponentsToPermutation = (components: number[]): number[] => {
    const permutation: number[] = [];
    for (const [j, insertionIndex] of components.entries()) {
        permutation.splice(insertionIndex, 0, j);
    }

    return permutation;
};

const permutations = function* <T>(list: T[], order: PermutationOrder) {
    const n = list.length;

    const indices = (() => {
        switch (order) {
            case "ascending":
                return ascendingPermutationIndices(n);
            case "descending":
                return descendingPermutationIndices(n);
            case "random":
                return randomPermutationIndices(n);
        }
    })();

    for (const i of indices) {
        const components = factorialComponents(i, n);
        const permutation = factorialComponentsToPermutation(components);
        yield permutation.map((j) => list[j]);
    }
};
