import firebase from "firebase/app";
import "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAXQGhSptj5rV7x7NnuMo-zgBBKav0FrE0",
  authDomain: "fe-upload-plugin.firebaseapp.com",
  projectId: "fe-upload-plugin",
  storageBucket: "fe-upload-plugin.appspot.com",
  messagingSenderId: "369350865443",
  appId: "1:369350865443:web:8a4df895211f0a9ae7b796",
};
firebase.initializeApp(firebaseConfig);

const storage = firebase.storage();

const progresshandler = (previews, i) => snapshot => {
  const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  const previewBar = previews[i].querySelector(".previewInfoUpload");

  previewBar.style.width = percent.toFixed() + "%";
  if (percent > 13) previewBar.innerText = percent.toFixed() + "%";
};

const completehandler = (task, previews, i) => url => {
  task.snapshot.ref.getDownloadURL().then(url => {
    const previewBar = previews[i].querySelector(".previewInfoUpload");
    previewBar.innerText = "";
    previewBar.innerHTML = `<a class="linkWithResult" href="${url}" target="_blank">${url}</a>`;
  });
};

export const onDownload = ({ files, preview, previews }) => {
  files.forEach((file, i) => {
    const ref = storage.ref(`images/${file.name}`);
    const task = ref.put(file);
    task.on(
      "state_changed",
      progresshandler(previews, i),
      error => {
        console.log(error);
      },
      completehandler(task, previews, i)
    );
  });
};
