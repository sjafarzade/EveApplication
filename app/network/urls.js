import { AsyncStorage } from "react-native";

import { stringToBase64 } from "../utils";
import { DEFAULT_BASE_URL } from "../constants/constants";
import { userStore } from "../stores";

async function getBaseUrl() {
  const selected = await AsyncStorage.getItem("selectedCompany");
  if (!!selected) {
    const { value } = await JSON.parse(selected);
    return value;
  }
  return DEFAULT_BASE_URL;
}

export async function loginUrl() {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/account/login.aspx`;
}

export async function correspondenceUrl(
  pageIndex = 0,
  sortBy = "EntDate",
  ascending = true,
  filter
) {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/Ajax/autflwevents.aspx?command=GetRecords&pageIndex=${pageIndex}&SortBy=${sortBy}&ASC=${ascending}&Filters=${filter}&GridName=AutflwEvents`;
}

export async function newCorrespondenceUrl(
  { isSecure, message, subject, toList = [], ccList = [], reference, priority },
  randomId,
  letterNo,
  number = null
) {
  const baseUrl = await getBaseUrl();
  let toString = "",
    ccString = "";
  const mainToUser = toList.find((item) => !!item.id);
  if (!!mainToUser) {
    toList = toList.filter((item) => item.name !== mainToUser.name);
  }
  if (toList.length > 1) {
    for (let toItem of toList) {
      toString = toString + toItem.name + ",";
    }
  }
  if (ccList.length > 0) {
    for (let ccItem of ccList) {
      ccString = ccString + ccItem.name + ",";
    }
  }
  if (!letterNo) {
    letterNo = "";
  }

  if (!!number) {
    return `${baseUrl}/Ajax/autflwevents.aspx?Command=NewRecord&Data=comment:${stringToBase64(
      subject
    )}|AFERichText:${stringToBase64(message)}|ToUid:${stringToBase64(
      mainToUser.id
    )}|Recivers:${stringToBase64(
      toString.substring(0, toString.length - 1)
    )}|IsSecure:${
      isSecure ? stringToBase64("1") : stringToBase64("0")
    }|RecieverCopy:${stringToBase64(
      ccString.substring(0, ccString.length - 1)
    )}|AFEKid:${stringToBase64(reference)}|ALEid:${stringToBase64(
      priority
    )}|FromUid:${stringToBase64(
      "" + userStore.userInfo.userId
    )}|Letno:${stringToBase64(letterNo)}|AFEid:${stringToBase64(
      "" + number
    )}&Details=&DetailsData=&UpdateMode=false&DuplicateMode=false&PreviousData=&FormName=autflwevents&PK_Value=${number}&ForeignKeys=&PK_Name=AFEid&RandomID=${randomId}`;
  } else {
    return `${baseUrl}/Ajax/autflwevents.aspx?Command=NewRecord&Data=comment:${stringToBase64(
      subject
    )}|AFERichText:${stringToBase64(message)}|ToUid:${stringToBase64(
      mainToUser.id
    )}|Recivers:${stringToBase64(
      toString.substring(0, toString.length - 1)
    )}|IsSecure:${
      isSecure ? stringToBase64("1") : stringToBase64("0")
    }|RecieverCopy:${stringToBase64(
      ccString.substring(0, ccString.length - 1)
    )}|AFEKid:${stringToBase64(reference)}|ALEid:${stringToBase64(
      priority
    )}|Letno:${stringToBase64(
      letterNo
    )}&Details=&DetailsData=&UpdateMode=false&DuplicateMode=false&PreviousData=&FormName=autflwevents&PK_Value=${number}&ForeignKeys=&PK_Name=AFEid&RandomID=${randomId}  `;
  }
}

export async function correspondenceAttachmentUrl(id) {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/Ajax/GlobalHandler.aspx?Command=GetAttachments&GridName=autflwevents&PrimaryKey=${id}`;
}

export async function confirmationAttachmentUrl(id) {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/Ajax/GlobalHandler.aspx?Command=GetAttachments&GridName=wrkorder&PrimaryKey=${id}`;
}

export async function confirmationUrl(
  pageIndex = 0,
  sortBy = "Enttime",
  ascending = false,
  filter
) {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/Ajax/flwhistory.aspx?command=GetRecords&pageIndex=${pageIndex}&SortBy=${sortBy}&ASC=${ascending}&Filters=${filter}&GridName=flwhistory`;
}

export async function usernameUrl(personalID) {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/Ajax/GlobalHandler.aspx?Command=GetUserName&Pid=${personalID}`;
}

export async function correspondenceContentUrl(
  contentId,
  recordId,
  changeSeen = false
) {
  const baseUrl = await getBaseUrl();
  let url = `${baseUrl}/Ajax/GlobalHandler.aspx?Command=DownloadAttachment&Aftid=${contentId}&Ajax=true&FormName=autflwevents&RecordID=${recordId}`;

  if (!!changeSeen) {
    url += "&ChangeSeeflag=true";
  }
  return url;
}

export async function personLookupUrl(pageIndex) {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/Ajax/users.aspx?command=GetRecords&PageIndex=${pageIndex}&SortBy=&ASC=false&Filters=WhereClauseDefault:MT0x&GridName=users`;
}

export async function priorityLookupUrl() {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/Ajax/AutLetErgent.aspx?Command=GetRecords`;
}

export async function referenceTypeLookupUrl(pageIndex = 0) {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/Ajax/AutSubject.aspx?command=GetRecords&PageIndex=${pageIndex}&SortBy=&ASC=false&Filters=WhereClauseDefault:MT0x&GridName=autsubject`;
}

export async function confirmationAcceptUrl(
  description,
  formId,
  formName,
  historyId,
  recordId,
  userId
) {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/Ajax/GlobalHandler.aspx?Command=Confirm&FormID=${formId}&FormName=${formName}&RecordID=${recordId}&UserID=&HistoryID=${historyId}&Description=${description}`;
}

export async function confirmationDenyUrl(
  description,
  formId,
  formName,
  historyId,
  recordId,
  userId
) {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/Ajax/GlobalHandler.aspx?Command=Fail&FormID=${formId}&FormName=${formName}&RecordID=${recordId}&UserID=&HistoryID=${historyId}&Description=${description}`;
}

export async function confirmationArchiveUrl(historyId) {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/Ajax/FlwHistoryFunctional/FlwHistoryOperation/FlwHistoryOperation.aspx?Command=ArchiveFromDeleteFiles&FhidS=${historyId}`;
}

export async function historyOfActionsUrl(
  description,
  formId,
  formName,
  historyId,
  recordId,
  userId
) {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/Ajax/GlobalHandler.aspx?Command=GetConfirmationList&FormID=${formId}&FormName=${formName}&RecordID=${recordId}&UserID=&HistoryID=${historyId}&Description=${description}`;
}

export async function returnBackUrl(
  description,
  formId,
  formName,
  historyId,
  recordId,
  userId
) {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/Ajax/GlobalHandler.aspx?Command=ReturnBack&FormID=${formId}&FormName=${formName}&RecordID=${recordId}&UserID=&HistoryID=${historyId}&Description=${description}`;
}

export async function getFoldersUrl() {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/Ajax/GlobalHandler.aspx?Command=TreeCorrespondence`;
}

export async function createFolderUrl(foldername, userId) {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/Ajax/autfolders.aspx?Command=NewRecord&Data=name:${foldername}|FKid:NA==|Uid:${userId}|CreatedUid:${userId}&Details=&DetailsData=&UpdateMode=false&DuplicateMode=false&PreviousData=&FormName=autfolders&PK_Name=Fldrid`;
}

export async function userInfoUrl() {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/Ajax/GlobalHandler.aspx?Command=GetUidPid`;
}

export async function confirmFolderUrl(primaryKey) {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/Ajax/GlobalHandler.aspx?Command=Confirm&FormID=&FormName=autfolders&RecordID=${primaryKey}&UserID=&HistoryID=&Description=`;
}

export async function userPictureUrl(personalId, pictureId) {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/Ajax/GlobalHandler.aspx?Command=DownloadAttachment&Aftid=${pictureId}&FormName=personnel&RecordID=${personalId}&PictureBox=true&Ajax=true`;
}

export async function folderCorrespondencesFilterUrl(
  folderId,
  pageIndex = 0,
  sortBy = "EntDate",
  ascending = true
) {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/Ajax/AutFlwEvents.aspx?command=GetRecords&PageIndex=${pageIndex}&SortBy=${sortBy}&ASC=${ascending}&Filters=FilterID:${folderId}&GridName=autflwevents`;
}

export async function moveCorrespondenceUrl(correspondenceId, folderId) {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/Ajax/GlobalHandler.aspx?Command=ChangeDocuments&RecordIDs=${correspondenceId}&DocumentID=${folderId}`;
}

export async function downloadAttachmentUrl(attachmentId) {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/Ajax/GlobalHandler.aspx?Command=DownloadAttachment&AttachmentID=${attachmentId}`;
}

export async function uploadAttachmentUrl(randomId, number = null) {
  const baseUrl = await getBaseUrl();
  if (!!number) {
    return `${baseUrl}/Ajax/GlobalHandler.aspx?Command=UploadFile&GridName=autflwevents&PrimaryKey=${number}&FolderID=`;
  } else {
    return `${baseUrl}/Ajax/GlobalHandler.aspx?Command=UploadFile&GridName=autflwevents&PrimaryKey=-10&FolderID=&RandomID=${randomId}`;
  }
}

export async function removeAttachmentUrl(attachmentId) {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/Ajax/GlobalHandler.aspx?Command=RemoveAttachments&Delimiter=|&AttachmentIDs=${attachmentId}`;
}

export async function masterDetailesUrl(formId, id) {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/Ajax/Mobile_API.aspx?Command=MasterDetailData&Eid=${formId}&ID=${id}`;
}

export async function announcementsActionsUrl(formId, id) {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/Ajax/Mobile_API.aspx?Command=GetNotice&Eid=${formId}&ID=${id}`;
}

export async function submitAnnouncementUrl(comment, formId, id) {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/Ajax/Mobile_API.aspx?Command=InsertNotice&Eid=${formId}&ID=${id}&Comment=${comment}`;
}
