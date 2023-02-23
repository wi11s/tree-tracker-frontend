import React from "react";
import { useState, useEffect } from "react";
import FriendRequests from './FriendRequests';
import Friends from './Friends';
import UserCard from "./UserCard";
import { motion, AnimatePresence } from "framer-motion"

export default function FriendList({user, setIsFriendList, isFriendList}) {
    const [requests, setRequests] = useState([]);
    const [showRequests, setShowRequests] = useState(false);
    const [users, setUsers] = useState([]);
    const [displayUsers, setDisplayUsers] = useState(null);
    const [searchInput, setSearchInput] = useState('');
    const [isSearch, setIsSearch] = useState(true);
    const [isRequest, setIsRequest] = useState(false);

    useEffect(() => {
        if (user.id !== null) {
        fetch(`/users/filtered/${user.id}`, {
            method: 'GET',
            headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt')}`
            }
        })
        .then(r => r.json())
        .then(users => {
            // console.log(users)
            setUsers(users)
            setDisplayUsers(users)
        })
        }
    }, [user])

    
    function handleChange(e) {
        setSearchInput(e.target.value)

        setDisplayUsers(users.filter(user => user.username.includes(e.target.value)))
        console.log(displayUsers)
    }

    useEffect(() => {
        setRequests(user.requests)
    }, [user])

    // filterdDisplayUsers = displayUsers.filter(displayUser => {
    //     return !user.friendships.map(friend => friend.id).includes(displayUser.id)
    // })

    function handleSearch() {
        setIsSearch(true);
        setIsRequest(false);
    }

    function handleRequest() {
        setIsSearch(false);
        setIsRequest(true);
    }
    

    return (
        
        <div className="friend-list-container">
            <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: 250 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ease: "easeOut", duration: .1 }}
                exit={{ opacity: 0, x: 250 }}
                className='friend-list'>
                    
                <div className="friend-list-quit" onClick={() => setIsFriendList(false)}>
                    <i className='bx bx-x'></i>
                </div>
                
                <div className="my-friends-section">
                    <div className="section-header">
                        <p>Friends</p>
                    </div>

                    <Friends user={user}/>
                </div>

                <div className="bottom">
                    <div className='bottom-section'>
                    {isSearch ? 
                        <>
                        <div className="search-friends-bar">
                            <i className='bx bx-search' ></i>
                            <input type="text" placeholder="Search" className='search-bar' onChange={handleChange} value={searchInput}/>
                        </div>

                        {displayUsers !== null && searchInput !== '' ? displayUsers.map(displayUser => {
                        return (
                            <UserCard displayUser={displayUser} user={user} key={displayUser.id}/>
                        )
                        
                        }) : <i className="friend-list-message">Search by username</i>}
                        </>
                    : null
                    }
                    
                    {isRequest ? <FriendRequests user={user} requests={requests} setRequests={setRequests}/> : null}
                    </div>

                    <div className="friend-list-switch-container">
                        <div className="friend-list-switch" onClick={handleSearch}>
                            <p>Search Friend</p>
                        </div>

                        <div className="friend-list-switch" onClick={handleRequest}>
                            <p>Friend Requests</p>
                        </div>
                    </div>
                </div>
            </motion.div>
            </AnimatePresence>
        </div>
        
    )
}