import { base64ToString } from '../utils';
import {
  FOLDER_OTHER_TYPE,
  FOLDER_INBOX_TYPE,
  FOLDER_DELETED_TYPE,
  FOLDER_SENT_TYPE,
} from '../constants/constants';
import he from 'he';

const correspondenceKeyConverter = {
  number: 'AFEid',
  fromID: 'FromUid',
  fromName: 'FromUser',
  senderName: 'sender',
  toID: 'ToUid',
  toName: 'ToUser',
  receivers: 'Recivers',
  subject: 'comment',
  subjectCatagory: 'Subjectname',
  faDate: 'EntDate_fa',
  receiverCopy: 'RecieverCopy',
  urgencyType: 'ALEid',
  letterNo: 'Letno',
  secure: 'IsSecure',
  seen: 'Seeflag',
  contentId: 'AFERichText',
  parentId: 'ParentAFEid',
};

const correspondenceAttachKeyConverter = {
  fileName: 'Title',
  extension: 'Extension',
};

const confirmationsKeyConverter = {
  userId: 'Uid',
  username: 'uname',
  id: 'ID',
  resend: 'Resend',
  typeID: 'FHKid',
  typeDescription: 'FHKDesc',
  comment: 'comment',
  blocked: 'Blockstatus',
  deleted: 'Deleted',
  pending: 'Pending',
  procedureName: 'fnname',
  fromUsername: 'FromUserName',
  creator: 'Creator',
  formName: 'EName',
  recordId: 'Frid',
  historyId: 'Fhid',
  formId: 'Eid',
  description: 'RetOrFailReason',
};

const historyOfActionsKeyConverter = {
  priority: 'FPriority',
  username: 'uname',
  createReason: 'reasonEnterKartable',
  userAction: 'UserAction',
  enterTime: 'entertime',
  confirmTime: 'Confirmtime',
  comment: 'comment',
};

const correspondenceContentKeyConverter = {
  content: 'Content',
};

const personsLookupKeyConverter = {
  userId: 'Uid',
  username: 'uname',
  role: 'utitle',
  firstName: 'Pfname',
  lastName: 'Plname',
  description: 'BriefDescription',
  personalId: 'pid',
};

const prioritiesLookupKeyConverter = {
  id: 'ALEid',
  text: 'ALEDescription',
};

const referencesLookupKeyConverter = {
  id: 'Subjectid',
  text: 'Subjectname',
};

const foldersKeyConverter = {
  name: 'Name',
};

const userInfoConverter = {
  userId: 'Uid',
  personalId: 'Pid',
  companyName: 'CompanyName',
  pictureId: 'PictureID',
  username: 'UserName',
};

export function correspondenceDataInterface(correspondence) {
  const converted = convert(correspondence, correspondenceKeyConverter);
  converted['attachments'] = [];
  converted['content'] = 'No content for preview';
  converted['enDate'] = correspondence['EntDate_g'];
  converted['sent'] = converted.seen == 2;
  converted['createdAt'] = new Date(base64ToString(correspondence['EntDate']));
  converted['seen'] = converted.seen != 0;
  return converted;
}

export function confirmationDataInterface(confirmation) {
  const converted = convert(confirmation, confirmationsKeyConverter);
  converted['time_en'] = confirmation['Enttime_g'];
  converted['formName'] = converted['formName'].slice(3);
  converted['createdAt'] = new Date(base64ToString(confirmation['Enttime']));
  converted['attachments'] = [];
  return converted;
}

export function historyOfActionsDataInterface(history) {
  const converted = convert(history, historyOfActionsKeyConverter);
  return converted;
}

export function correspondenceAttachmentInterface(attachment) {
  const converted = convert(attachment, correspondenceAttachKeyConverter);
  converted['id'] = attachment.ID;
  converted['type'] = attachment.Type;
  return converted;
}

export function correspondenceContentInterface(content) {
  const converted = convert(content, correspondenceContentKeyConverter);
  return converted;
}

export function personsLookupInterface(lookupItem) {
  const converted = convert(lookupItem, personsLookupKeyConverter);
  return converted;
}

export function priorityLookupInterface(priority) {
  const converted = convert(priority, prioritiesLookupKeyConverter);
  return converted;
}

export function referenceLookupInterface(reference) {
  const converted = convert(reference, referencesLookupKeyConverter);
  return converted;
}

export function userInfoInterface(userInfo) {
  const converted = convert(userInfo, userInfoConverter, false);
  return converted;
}

export function folderInterface(folder) {
  let converted = convert(folder, foldersKeyConverter);
  converted = { ...converted, ...{ id: folder.ID, parentId: folder.ParentID } };
  converted = {
    ...converted,
    type:
      converted.name.includes('inbo') || converted.name.includes('رسیده')
        ? FOLDER_INBOX_TYPE
        : converted.name.includes('sen') || converted.name.includes('ارسال')
          ? FOLDER_SENT_TYPE
          : converted.name.includes('delet') || converted.name.includes('حذف')
            ? FOLDER_DELETED_TYPE
            : FOLDER_OTHER_TYPE,
  };

  return converted;
}

export function convert(data, keySet, base64Decode = true) {
  const convertedData = {};
  for (let key of Object.keys(data)) {
    const convertedKey = Object.keys(keySet).find(item => keySet[item] == key);
    if (!!convertedKey) {
      convertedData[convertedKey] = base64Decode
        ? he.decode(base64ToString(data[key]))
        : data[key];
    }
  }
  return convertedData;
}
