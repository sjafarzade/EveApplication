import { observable, computed, action, decorate } from 'mobx';
import {
  TODO_STATUS_DONE,
  TODO_STATUS_PENDING,
  TODO_STATUS_EXPIRED,
  ALL_CORRESPONDENCES_FOLDER_ID,
} from '../constants/constants';

class UserStore {
  username;
  password;
  cookie;
  storeUpdated = false;
  correspondences = [];
  confirmations = [];
  persons = [];
  priorities = [];
  referenceTypes = [];
  userInfo = {
    userId: null,
    personalId: null,
    companyName: null,
    pictureId: null,
    username: null,
    userImage: null,
  };
  reloade = false;
  folders = [];
  userPicture = null;
  selectedFolder = ALL_CORRESPONDENCES_FOLDER_ID;
  todoList = [
    { id: 1, status: TODO_STATUS_PENDING, text: 'Go to the station' },
    {
      id: 2,
      status: TODO_STATUS_EXPIRED,
      text: 'Call Sadra to arrange appointment',
    },
    { id: 3, status: TODO_STATUS_PENDING, text: 'Visit doctor' },
    {
      id: 4,
      statwhiteus: TODO_STATUS_PENDING,
      text: 'Help Sara to implement todo',
    },
    { id: 5, status: TODO_STATUS_EXPIRED, text: 'Talk with Shervin on new UI' },
    {
      id: 6,
      status: TODO_STATUS_PENDING,
      text: 'Go bank and make new cash account',
    },
    {
      id: 7,
      status: TODO_STATUS_DONE,
      text: 'Believing neglected so so allowance existence departure in',
    },
    {
      id: 8,
      status: TODO_STATUS_PENDING,
      text: 'Allow miles wound place the leave had.',
    },
    {
      id: 9,
      status: TODO_STATUS_PENDING,
      text: 'Get car back from carwash',
    },
  ];

  toggleStoreUpdate() {
    this.storeUpdated = !this.storeUpdated;
  }

  setCookie(cookie) {
    this.cookie = cookie;
  }

  setUsername(username) {
    this.username = username;
  }

  setPassword(password) {
    this.password = password;
  }

  setCorrespondences(correspondences) {
    this.correspondences = correspondences;
  }

  setConfirmations(confirmations) {
    this.confirmations = confirmations;
  }

  setCorrespondenceAttachments(correspondenceId, attachments) {
    const correspondence = this.correspondences.find(
      item => item.number == correspondenceId,
    );
    if (!!correspondence) {
      correspondence.attachments = attachments;
    }
  }

  setCorrespondenceContent(correspondenceId, content) {
    const correspondence = this.correspondences.find(
      item => item.number == correspondenceId,
    );
    if (!!correspondence) {
      correspondence.content = content;
    }
  }

  setConfirmationAttachments(confirmationId, attachments) {
    const confirmation = this.confirmations.find(
      item => item.id == confirmationId,
    );
    if (!!confirmation) {
      confirmation.attachments = attachments;
    }
  }

  updateTodo(todo) {
    this.todoList = this.todoList.filter(item => item.id !== todo.id);
    this.todoList.unshift(todo);
  }

  setPersons(persons) {
    this.persons = persons;
  }

  addPersons(persons) {
    this.persons.push(...persons);
  }

  setPriorities(priorities) {
    this.priorities = priorities;
  }

  setReferenceTypes(referenceTypes) {
    this.referenceTypes = referenceTypes;
  }

  setUserInfo(userInfo) {
    this.userInfo = { ...this.userInfo, ...userInfo };
  }

  changeCorrespondenceSeenInStore(correspondenceId) {
    const correspondence = this.correspondences.find(
      item => item.number == correspondenceId,
    );
    correspondence.seen = true;
    const correspondenceIndex = this.correspondences.findIndex(
      item => item.number == correspondenceId,
    );

    this.correspondences = [
      ...this.correspondences.slice(0, correspondenceIndex),
      correspondence,
      ...this.correspondences.slice(
        correspondenceIndex + 1,
        this.correspondences.length,
      ),
    ];
  }

  setUserPicture(userPicture) {
    this.userPicture = userPicture;
  }

  setFolders(folders) {
    this.folders = folders;
  }

  addFolder(folder) {
    this.folders.unshift(folder);
  }

  toggleReload() {
    this.reload = !this.reload;
  }

  setSelectedFolder(folder) {
    this.selectedFolder = folder;
  }

  addCorrespondences(correspondences) {
    this.correspondences.push(...correspondences);
  }

  addConfirmations(confirmations) {
    this.confirmations.push(...confirmations);
  }

  removeConfirmationFromStore(confirmationId) {
    this.confirmations = this.confirmations.filter(
      item => item.id !== confirmationId,
    );
  }
}

decorate(UserStore, {
  username: observable,
  password: observable,
  cookie: observable,
  correspondences: observable,
  confirmations: observable,
  todoList: observable,
  persons: observable,
  priorities: observable,
  referenceTypes: observable,
  userInfo: observable,
  userPicture: observable,
  folders: observable,
  reload: observable,
  selectedFolder: observable,
  storeUpdated: observable,

  setCookie: action,
  setUsername: action,
  setPassword: action,
  setCorrespondences: action,
  setConfirmations: action,
  setCorrespondenceAttachments: action,
  setConfirmationAttachments: action,
  updateTodo: action,
  setPersons: action,
  addPersons: action,
  setPriorities: action,
  changeCorrespondenceSeenInStore: action,
  setReferenceTypes: action,
  setUserInfo: action,
  setUserPicture: action,
  setFolders: action,
  addFolder: action,
  toggleReload: action,
  setSelectedFolder: action,
  addCorrespondences: action,
  addConfirmations: action,
  removeConfirmationFromStore: action,
  toggleStoreUpdate: action,
});

const userStore = new UserStore();

export default userStore;
export { UserStore };
