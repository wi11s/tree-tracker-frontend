import React, { useState, useEffect } from 'react'
import Reply from './Reply'

export default function Replies({user, postId, replyCount, setParentReplyCount, parentReplyCount}) {

    const [replies, setReplies] = useState([])
    useEffect(() => {
        fetch(`https://tree-tracker-backend.herokuapp.com/posts/replies/${postId}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('jwt')}`,
            }
        })
        .then(r => r.json())
        .then(data => {
            // console.log(data)
            setReplies(data)
        })
    }, [replyCount])

    // console.log(replies)
    
  return (
    <>{replies.map(reply => {
        if (reply !== null) {
            return <Reply user={user} postId={postId} key={reply.id} reply={reply} setReplies={setReplies} replies={replies} setParentReplyCount={setParentReplyCount} parentReplyCount={parentReplyCount}/>
        }
    })}</>
  )
}