const factorial = (n: number): bigint => {
    if (n === 0 || n === 1) {
        return 1n;
    }

    return factorial(n - 1) * BigInt(n);
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

const randomBigInt = (max: bigint): bigint => {
    max = max < 0n ? 0n : max;

    if (max <= Number.MAX_SAFE_INTEGER) {
        const rand = Math.floor(Math.random() * Number(max));
        return BigInt(rand);
    }

    const useUpperRange = Math.round(Math.random());
    const half = max >> 1n;

    if (useUpperRange) {
        const remainder = max & 1n;
        return half + remainder + randomBigInt(half);
    }

    return randomBigInt(half);
};

const gcd = (a: bigint, b: bigint): bigint => {
    // absolute value
    a = a < 0n ? -a : a;
    b = b < 0n ? -b : b;
    // Force a as max and b as min
    [a, b] = a < b ? [b, a] : [a, b];

    while (b > 0n) {
        [a, b] = [b, a % b];
    }

    return a;
};

/**
 * Permutation function of {0, ..., n - 1} by cycling values and then
 * cycling based upon gcd classes recursively.
 */
const looselyRandomPermutation = (
    i: bigint,
    n: bigint,
    seed: bigint
): bigint => {
    const cycled = (i + seed) % n;
    const d = gcd(n, cycled);

    if (d === 1n) {
        return cycled;
    }

    const reduced = cycled / d;
    const reducedRange = n / d;

    return (
        d * looselyRandomPermutation(reduced, reducedRange, seed % reducedRange)
    );
};

const randomPermutationIndices = function* (n: number) {
    const fact = factorial(n);
    const seed = randomBigInt(fact);

    for (let i = 0n; i < fact; ++i) {
        yield looselyRandomPermutation(i, fact, seed);
    }
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

export const permutations = function* <T>(list: T[], order: PermutationOrder) {
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
