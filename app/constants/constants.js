import images from '@assets/images';

export const SERVER_COOKIE_KEY = '.ASPXAUTH';
export const CORRESPONDENCE_DEFAULT_FILTER =
  'FilterID:LTE=|SearchIndex:LTE=|WhereClauseDefault:MT0x';
export const PRIORITY_STRINGS = {
  '1': 'Normal',
  '2': 'High',
  '3': 'Very High',
  default: 'None',
};
export const CONFIRMATION_DEFAULT_FILTER = 'WhereClauseDefault:MT0x';
export const CONFIRMATION_TYPE_TO_ICON = {
  '1': images.icon_approved_letter,
  '2': images.icon_accept_notification,
  '3': images.icon_deny_letter,
  '4': images.icon_deny_notification,
  '5': images.icon_group_approve,
};

export const TODO_STATUS_DONE = 'DONE';
export const TODO_STATUS_PENDING = 'PENDING';
export const TODO_STATUS_EXPIRED = 'EXPIRED';

export const FOLDER_INBOX_TYPE = 'INBOX';
export const FOLDER_DELETED_TYPE = 'DELETED';
export const FOLDER_OTHER_TYPE = 'OTHER';
export const FOLDER_SENT_TYPE = 'SENT';

export const FAILED_BASE64 = 'eyJzdWNjZWVkIjpmYWxzZX0=';

export const PAGE_SIZE = 10;

export const DEFAULT_BASE_URL = '130.185.77.150:5020';

export const ALL_CORRESPONDENCES_FOLDER_ID = '-1';
