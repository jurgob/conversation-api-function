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
	} catch (err) {
		logger.info("Error", { err})
	}
}

createCallWithoutVAPI();