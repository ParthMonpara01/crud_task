export class AppConstants {

  static readonly DEFAULT_PAGE_SIZE = 5;
  static readonly SORT_PAGE_COLUMN = 'name';
  static readonly PAGE_SIZE_OPTIONS = [
    5,
    10,
    50,
    100
  ];

  static readonly CURRENT_PAGE = 0;

  static readonly TOTAL_ELEMENT = 0;
  static readonly TOTAL_PAGES = 0;

  static readonly NAME_MIN_LENGTH = 2;
  static readonly NAME_MAX_LENGTH = 50;
  static readonly CATEGORY_NAME_PATTERN = "^(?=.*[A-Za-z])[A-Za-z ]+$";

  static readonly DESCRIPTION_MAX_LENGTH = 250;

  static readonly SLOGAN_MAX_LENGTH = 150;

  static readonly MIN_PRICE = 1;
  static readonly MAX_PRICE = 99999;
  static readonly PRICE_PATTERN = /^\d{1,6}(\.\d{1,2})?$/;
  static readonly ITEM_FORM_NAME_PATTERN = '^(?=.*[A-Za-z])[A-Za-z ]+$';

  
}