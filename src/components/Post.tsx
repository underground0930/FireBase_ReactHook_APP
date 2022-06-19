import React, { useEffect, useState } from "react";
import styles from "./Post.module.css";
import { db } from "../firebase";

import {
  collection,
  query,
  onSnapshot,
  orderBy,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";

// ui
import { Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import MessageIcon from "@material-ui/icons/Message";
import SendIcon from "@material-ui/icons/Send";

// types
import { POST, COMMENT } from "../Types";

const useStyles = makeStyles((theme) => ({
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(3),
  },
}));

const Post: React.FC<POST> = (props) => {
  console.log(props.postId);
  const classes = useStyles();
  const user = useSelector(selectUser);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<COMMENT[]>([]);
  const [openComments, setOpenComments] = useState(false);
  useEffect(() => {
    const q = query(
      collection(db, "posts", props.postId, "comments"),
      orderBy("timestamp", "desc")
    );
    const unSub = onSnapshot(q, (snapshot) => {
      setComments(
        snapshot.docs.map((doc) => {
          return {
            id: doc.id,
            avatar: doc.data().avatar,
            text: doc.data().text,
            username: doc.data().username,
            timestamp: doc.data().timestamp,
          };
        })
      );
      return () => {
        unSub();
      };
    });
  }, [props.postId]);
  const newComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await addDoc(collection(db, "posts", props.postId, "comments"), {
      avatar: user.photoUrl,
      text: comment,
      timestamp: serverTimestamp(),
      username: user.displayName,
    });
    setComment("");
  };
  return (
    <div className={styles.post}>
      <div className={styles.post_avatar}>
        <Avatar src={props.avatar} />
      </div>
      <div className={styles.post_body}>
        <div>
          <div className={styles.post_header}>
            <h3>
              <span className={styles.post_headerUser}>@{props.username}</span>
              <span className={styles.post_headerTime}>
                {new Date(props.timestamp?.toDate()).toLocaleString()}
              </span>
            </h3>
          </div>
          <div className={styles.post_tweet}>
            <p>{props.text}</p>
          </div>
        </div>
        {props.image && (
          <div className={styles.post_tweetImage}>
            <img src={props.image} alt="tweet" />
          </div>
        )}
        <MessageIcon
          className={styles.post_commentIcon}
          onClick={() => setOpenComments(!openComments)}
        />
        {openComments && (
          <>
            {comments.map((c) => {
              return (
                <div key={c.id} className={styles.post_comment}>
                  <Avatar src={c.avatar} className={classes.small} />
                  <span className={styles.post_commentUser}>@{c.username}</span>
                  <span className={styles.post_commentText}>@{c.text}</span>
                  <span className={styles.post_headerTime}>
                    {new Date(c.timestamp?.toDate()).toLocaleString()}
                  </span>
                </div>
              );
            })}
            <form onSubmit={newComment}>
              <div className={styles.post_form}>
                <input
                  type="text"
                  placeholder="type new comment..."
                  value={comment}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setComment(e.target.value);
                  }}
                />
                <button
                  disabled={!comment}
                  className={comment ? styles.post_button : styles.post_buttonDisable}
                  type="submit"
                >
                  <SendIcon className={styles.post_sendIcon} />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Post;
