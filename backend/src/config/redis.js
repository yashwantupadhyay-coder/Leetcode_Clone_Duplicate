const { createClient }  = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-11595.c305.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 11595
    }
});

module.exports = redisClient;