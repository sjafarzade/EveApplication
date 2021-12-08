import Cookie from "react-native-cookie";
import RNFetchBlob from "rn-fetch-blob";
import * as mime from "react-native-mime-types";
import { Platform } from "react-native";

import { stringToBase64, extractMasterDetails } from "../utils";
import {
  loginUrl,
  correspondenceUrl,
  correspondenceAttachmentUrl,
  confirmationUrl,
  confirmationAcceptUrl,
  confirmationDenyUrl,
  confirmationArchiveUrl,
  confirmationAttachmentUrl,
  usernameUrl,
  correspondenceContentUrl,
  personLookupUrl,
  priorityLookupUrl,
  historyOfActionsUrl,
  returnBackUrl,
  referenceTypeLookupUrl,
  getFoldersUrl,
  newCorrespondenceUrl,
  createFolderUrl,
  userInfoUrl,
  confirmFolderUrl,
  userPictureUrl,
  folderCorrespondencesFilterUrl,
  moveCorrespondenceUrl,
  downloadAttachmentUrl,
  uploadAttachmentUrl,
  removeAttachmentUrl,
  masterDetailesUrl,
  announcementsActionsUrl,
  submitAnnouncementUrl,
} from "./urls";

import {
  SERVER_COOKIE_KEY,
  FAILED_BASE64,
  FOLDER_OTHER_TYPE,
  CORRESPONDENCE_DEFAULT_FILTER,
  PAGE_SIZE,
} from "../constants/constants";
import { userStore } from "../stores";
import {
  correspondenceDataInterface,
  correspondenceAttachmentInterface,
  confirmationDataInterface,
  correspondenceContentInterface,
  personsLookupInterface,
  priorityLookupInterface,
  historyOfActionsDataInterface,
  referenceLookupInterface,
  userInfoInterface,
  folderInterface,
  announcementInterface,
  confirmationAttachmentInterface,
} from "./interface";

export async function loginQuery(username, password) {
  await Cookie.clear();
  const url = await loginUrl();

  var options = {
    method: "GET",
    headers: {
      "Cache-Control": "private",
      Authorization: `Basic ${stringToBase64(`${username}:${password}`)}`,
      "Access-Control-Allow-Headers": "*",
      auth: `Basic ${stringToBase64(`${username}:${password}`)}`,
    },
    credentials: "same-origin",
  };
  let loginRes;
  try {
    loginRes = await fetch(url, options);
  } catch (error) {
    return false;
  }
  const response = await Cookie.get(url);
  if (response && response[SERVER_COOKIE_KEY]) {
    userStore.setCookie(response[SERVER_COOKIE_KEY]);
    userStore.setUsername(username);
    userStore.setPassword(password);
    return true;
  } else {
    return false;
  }
}

export async function getCorrespondenceQuery(
  pageIndex = 0,
  sortBy = "",
  ascending = true,
  filter = CORRESPONDENCE_DEFAULT_FILTER
) {
  const url = await correspondenceUrl(pageIndex, sortBy, ascending, filter);
  var options = {
    method: "GET",
    headers: {
      "Cache-Control": "private",
    },
    credentials: "same-origin",
  };
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    return false;
  }
  if (response && response.ok) {
    const jsonResponse = await response.json();
    const correspondences = jsonResponse.Items.map((item) =>
      correspondenceDataInterface(item)
    );
    if (pageIndex == 0) {
      userStore.setCorrespondences(correspondences);
    } else if (pageIndex >= userStore.correspondences.length / PAGE_SIZE) {
      userStore.addCorrespondences(correspondences);
    }
    for (let correspondence of correspondences) {
      try {
        await getCorrespondenceAttachmentsQuery(correspondence.number);
        await getCorrespondenceContentQuery(
          correspondence.contentId,
          correspondence.number
        );
      } catch (error) {}
    }
    userStore.toggleReload();
    return true;
  } else {
    return false;
  }
}

export async function getCorrespondenceAttachmentsQuery(correspondenceId) {
  const url = await correspondenceAttachmentUrl(correspondenceId);
  var options = {
    method: "GET",
    headers: {
      "Cache-Control": "private",
    },
    credentials: "same-origin",
  };

  const response = await fetch(url, options);
  if (response && response.ok) {
    const jsonResponse = await response.json();
    const attachments = jsonResponse.Attachments.map((attach) =>
      correspondenceAttachmentInterface(attach)
    );
    userStore.setCorrespondenceAttachments(correspondenceId, attachments);
    return true;
  } else {
    return false;
  }
}

export async function changeCorrespondenceSeenQuery(
  contentId,
  correspondenceId
) {
  const url = await correspondenceContentUrl(contentId, correspondenceId, true);
  var options = {
    method: "GET",
    headers: {
      "Cache-Control": "private",
    },
    credentials: "same-origin",
  };
  try {
    await fetch(url, options);
  } catch (error) {}
}

export async function getCorrespondenceContentQuery(
  contentId,
  correspondenceId
) {
  const url = await correspondenceContentUrl(
    contentId,
    correspondenceId,
    false
  );
  var options = {
    method: "GET",
    headers: {
      "Cache-Control": "private",
    },
    credentials: "same-origin",
  };
  const response = await fetch(url, options);
  if (response && response.ok) {
    const jsonResponse = await response.json();
    const converted = correspondenceContentInterface(jsonResponse);
    userStore.setCorrespondenceContent(correspondenceId, converted.content);
    return true;
  } else {
    return false;
  }
}

export async function getConfirmationQuery(
  pageIndex,
  sortBy,
  ascending,
  filter
) {
  const url = await confirmationUrl(pageIndex, sortBy, ascending, filter);
  var options = {
    method: "GET",
    headers: {
      "Cache-Control": "private",
    },
    credentials: "same-origin",
  };
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    return false;
  }
  if (response && response.ok) {
    const jsonResponse = await response.json();
    const confirmations = jsonResponse.Items.map((item) =>
      confirmationDataInterface(item)
    );

    if (pageIndex == 0) {
      userStore.setConfirmations(confirmations);
    } else if (pageIndex >= userStore.confirmations.length / PAGE_SIZE) {
      userStore.addConfirmations(confirmations);
    }
    for (let confirmation of confirmations) {
      try {
        console.warn("here");
        await getConfirmationAttachmentsQuery(confirmation.id);
      } catch (error) {
        console.warn("error", error);
      }
    }
    userStore.toggleReload();
    return true;
  } else {
    return false;
  }
}

export async function getConfirmationAttachmentsQuery(confirmationId) {
  const url = await confirmationAttachmentUrl(confirmationId);
  var options = {
    method: "GET",
    headers: {
      "Cache-Control": "private",
    },
    credentials: "same-origin",
  };

  const response = await fetch(url, options);
  if (response && response.ok) {
    const jsonResponse = await response.json();
    console.warn("attach", jsonResponse);
    const attachments = jsonResponse.Attachments.map((attach) =>
      confirmationAttachmentInterface(attach)
    );
    userStore.setConfirmationAttachments(confirmationId, attachments);
    return true;
  } else {
    return false;
  }
}

export async function getUsernameQuery(personalID) {
  const url = await usernameUrl(personalID);
  var options = {
    method: "GET",
    headers: {
      "Cache-Control": "private",
    },
    credentials: "same-origin",
  };
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    return { status: false };
  }
  if (response && response.ok) {
    const jsonResponse = await response.json();
    return { status: true, username: jsonResponse.UserName };
  }
  return { status: false };
}

export async function getPersonsLookupQuery(pageIndex = 0) {
  const url = await personLookupUrl(pageIndex);
  var options = {
    method: "GET",
    headers: {
      "Cache-Control": "private",
    },
    credentials: "same-origin",
  };
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    return false;
  }
  if (response && response.ok) {
    const jsonResponse = await response.json();
    const persons = jsonResponse.Items.map((item) =>
      personsLookupInterface(item)
    );
    if (pageIndex == 0) {
      userStore.setPersons(persons);
    } else if (pageIndex >= userStore.persons.length / PAGE_SIZE) {
      userStore.addPersons(persons);
    }
    return true;
  }
  return true;
}

export async function getPriorityLookupQuery() {
  const url = await priorityLookupUrl();
  var options = {
    method: "GET",
    headers: {
      "Cache-Control": "private",
    },
    credentials: "same-origin",
  };
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    return false;
  }
  if (response && response.ok) {
    const jsonResponse = await response.json();
    const priorities = jsonResponse.Items.map((item) =>
      priorityLookupInterface(item)
    );
    userStore.setPriorities(priorities);
    return true;
  }
  return false;
}

export async function getReferenceTypeLookupQuery() {
  const url = await referenceTypeLookupUrl();
  var options = {
    method: "GET",
    headers: {
      "Cache-Control": "private",
    },
    credentials: "same-origin",
  };
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    return false;
  }
  if (response && response.ok) {
    const jsonResponse = await response.json();
    const references = jsonResponse.Items.map((item) =>
      referenceLookupInterface(item)
    );
    userStore.setReferenceTypes(references);
    return { status: true, data: userStore.referenceTypes };
  }
  return { status: false };
}

const messageBodyWrapper = (message) =>
  `<div dir='rtl' style='direction: rtl;unicode-bidi: embed;'>فرستنده: [[Sender]] ,  گیرنده: [[Receiver]] ,  موضوع: [[Subject]] , گیرندگان رونوشت:[[RecieverCopy]] , [[Now]]</div>###<p>${message}</p>`;

export async function createNewFolder(foldername) {
  const { userId } = userStore.userInfo;
  const url = await createFolderUrl(
    stringToBase64(foldername),
    stringToBase64(userStore.userInfo.userId)
  );
  let options = {
    method: "GET",
    headers: {
      "Cache-Control": "private",
    },
    credentials: "same-origin",
  };
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    return false;
  }
  if (response && response.ok) {
    const jsonResponse = await response.json();
    const { PrimaryKeyValue } = jsonResponse;
    const confirmUrl = await confirmFolderUrl(PrimaryKeyValue);
    let confirmResponse;
    try {
      confirmResponse = await fetch(confirmUrl, options);
    } catch (error) {
      return false;
    }
    if (confirmResponse && confirmResponse.ok) {
      userStore.addFolder({ name: foldername, type: FOLDER_OTHER_TYPE });
      getFoldersQuery();
      let jsonConfirmResponse;
      try {
        jsonConfirmResponse = await confirmResponse.json();
      } catch (error) {
        return false;
      }
      if (jsonConfirmResponse && jsonConfirmResponse.succeed) {
        return true;
      }
    }
  }
  return false;
}

export async function userInfoQuery() {
  const url = await userInfoUrl();
  var options = {
    method: "GET",
    headers: {
      "Cache-Control": "private",
    },
    credentials: "same-origin",
  };
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    return false;
  }
  if (response && response.ok) {
    const jsonResponse = await response.json();
    userStore.setUserInfo(userInfoInterface(jsonResponse.UserInform));
    return true;
  }
  return false;
}

export async function postNewCorrespondence(
  correspondence,
  randomId,
  letterNo,
  number
) {
  let url;
  try {
    url = await newCorrespondenceUrl(
      {
        ...correspondence,
        message: messageBodyWrapper(correspondence.message),
      },
      randomId,
      letterNo,
      number
    );
  } catch (e) {}
  var options = {
    method: "GET",
    headers: {
      "Cache-Control": "private",
    },
    credentials: "same-origin",
  };
  let response;

  try {
    response = await fetch(url, options);
  } catch (error) {
    return false;
  }
  if (response && response.ok) {
    return true;
  }
  return false;
}

export async function confirmationAprrove(
  description,
  formId,
  formName,
  historyId,
  recordId,
  userId
) {
  const url = await confirmationAcceptUrl(
    description,
    formId,
    formName,
    historyId,
    recordId,
    userId
  );
  var options = {
    method: "GET",
    headers: {
      "Cache-Control": "private",
    },
    credentials: "same-origin",
  };
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    return false;
  }
  if (response && response.ok) {
    return true;
  }
}

export async function confirmationDeny(
  description,
  formId,
  formName,
  historyId,
  recordId,
  userId
) {
  const encodedDescription = stringToBase64(description);
  const url = await confirmationDenyUrl(
    encodedDescription,
    formId,
    formName,
    historyId,
    recordId,
    userId
  );
  var options = {
    method: "GET",
    headers: {
      "Cache-Control": "private",
    },
    credentials: "same-origin",
  };
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    console.log(error);
    return false;
  }
  if (response && response.ok) {
    return true;
  }
}

export async function confirmationArchive(historyId) {
  const url = await confirmationArchiveUrl(historyId);
  var options = {
    method: "GET",
    headers: {
      "Cache-Control": "private",
    },
    credentials: "same-origin",
  };
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    return false;
  }
  if (response && response.ok) {
    return true;
  }
}

export async function historyOfActions(
  description,
  formId,
  formName,
  historyId,
  recordId,
  userId
) {
  const url = await historyOfActionsUrl(
    description,
    formId,
    formName,
    historyId,
    recordId,
    userId
  );
  var options = {
    method: "GET",
    headers: {
      "Cache-Control": "private",
    },
    credentials: "same-origin",
  };
  const response = await fetch(url, options);
  if (response && response.ok) {
    const jsonResponse = await response.json();
    const history = jsonResponse.Items.map((item) =>
      historyOfActionsDataInterface(item)
    );
    return history;
  }
}

export async function returnBackfromApprove(
  description,
  formId,
  formName,
  historyId,
  recordId,
  userId
) {
  const encodedDescription = stringToBase64(description);
  const url = await returnBackUrl(
    encodedDescription,
    formId,
    formName,
    historyId,
    recordId,
    userId
  );
  var options = {
    method: "GET",
    headers: {
      "Cache-Control": "private",
    },
    credentials: "same-origin",
  };
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    return false;
  }
  if (response && response.ok) {
    return true;
  }
}

export async function getUserpictureQuery() {
  if (!userStore.userInfo.pictureId) {
    return null;
  }
  const url = await userPictureUrl(
    userStore.userInfo.personalId,
    userStore.userInfo.pictureId
  );
  RNFetchBlob.fetch("GET", url, {})
    .then((res) => {
      let base64Str = res.base64();
      if (base64Str !== FAILED_BASE64) {
        userStore.setUserPicture(base64Str);
      }
    })
    .catch((errorMessage, statusCode) => {});
}

export async function getFoldersQuery() {
  const url = await getFoldersUrl();
  var options = {
    method: "GET",
    headers: {
      "Cache-Control": "private",
    },
    credentials: "same-origin",
  };
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    return false;
  }
  if (response && response.ok) {
    const jsonResponse = await response.json();
    const folders = jsonResponse.Items.map((item) => folderInterface(item));
    userStore.setFolders(folders);
    return true;
  }
}

export async function getFolderCorrespondencesQuery(
  folderId,
  pageIndex = 0,
  sortBy,
  ascending
) {
  const url = await folderCorrespondencesFilterUrl(
    stringToBase64(folderId),
    pageIndex,
    sortBy,
    ascending
  );
  var options = {
    method: "GET",
    headers: {
      "Cache-Control": "private",
    },
    credentials: "same-origin",
  };
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    return false;
  }
  if (response && response.ok) {
    const jsonResponse = await response.json();
    const correspondences = jsonResponse.Items.map((item) =>
      correspondenceDataInterface(item)
    );
    if (pageIndex == 0) {
      userStore.setCorrespondences(correspondences);
    } else if (pageIndex >= userStore.correspondences.length / PAGE_SIZE) {
      userStore.addCorrespondences(correspondences);
    }
    for (let correspondence of correspondences) {
      try {
        await getCorrespondenceAttachmentsQuery(correspondence.number);
        await getCorrespondenceContentQuery(
          correspondence.contentId,
          correspondence.number
        );
      } catch (error) {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
}

export async function moveCorrespondenceQuery(correspondenceId, folderId) {
  const url = await moveCorrespondenceUrl(correspondenceId, folderId);
  var options = {
    method: "GET",
    headers: {
      "Cache-Control": "private",
    },
    credentials: "same-origin",
  };
  const response = await fetch(url, options);

  if (response && response.ok) {
    const jsonResponse = await response.json();
    if (jsonResponse && jsonResponse.Succeed) {
      return true;
    }
    return false;
  }
  return false;
}

export async function downloadAttachmentQuery(
  attachmentId,
  fileName,
  onDownloadEnd,
  onDownloadCancel,
  setProgress,
  setTask
) {
  const url = await downloadAttachmentUrl(attachmentId);
  const { fs } = RNFetchBlob;
  const baseDir =
    Platform.OS == "ios" ? fs.dirs.DocumentDir : fs.dirs.DownloadDir;
  let eveDir = baseDir;
  try {
    const mkdirRes = await fs.mkdir(`${baseDir}/eveApplication`);
    if (mkdirRes) {
      eveDir = `${baseDir}/eveApplication`;
    }
  } catch (err) {
    if (err.code == "EEXIST") {
      eveDir = `${baseDir}/eveApplication`;
    }
  }

  const downloadTask = RNFetchBlob.config({
    fileCache: false,
    path: `${eveDir}/${fileName}`,
  }).fetch("POST", url, {
    Cookie: `.ASPXAUTH=${userStore.cookie};`,
    "Cache-Control": "private",
  });
  setTask(downloadTask);
  downloadTask
    .progress({ interval: 250 }, (received, total) => {
      setProgress((received / total) * 100);
    })
    .then((res) => {
      onDownloadEnd();
    })
    .catch((err) => {
      onDownloadCancel();
    });
}

export async function uploadAttachmentQuery(
  fileAddress,
  fileName,
  fileType,
  onUploadEnd,
  onUploadCancel,
  setProgress,
  setTask,
  randomId,
  number
) {
  const url = await uploadAttachmentUrl(randomId, number);
  if (Platform.OS == "ios") {
    fileAddress = fileAddress.replace("file://", "");
  }
  const uploadTask = RNFetchBlob.fetch(
    "POST",
    url,
    {
      Cookie: `.ASPXAUTH=${userStore.cookie};`,
      "Cache-Control": "private",
    },
    [
      {
        filename: fileName,
        "Content-Type": mime.lookup(fileName),
        type: mime.lookup(fileName),
        "Content-Disposition": "form-data",
        name: "file",
        data:
          Platform.OS == "ios"
            ? "RNFetchBlob-" + decodeURI(fileAddress)
            : RNFetchBlob.wrap(fileAddress),
      },
    ]
  );
  setTask(uploadTask);
  uploadTask
    .uploadProgress({ interval: 250 }, (written, total) => {
      setProgress(written / total);
    })
    .then((res) => {
      onUploadEnd(JSON.parse(res.text()));
    })
    .catch((err) => {
      onUploadCancel();
    });
}

export async function removeAttachmentQuery(attachmentId) {
  const url = await removeAttachmentUrl(attachmentId);
  var options = {
    method: "GET",
    headers: {
      "Cache-Control": "private",
    },
    credentials: "same-origin",
  };
  const response = await fetch(url, options);
  if (response && response.ok) {
    const jsonResponse = await response.json();
    if (jsonResponse && jsonResponse.Succeed) {
      return true;
    }
    return false;
  }
  return false;
}

export async function masterDetailesQuery(formId, id) {
  const url = await masterDetailesUrl(formId, id);
  var options = {
    method: "GET",
    headers: { "Catch-Control": "private" },
    credentials: "same-origin",
  };
  try {
    const res = await RNFetchBlob.fetch("GET", url, {});
    const status = res.info().status;

    if (status == 200) {
      let text = res.text();
      const masterRes = extractMasterDetails(text);
      return masterRes;
    }
    return [];
  } catch (e) {
    return [];
  }
}

export async function announcementQuery(formId, id) {
  try {
    const url = await announcementsActionsUrl(formId, id);
    var options = {
      method: "GET",
      headers: {
        "Cache-Control": "private",
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
    };
    const response = await fetch(url, options);

    if (response && response.ok) {
      const jsonResponse = await response.json();
      return jsonResponse.noticeData.map((item) => announcementInterface(item));
    }
  } catch (err) {
    return [];
  }
}

export async function submitAnnouncementQuery(comment, formId, id) {
  const url = await submitAnnouncementUrl(comment, formId, id);
  var options = {
    method: "GET",
    headers: {
      "Cache-Control": "private",
    },
    credentials: "same-origin",
  };
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    return false;
  }
  if (response && response.ok) {
    return true;
  }
}
