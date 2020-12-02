import base64 from 'base-64';
import utf8 from 'utf8';
import {PRIORITY_STRINGS} from './constants/constants';
import RNFetchBlob from 'rn-fetch-blob';
import moment from 'moment';
import {Platform} from 'react-native';

export function textWrapper(text, size) {
  return text.length < size ? text : text.slice(0, size) + '...';
}

export function stringToBase64(string) {
  const bytes = utf8.encode(string);
  const encoded = base64.encode(bytes);
  return encoded;
}

export function base64ToString(base64Text) {
  return utf8.decode(base64.decode(base64Text));
}

export function timeFormatter(timeString) {
  const splittedTime = timeString.split(' ');
  [, time, timeIndicator] = splittedTime;
  const timeArray = time.split(':');

  return timeArray[0] + ':' + timeArray[1] + '  ' + timeIndicator;
}

export function priorityToText(priority) {
  let priorityString = PRIORITY_STRINGS[priority];
  if (!priorityString) priorityString = PRIORITY_STRINGS['default'];
  return priorityString;
}

export function extractContent(html = '') {
  pStartFound = false;
  spanStartFound = false;
  startRead = false;
  string = '';

  for (let i = 0; i < html.length; i++) {
    if (startRead && html.substring(i, i + 2) == '</') {
      string += '\n';
      startRead = false;
      pStartFound = false;
      spanStartFound = false;
    }
    if (startRead) {
      string += html.charAt(i);
    }

    if (html.charAt(i) == '>' && pStartFound && spanStartFound) {
      startRead = true;
    }
    if (html.substring(i - 3, i) == '<p ') {
      pStartFound = true;
      if (pStartFound) {
        nextPStart = true;
      }
    }
    if (html.substring(i - 6, i) == '<span ') {
      if (spanStartFound) {
        nextSpanStart = true;
      }
      spanStartFound = true;
    }
    let chars = [];
  }
  const regex = /&nbsp;/gi;
  string = string.replace(regex, '');
  string = string.substring(0, string.length - 1);

  //Replace special characteres
  string = string.replace('&amp;', '&');
  string = string.replace('&quot;', '"');
  string = string.replace('&gt;', '<');
  string = string.replace('&lt;', '>');
  string = string.replace('&#10;', '');

  return string;
}

export function getAttachmentFileName(attachment, correspondence) {
  return `${correspondence.number}_${attachment.fileName}`;
}

export function getAttachmentFileAddress(attachment, correspondence) {
  const baseDir =
    Platform.OS == 'ios'
      ? RNFetchBlob.fs.dirs.DocumentDir
      : RNFetchBlob.fs.dirs.DownloadDir;
  return `${baseDir}/eveApplication/${getAttachmentFileName(
    attachment,
    correspondence,
  )}`;
}

export async function checkFileExists(attachment, correspondence) {
  const attachmentAddress = getAttachmentFileAddress(
    attachment,
    correspondence,
  );
  try {
    const exist = await RNFetchBlob.fs.exists(attachmentAddress);
    return exist;
  } catch (err) {
    return false;
  }
}

export function createRandomId() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return (
    s4() +
    s4() +
    '-' +
    s4() +
    '-' +
    s4() +
    '-' +
    s4() +
    '-' +
    s4() +
    s4() +
    s4()
  );
}

export async function extractMasterDetails(obj) {
  // var utf8Object = utf8.decode(obj);
  let jsonObject = {};
  if (Platform.OS == 'ios') {
    jsonObject = eval('(' + ` ${obj} ` + ')').MasterData;
  } else {
    const utfDecoded = await utf8.decode(obj);
    const evaluatedData = await eval('(' + ` ${utfDecoded} ` + ')');
    jsonObject = evaluatedData.MasterData;
  }
  const numberPattern = /\d+/g;
  const masterDataArray = {};
  for (let masterItem of jsonObject) {
    for (let obj of Object.keys(masterItem)) {
      masterDataArray[obj] =
        !!masterItem[obj] && masterItem[obj].includes('/Date')
          ? moment(
              new Date(parseInt(masterItem[obj].match(numberPattern)[0])),
            ).format('Do MMM YYYY, h:mm')
          : masterItem[obj];
    }
  }
  return masterDataArray;
}
