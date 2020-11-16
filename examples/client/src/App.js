import React, { useState, useEffect } from 'react';
import axios from 'axios';

import FormCreateConversation from './components/FormCreateConversation'
import FormEnableAudioInConversations from './components/FormEnableAudioInConversations'
import FormLogin from './components/FormLogin'
import Audio from './components/Audio'
import EventsHistory from './components/EventsHistory'

import createRtcAudioConnection from './utils/createRtcAudioConnection'
import CSClient from './utils/csClient'


import './App.css';



const csClient = CSClient()



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



function useCSClientEvents (csClient) {
  
  const [event, setEvent] = useState(null)
  
  const setLastEvent = (clientEvent) => {
    setEvent(clientEvent)
  }
  
  useEffect(() => {
    csClient.onEvent(setLastEvent)
    csClient.onRequestStart(setLastEvent)
    csClient.onRequestEnd(setLastEvent)
  })
  
  return event
}


function LoggedPage(props) {
  
  // const [csClient, setCsClient] = useState(null)
  
  const lastCSClientEvent = useCSClientEvents(csClient)
  const [eventsHistory, setEvents] = useState([])
  
  // useCSClientEvents
  const [audioState, setAudioState] = useState({
    audioSrcObject: null,
    peerConnection: null
  })

  
  //init cs client
  useEffect(() => {
    console.log(` ->->->-> useEffect init csClient`)

    const initCSClient = async () => {
      console.log(` ++++ initialize createCSClient`)
      const { token, cs_url, ws_url } = props.loginData
      
      csClient.connect({
        token, cs_url, ws_url
      });

    }

    initCSClient()


  }, [props.loginData])

  useEffect(() => {
    
    const appendHistory = (clientEvent) => {
      if (clientEvent)
        setEvents(eventsHistory => [...eventsHistory, clientEvent])
    }

    appendHistory(lastCSClientEvent)

  }, [lastCSClientEvent] )


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

    }

    csClient.onEvent(onEvent)

  }, [audioState])

  const onEnableAudioInConversationSubmit = async (data) => {
    // const { conversation_id } = data
    try {
    console.log(`--- onEnableAudioInConversationSubmit`, data)
    const { audio_conversation_id} = data
    const conversation_id = audio_conversation_id
    const pc = await createRtcAudioConnection()
    
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
        <EventsHistory 
          eventsHistory={eventsHistory} 
          onCleanHistoryClick={() => setEvents(() => [])}
        />
      </div>
          
    </div>
  );
}


export default App;
