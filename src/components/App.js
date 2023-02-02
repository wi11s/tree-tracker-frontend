
import './App.css';
import React, {useState, useEffect} from'react';

import {Routes, Route } from "react-router-dom"
// import { BrowserRouter as Router } from 'react-router-dom';
import Home from './Home';
import Header from './Header';
import Footer from './Footer';
import Map from './Map';
import Error from './Error';
import AddTree from './AddTree';
import Progress from './Progress';
import Login from './Login';
import { useNavigate } from 'react-router-dom'
import { isCompositeComponent } from 'react-dom/test-utils';


function App() {

  const [user, setUser] = useState(null)
  const [useCustomLocation, setUseCustomLocation] = useState(true)
  const [latitude, setLatitude] = useState(null)
  const [longitude, setLongitude] = useState(null)

  const [trees, setTrees] = useState([])

  // set user
  useEffect(() => {
    fetch("/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      }
    })
    .then((r) => {
      console.log(r)
      if (r.ok) {
        r.json().then((user) => setUser(user));
      }
    });
  }, [localStorage.getItem("jwt")]);

  // set trees from census data

  useEffect(() => {
    fetch('https://data.cityofnewyork.us/resource/5rq2-4hqu.json')
    .then((res) => res.json())
    .then(obj => {
      // console.log(obj[0])
      setTrees(obj.filter(t => t['spc_common'] !== undefined))
    })
  }, [setTrees])

  // set trees from user data

  const [userTrees, setUserTrees] = useState([])
  
  useEffect(() => {
    fetch('https://trusted-swanky-whimsey.glitch.me/trees')
    .then((res) => res.json())
    .then(obj => {
      console.log(obj)
      setUserTrees(obj)
    })
  }, [setUserTrees])

  function handleLatChange(e) {
    setLatitude(e.target.value)
  }
  function handleLngChange(e) {
    setLongitude(e.target.value)
  }

  // get user location

  const [pos, setPos] = useState({})
  useEffect(() => {
    const timer = setTimeout(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (useCustomLocation) {
              let newPos = {
                lat: parseFloat(position.coords.latitude),
                lng: parseFloat(position.coords.longitude)
              };
              setPos(newPos)

            } else {
              pos = {
                lat: parseFloat(latitude),
                lng: parseFloat(longitude)
              }
              
            }
          }
        )
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [pos])
  // console.log(pos)

  // set states

  const navigate = useNavigate()
  const apiKey = process.env.REACT_APP_PLANT_KEY

  const [showTreeInfo, setShowTreeInfo] = useState(false)
  const [treeInfo, setTreeInfo] = useState({spc_common: '', userAdded: true})
  const [newTree, setNewTree] = useState({})

  const [center, setCenter] = useState({ lat: 40.74, lng: -73.90 })
  const [zoom, setZoom] = useState(12)

  const wiki = require('wikipedia');

  const [wikiLink, setWikiLink] = useState('')
  const [wikiImage, setWikiImage] = useState('')
  const [description, setDescription] = useState('')

  const [name, setName] = useState('')
  function handleNameChange(e) {
    setName(e.target.value)
  }

  (async () => {
    try {
      const page = await wiki.page(name);
      const summary = await page.summary();

      setWikiLink(summary['content_urls'].desktop.page)

      setWikiImage(summary.thumbnail.source)
      
      setDescription(summary.description)
      

    } catch (error) {
      console.log(error);
    }
  })();

  
  const [allTrees, setAllTrees] = useState([])
  useEffect(() => {
    setAllTrees([...trees, ...userTrees])
  }, [trees, userTrees])

  const treeOptions = allTrees.filter((item, index) => index === allTrees.indexOf(allTrees.find(tree => tree['spc_common'] === item['spc_common'])))
  
  function idPost(base64files) {
    fetch('https://api.plant.id/v2/identify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Api-Key": apiKey
      },
      body: JSON.stringify({
        images: [base64files],
        modifiers: ["similar_images"],
        plant_details: ["common_names", "url"],
        }),
    })
    .then(response => response.json())
    .then(data => {
      // console.log('Success:', data);
      setNewTree({
        spc_common: data.suggestions[0]['plant_name'],
        wiki: data.suggestions[0]['plant_details'].url,
        image: data.images[0].url,
        position: pos,
        suggestions: data.suggestions
      })
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }

  function encodeImageFileAsURL(e) {
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.onloadend = function() {
        idPost(reader.result.slice(23), pos)
        console.log(reader.result.slice(23), pos)
    }
    reader.readAsDataURL(file);
  }
  
  // new tree post
  function handleSubmit(e) {
    e.preventDefault()
    if (pos===undefined) {
      alert('please wait for your current location to load')
    } else if (name==='') {
      // console.log(newTree, name)
    
      fetch('https://trusted-swanky-whimsey.glitch.me/trees', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTree)
      })
      .then(response => response.json())
      .then((obj) => {
        console.log(obj)
        if (obj.error) {
          alert(obj.error)
        } else {
          navigate('/map')
          setCenter(pos)
          setZoom(16)
          setTreeInfo({spc_common: obj['spc_common'], wiki: obj.wiki, image: obj.image, userAdded: true})
  
          setAllTrees(allTrees => [...allTrees, obj])
    
          setShowTreeInfo(true)
        }
      })
    } else if (!description.toLowerCase().includes('tree') && !description.toLowerCase().includes('plant')) {
      
      alert('Please enter a valid tree name')
    } else {

      let newTreeByName = {
        spc_common: name,
        wiki: wikiLink,
        image: wikiImage,
        position: pos,
      }   
  
      console.log('newtreebyname:', pos)

      fetch('https://trusted-swanky-whimsey.glitch.me/trees', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTreeByName)
      })
      .then(response => response.json())
      .then((obj) => {
        console.log('obj', obj)

        navigate('/map')
        setCenter(pos)
        setZoom(16)
        setTreeInfo({spc_common: obj['spc_common'], wiki: obj.wiki, image: obj.image})

        setAllTrees(allTrees => [...allTrees, obj])
  
        setShowTreeInfo(true)
      })
    }
  }

  // check to see if user is logged in
  if (!user) {
    return (<div className="login"><Login setUser={setUser} /></div>);
  }


  return (
    <div className="App">
      <Header setUser={setUser}/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="map" element={<Map center={center} zoom={zoom} showTreeInfo={showTreeInfo} setShowTreeInfo={setShowTreeInfo} treeInfo={treeInfo} setTreeInfo={setTreeInfo} treeOptions={treeOptions} trees={trees} pos={pos}/>} />
        <Route path="addtree" element={<AddTree handleSubmit={handleSubmit} encodeImageFileAsURL={encodeImageFileAsURL} pos={pos} handleNameChange={handleNameChange} setUseCustomLocation={setUseCustomLocation} handleLatChange={handleLatChange} handleLngChange={handleLngChange} useCustomLocation={useCustomLocation} pos={pos}/>} />
        <Route path="progress" element={<Progress treeOptions={treeOptions} trees={trees}/>} />
        <Route path="*" element={<Error />} /> 
        <Route path="login" element={<Login setUser={setUser} />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
