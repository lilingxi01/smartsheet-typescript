import { z } from 'zod';

const NewCellSharedSchema = z.object({
  columnId: z.number(),
  format: z.string().optional(),
});

export const NewCellSchema = z.union([
  z.object({
    value: z.string().or(z.string().array()).or(z.number()).or(z.boolean()).or(z.null()),
  }).merge(NewCellSharedSchema),
  z.object({
    formula: z.string(),
  }).merge(NewCellSharedSchema),
]);

export type SmartsheetNewCell = z.infer<typeof NewCellSchema>;

// TODO: Add the rest of the cell types.
export const CellSchema = z.object({
  columnId: z.number(),
  value: z.unknown(),
  displayValue: z.unknown(),
  columnType: z.unknown(),
  strict: z.boolean().optional(),
  format: z.string().optional(),
});

export enum SmartsheetFontFamily {
  Arial = 'Arial',
  Roboto = 'Roboto',
  Tahoma = 'Tahoma',
  Times_New_Roman = 'Times New Roman',
  Verdana = 'Verdana',
}
const fontFamilyMapping = Object.values(SmartsheetFontFamily);

export enum SmartsheetFontSize {
  SIZE_8 = '8',
  SIZE_9 = '9',
  SIZE_10 = '10',
  SIZE_12 = '12',
  SIZE_14 = '14',
  SIZE_16 = '16',
  SIZE_18 = '18',
  SIZE_20 = '20',
  SIZE_24 = '24',
  SIZE_28 = '28',
  SIZE_32 = '32',
  SIZE_36 = '36',
}
const fontSizeMapping = Object.values(SmartsheetFontSize);

// TODO: Their color indices are also unordered. We need to fix this!!!
export enum SmartsheetColor {
  AUTOMATIC = '', // 0
  BLACK = '#000000', // 1
  WHITE = '#ffffff', // 2
  TRANSPARENT = 'transparent', // 3

  // Fifth row in Smartsheet color selector.
  RED_LIGHTER = '#EDE3EB', // 4
  ORANGE_LIGHTER = '#FDF4E2', // 5
  YELLOW_LIGHTER = '#FFFEE9', // 6
  GREEN_LIGHTER = '#EAF5EA', // 7
  BLUE_LIGHTER = '#E6F1FD', // 8
  PURPLE_LIGHTER = '#F1E5F4', // 9
  BEIGE_LIGHTER = '#F0E9DF', // 10

  // Fourth row in Smartsheet color selector.
  RED_LIGHT = '#F8CED3', // 11
  ORANGE_LIGHT = '#FAE2B5', // 12
  YELLOW_LIGHT = '#FFFF96', // 13
  GREEN_LIGHT = '#CDE6CB', // 14
  BLUE_LIGHT = '#C0DCF9', // 15
  PURPLE_LIGHT = '#E5C9ED', // 16
  BEIGE_LIGHT = '#EBDDCD', // 17
  BROWN_LIGHT = '#E5E5E5', // 18

  // Third row in Smartsheet color selector.
  RED = '#E88581', // 19
  ORANGE = '#F7CF87', // 20
  YELLOW = '#FEFE54', // 21
  GREEN = '#91CF8D', // 22
  BLUE = '#74B1F3', // 23
  PURPLE = '#C793D5', // 24
  BEIGE = '#CBB093', // 25
  BROWN = '#BDBDBD', // 26

  // Second row in Smartsheet color selector.
  RED_DARK = '#D8473A', // 27
  ORANGE_DARK = '#F09336', // 28
  YELLOW_DARK = '#FCEE4F', // 29
  GREEN_DARK = '#61AF58', // 30
  BLUE_DARK = '#2D60BD', // 31
  PURPLE_DARK = '#8621A7', // 32
  BEIGE_DARK = '#8D501A', // 33
  BROWN_DARK = '#757575', // 34

  // First row in Smartsheet color selector.
  RED_DARKER = '#8C231B', // 35
  ORANGE_DARKER = '#D95B27', // 36
  YELLOW_DARKER = '#E5C943', // 37
  GREEN_DARKER = '#407E39', // 38
  BLUE_DARKER = '#183378', // 39
  PURPLE_DARKER = '#591086', // 40
  BEIGE_DARKER = '#542F0B', // 41
}
const colorMapping = Object.values(SmartsheetColor);

// TODO: Their currency numbers are not in order and is designed tricky. We will add more when needed.
export enum SmartsheetCurrency {
  NONE = 'none',
  CAD = '4',
  EUR = '6',
  USD = '13',
  CNY = '16',
}
const currencyMapping = Object.values(SmartsheetCurrency);

export enum SmartsheetDateFormat {
  LOCALE_BASED = 'LOCALE_BASED',
  MMMM_D_YYYY = 'MMMM_D_YYYY',
  MMM_D_YYYY = 'MMM_D_YYYY',
  D_MMM_YYYY = 'D_MMM_YYYY',
  YYYY_MM_DD_HYPHEN = 'YYYY_MM_DD_HYPHEN',
  YYYY_MM_DD_DOT = 'YYYY_MM_DD_DOT',
  DWWWW_MMMM_D_YYYY = 'DWWWW_MMMM_D_YYYY',
  DWWW_DD_MMM_YYYY = 'DWWW_DD_MMM_YYYY',
  DWWW_MM_DD_YYYY = 'DWWW_MM_DD_YYYY',
  MMMM_D = 'MMMM_D',
  D_MMMM = 'D_MMMM',
}
const dateFormatMapping = Object.values(SmartsheetDateFormat);

export enum SmartsheetHorizontalAlign {
  DEFAULT = 'default',
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
}
const horizontalAlignMapping = Object.values(SmartsheetHorizontalAlign);

export enum SmartsheetVerticalAlign {
  DEFAULT = 'default',
  TOP = 'top',
  MIDDLE = 'middle',
  BOTTOM = 'bottom',
}
const verticalAlignMapping = Object.values(SmartsheetVerticalAlign);

export enum SmartsheetNumberFormat {
  NONE = 'none',
  NUMBER = 'NUMBER',
  CURRENCY = 'CURRENCY',
  PERCENT = 'PERCENT',
}
const numberFormatMapping = Object.values(SmartsheetNumberFormat);

export function stringifyFormatter(formatter: CellFormatter): string {
  const defaultFormatter = CellFormatter.defaultFormatter;

  return [
    formatter.fontFamily === defaultFormatter.fontFamily
      ? ''
      : fontFamilyMapping.indexOf(formatter.fontFamily).toString(),

    formatter.fontSize === defaultFormatter.fontSize
      ? ''
      : fontSizeMapping.indexOf(formatter.fontSize).toString(),

    formatter.bold == defaultFormatter.bold
      ? ''
      : formatter.bold ? '1' : '0',

    formatter.italic == defaultFormatter.italic
      ? ''
      : formatter.italic ? '1' : '0',

    formatter.underline == defaultFormatter.underline
      ? ''
      : formatter.underline ? '1' : '0',

    formatter.strikethrough == defaultFormatter.strikethrough
      ? ''
      : formatter.strikethrough ? '1' : '0',

    formatter.horizontalAlign === defaultFormatter.horizontalAlign
      ? ''
      : horizontalAlignMapping.indexOf(formatter.horizontalAlign).toString(),

    formatter.verticalAlign === defaultFormatter.verticalAlign
      ? ''
      : verticalAlignMapping.indexOf(formatter.verticalAlign).toString(),

    formatter.textColor === defaultFormatter.textColor
      ? ''
      : colorMapping.indexOf(formatter.textColor).toString(),

    formatter.backgroundColor === defaultFormatter.backgroundColor
      ? ''
      : colorMapping.indexOf(formatter.backgroundColor).toString(),

    formatter.taskbarColor === defaultFormatter.taskbarColor
      ? ''
      : colorMapping.indexOf(formatter.taskbarColor).toString(),

    formatter.currency === defaultFormatter.currency
      ? ''
      : formatter.currency,

    formatter.decimalCount === defaultFormatter.decimalCount
      ? ''
      : formatter.decimalCount.toString(),

    formatter.thousandsSeparator == defaultFormatter.thousandsSeparator
      ? ''
      : formatter.thousandsSeparator ? '1' : '0',

    formatter.numberFormat === defaultFormatter.numberFormat
      ? ''
      : numberFormatMapping.indexOf(formatter.numberFormat).toString(),

    formatter.textWrap == defaultFormatter.textWrap
      ? ''
      : formatter.textWrap ? '1' : '0',

    formatter.dateFormat === defaultFormatter.dateFormat
      ? ''
      : dateFormatMapping.indexOf(formatter.dateFormat).toString(),
  ].join(',');
}

/**
 * The default format string that we will use when the `format` property in cell object is undefined.
 */
const defaultFormatString = ',2,,,,,,,,,,,,,,,';

/**
 * A cell formatter.
 */
export class CellFormatter {
  public static defaultFormatter = new CellFormatter();

  public fontFamily: SmartsheetFontFamily;
  public fontSize: SmartsheetFontSize;
  public bold: boolean;
  public italic: boolean;
  public underline: boolean;
  public strikethrough: boolean;
  public horizontalAlign: SmartsheetHorizontalAlign;
  public verticalAlign: SmartsheetVerticalAlign;
  public textColor: SmartsheetColor;
  public backgroundColor: SmartsheetColor;
  public taskbarColor: SmartsheetColor;
  public currency: SmartsheetCurrency;
  public decimalCount: number;
  public thousandsSeparator: boolean;
  public numberFormat: SmartsheetNumberFormat;
  public textWrap: boolean;
  public dateFormat: SmartsheetDateFormat;

  /**
   * Creates a new instance of the FormatOptions class.
   *
   * @param {string} formatString - The format string to initialize the object with. Default value is 'defaultFormatString'.
   */
  constructor(formatString?: string) {
    let splitFormatString = formatString?.split(',') ?? [];
    const defaultValues = defaultFormatString.split(',').map((value) => value ? value : '0');
    if (defaultValues.length !== 17) {
      throw new Error('Invalid default format string. This should be an internal error of this SDK.');
    }
    if (splitFormatString.length !== 17) {
      splitFormatString = defaultValues;
    }
    const values = splitFormatString.map((value, index) => {
      return value ? value : (defaultValues[index] ?? '0');
    });

    this.fontFamily = fontFamilyMapping[parseInt(values[0])];
    this.fontSize = fontSizeMapping[parseInt(values[1])];
    this.bold = values[2] === '1';
    this.italic = values[3] === '1';
    this.underline = values[4] === '1';
    this.strikethrough = values[5] === '1';
    this.horizontalAlign = horizontalAlignMapping[parseInt(values[6])];
    this.verticalAlign = verticalAlignMapping[parseInt(values[7])];
    this.textColor = colorMapping[parseInt(values[8])];
    this.backgroundColor = colorMapping[parseInt(values[9])];
    this.taskbarColor = colorMapping[parseInt(values[10])];
    // Transform the value to SmartsheetCurrency enum (not based on the index but the value).
    this.currency = currencyMapping.find((currency) => currency === (values[11])) ?? SmartsheetCurrency.NONE;
    this.decimalCount = isNaN(parseInt(values[12])) ? 0 : parseInt(values[12]);
    this.thousandsSeparator = values[13] === '1';
    this.numberFormat = numberFormatMapping[parseInt(values[14])];
    this.textWrap = values[15] === '1';
    this.dateFormat = dateFormatMapping[parseInt(values[16])];
  }

  /**
   * Parses a format string.
   * @param format - The format string from Smartsheet cell object to parse.
   */
  static parse(format: string): CellFormatter {
    return new CellFormatter(format);
  }

  /**
   * Stringifies this formatter into the string format that could be used in Smartsheet cell object.
   */
  stringify(): string {
    return stringifyFormatter(this);
  }
}
