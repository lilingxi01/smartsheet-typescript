import { getAlgoliaParcelIndexing } from '@/lib/algolia/algolia';

describe('getAlgoliaParcelIndexing', () => {
  test('should return initialized Algolia search index object', () => {
    const algolia = getAlgoliaParcelIndexing();
    expect(algolia).toBeDefined();
  });
});
