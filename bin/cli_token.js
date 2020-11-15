const {generateBEToken,generateUserToken,getStaticConfig} = require('../utils');

const config = getStaticConfig(process.env)



const user_name = process.argv[2]

const token = user_name ? generateUserToken({config, user_name}) : generateBEToken({config})
	

// getStaticConfig
// console.log(JSON.stringify(config, null, '  '))
console.log(token)

