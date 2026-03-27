import {
	englishDataset,
	englishRecommendedTransformers,
	RegExpMatcher,
} from "obscenity";

const matcher = new RegExpMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers,
});

export function isSafe(text: string) {
	return !matcher.hasMatch(text);
}
