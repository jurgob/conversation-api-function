import React, { useState, useEffect, useRef } from 'react';
import { useForm } from "react-hook-form";
import axios from 'axios';

import createRtcAudioConnection from './utils/createRtcAudioConnection'
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

  useEffect(() => {
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

// let peerConnection = null

function LoggedPage(props) {
  
  const [csClient, setCsClient] = useState(null)
  
  const [eventsHistory, setEvents] = useState([])
  
  const [audioState, setAudioState] = useState({
    audioSrcObject: null,
    peerConnection: null
  })

  
  const appendHistory = (clientEvent) => {
    setEvents(eventsHistory => [...eventsHistory, clientEvent])
  }
  //init cs client
  useEffect(() => {
    console.log(` ->->->-> useEffect init csClient`)


    const initCSClient = async () => {
      console.log(` ++++ initialize createCSClient`)
      const { token, cs_url, ws_url } = props.loginData
      const _csClient = await createCSClient({
        token, cs_url, ws_url
      });

      setCsClient(() => _csClient)
    }

    initCSClient()


  }, [props.loginData])

  useEffect(() => {
    console.log(` ->->->-> useEffect csClient Handler `, csClient);
    if (!csClient)
      return;

    const onTrack = (e) => {
      const _setAudioSrcObject = audioState.peerConnection.getRemoteStreams()[0]
      console.log(`_setAudioSrcObject `, _setAudioSrcObject)

      setAudioState(as => {
        console.log(`setAudioState onTrack`, {
          ...as,
          audioSrcObject: _setAudioSrcObject
        })
        return {
          ...as, 
          audioSrcObject: _setAudioSrcObject  
        }
      })
    }

    const onEvent = async (evt) => {
      if (evt.type === 'rtc:answer') {
        const sdp = evt.body.answer
        const remoteDescription = new RTCSessionDescription({
          type: 'answer',
          sdp,
        })
        
        console.log(`rtc:answer audioState `, audioState)

        if (audioState.peerConnection) {
          
          audioState.peerConnection.ontrack = onTrack
          
          audioState.peerConnection.setRemoteDescription(remoteDescription)
        }

      }

      appendHistory(evt)
    }

    csClient.onEvent(onEvent)
    csClient.onRequestStart(appendHistory)
    csClient.onRequestEnd(appendHistory)

  }, [audioState])

  const onEnableAudioInConversationSubmit = async (data) => {
    // const { conversation_id } = data
    try {
    console.log(`--- onEnableAudioInConversationSubmit`, data)
    const { audio_conversation_id} = data
    const conversation_id = audio_conversation_id
    const pc = await createRtcAudioConnection()
    // setpeerConnection(pc)
    // setAudioState(as => {
    //   console.log(`setAudioState `, { ...as, peerConnection: pc })
    //   return { ...as, peerConnection: pc }
    // })
    
    console.log(`setAudioState `, { ...audioState, peerConnection: pc })
    setAudioState({ ...audioState, peerConnection: pc })
    
    // peerConnection = pc
    const userConvRes = await csClient.request({
        url: `/v0.3/users/${csClient.getSessionData().user_id}/conversations`,
        method: "get"
    })

    const member_id = userConvRes.data._embedded.conversations.find(({ id }) => id === conversation_id)._embedded.member.id 

    await csClient.request({
      url: `/v0.1/conversations/${conversation_id}/rtc`,
      method: "post",
      data: {
        from: member_id,
        body: {
          offer: pc.localDescription,
        }
      }
    })

    } catch (e){
      console.log(`onEnableAudioInConversationSubmit error: `, e)
    }

  }

  const onCreateConversationSubmit = async (data) => {
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
        <h2>Enable Audio In Conversations</h2>
        <FormEnableAudioInConversations onSubmit={onEnableAudioInConversationSubmit} />
        <Audio srcObject={audioState.audioSrcObject} />
      </div>
      <div>
        <h2>History</h2>
        <div>
          <button onClick={() => setEvents(() => [])} >Clean History</button>
        </div>
        {eventsHistory.map((evt, idx) => {
          return (
            <div key={idx}  >
              <EventTitle event={evt} style={{ padding: "5px", margin: "5px" }} />
              <pre style={{ padding: "5px", margin: "5px", backgroundColor: "#ddd" }} >{JSON.stringify(evt, ' ', ' ')}</pre>
            </div>
          )
        })}
      </div>    
    </div>
  );
}

const EventTitle = ({event, style}) => {
  let text ='unknown'
  if(event.request && event.response){
    text = '<- http response'
  } else if (event.request && !event.response) {
    text = '-> http request'
  } else if (event.type && event.body){
    text = '<- ws event'
  }


  return (<h3 style={style} >{text}</h3>)
}

function FormEnableAudioInConversations({ onSubmit }) {
  const { register, handleSubmit, errors } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="audio_conversation_id">Conversations Id </label>

      {/* use aria-invalid to indicate field contain error */}
      <input
        type="text"
        id="audio_conversation_id"
        name="audio_conversation_id"
        aria-invalid={errors.name ? "true" : "false"}
        defaultValue= "CON-71ed48a1-4983-4557-a911-561fcb380d2f"
        ref={register({ required: true, maxLength: 50,  })}
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

function Audio({ srcObject, ...props }) {
  const refAudio = useRef(null)

  useEffect(() => {
    if (!refAudio.current) return
    refAudio.current.srcObject = srcObject
  }, [srcObject])

  return <audio ref={refAudio} {...props} controls autoPlay />
}


export default App;
