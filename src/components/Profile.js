import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import TreeCard from './TreeCard';
import { useNavigate } from 'react-router-dom';
import { set, selectUser } from '../slices/userSlice'

export default function ({ treeTypes, userTrees, setUser, user }) {
    const navigate = useNavigate();
    
    const rarity = {
      verycommon: {
          color: '#bdbbbb',
          point: 20,
      },
      common: {
          color: '#3bad4c',
          point: 40,
      },
      uncommon: {
          color: '#1cc7e6',
          point: 60,
      },
      rare: {
          color: '#743bad',
          point: 80,
      },
      veryrare: {
          color: '#e67d1c',
          point: 100,
      }
  }

function userScore(user) {
    let total = 0;
    user.forEach(tree => {
      total += rarity[tree.frequency.replace(/ +/g, "")].point;
    })
    return total;
}

  function handleClick() {
    localStorage.removeItem("jwt");
    setUser(null);
    navigate('/');
  }
  
  function sortTreeTypes(arr) {
    arr.forEach(a => {
      a.order = rarity[a.frequency.replace(/ +/g, "")].point
    })
    
    const newArr = arr.sort((a, b) => {
      return a.order - b.order
    })

    return newArr;
  }


    // return (
    //     <main className='progress'>
    //     <NavLink onClick={handleClick} to='/login' end className='link' style={({ isActive }) => ({borderBottom: isActive? '1.5px solid #3d4637' : null, paddingBottom: isActive ? "5px" : null})}>
    //         Sign Out
    //     </NavLink>
    //     <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1, transition:{duration: .8}}} className='progress-container'>
    //       <div className='progress-title'>
    //         <h1>PROGRESS </h1>
    //         <span>{points} / {total}</span>
    //         </div>
    //         <hr></hr>
    //         <div className='progree-card-container'>
    //           {treeTypes.map(tree => {
    //             if (tree['common_name']) {
    //               return (
    //                 <TreeType key={tree['common_name']} tree={tree} userTrees={userTrees} userId={user.id}/>
    //               )
    //             }  
    //           })}
    //         </div>
    //     </motion.div>
    //     </main>
    //   )

    return (
      <div className="profile" id='top'>
        <div className="profile-container">
          <div className="user-profile-container">
            <div className="user-info-island">
              <div className="user-info">
                <div className="profile-header">
                  <h1>{user.name.toUpperCase()}</h1>
                  <i>{user.username}</i>
                </div>

                <div className="user-email">
                  <p>{user.email}</p>
                </div>              
              </div>

              <div className="profile-logout" onClick={handleClick}>
                <i className='bx bx-log-out'></i>
              </div>
            </div>

            <div className="score-island">
                <p>Score</p>
                <h3>{userScore(user.tree_types)}</h3>
            </div>
          </div>

          <div className="progress-container">
              <div className="progress-header">
                <h1>PROGRESS</h1>
                <div className="progress-count">
                  <p>{userTrees.length} / {treeTypes.length}</p>
                </div>
              </div>

              <div className="tree-card-container">
                {treeTypes.length !== 0 
                ? 
                (sortTreeTypes(treeTypes).map(tree => {
                    return <TreeCard key={tree['common_name']} tree={tree} rarity={rarity} />
                }))
                : 
                null
                 }
              </div>

                 <div className="back-to-top">
              <a href='#top' className='button' style={{textAlign: 'center'}}>
                <p>Back To Top</p>
              </a>
              </div>
          </div>
          
        </div>
      </div>
    )
}
