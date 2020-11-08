INBOUND CALL


//** someone is calling the LVN, you receive and app:knocking and a sip:ringing */


// <- rct event app:knocking 
{
    "application_id": "9df502d9-784e-4f3f-8b23-e8faf438eb8f",
    "from": "knocker:568e4e01-d423-459b-9556-7d1b0a674edc",
    "body": {
    "user": {
        "id": "USR-4a7e5271-e249-45d5-8de4-3780c6ed485a"
    },
    "channel": {
        "type": "phone",
        "to": {
        "type": "phone",
        "number": "447418397039"
        },
        "from": {
        "type": "phone",
        "number": "447479199288"
        },
        "id": "f3c45be8289974a086340e4cda9711d8",
        "headers": {},
        "legs": [],
        "leg_ids": []
    }
    },
    "timestamp": "2020-11-02T08:56:08.390Z",
    "type": "app:knocking"
} 

// <- recv event sip ringing

{
    "application_id": "9df502d9-784e-4f3f-8b23-e8faf438eb8f",
    "from": "knocker:568e4e01-d423-459b-9556-7d1b0a674edc",
    "body": {
    "direction": "inbound",
    "channel": {
        "type": "phone",
        "to": {
        "type": "phone",
        "number": "447418397039"
        },
        "from": {
        "type": "phone",
        "number": "447479199288"
        },
        "id": "f3c45be8289974a086340e4cda9711d8",
        "headers": {},
        "legs": [],
        "leg_ids": []
    }
    },
    "timestamp": "2020-11-02T08:56:08.401Z",
    "type": "sip:ringing"
}


// -> create conversation
{
    url: "https://api.nexmo.com/beta/conversations",
        method: "post",
            data: { },
    headers: {
        'Authorization': `Bearer ${token}`
    }
}


// <- conversation:created
{
    "id": "CON-2b49b74a-9520-4503-aed6-0b3167915c83",
    "name": "NAM-83641432-53d4-4d2c-9908-8babceb743e8",
    "timestamp": {
        "created": "2020-11-02T08:33:45.491Z"
    },
    "state": "ACTIVE"
    },
    "application_id": "9df502d9-784e-4f3f-8b23-e8faf438eb8f",
    "timestamp": "2020-11-02T08:33:45.497Z",
    "type": "conversation:created"
}

// -> create user
{
    url: "https://api.nexmo.com/beta/users",
    method: "post",
    data: {},
    headers: {
        'Authorization': `Bearer ${token}`
    }
}

// -> create member state invited
{
    url: `https://api.nexmo.com/beta/conversations/${conversation_id}/members`,
    method: "post",
    data: {
        user_id: user_id,
        action: "invite",
        channel: {
            type: "phone",
            from: {
                number: "447479199288",
                type: "phone"
            },
            to: {
                number:"447418397039",
                type: "phone"
            }
        }	
    },
    headers: {
        'Authorization': `Bearer ${token}`
    }
}

// <- recv event member:invited

{
    "from": "MEM-81421163-d02a-4a14-a9b4-45fa602349cb",
    "conversation_id": "CON-2b49b74a-9520-4503-aed6-0b3167915c83",
    "body": {
    "cname": "NAM-83641432-53d4-4d2c-9908-8babceb743e8",
    "conversation": {
        "conversation_id": "CON-2b49b74a-9520-4503-aed6-0b3167915c83",
        "name": "NAM-83641432-53d4-4d2c-9908-8babceb743e8"
    },
    "invited_by": "USR-db91dd50-4bb6-4b0f-9031-26db595fbc00",
    "user": {
        "member_id": "MEM-81421163-d02a-4a14-a9b4-45fa602349cb",
        "user_id": "USR-db91dd50-4bb6-4b0f-9031-26db595fbc00",
        "media": {
        "audio_settings": {
            "enabled": false,
            "earmuffed": false,
            "muted": false
        },
        "audio": false
        },
        "name": "NAM-c7da90ed-55c5-4320-90e6-a7911bcc10fe"
    },
    "channel": {
        "type": "phone",
        "id": "330542ee-6caa-41af-a3b2-95a27517c1e7",
        "from": {
        "number": "447479199288",
        "type": "phone"
        },
        "legs": [
        {
            "leg_id": "330542ee-6caa-41af-a3b2-95a27517c1e7",
            "status": "started"
        }
        ],
        "to": {
        "number": "447418397039",
        "type": "phone"
        },
        "leg_ids": [
        "330542ee-6caa-41af-a3b2-95a27517c1e7"
        ]
    },
    "media": {
        "audio_settings": {
        "enabled": false,
        "earmuffed": false,
        "muted": false
        },
        "audio": false
    },
    "timestamp": {
        "invited": "2020-11-02T08:33:49.555Z"
    },
    "initiator": {
        "invited": {
        "isSystem": true
        }
    }
    },
    "id": 1,
    "application_id": "9df502d9-784e-4f3f-8b23-e8faf438eb8f",
    "timestamp": "2020-11-02T08:33:49.574Z",
    "type": "member:invited"
}

// <- rect event sip:ringing

{
      "application_id": "9df502d9-784e-4f3f-8b23-e8faf438eb8f",
      "from": "MEM-81421163-d02a-4a14-a9b4-45fa602349cb",
      "conversation_id": "CON-2b49b74a-9520-4503-aed6-0b3167915c83",
      "body": {
        "direction": "outbound",
        "channel": {
          "id": "330542ee-6caa-41af-a3b2-95a27517c1e7",
          "type": "phone",
          "to": {
            "number": "447418397039",
            "type": "phone"
          },
          "from": {
            "number": "447479199288",
            "type": "phone"
          }
        }
      },
      "id": 3,
      "timestamp": "2020-11-02T08:33:50.711Z",
      "type": "sip:ringing"
    }


// <- recv event leg:status:update (leg  ringing)

{
      "application_id": "9df502d9-784e-4f3f-8b23-e8faf438eb8f",
      "conversation_id": "CON-2b49b74a-9520-4503-aed6-0b3167915c83",
      "from": "MEM-81421163-d02a-4a14-a9b4-45fa602349cb",
      "body": {
        "leg_id": "330542ee-6caa-41af-a3b2-95a27517c1e7",
        "type": "phone",
        "direction": "outbound",
        "status": "ringing",
        "statusHistory": [
          {
            "status": "started",
            "date": "2020-11-02T08:33:49.571Z",
            "member_id": "MEM-81421163-d02a-4a14-a9b4-45fa602349cb",
            "conversation_id": "CON-2b49b74a-9520-4503-aed6-0b3167915c83"
          },
          {
            "status": "ringing",
            "date": "2020-11-02T08:33:50.676Z",
            "member_id": "MEM-81421163-d02a-4a14-a9b4-45fa602349cb",
            "conversation_id": "CON-2b49b74a-9520-4503-aed6-0b3167915c83"
          }
        ]
      },
      "id": 2,
      "timestamp": "2020-11-02T08:33:50.680Z",
      "type": "leg:status:update"
    }