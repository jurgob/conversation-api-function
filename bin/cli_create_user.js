const axios = require('axios');

const {generateBEToken,generateUserToken,getStaticConfig} = require('../src/utils');

const config = getStaticConfig(process.env)

const token = generateBEToken({config: config})

// getStaticConfig
// console.log(JSON.stringify(config, null, '  '))
// console.log(token)

const user_name = process.argv[2]

if(!user_name){
	console.log('at least an argument is required (user name required)')
	process.exit(1);
}

console.log(user_name)

axios({
	url: "https://api.nexmo.com/beta/users",
	method: "post",
	data: {
		name: user_name
	},
	headers: {
		'Authorization': `Bearer ${token}` 
	}
})
.then(res => {
	console.log(res)
})
.catch(err => {
	console.log(`err: `, err)
})
