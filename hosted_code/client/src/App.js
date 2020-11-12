import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import axios from 'axios';

import createAudioConnection from './utils/createRtcAudioConnection'
import createCSClient from './utils/csClient'

import './App.css';
function App() {
  const [loginData, setLoginData] = useState(null)

  const onSubmitLogin = async ({username}) => {
    const loginRes = await axios({
      url: `http://localhost:5001/login`,
      method: "post",
      data: {
        "user": username
      }
    })
    console.log('loginRes: ', loginRes)
    setLoginData(loginRes.data)
  }

  useEffect(async () => {
    document.title = "Conversation Service examples"

    
  })

  return (
    <div>
      {!loginData && <FormLogin onSubmit={onSubmitLogin} />}
      {loginData && <LoggedPage loginData={loginData} />}
    </div>
  )
}

function FormLogin({ onSubmit }) {
  const { register, handleSubmit, errors } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="username">User Name</label>

      {/* use aria-invalid to indicate field contain error */}
      <input
        type="text"
        id="username"
        name="username"
        aria-invalid={errors.name ? "true" : "false"}
        ref={register({ required: true, maxLength: 30 })}
      />

      {/* use role="alert" to announce the error message */}
      {errors.name && errors.name.type === "required" && (
        <span role="alert">This is required</span>
      )}
      {errors.name && errors.name.type === "maxLength" && (
        <span role="alert">Max length exceeded</span>
      )}

      <input type="submit" />
    </form>
  )
}


function LoggedPage(props) {
  let csClient = null;
  const [eventsHistory, setEvents] = useState([])
  
  const appendHistory = (clientEvent) => {
    console.log('on event from react event: ', clientEvent)
    console.log('on event from react array: ', eventsHistory)
    console.log('on event from react new array: ', [...eventsHistory, clientEvent])
    setEvents(eventsHistory => [...eventsHistory, clientEvent])
  }

  useEffect(async () => {
    
    const {token, cs_url, ws_url} = props.loginData
    csClient = await createCSClient({
      token, cs_url, ws_url
    });
    

    csClient.onEvent(appendHistory)
    csClient.onRequestStart(appendHistory)
    csClient.onRequestEnd(appendHistory)
    
    window.csClient = csClient

  })

  const onCreateConversationSubmit = async (data) => {
    console.log(data)
    const { conversation_name, conversation_display_name } = data
    const convRes = await csClient.request({
      url: `/v0.3/conversations`,
      method: "post",
      data: {
        "name": conversation_name,
        "display_name": conversation_display_name
      }
    })
    
    await csClient.request({
      url: `/v0.3/conversations/${convRes.data.id}/members`,
      method: "post",
      data: {
        "state": "joined",
        "user": {
          name: csClient.getSessionData().user_name,
        },
        "channel": {
          "type": "app"
        }
      }
    })
    
  }

  const getMyConversations = async () => {
    await csClient.request({
      url: `/v0.3/users/${csClient.getSessionData().user_id}/conversations`,
      method: "get"
    })
  }

  return (
    <div className="App">
      <h1>Conversations Client Playground</h1>  
      <div>
        <h2>Create Conversation and Join</h2>
        <FormCreateConversation onSubmit={onCreateConversationSubmit} />
        <h2>Get My Conversations</h2>
        <button onClick={getMyConversations} >Get My Conversations</button>
      </div>
      <div>
        <h2>History</h2>
        <div>
          <button onClick={() => setEvents([])} >Clean History</button>
        </div>
        {eventsHistory.map((evt, idx) => {
          return (
            <div key={idx} style={{padding: "5px", margin: "5px", backgroundColor: "#ddd"}} >
              <pre  >{JSON.stringify(evt, ' ', ' ')}</pre>
            </div>
          )
        })}
      </div>    
    </div>
  );
}

function FormCreateConversation({onSubmit}){
  const { register, handleSubmit, errors } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="conversation_name">Name</label>

      {/* use aria-invalid to indicate field contain error */}
      <input
        type="text"
        id="conversation_name"
        name="conversation_name"
        aria-invalid={errors.name ? "true" : "false"}
        ref={register({ required: true, maxLength: 30 })}
      />
      <br />
      <label htmlFor="conversation_display_name">Display Name</label>
      <input
        type="text"
        id="conversation_display_name"
        name="conversation_display_name"
        aria-invalid={errors.name ? "true" : "false"}
        ref={register({ required: true, maxLength: 30 })}
      />

      {/* use role="alert" to announce the error message */}
      {errors.name && errors.name.type === "required" && (
        <span role="alert">This is required</span>
      )}
      {errors.name && errors.name.type === "maxLength" && (
        <span role="alert">Max length exceeded</span>
      )}

      <input type="submit" />
    </form>
  )
}




export default App;