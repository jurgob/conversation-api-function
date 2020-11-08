const axios = require('axios');
const bunyan = require('bunyan');
const {generateBEToken,generateUserToken,getStaticConfig} = require('./utils');

const config = getStaticConfig(process.env)

const token = generateBEToken({config: config})

const logger = bunyan.createLogger({ name: 'myapp' });


function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
// getStaticConfig
// console.log(JSON.stringify(config, null, '  '))
// console.log(token)

// const user_name = process.argv[2]

// if(!user_name){
// 	console.log('at least an argument is required (user name required)')
// 	process.exit(1);
// }

const createCallWithoutVAPI = async () => {
	try {
		
	
		const convRes = await axios({
			url: "https://api.nexmo.com/beta/conversations",
			method: "post",
			data: {},
			headers: {
				'Authorization': `Bearer ${token}`
			}
		})
		logger.info("Conversation Created", { data: convRes.data, status: convRes.status })
	
		const userRes = await axios({
			url: "https://api.nexmo.com/beta/users",
			method: "post",
			data: {},
			headers: {
				'Authorization': `Bearer ${token}`
			}
		})
		logger.info("User Created", { data: userRes.data, status: userRes.status})
	
		const conversation_id = convRes.data.id
		const user_id = userRes.data.id

		await sleep(3000)

		const memberRes = await axios({
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
		})
		logger.info("Member Voice Created", { data: memberRes.data, status: memberRes.status })

		/* 
			{
				"user_id":"USR-7330ba96-cab2-4e3b-9f58-0967bea19694",
				"user_name":null,
				"knocking_id":"knocker:3499f21b-1f54-467b-86fa-6259ad9c62aa",
				"channel":{
					"headers":{},
					"cpa":false,
					"preanswer":true,
					"from":{
						"number":"447479199288",
						"headers":{},
						"type":"phone"
					},
					"id":"1d1ff60a3b10888988825e56740dd4bb",
					"to":{
						"number":"447418397039",
						"headers":{},
						"type":"phone"
					},
					"type":"phone",
					"ring_timeout":-1,
					"cpa_time":-1,
					"max_length":-1
				},
				"action":"join",
				"media":{
					"audio":{
						"earmuffed":false,
						"muted":false
					}
				}
			}
		*/
	
	



	} catch (err) {
		logger.info("Error", { err})
	}
}

//createCallWithoutVAPI();