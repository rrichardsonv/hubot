const twitchWebhooks = require('twitch-webhook');

function mapObject(obj, keyMapper = (k, _) => k, mapper = (_, v) => v) {
  return Object.keys(obj).reduce((agg, k) => {
    const newV = mapper(k, obj[k])
    const newK = keyMapper(k, obj[k])
    agg[newK] = newV;
    return agg;
  }, {});
}

function filterOrEmpty(k, v, sensitive = ['client_id', 'secret']) {
  let visibleValue = v
  if (k in sensitive) {
    if (v === "" || !v) {
      visibleValue = "[EMPTY]"
    } else {
      visibileValue = "[FILTERED]"
    }
  }

  return visibleValue;
}

module.exports = (robot) => {
  robot.hear(/hendabear setup/i, (resp) => {
    const config = {
      client_id: process.env.TWITCH_CLIENT_ID,
      callback: "https://vast-shore-03490.herokuapp.com/twitch",
      secret: process.env.TWITCH_SECRET,
      lease_seconds: 68400,
      listen: {
        port: 8080,
        host: '127.0.0.1',
        autoStart: false,
        https: true
      }
    };

    console.log(mapObject(config, (k, _) => k, filterOrEmpty))
    const tweetch = new twitchWebhooks(config);

    tweetch.on('streams', ({ event }) => {
      if (event.data === []) {
        resp.send("Headabear stream offline! :wave:")
      } else {
        resp.send("Headabear stream online! :penguin_dance:")
      }
    })

    tweetch.on('unsubscribe', () => {
      resp.send("No longer getting info from twitch")
    })

    tweetch.subscribe('streams', { user_id: process.env.HENDABEAR_ID })
  })
}
