import React, { useState } from "react";
import firebase from "firebase/app";
import styles from "./TweetInput.module.css";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { auth, db, storage } from "../firebase";
import { Avatar, Button, IconButton } from "@material-ui/core";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";

// utils
import { setRandomChar } from "../utils/setRandomChar";
import { changeImageHandler } from "../utils/changeImageHandler";
import { getDownloadURL, uploadBytesResumable, ref } from "firebase/storage";
import { collection, serverTimestamp, addDoc } from "firebase/firestore";

export default function TweetInput() {
  const user = useSelector(selectUser);
  const [tweetImage, setTweetImage] = useState<File | null>(null);
  const [tweetMsg, setTweetMsg] = useState("");

  const addDocWrapper = (url: string) => {
    addDoc(collection(db, "posts"), {
      avatar: user.photoUrl,
      image: url,
      text: tweetMsg,
      timestamp: serverTimestamp(),
      username: user.displayName,
    });
  };

  const sendTweet = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (tweetImage) {
      const randomChar = setRandomChar();
      const fileName = randomChar + "_" + tweetImage.name;
      const storageRef = ref(storage, `images/${fileName}`);
      const uploadTweetImg = uploadBytesResumable(storageRef, tweetImage);
      uploadTweetImg.on(
        "state_changed",
        () => {},
        (err) => {
          alert(err.message);
        },
        async () => {
          await getDownloadURL(storageRef).then(async (url) => {
            await addDocWrapper(url);
          });
        }
      );
    } else {
      addDocWrapper("");
    }
    setTweetImage(null);
    setTweetMsg("");
  };

  return (
    <>
      <form onSubmit={sendTweet}>
        <div className={styles.tweet_form}>
          <Avatar
            className={styles.tweet_avatar}
            src={user.photoUrl}
            onClick={async () => {
              await auth.signOut();
            }}
          />
          <input
            className={styles.tweet_input}
            placeholder={"What`s happen"}
            type="text"
            autoFocus
            value={tweetMsg}
            onChange={(e) => setTweetMsg(e.currentTarget.value)}
          />
          <IconButton>
            <label>
              <input
                type="file"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  changeImageHandler(e, setTweetImage);
                }}
                style={{ opacity: tweetImage ? 0.4 : 1 }}
              />

              <AddAPhotoIcon
                className={tweetImage ? styles.tweet_addIconLoaded : styles.tweet_addIcon}
              ></AddAPhotoIcon>
            </label>
          </IconButton>
        </div>
        <Button
          type="submit"
          disabled={!tweetMsg}
          className={tweetMsg ? styles.tweet_sendBtn : styles.tweet_sendDisableBtn}
        >
          Tweet
        </Button>
      </form>
    </>
  );
}
