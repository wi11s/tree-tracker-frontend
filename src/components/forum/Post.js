import React, { useState, useEffect } from 'react';
import Replies from './Replies';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import { useSelector } from 'react-redux'
import { selectUser } from '../../slices/userSlice'

export default function Post({post, setPosts, posts}) {

  const user = useSelector(selectUser)
  const username = post.user.username
  // console.log(post)
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(post.likes_count)
  const [commonToggle, setCommonToggle] = useState(false)
  const [replyCount, setReplyCount] = useState(post.initial_replies.length)
  const [expand, setExpand] = useState(false)
  const [replies, setReplies] = useState(false)
  const [content, setContent] = useState('')
  const [replyingState, setReplyingState] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`https://tree-tracker-backend.herokuapp.com/like/${user.id}/${post.id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwt")}`
      }
    })
    .then(r => r.json())
    .then(data => {
      // console.log(data)
      if (data) {
        setLiked(true)
      }
    })
  }, [localStorage.getItem("jwt")])

  function handleClick() {
    if (liked === false) {
      fetch('https://tree-tracker-backend.herokuapp.com/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: JSON.stringify({
          post_id: post.id,
          user_id: user.id
        })
      })
      .then(r => r.json())
      .then(data => {
        console.log(data)
        setLiked(true)
        let newLikes = likes + 1
        setLikes(newLikes)
      })
    } else
      fetch(`https://tree-tracker-backend.herokuapp.com/like/${user.id}/${post.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        }
      })
      .then(() => {
        setLiked(false)
        let newLikes = likes - 1
        setLikes(newLikes)
      })
  }

  function handleExpand() {
    setExpand(!expand)
  }

  function handleReplyClick() {
    setReplies(!replies)
    setCommonToggle(!commonToggle)
  }

  function handleContentChange(e) {
    setContent(e.target.value)
  }

  function handleReplySubmit(e) {
    e.preventDefault()
    fetch('https://tree-tracker-backend.herokuapp.com/replies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('jwt')}`
      },
      body: JSON.stringify({
        content: content,
        user_id: user.id,
        post_id: post.id
      })
    })
    .then(r => r.json())
    .then(data => {
      console.log(data)
      if (data.id) {
        setExpand(true)
        setReplyingState(!replyingState)
        setReplyCount(replyCount => replyCount + 1)
        setContent('')
      } else {
        alert(data.exception)
      }
    })
  }

  function toViewProfile() {
    navigate(`/profile/${post.user.id}`)
  }

  function handleDelete() {
    fetch(`https://tree-tracker-backend.herokuapp.com/posts/${post.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwt')}`
      }
    })
    .then(r => r.json())
    .then(data => {
      console.log(data)
    })

    setPosts(posts.filter(p => p.id !== post.id))
  }

  return (

    <div className="post">
      <div className="post-container">
        <p className="card-header" onClick={toViewProfile}>
          {username} :
        </p>

        {post.user.id === user.id ?  <i className='bx bx-x' onClick={() => handleDelete(post.id)}></i> : null}
          
        <p className='postContent'>{post.content}</p>

        <div className="post-bottom">
          <p className='post-date'>{post.created_at.substring(0, 10)}</p>

          <div className="post-icons-container">
            <div className="post-icons">
              {liked ? <i className='bx bxs-heart' onClick={handleClick}></i> : <i className='bx bx-heart' onClick={handleClick}></i>}
              <p>{likes}</p>
            </div>

            <div className="post-icons">
              {commonToggle ? <i className='bx bxs-message-square-dots' onClick={handleReplyClick}></i> : <i className='bx bx-message-square-dots' onClick={handleReplyClick}></i>}
              <p>{replyCount}</p>
            </div>
          </div>
        </div>

        {replies ? <Replies user={user} postId={post.id} replyCount={replyCount} setParentReplyCount={setReplyCount} parentReplyCount={replyCount}/> : null}
      </div>
      
      {replies ? (
        <div className='post-card'>
            <form className="replyForm" onSubmit={handleReplySubmit}>
              <input type="text" className="post-reply-form" placeholder="Reply to this post" onChange={handleContentChange} value={content}/>
              <div className="box">
                <input type="submit" className="forum-btn reply-btn" value="Reply" />
              </div>
            </form>
        </div>
      ) : null}

      

    </div>
  )
}
