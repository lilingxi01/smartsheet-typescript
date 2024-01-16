import { deepMerge } from '@/lib/deep-merge';

describe('deepMerge', () => {
  test('works for deep-merging different keys', () => {
    const object1 = {
      '&:hover': {
        color: 'red',
      },
    };
    const object2 = {
      '&:hover': {
        fontSize: 15,
      },
    };
    const expectedObject = {
      '&:hover': {
        color: 'red',
        fontSize: 15,
      },
    };
    expect(deepMerge(object1, object2)).toStrictEqual(expectedObject);
  });

  test('works for deep-merging same and different keys', () => {
    const object1 = {
      '&:hover': {
        color: 'red',
      },
    };
    const object2 = {
      '&:hover': {
        color: 'blue',
      },
    };
    const object3 = {
      '&:hover': {
        fontSize: 15,
      },
    };
    const expectedObject = {
      '&:hover': {
        color: 'blue',
        fontSize: 15,
      },
    };
    expect(deepMerge(object1, object2, object3)).toStrictEqual(expectedObject);
  });
});
