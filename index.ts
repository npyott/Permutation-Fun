const factorial = (n: number): number => {
    if (n === 0 || n === 1) {
        return 1;
    }

    return factorial(n - 1) * n;
};

const gcd = (a: number, b: number, normalized = false): number => {
    if (!normalized) {
        a = Math.floor(Math.abs(a));
        b = Math.floor(Math.abs(b));
        a = Math.max(a, b);
        b = Math.min(a, b);
    }

    if (a === 0) {
        return b;
    }

    if (b === 0) {
        return a;
    }

    return gcd(b, a % b, true);
};

const coprimeNumbers = function* (
    n: number,
    max: number = n,
): Generator<number> {
    for (let i = 1; i < max; ++i) {
        const d = gcd(n, i);

        if (d === 1) {
            yield i;
        }
    }
};

type PermutationOrder =
    | "ascending"
    | "descending"
    | "random";

const ascendingPermutationIndices = function* (n: number) {
    const fact = factorial(n);
    for (let i = fact - 1; i >= 0; --i) {
        yield i;
    }
};

const descendingPermutationIndices = function* (n: number) {
    const fact = factorial(n);
    for (let i = 0; i < fact; ++i) {
        yield i;
    }
};

const randomPermutationIndices = function* (n: number) {
    const fact = factorial(n);

    let increment = 1;
    let seen = 1;
    for (const i of coprimeNumbers(n)) {
        const swap = Math.random() < 1 / seen;
        if (swap) {
            increment = i;
        }
    }

    const start = Math.floor(
        Math.random() * fact,
    );

    for (let i = 0; i < fact; ++i) {
        yield (increment * (i + start)) % fact;
    }
};

/**
 * Represent a number i (between 0 and n! - 1) in n-factorial notation.
 * Given by i = n * q + r,
 * where r is the component and we recurse on q now between 0 and (n - 1)!.
 * The result is a list of numbers [r1, ..., rn] such that 0 <= ri < i,
 * which bijects {0, ..., n! - 1} to {0} x {0, 1} x ... x {0, ..., n - 1}
 */
const factorialComponents = (i: number, n: number): number[] => {
    if (n === 1) {
        return [0];
    }

    const finalComponent = i % n;

    const subComponents = factorialComponents(
        Math.floor(i / n),
        n - 1,
    );

    subComponents.push(finalComponent);
    return subComponents;
};

const permutations = function* <T>(list: T[], order: PermutationOrder) {
    const n = list.length;
    const fact = factorial(n);

    const indices = new Array(fact).fill(0).map(
        (_, i) => i,
    ).sort((a, b) => {
        switch (order) {
            case "ascending":
                return -1;
            case "descending":
                return 1;
            case "random":
                return Math.round(Math.random() - 1);
        }
    });
    for (const i of indices) {
        const parts = factorialComponents(i, n);

        const permutation: number[] = [];
        for (const [j, insertionIndex] of parts.entries()) {
            permutation.splice(insertionIndex, 0, j);
        }

        yield permutation.map((j) => list[j]);
    }
};
